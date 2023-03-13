(function () {
  "use strict";

  var scriptEl = document.currentScript;
  var endpoint = scriptEl.getAttribute("hostname") || defaultEndpoint(scriptEl);

  function view() {
    sendEvent({
      type: "view",
      path: location.href,
    });
  }

  function gone() {
    sendEvent({
      type: "gone",
      path: location.href,
    });
  }

  function sendEvent(eventData) {
    navigator.sendBeacon(endpoint + "/eye", JSON.stringify(eventData));
  }

  if (document.visibilityState === "visible") {
    view();
  }

  document.onvisibilitychange = () => {
    if (document.visibilityState === "hidden") {
      gone();
    } else if (document.visibilityState === "visible") {
      view();
    }
  };
});
