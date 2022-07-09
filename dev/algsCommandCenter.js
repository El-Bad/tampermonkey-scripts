// ==UserScript==
// @name         COMMAND CENTER TEST
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://google.com/commandcenter/better
// @icon         https://www.google.com/s2/favicons?sz=64&domain=undefined.algs-command-center
// @require      http://code.jquery.com/jquery-3.3.1.min.js
// @require      file:///C:/Users/Nick/OneDrive/javascript/tampermonkey-scripts/dev/algsCommandCenter.js
// @grant        GM.xmlHttpRequest
// ==/UserScript==

const $ = jQuery;
var css = `
html{
  padding: 0;
}
body{
  background: #222;
  min-width: 100vw;
  min-height: 100vh;
  margin: 0;
  padding: 0px;
  max-width: unset;
  max-height: unset;
  color: white;
}

tr,
td{
  max-width: 10rem;
  padding: 1rem;
  overflow: hidden;
}
`;

var pollNum = 0;
var pollSpeed = 2000;
var pollInterval = undefined;

$(document).ready(() => {
  $.noConflict();
  $("head").append(`<style type="text/css">${css}</style>`);
  console.log("RUNNING");
  $("body").children().remove();
  $("body").append(
    `<div id="maincontainer">
      <div id="tableContainer" />
      <pre id="algsData">loading...</pre>
    </div>`
  );

  pollData();
  pollInterval = setInterval(pollData, pollSpeed);

  function pollData() {
    pollNum++;
    console.log("polling", pollNum);

    const API_URL = `https://discover.flowics.com/discover/public/datasources/company/1584/integration_sink/apex-prod-twitch-delay/payload/graphics_match`;
    GM.xmlHttpRequest({
      method: "GET",
      url: API_URL,
      onload: function (response) {
        useResponse(response);
      },
    });
  }

  function buildTable(arr) {
    var table = $(`<table id="teamTable"></table>`);
    if (arr && arr.length === 0) return table;

    var headerComplete = false;
    for (var val of arr) {
      val = transform(val);
      if (!headerComplete) {
        var header = $(`<tr></tr>`);
        for (var key of Object.keys(val)) {
          header.append(`<th>${key}</th>`);
        }
        table.append(header);
        headerComplete = true;
      }

      var row = $(`<tr></tr>`);
      for (var key of Object.values(val)) {
        row.append(`<td>${key}</td>`);
      }
      table.append(row);
    }

    return table;
  }

  function transform(obj) {
    delete obj.logo;
    delete obj.players;
    delete obj.displayName;
    return obj;
  }

  function useResponse({ response }) {
    response = JSON.parse(response);
    var tableData = buildTable(response?.teams_iterable);
    $("#tableContainer").html(tableData);
    $("#algsData").text(
      `RAW DATA ${pollNum} (${pollSpeed / 1000} polls/sec): ${JSON.stringify(
        response,
        null,
        2
      )}`
    );
  }
});

const example = {
  tournamentPlace: 1,
  name: "Alliance",
  status: "dead",
  matchPoints: 1,
  damage: 1025,
  tournamentPoints: 32,
  logo: "https://algs-media.flowics.com/user-library-prod/v1/team/2666/6269cf4624b1814d91723ea2/Alliance.png",
  matchPoint: false,
  players: [],
  kills: 1,
  placement: 16,
  displayName: "Alliance",
};
