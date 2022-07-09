//promiseElement('#currLocalTime').then(($el)=>$el.css("color","red"));
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

//await sleep(ms)
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

//make sure to @grant GM_addStyle and GM_getResourceText
function userscriptSetup() {
  "use strict";

  //add all resource variables defined in ==UserScript==
  const { resources } = GM_info?.script;
  for (const resource of resources) {
    GM_addStyle(GM_getResourceText(resource.name));
  }

  jQuery?.noConflict();

  window.DEV = GM_info.script.name.toUpperCase().includes("DEV");

  const color = window.DEV ? "turquoise" : "lightblue";
  console.groupCollapsed(
    `%c Running ${GM_info?.script?.name ?? "userscript"}`,
    `color:${color}; font-weight: bold; font-size: 1.2rem;`
  );
  console.log(GM_info);
  console.groupEnd();
}

const utilsLoaded = () => console.log("Loaded Utils File");
