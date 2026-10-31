(function () {
    "use strict";

    const scriptEl = document.currentScript;
    const endpoint = scriptEl.getAttribute("hostname") || "https://api.analiza.dev";
    const tenant = scriptEl.getAttribute("tenant");

    let lastViewedUrl = null;
    let hiddenAt = null;
    const refocusViewThresholdMs = 30 * 60 * 1000;

    function view() {
        sendEvent({
            t: "view", p: location.href, u: tenant, r: document.referrer
        });
        lastViewedUrl = location.href;
    }

    function gone() {
        sendEvent({
            t: "gone", p: location.href, u: tenant, r: document.referrer
        });
    }

    function sendEvent(eventData) {
        fetch(endpoint + "/eye", {
            keepalive: true, method: 'POST', body: JSON.stringify(eventData),
        });
    }

    if (tenant && tenant.length === 36) {

        if (document.visibilityState === "visible") {
            view();
        }
        let pushState = history.pushState
        if (history.pushState) {
            history.pushState = function () {
                pushState.apply(history, arguments);
                view()
            };
            window.addEventListener('popstate', view)
        }

        document.onvisibilitychange = () => {
            if (document.visibilityState === "hidden") {
                hiddenAt = Date.now();
                gone();
            } else if (document.visibilityState === "visible") {
                const hiddenForMs = hiddenAt === null ? 0 : Date.now() - hiddenAt;
                if (location.href !== lastViewedUrl || hiddenForMs > refocusViewThresholdMs) {
                    view();
                }
            }
        };
    } else {
        console.info("analiza.dev tenant not set to the expected UUID value, analiza is disabled.")
    }
})();
