const $ = jQuery;
userscriptSetup();

promiseElement(`.tab2.active:contains("Player Kills")`, 0).then(async ($el) => {
  await promiseElement(".tabs-content > .active", 0);
  const $activeTab = $(".tabs-content > .active");
  const $playerKillTable = $activeTab.find("tbody").eq(0);
  const $graphContainer = $(`.template-box:contains("Input Percentage Split")`);
  const playerStats = playerTableToArray($playerKillTable[0]);
  const inputBreakdown = teamInputBreakdown(playerStats);
  console.log("Player Stats", playerStats);
  console.log("Team Stats", inputBreakdown.teams);

  addBasicHeatmap($graphContainer, $playerKillTable, playerStats);

  $el
    .parent()
    .append(`<li class="tab3" id="breakdownTab"><a>Input Breakdown</a></li>`);

  $el
    .parent()
    .parent()
    .append(`<div id="breakdownContent" class="wiki-bordercolor-light"></div>`);

  addBreakdownTable($("#breakdownContent"), inputBreakdown);

  $("#breakdownTab").on("click", () => {
    $el.parent().find("li").removeClass("active");
    $(".tabs-content > .active").removeClass("active");
    $("#breakdownTab").addClass("active");
    $("#breakdownContent").addClass("active");
  });

  $el
    .parent()
    .find("li:not(#breakdownTab)")
    .on("click", () => {
      $("#breakdownTab").removeClass("active");
      $("#breakdownContent").removeClass("active");
    });
});

let sumControllerPerformance = 0;

function addBreakdownTable($container, inputBreakdown) {
  $container.append(`
    <table id="inputBreakdownTable" class="display">
      <thead>
        <tr>
          <th title="Team">Team</th>
          <th title="Total Kills">Total Kills</th>
          <th title="%CP / (DaysC / DaysM)">%CP V Expected</th>
          <th title="Number of Controller Players the Team Played with">CP</th>
          <th title="Number of Players the Team Played with">Players</th>
          <th title="Percentage of Total Points Earned by Controller">%CP</th>
          <th title="Total Kills Per Day">K/Day</th>
          <th title="Controller Kills Per Day">C K/Day</th>
          <th title="Mouse & Keyboard Kills Per Day">MnK K/Day</th>
          <th title="Ratio of Controller to MnK Kills Per Day">C/M</th>
          <th title="Days Played Controller | MnK">Days C | M</th>
        </tr>
      </thead>
      <tbody id="inputBreakdownTableBody">
      </tbody>
    </table>
  `);
  for (const teamName in inputBreakdown["teams"]) {
    const team = inputBreakdown["teams"][teamName];
    let totalKillPoints = inputBreakdown["teams"][teamName]["totalKillPoints"];
    let controllerPoints = 0;
    let mnkPoints = 0;
    let mnkPlayers = 0;
    let controllerPlayers = 0;
    let totalPlayers = 0;
    for (const inputType in team) {
      if (!["Controller", "Mouse & Keyboard"].includes(inputType)) continue;
      const input = team[inputType];
      totalPlayers += input.players;
      if (inputType === "Controller") {
        controllerPoints += input.points;
        controllerPlayers += input.players;
      }
      if (inputType === "Mouse & Keyboard") {
        mnkPoints += input.points;
        mnkPlayers += input.players;
      }
    }
    const controllerDays = team["Controller"]?.days || 0;
    const mnkDays = team["Mouse & Keyboard"]?.days || 0;
    const totalDays = controllerDays + mnkDays;
    const controllerKillsPerDay = controllerPoints / controllerDays || 0;
    const mnkKillsPerDay = mnkPoints / mnkDays || 0;
    const controllerPercentage = (controllerPoints / totalKillPoints) * 100;
    const controllerPercentageVsExpected =
      controllerPercentage /
      100 /
      (controllerDays / (mnkDays + controllerDays));

    const controllerPercentageVsExpectedNoNaN = isNaN(
      controllerPercentageVsExpected
    )
      ? 1
      : controllerPercentageVsExpected;

    sumControllerPerformance += controllerPercentageVsExpectedNoNaN - 1;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${teamName}</td>
      <td>${totalKillPoints}</td>
      <td>${controllerPercentageVsExpectedNoNaN.toFixed(2)}</td>
      <td>${controllerPlayers}</td>
      <td>${totalPlayers}</td>
      <td>${controllerPercentage.toFixed(2)}%</td>
      <td>${(totalKillPoints / totalDays).toFixed(2)}</td>
      <td>${controllerKillsPerDay.toFixed(2)}</td>
      <td>${mnkKillsPerDay.toFixed(2)}</td>
      <td>${(controllerKillsPerDay / mnkKillsPerDay).toFixed(2)}</td>
      <td class="daystd">${controllerDays
        .toString()
        .padStart(2, " ")} | ${mnkDays.toString().padEnd(2, " ")}</td>
    `;
    document.getElementById("inputBreakdownTableBody").appendChild(row);
  }

  $("#inputBreakdownTable").DataTable({
    columnDefs: [{ targets: [1, 2, 3], orderable: true }],
    paging: false,
  });

  console.log("sumControllerPerformance", sumControllerPerformance);
}

function playerTableToArray(table) {
  const rows = Array.from(table.rows);
  return rows.map((row) => {
    const cells = Array.from(row.cells);
    const place = Number(cells[0].textContent.trim().replace(".", ""));
    const player = cells[1].textContent.trim();
    const team = $(cells[1]).find("a").attr("title");
    const input = $(cells[2]).find("abbr")[0]?.title || "Unknown";
    const total = parseInt(cells[3].textContent.trim());
    const days = cells
      .slice(4)
      .map((cell) => parseInt(cell.textContent.trim()));
    return { place, player, team, input, total, days };
  });
}

function teamInputBreakdown(players) {
  const inputBreakdown = {};

  let maxNonNullValues = 0;

  players.forEach((obj) => {
    const nonNullValues = obj.days.filter((day) => day !== null && !isNaN(day));
    maxNonNullValues = Math.max(maxNonNullValues, nonNullValues.length);
  });

  inputBreakdown["maxDays"] = maxNonNullValues;
  inputBreakdown["teams"] = {};
  const teams = inputBreakdown["teams"];

  for (const { days, team, input, total } of players) {
    // Initialize the team's input type count if it doesn't exist yet
    if (!teams[team]) {
      teams[team] = {};
    }

    // Increment the team's input type count
    if (!teams[team][input]) {
      teams[team][input] = {
        points: 0,
        percentage: 0,
        players: 0,
        days: 0,
      };
    }
    teams[team][input].points += total;
    teams[team][input].players++;
    teams[team][input].days += days.reduce(
      (acc, curr) => (!isNaN(curr) && curr !== null ? acc + 1 : acc),
      0
    );
  }

  // Calculate the percentage of points for each input type for each team
  for (const team in teams) {
    const totalKillPoints = Object.values(teams[team]).reduce(
      (a, b) => a + b.points,
      0
    );
    for (const input in teams[team]) {
      teams[team][input].percentage =
        (teams[team][input].points / totalKillPoints) * 100;
    }
    teams[team]["totalKillPoints"] = totalKillPoints;
  }

  return inputBreakdown;
}

function addBasicHeatmap($graphContainer, $tbody, playerStats) {
  const INPUT_COLUMN_INDEX = 2;
  const TITLE_ROWS = 0;

  const $heatmapBasic = $(
    `<div id="input-heatmap-basic" class="input-heatmap">
      <b>Input Heatmap</b>
    </div>`
  );

  for (let row of $tbody.find("tr")) {
    if ($(row).index() < TITLE_ROWS) continue;

    const placement = $(row).find("td").eq(0).text().trim().replace(".", "");
    const $input = $(row).find("td").eq(INPUT_COLUMN_INDEX);
    const title = $input.find("abbr")[0].title ?? "Unknown";
    $heatmapBasic.append(
      `<div class="heatmapRow" data-player-place="${placement}" title="${title}" />`
    );
  }

  const controllerPlayers = playerStats.filter(
    (player) => player.input === "Controller"
  );
  const controllerAveragePlacement =
    controllerPlayers.reduce((acc, curr) => acc + curr.place, 0) /
    controllerPlayers.length;
  const $controllerRow = $heatmapBasic.find(
    `.heatmapRow[data-player-place="${Math.round(
      controllerAveragePlacement.toFixed(2)
    )}"]`
  );
  $controllerRow
    .addClass("controllerAveragePlacement")
    .get(0)
    .setAttribute("data-average", `avg ${controllerAveragePlacement}`);

  const mnkPlayers = playerStats.filter(
    (player) => player.input === "Mouse & Keyboard"
  );
  const mnkAveragePlacement =
    mnkPlayers.reduce((acc, curr) => acc + curr.place, 0) / mnkPlayers.length;
  const $mnkRow = $heatmapBasic.find(
    `.heatmapRow[data-player-place="${Math.round(mnkAveragePlacement)}"]`
  );
  $mnkRow
    .addClass("mnkAveragePlacement")
    .get(0)
    .setAttribute("data-average", `avg ${mnkAveragePlacement.toFixed(2)}`);

  console.log(
    "controllerAveragePlacement",
    controllerAveragePlacement,
    "mnkAveragePlacement",
    mnkAveragePlacement
  );

  return $graphContainer.append($heatmapBasic);
}
