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

    const downloadExtension = /\.(pdf|zip|gz|tar|dmg|exe|msi|pkg|deb|rpm|apk|csv|txt|docx?|xlsx?|pptx?|odt|ods|mp3|mp4|mov|avi|epub)$/i;

    // clickTarget reduces an <a href> target to what we are willing to send:
    // mailto:/tel: keep only the scheme, outbound http(s) links and file
    // downloads keep origin + path (never query or hash), internal links
    // send nothing.
    function clickTarget(el) {
        let url;
        try {
            url = new URL(el.href, location.href);
        } catch {
            return "";
        }
        if (url.protocol === "mailto:" || url.protocol === "tel:") {
            return url.protocol;
        }
        if ((url.protocol === "http:" || url.protocol === "https:") &&
            (url.host !== location.host || downloadExtension.test(url.pathname))) {
            return url.origin + url.pathname;
        }
        return "";
    }

    function onClick(e) {
        // auxclick also fires for right-click (context menu); only count middle-click.
        if (e.type === "auxclick" && e.button !== 1) {
            return;
        }
        let target = e.target;
        if (!(target instanceof Element)) {
            target = target && target.parentElement;
        }
        if (!(target instanceof Element)) {
            return;
        }
        if (target.closest('[data-analiza-click="off"]')) {
            return;
        }
        const named = target.closest("[data-analiza-click]");
        const name = named ? (named.getAttribute("data-analiza-click") || "") : "";
        const el = target.closest("a[href]");
        if (!named && !el) {
            return;
        }
        const h = el ? clickTarget(el) : "";
        if (!name && !h) {
            return;
        }
        sendEvent({
            t: "click", p: location.href, u: tenant, r: document.referrer, n: name, h: h
        });
    }

    if (tenant && tenant.length === 36) {

        document.addEventListener("click", onClick, true);
        document.addEventListener("auxclick", onClick, true);

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
