const $ = jQuery;
userscriptSetup();

document.title = "ALGS Live Stats";
$("head").append(
  `<link rel="icon" type="image/x-icon"
    href="https://raw.githubusercontent.com/El-Bad/tampermonkey-scripts/master/src/algsLiveStats/icon.png"/>`
);

let dataSet = { data: [{ name: "test", status: "test", extra: "extra" }] };
var pollCount = 0;
var pollSpeed = 2000;
var pollInterval = undefined;

$("body").children().remove();
$("body").append(
  `<div id="maincontainer">
      <div id="tableContainer" />
      <table id="dataTable" />
      <pre id="algsData">loading...</pre>
    </div>`
);

window.DEV && $("#maincontainer").prepend(`<h1>DEVELOPMENT MODE</h1`);
const API_URL = `https://discover.flowics.com/discover/public/datasources/company/1584/integration_sink/apex-prod-twitch-live/payload/graphics_match`;

let datatable = $("#dataTable").DataTable({
  ajax: (_, callback) => {
    GM.xmlHttpRequest({
      method: "GET",
      url: API_URL,
      onload: ({ response }) => {
        response = JSON.parse(response);
        callback({ data: response.teams_iterable });
      },
    });
  },
  columns: [
    { title: "Name", data: "name" },
    { title: "Status", data: "status" },
  ],
});

pollData();
if (!window.DEV) pollInterval = setInterval(pollData, pollSpeed);

function pollData() {
  pollCount++;
  const API_URL = `https://discover.flowics.com/discover/public/datasources/company/1584/integration_sink/apex-prod-twitch-live/payload/graphics_match`;
  GM.xmlHttpRequest({
    method: "GET",
    url: API_URL,
    onload: (response) => useResponse(response),
  });
}

function useResponse({ response }) {
  response = JSON.parse(response);
  $("#algsData").text(
    `RAW DATA ${pollCount} (${pollSpeed / 1000} polls/sec): ${JSON.stringify(
      response,
      null,
      2
    )}`
  );
}
