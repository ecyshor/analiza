(function () {
    "use strict";

    const scriptEl = document.currentScript;
    const endpoint = scriptEl.getAttribute("hostname") || "https://api.analiza.dev";
    const tenant = scriptEl.getAttribute("tenant");

    function view() {
        sendEvent({
            type: "view", path: location.href, tenant: tenant
        });
    }

    function gone() {
        sendEvent({
            type: "gone", path: location.href, tenant: tenant
        });
    }

    function sendEvent(eventData) {
        navigator.sendBeacon(endpoint + "/eye", JSON.stringify(eventData));
    }

    if (tenant.length === 36) {

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
    } else {
        console.info("analiza.dev tenant not set to the expected UUID value, analiza is disabled.")
    }
})();
