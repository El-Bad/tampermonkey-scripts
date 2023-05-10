const css = `
.tsSpan {
  padding-left:4px;
}

#seekbarCurrentLocal {
  top: 15px;
  position: relative;
  left: 210px;
  display: inline-block;
}
`;

jQuery(function ($) {
  $("head").append(`<style type="text/css">${css}</style>`);
  console.log("RUNNING Twitch Vod Local Timestamps");
  script();
});

const storedAccessToken = localStorage.getItem("storedAccessToken");
const authURL = `https://id.twitch.tv/oauth2/authorize?response_type=token&client_id=v2bd4gbgdfyveh1khra6i1imuv5e4r&redirect_uri=https://www.twitch.tv&scope=viewing_activity_read+openid&state=${window.location.href}`;
const $spacer = '<span class="tsSpan"> • </span>';

const knownUrl = window.location.href;
const script = () => {
  if (window.location?.hash?.includes("access_token")) {
    const { accessToken, state } = getAccessToken();
    localStorage.setItem("storedAccessToken", accessToken);
    window.location.href = decodeURIComponent(state);
  } else if (window.location.href.match(/.*\/videos\/.+/g)) {
    storedAccessToken ? main() : authorize();
  } else {
    const checkVideosPage = setInterval(function () {
      if (window.location.href.match(/.*\/videos\/.+/g)) {
        clearInterval(checkVideosPage);
        startTimestamps();
      }
    }, 100);
  }
};

function getAccessToken() {
  const fragment = window.location.hash.substring(1);
  const params = {};
  fragment.split("&").forEach(function (item) {
    const pair = item.split("=");
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
  const $authLink = `<span class="tsSpan"><a href="${authURL}">AUTHENTICATE Twitch Vod Local Timestamps Script</a><span>`;
  promiseElement(".timestamp-metadata__bar").then(($el) => {
    $el.eq(0).parent().append($spacer);
    $el.eq(0).parent().append($authLink);
  });
}

function videoApiSuccess(response) {
  const $currTimeDisplay = `<span id="currLocalTime" class="tsSpan"><span>`;
  const utcTime = response.data[0].created_at;
  const createdAtDate = new Date(utcTime);

  promiseElement(".timestamp-metadata__bar").then(($el) => {
    const updateTimeInterval = setInterval(function () {
      const seekTime = $(`[data-a-target='player-seekbar-current-time']`)
        .eq(0)
        .html();
      if (seekTime) {
        const seekSeconds = hmsToSeconds(seekTime);
        const currDateTime = new Date(createdAtDate);
        currDateTime.setSeconds(createdAtDate.getSeconds() + seekSeconds);
        const currTime = moment(currDateTime).format("M/DD/YY - h:mm:ss A");
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

function hmsToSeconds(hms) {
  const a = hms.split(":");
  return +a[0] * 60 * 60 + +a[1] * 60 + +a[2];
}

function promiseElement(selector, timeoutms = 10000) {
  let observer, timeout;
  return new Promise((resolve, reject) => {
    observer = new MutationObserver((mutations, observer) => {
      for (const mutation of mutations) {
        if (mutation.type === "childList" || mutation.type === "attributes") {
          const $el = $(selector);
          if ($el.length) {
            observer.disconnect();
            clearTimeout(timeout);
            resolve($el);
            break;
          }
        }
      }
    });
    observer.observe(document.body, {
      childList: true,
      attributes: true,
      subtree: true,
    });
    if (timeoutms) {
      timeout = setTimeout(() => {
        observer.disconnect();
        reject(`Timed out in ${timeoutms}ms.`);
      }, timeoutms);
    }
  });
}
