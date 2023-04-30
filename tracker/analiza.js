(function () {
    "use strict";

    const scriptEl = document.currentScript;
    const endpoint = scriptEl.getAttribute("hostname") || "https://api.analiza.dev";
    const tenant = scriptEl.getAttribute("tenant");

    function view() {
        sendEvent({
            t: "view", p: location.href, e: tenant, r: document.referrer
        });
    }

    function gone() {
        sendEvent({
            t: "gone", p: location.href, e: tenant, r: document.referrer
        });
    }

    function sendEvent(eventData) {
        fetch(endpoint + "/eye", {
            keepalive: true,
            method: 'POST',
            body: JSON.stringify(eventData),
        });
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
