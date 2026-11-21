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

    // Links that look like they carry a credential (userinfo, a secret-ish
    // query/hash parameter, or a token-looking value or path segment) are never
    // reported, not even as origin + path. Mirrored by sanitizeClickTarget in eye.
    const sensitiveKey = /token|secret|passw|pwd|auth|bearer|jwt|session|sig(nature)?$|^sid$|key|code|otp|nonce|ticket|credential|magic|reset|invite|verify/i;
    const tokenLike = /[A-Za-z0-9]{16,}|^eyJ|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

    function looksLikeToken(v) {
        const m = tokenLike.exec(v);
        return m !== null && (/\d/.test(m[0]) || /^eyJ/.test(m[0]));
    }

    function hasSecret(url) {
        if (url.username || url.password) {
            return true;
        }
        for (const seg of url.pathname.split("/")) {
            let s = seg;
            try { s = decodeURIComponent(seg); } catch { /* keep raw */ }
            if (looksLikeToken(s)) {
                return true;
            }
        }
        const params = [url.search, url.hash.replace(/^#[^=&]*\?/, "&")].join("&");
        for (const pair of params.replace(/^[?#]/, "").split(/[&;]/)) {
            const i = pair.indexOf("=");
            const k = i < 0 ? pair : pair.slice(0, i);
            const v = i < 0 ? "" : pair.slice(i + 1);
            if (sensitiveKey.test(k) || looksLikeToken(v) || (i < 0 && looksLikeToken(k))) {
                return true;
            }
        }
        return false;
    }

    // clickTarget reduces an <a href> target to what we are willing to send:
    // mailto:/tel: keep only the scheme, outbound http(s) links and file
    // downloads keep origin + path (never query or hash), internal links
    // send nothing, and links that appear to contain a token send nothing.
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
            if (hasSecret(url)) {
                return "";
            }
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
