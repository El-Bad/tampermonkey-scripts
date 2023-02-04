// ==UserScript==
// @name         Maroofy to playlist

// @namespace    http://El.Bad
// @version      0.1
// @description  create spotify playlist from Maroofy
// @author       El_Bad

// @match        https://maroofy.com/songs/*

// @require      http://code.jquery.com/jquery-3.3.1.min.js
// @require      file:///C:/Users/NickV/OneDrive/javascript/tampermonkey-scripts/src/utils.js

// @resource     mainCss file:///C:/Users/NickV/OneDrive/javascript/tampermonkey-scripts/src/liquipediaInputStats/liquipediaInputStats.css
// @require      file:///C:/Users/NickV/OneDrive/javascript/tampermonkey-scripts/src/liquipediaInputStats/liquipediaInputStats.js

// @grant        GM.xmlHttpRequest
// @grant        GM_info
// @grant        GM_getResourceText
// @grant        GM_addStyle
// ==/UserScript==

var textPlaylist = "";

copyToClipboard = () => {
  console.log("copying to clipboard");
  const el = document.createElement("textarea");
  console.log(textPlaylist.split(",").slice(0, 20).join());
  el.value = textPlaylist.split(",").slice(0, 20).join();
  document.body.appendChild(el);
  el.select();
  navigator.clipboard.writeText(el.value);
  document.body.removeChild(el);
};

createSpotifyPlaylist = () => {
  $.ajax({
    method: "GET",
    url: "", //`https://www.tunemymusic.com/Logic/CreatPlaylist.php?target=Spotify&accountID=lbadl147&PlaylistName=TEST-PLAYLIST&PlaylistSize=20&otbl=undefined&mode=no`,
  }).done((response) => {
    console.log(data?.response);
  });
};

(function () {
  "use strict";
  console.log("running from file source");
  utilsLoaded();
  console.log("here");

  promiseElement(`.rounded-lg.flex.p-2.justify-between`).then(($el) => {
    console.log($el);
    $el.each(function () {
      console.log(
        `${$(this).find("h6").eq(0).text()} - ${$(this)
          .find("p")
          .eq(0)
          .text()},\n`
      );
      textPlaylist += `${$(this).find("h6").eq(0).text()} - ${$(this)
        .find("p")
        .eq(0)
        .text()}, \n`;
    });

    console.log(textPlaylist);

    $el
      .parent()
      .parent()
      .children()
      .eq(0)
      .append(
        `<button id="copyPlaylist" onclick=copyToClipboard()>Copy Playlist</button>`
      );
    $el
      .parent()
      .parent()
      .children()
      .eq(0)
      .append(
        `<button id="createSpotifyPlaylist" onclick=createSpotifyPlaylist()>Create Spotify Playlist</button>`
      );
  });
})();
