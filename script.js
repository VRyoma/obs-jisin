const API_URL = "https://api.p2pquake.net/v2/history?codes=551&limit=10";
const POLL_INTERVAL = 30000;
const MAX_AGE_HOURS = 24;
const DISPLAY_DURATION = 15000;

const SCALE_MAP = {
  10: { text: "震度1", class: "scale-1" },
  20: { text: "震度2", class: "scale-2" },
  30: { text: "震度3", class: "scale-3" },
  40: { text: "震度4", class: "scale-4" },
  45: { text: "震度5弱", class: "scale-5lower" },
  50: { text: "震度5強", class: "scale-5upper" },
  55: { text: "震度6弱", class: "scale-6lower" },
  60: { text: "震度6強", class: "scale-6upper" },
  70: { text: "震度7", class: "scale-7" },
};

const TSUNAMI_MAP = {
  None: null,
  Unknown: null,
  Checking: "津波の有無を調査中",
  NonEffective: "若干の海面変動（被害の心配なし）",
  Watch: "⚠ 津波注意報 発令中",
  Warning: "🔴 津波警報 発令中",
};

let displayedIds = new Set();
let tickerQueue = [];
let isDisplaying = false;

function parseApiTime(timeStr) {
  const normalized = timeStr.replace(/\//g, "-");
  return new Date(normalized);
}

function formatTime(timeStr) {
  const d = parseApiTime(timeStr);
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${month}月${day}日 ${hours}:${minutes}`;
}

function isRecent(timeStr) {
  const quakeTime = parseApiTime(timeStr);
  const now = new Date();
  const diffMs = now - quakeTime;
  return diffMs < MAX_AGE_HOURS * 60 * 60 * 1000;
}

function createTickerElement(quake) {
  const eq = quake.earthquake;
  const scale = SCALE_MAP[eq.maxScale];
  if (!scale) return null;

  const hypo = eq.hypocenter || {};

  const ticker = document.createElement("div");
  ticker.className = `ticker ${scale.class}`;

  const label = document.createElement("div");
  label.className = "ticker-label";
  label.textContent = "地震情報";

  const content = document.createElement("div");
  content.className = "ticker-content";

  const timeSpan = document.createElement("span");
  timeSpan.className = "time";
  timeSpan.textContent = formatTime(eq.time);

  const location = document.createElement("span");
  location.className = "location";
  location.textContent = hypo.name || "震源調査中";

  const intensity = document.createElement("div");
  intensity.className = "intensity-badge";
  intensity.textContent = scale.text;

  content.appendChild(timeSpan);
  content.appendChild(location);

  if (hypo.magnitude > 0) {
    const mag = document.createElement("span");
    mag.className = "magnitude";
    mag.textContent = `M${hypo.magnitude.toFixed(1)}`;
    content.appendChild(mag);
  }

  if (hypo.depth >= 0) {
    const depth = document.createElement("span");
    depth.className = "depth";
    depth.textContent = `深さ${hypo.depth === 0 ? "ごく浅い" : hypo.depth + "km"}`;
    content.appendChild(depth);
  }

  const tsunamiText = TSUNAMI_MAP[eq.domesticTsunami];
  if (tsunamiText) {
    const tsunami = document.createElement("span");
    tsunami.className = "tsunami-warn";
    tsunami.textContent = tsunamiText;
    content.appendChild(tsunami);
  }

  ticker.appendChild(label);
  ticker.appendChild(content);
  ticker.appendChild(intensity);

  return ticker;
}

function showTicker(quake) {
  const container = document.getElementById("ticker-container");
  const el = createTickerElement(quake);
  if (!el) return Promise.resolve();

  container.appendChild(el);

  return new Promise((resolve) => {
    setTimeout(() => {
      el.classList.add("hiding");
      el.addEventListener("animationend", () => {
        el.remove();
        resolve();
      });
    }, DISPLAY_DURATION);
  });
}

async function processQueue() {
  if (isDisplaying || tickerQueue.length === 0) return;
  isDisplaying = true;

  try {
    while (tickerQueue.length > 0) {
      const quake = tickerQueue.shift();
      await showTicker(quake);
      if (tickerQueue.length > 0) {
        await new Promise((r) => setTimeout(r, 500));
      }
    }
  } catch (e) {
    console.error("テロップ表示エラー:", e);
  } finally {
    isDisplaying = false;
  }
}

async function fetchEarthquakes() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) return;

    const data = await res.json();

    const recent = data
      .filter((item) => {
        if (item.code !== 551) return false;
        if (!item.earthquake) return false;
        if (!isRecent(item.earthquake.time)) return false;
        return true;
      })
      .sort((a, b) => parseApiTime(a.earthquake.time) - parseApiTime(b.earthquake.time));

    for (const quake of recent) {
      const hypo = quake.earthquake.hypocenter || {};
      const id = quake.id || quake.earthquake.time + (hypo.name || "");
      if (!displayedIds.has(id)) {
        displayedIds.add(id);
        tickerQueue.push(quake);
      }
    }

    processQueue();
  } catch (e) {
    console.error("地震情報の取得に失敗:", e);
  }
}

fetchEarthquakes();
setInterval(fetchEarthquakes, POLL_INTERVAL);
