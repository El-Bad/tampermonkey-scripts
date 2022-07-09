GM_addStyle(GM_getResourceText("mainCss"));

const DEV = true;

const $ = jQuery;
$.noConflict();
GM_addStyle(GM_getResourceText("jqueryCss"));

$(document).attr("title", "ALGS Live Stats");

$("head").append(
  `<link rel="icon" type="image/x-icon"
    href="https://raw.githubusercontent.com/El-Bad/tampermonkey-scripts/master/src/algsLiveStats/icon.png"/>`
);

var pollNum = 0;
var pollSpeed = 2000;
var pollInterval = undefined;

console.log("Running ALGS Live Stats Script");
$("body").children().remove();
$("body").append(
  `<div id="maincontainer">
      <div id="tableContainer" />
      <pre id="algsData">loading...</pre>
    </div>`
);

DEV && $("#maincontainer").prepend(`<h1>DEVELOPMENT MODE</h1`);

pollData();
if (!DEV) pollInterval = setInterval(pollData, pollSpeed);

function pollData() {
  pollNum++;
  const API_URL = `https://discover.flowics.com/discover/public/datasources/company/1584/integration_sink/apex-prod-twitch-live/payload/graphics_match`;
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

  var tbody = $(`<tbody></tbody>`);
  for (var val of arr) {
    val = transform(val);
    if (!headerComplete) {
      var header = $(`<tr></tr>`);
      for (var key of Object.keys(val)) {
        header.append(`<th>${key}</th>`);
      }
      table.append(`<thead>${header.html()}</thead>`);
      headerComplete = true;
    }
    var row = $(`<tr></tr>`);
    for (var key of Object.values(val)) {
      row.append(`<td>${key}</td>`);
    }
    tbody.append(row);
  }
  table.append(tbody);

  return table;
}

function transform(obj) {
  delete obj.logo;
  delete obj.players;
  delete obj.displayName;
  return obj;
}

async function useResponse({ response }) {
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

  $("#teamTable").DataTable();
}

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
