// ==UserScript==
// @name         Twitch Vod Local Timestamps
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Add local time the content was streamed at to the twitch vod
// @author       El Bad#1806
// @match        https://www.twitch.tv/*
// @grant        none
// @require      http://code.jquery.com/jquery-3.3.1.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.1/moment.min.js

// ==/UserScript==
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
    var authURL =
      "https://id.twitch.tv/oauth2/authorize?response_type=token&client_id=v2bd4gbgdfyveh1khra6i1imuv5e4r&redirect_uri=" +
      window.location +
      "&scope=viewing_activity_read+openid";
    var hash = window.location.hash;
    var $spacer = '<span class="tsSpan"> • </span>';

    var knownUrl = window.location.href;
    function begin() {
      if (window.location.href.match(/.*\/videos\/.+/g)) {
        startTimestamps();
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

    function startTimestamps() {
      if (hash.length > 0 && hash.includes("access_token")) {
        var accessToken = window.location.hash.split("access_token=")[1];
        accessToken = accessToken.split("&")[0];
        localStorage.setItem("storedAccessToken", accessToken);
      }

      if (storedAccessToken !== null && storedAccessToken !== undefined) {
        main();
      } else {
        authorize();
      }
    }

    function main() {
      let vidID =
        window.location.href.split("/")[
          window.location.href.split("/").length - 1
        ];
      vidID = vidID.split("?")[0];
      $.ajax({
        url: "https://api.twitch.tv/helix/videos?id=" + vidID,
        type: "GET",
        beforeSend: function (xhr) {
          xhr.setRequestHeader("Authorization", "Bearer " + storedAccessToken);
          xhr.setRequestHeader("Client-Id", "v2bd4gbgdfyveh1khra6i1imuv5e4r");
        },
        data: {},
        success: videoApiSuccess,
        error: function (err) {
          console.log("error accessing twitch api for video");
          console.log(err);
          authorize();
        },
      });
    }

    function authorize() {
      var $authLink =
        '<span class="tsSpan"><a href="' +
        authURL +
        '">AUTHENTICATE Twitch Vod Local Timestamps Script</a><span>';
      promiseElement(".timestamp-metadata__bar").then(($el) => {
        $el.eq(0).parent().append($spacer);
        $el.eq(0).parent().append($authLink);
      });
    }

    function videoApiSuccess(response) {
      let $currTimeDisplay = '<span id="currLocalTime" class="tsSpan"><span>';
      let utcTime = response.data[0].created_at;
      let createdAtDate = new Date(utcTime);

      promiseElement(".timestamp-metadata__bar").then(($el) => {
        var updateTimeInterval = setInterval(function () {
          let seekTime = $("[data-a-target='player-seekbar-current-time']")
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

    function hmsToSeconds(hms) {
      var a = hms.split(":");
      // minutes are worth 60 seconds. Hours are worth 60 minutes.
      return +a[0] * 60 * 60 + +a[1] * 60 + +a[2];
    }

    function promiseElement(selector, timeoutms = 10000, refresh = 100) {
      return new Promise((resolve, reject) => {
        let interval = setInterval(() => {
          let $el = $(selector);
          if ($el.length > 0) {
            clearInterval(interval);
            resolve($el);
          }
        }, refresh);

        if (timeoutms !== 0) {
          let timeout = setTimeout(() => {
            clearTimeout(timeout);
            clearInterval(interval);
            reject("Timed out in " + timeoutms + "ms.");
          }, timeoutms);
        }
      });
    }
  }); //doc.ready
})(jQuery);
