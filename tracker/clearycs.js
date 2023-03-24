(function () {
    "use strict";

    const scriptEl = document.currentScript;
    const endpoint = scriptEl.getAttribute("hostname") || "http://localhost:8080";

    function view() {
        sendEvent({
            type: "view", path: location.href,
        });
    }

    function gone() {
        sendEvent({
            type: "gone", path: location.href,
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
})();
