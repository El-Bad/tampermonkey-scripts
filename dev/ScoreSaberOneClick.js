// ==UserScript==
// @name         ScoreSaber OneClick
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://scoresaber.com/leaderboard/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=scoresaber.com
// @require      http://code.jquery.com/jquery-3.3.1.min.js
// @require         file:///C:/Users/Nick/OneDrive/javascript/tampermonkey-scripts/utils.js
// @require         file:///C:/Users/Nick/OneDrive/javascript/tampermonkey-scripts/dev/ScoreSaberOneClick.js
// @grant        none
// ==/UserScript==

promiseElement(`a[title="Download Map"]`).then(($el) => {
  $el.parent().append("<br>");
  const hash = $el.parent().text().trim();
  $.get(`https://beatsaver.com/api/maps/hash/${hash}`, ({ id }) => {
    $el
      .clone()
      .attr("href", `beatsaver://${id}`)
      .append("OneClick")
      .appendTo($el.parent());
  });
});
