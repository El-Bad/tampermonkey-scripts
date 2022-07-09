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

const utilsLoaded = () => console.log("Loaded Utils File");
