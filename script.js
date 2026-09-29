(function () {
  "use strict";

  var root = document.documentElement;

  /* ---------- Dateline ---------- */

  var todayEl = document.getElementById("today");
  var issueEl = document.getElementById("issue-number");
  var yearEl = document.getElementById("year");
  var shownDay = "";
  var midnightTimer;

  function pad(n) {
    return (n < 10 ? "0" : "") + n;
  }

  // Built from local date parts; toISOString() would give the UTC date instead.
  function localISODate(date) {
    return date.getFullYear() + "-" + pad(date.getMonth() + 1) + "-" + pad(date.getDate());
  }

  function updateDate() {
    var now = new Date();
    var isoDay = localISODate(now);

    if (isoDay !== shownDay) {
      shownDay = isoDay;

      if (todayEl) {
        todayEl.textContent = now.toLocaleDateString(undefined, {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric"
        });
        todayEl.setAttribute("datetime", isoDay);
      }

      if (issueEl) {
        // Compare calendar days via UTC so daylight-saving shifts can't skew the count.
        var today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
        var firstIssue = Date.UTC(2026, 0, 1);
        issueEl.textContent = String(Math.max(1, Math.round((today - firstIssue) / 86400000) + 1));
      }

      if (yearEl) {
        yearEl.textContent = String(now.getFullYear());
      }
    }

    clearTimeout(midnightTimer);
    var nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    midnightTimer = setTimeout(updateDate, nextMidnight - now + 1000);
  }

  updateDate();

  // Timers can be paused while a tab sleeps, so re-check when the reader returns.
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) updateDate();
  });
  window.addEventListener("focus", updateDate);

  /* ---------- Type size controls ---------- */

  var STORAGE_KEY = "atl-text-scale";
  var MIN = 87.5;
  var MAX = 150;
  var STEP = 12.5;

  function readScale() {
    try {
      var saved = parseFloat(localStorage.getItem(STORAGE_KEY));
      return isNaN(saved) ? 100 : saved;
    } catch (e) {
      return 100;
    }
  }

  function applyScale(scale) {
    scale = Math.min(MAX, Math.max(MIN, scale));
    // Percentage keeps the reader's own browser font-size preference as the baseline.
    root.style.fontSize = scale + "%";
    try {
      localStorage.setItem(STORAGE_KEY, String(scale));
    } catch (e) {
      /* storage unavailable: setting still applies for this visit */
    }
    return scale;
  }

  var scale = applyScale(readScale());

  var status = document.createElement("p");
  status.className = "visually-hidden";
  status.setAttribute("role", "status");
  document.body.appendChild(status);

  document.querySelectorAll("[data-size]").forEach(function (button) {
    button.addEventListener("click", function () {
      var action = button.getAttribute("data-size");
      if (action === "up") scale = applyScale(scale + STEP);
      else if (action === "down") scale = applyScale(scale - STEP);
      else scale = applyScale(100);
      status.textContent = "Text size " + scale + " percent";
    });
  });
})();
