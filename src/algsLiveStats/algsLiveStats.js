const $ = jQuery;
userscriptSetup();

window.DEV = false;

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
    { title: "Place", data: "placement", width: "0%" },
    { title: "Name", data: "name", width: "0%" },
    { title: "Kills", data: "kills", width: "0%" },
    { title: "Damage", data: "damage", width: "0%" },
    { title: "Status", data: "status", visible: false, width: "0%" },
    {
      title: "Match Pt",
      data: "matchPoint",
      visible: false,
      className: "matchPoint",
    },
    { title: "Pts", data: "tournamentPoints" },
    { title: "#", data: "tournamentPlace", className: "tournamentPlace" },
  ],
  order: [
    [4, "asc"],
    [0, "asc"],
    [5, "asc"],
    [7, "asc"],
    [2, "desc"],
    [3, "desc"],
  ],
  bInfo: false,
  createdRow: function (row, data, dataIndex) {
    if (data?.status === "alive") $(row).addClass("alive");
    if (parseInt(data?.tournamentPlace) <= 10) $(row).addClass("top10");
    if (data?.matchPoint) $(row).addClass("onMatchPoint");
    console.log("ROW:", row, data, dataIndex);
  },
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
