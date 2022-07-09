const $ = jQuery;
userscriptSetup();

document.title = "ALGS Live Stats";
$("head").append(
  `<link rel="icon" type="image/x-icon"
    href="https://raw.githubusercontent.com/El-Bad/tampermonkey-scripts/master/src/algsLiveStats/icon.png"/>`
);

var pollCount = 0;
var pollSpeed = 1000;
var pollInterval = undefined;

$("body").children().remove();
$("body").append(
  `<div id="maincontainer">
      <div id="tableContainer" />
      <table id="dataTable" />
    </div>`
);

window.DEV && $("#maincontainer").prepend(`<h1>DEVELOPMENT MODE</h1`);

if (!window.DEV) pollInterval = setInterval(pollData, pollSpeed);

function pollData() {
  pollCount++;
  datatable.ajax.reload();
}

let datatable = $("#dataTable").DataTable({
  ajax: getData,
  paging: false,
  columns: [
    { title: "Place", data: "placement" },
    { title: "Name", data: "name" },
    { title: "Kills", data: "kills" },
    { title: "Damage", data: "damage" },
    { title: "Status", data: "status" },
    { title: "Match Pt", data: "matchPoint" },
    { title: "Pts", data: "tournamentPoints" },
    { title: "#", data: "tournamentPlace" },
  ],
  order: [
    [4, "asc"],
    [0, "asc"],
    [5, "asc"],
    [7, "asc"],
    [2, "desc"],
    [3, "desc"],
  ],
});

function getData(_, callback) {
  const API_URL = `https://discover.flowics.com/discover/public/datasources/company/1584/integration_sink/apex-prod-twitch-live/payload/graphics_match`;
  GM.xmlHttpRequest({
    method: "GET",
    url: API_URL,
    onload: ({ response }) => {
      response = JSON.parse(response);
      callback({ data: response.teams_iterable });
    },
  });
}
