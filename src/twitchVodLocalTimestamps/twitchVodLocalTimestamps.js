var css = `
.tsSpan{
padding-left:4px;
}

#seekbarCurrentLocal{
    top: 15px;
    position: relative;
    left: 210px;
    display: inline-block;
}
`;

(function ($) {
  $(document).ready(function () {
    $.noConflict();
    function addCSS(cssRules) {
      $("head").append('<style type="text/css">' + cssRules + "</style>");
    }
    addCSS(css);

    console.log("RUNNING Twitch Vod Local Timestamps");

    var storedAccessToken = localStorage.getItem("storedAccessToken");
    var authURL = `https://id.twitch.tv/oauth2/authorize?response_type=token&client_id=v2bd4gbgdfyveh1khra6i1imuv5e4r&redirect_uri=https://www.twitch.tv&scope=viewing_activity_read+openid&state=${window.location.href}`;
    var $spacer = '<span class="tsSpan"> • </span>';

    var knownUrl = window.location.href;
    function begin() {
      if (window.location?.hash?.includes("access_token")) {
        let { accessToken, state } = getAccessToken();
        accessToken = accessToken.split("&")[0];
        localStorage.setItem("storedAccessToken", accessToken);
        window.location.href = decodeURIComponent(state);
      } else if (window.location.href.match(/.*\/videos\/.+/g)) {
        storedAccessToken ? main() : authorize();
      } else {
        var checkVideosPage = setInterval(function () {
          if (window.location.href.match(/.*\/videos\/.+/g)) {
            clearInterval(checkVideosPage);
            startTimestamps();
          }
        }, 100);
      }
    }
    begin();

    function getAccessToken() {
      let fragment = window.location.hash.substring(1);
      let params = {};
      fragment.split("&").forEach(function (item) {
        let pair = item.split("=");
        params[pair[0]] = pair[1];
      });
      return {
        accessToken: params["access_token"],
        state: params["state"],
      };
    }

    function main() {
      const vidId = window.location.pathname.split("/videos/")?.[1];
      fetch(`https://api.twitch.tv/helix/videos?id=${vidId}`, {
        headers: {
          Authorization: `Bearer ${storedAccessToken}`,
          "Client-Id": "v2bd4gbgdfyveh1khra6i1imuv5e4r",
        },
      })
        .then((response) => response.json())
        .then((data) => videoApiSuccess(data))
        .catch((err) => {
          console.log("error accessing twitch api for video");
          console.log(err);
          authorize();
        });
    }

    function authorize() {
      var $authLink = `<span class="tsSpan"><a href="${authURL}">AUTHENTICATE Twitch Vod Local Timestamps Script</a><span>`;
      promiseElement(".timestamp-metadata__bar").then(($el) => {
        $el.eq(0).parent().append($spacer);
        $el.eq(0).parent().append($authLink);
      });
    }

    function videoApiSuccess(response) {
      let $currTimeDisplay = `<span id="currLocalTime" class="tsSpan"><span>`;
      let utcTime = response.data[0].created_at;
      let createdAtDate = new Date(utcTime);

      promiseElement(".timestamp-metadata__bar").then(($el) => {
        var updateTimeInterval = setInterval(function () {
          let seekTime = $(`[data-a-target='player-seekbar-current-time']`)
            .eq(0)
            .html();
          if (seekTime) {
            let seekSeconds = hmsToSeconds(seekTime);
            let currDateTime = new Date(createdAtDate);
            currDateTime.setSeconds(createdAtDate.getSeconds() + seekSeconds);
            let currTime = moment(currDateTime).format("M/DD/YY - h:mm:ss A");
            if ($("#currLocalTime").length === 0) {
              $el.eq(0).parent().append($spacer);
              $el.eq(0).parent().append($currTimeDisplay);
            }
            $("#currLocalTime").html(currTime);
          }
          if (window.location.href !== knownUrl) {
            knownUrl = window.location.href;
            clearInterval(updateTimeInterval);
            begin();
          }
        }, 300);
      });
    }

    const hmsToSeconds = (hms) => {
      const a = hms.split(":");
      return +a[0] * 60 * 60 + +a[1] * 60 + +a[2];
    };

    const promiseElement = (selector, timeoutms = 10000, refresh = 100) => {
      let interval, timeout;
      return new Promise((resolve, reject) => {
        interval = setInterval(() => {
          let $el = $(selector);
          if ($el.length) {
            clearInterval(interval);
            clearTimeout(timeout);
            resolve($el);
          }
        }, refresh);

        if (timeoutms) {
          timeout = setTimeout(() => {
            clearInterval(interval);
            reject(`Timed out in ${timeoutms}ms.`);
          }, timeoutms);
        }
      });
    };
  }); //doc.ready
})(jQuery);
