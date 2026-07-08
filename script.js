// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 震度マッピング
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const SCALE_MAP = {
  10: { text: "震度1",   class: "scale-1" },
  20: { text: "震度2",   class: "scale-2" },
  30: { text: "震度3",   class: "scale-3" },
  40: { text: "震度4",   class: "scale-4" },
  45: { text: "震度5弱", class: "scale-5lower" },
  50: { text: "震度5強", class: "scale-5upper" },
  55: { text: "震度6弱", class: "scale-6lower" },
  60: { text: "震度6強", class: "scale-6upper" },
  70: { text: "震度7",   class: "scale-7" },
};

const TSUNAMI_MAP = {
  None:         null,
  Unknown:      null,
  Checking:     "津波の有無を調査中",
  NonEffective: "若干の海面変動（被害の心配なし）",
  Watch:        "⚠ 津波注意報 発令中",
  Warning:      "🔴 津波警報 発令中",
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// WMO天気コード（Open-Meteo）→ 日本語
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const WMO_CODES = {
  0:  { text: "快晴",           icon: "☀️" },
  1:  { text: "晴れ",           icon: "🌤" },
  2:  { text: "晴れ時々くもり", icon: "⛅" },
  3:  { text: "くもり",         icon: "☁️" },
  45: { text: "霧",             icon: "🌫" },
  48: { text: "着氷霧",         icon: "🌫" },
  51: { text: "霧雨",           icon: "🌦" },
  53: { text: "霧雨",           icon: "🌦" },
  55: { text: "強い霧雨",       icon: "🌦" },
  61: { text: "小雨",           icon: "🌧" },
  63: { text: "雨",             icon: "🌧" },
  65: { text: "大雨",           icon: "🌧" },
  71: { text: "小雪",           icon: "❄️" },
  73: { text: "雪",             icon: "❄️" },
  75: { text: "大雪",           icon: "❄️" },
  77: { text: "霰",             icon: "🌨" },
  80: { text: "にわか雨",       icon: "🌦" },
  81: { text: "雨",             icon: "🌧" },
  82: { text: "強いにわか雨",   icon: "🌧" },
  85: { text: "にわか雪",       icon: "🌨" },
  86: { text: "強いにわか雪",   icon: "🌨" },
  95: { text: "雷雨",           icon: "⛈️" },
  96: { text: "雷雨（雹）",     icon: "⛈️" },
  99: { text: "激しい雷雨",     icon: "⛈️" },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 地震テロップ
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const displayedIds = new Set();
const tickerQueue  = [];
let isDisplaying   = false;

function parseApiTime(timeStr) {
  return new Date(timeStr.replace(/\//g, "-"));
}

function formatTime(timeStr) {
  const d  = parseApiTime(timeStr);
  const m  = d.getMonth() + 1;
  const dd = d.getDate();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${m}月${dd}日 ${hh}:${mm}`;
}

function isWithinHours(timeStr, hours) {
  return Date.now() - parseApiTime(timeStr) < hours * 3_600_000;
}

function createTickerElement(quake) {
  const eq    = quake.earthquake;
  const scale = SCALE_MAP[eq.maxScale];
  if (!scale) return null;

  const hypo = eq.hypocenter || {};

  const ticker = document.createElement("div");
  ticker.className = `ticker ${scale.class}`;

  const label = document.createElement("div");
  label.className   = "ticker-label";
  label.textContent = "地震情報";

  const content = document.createElement("div");
  content.className = "ticker-content";

  const timeSpan = document.createElement("span");
  timeSpan.className   = "time";
  timeSpan.textContent = formatTime(eq.time);

  const location = document.createElement("span");
  location.className   = "location";
  location.textContent = hypo.name || "震源調査中";

  const badge = document.createElement("div");
  badge.className   = "intensity-badge";
  badge.textContent = scale.text;

  content.appendChild(timeSpan);
  content.appendChild(location);

  if (hypo.magnitude > 0) {
    const mag = document.createElement("span");
    mag.className   = "magnitude";
    mag.textContent = `M${hypo.magnitude.toFixed(1)}`;
    content.appendChild(mag);
  }

  if (hypo.depth >= 0) {
    const depth = document.createElement("span");
    depth.className   = "depth";
    depth.textContent = `深さ${hypo.depth === 0 ? "ごく浅い" : hypo.depth + "km"}`;
    content.appendChild(depth);
  }

  const tsunamiText = TSUNAMI_MAP[eq.domesticTsunami];
  if (tsunamiText) {
    const tsunami = document.createElement("span");
    tsunami.className   = "tsunami-warn";
    tsunami.textContent = tsunamiText;
    content.appendChild(tsunami);
  }

  ticker.appendChild(label);
  ticker.appendChild(content);
  ticker.appendChild(badge);
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
      el.addEventListener("animationend", () => { el.remove(); resolve(); });
    }, CONFIG.earthquake.displayDuration);
  });
}

async function processQueue() {
  if (isDisplaying || tickerQueue.length === 0) return;
  isDisplaying = true;
  try {
    while (tickerQueue.length > 0) {
      const quake = tickerQueue.shift();
      await showTicker(quake);
      if (tickerQueue.length > 0) await new Promise((r) => setTimeout(r, 500));
    }
  } catch (e) {
    console.error("テロップ表示エラー:", e);
  } finally {
    isDisplaying = false;
  }
}

function handleEarthquake(data) {
  if (!data.earthquake) return;
  const hypo = data.earthquake.hypocenter || {};
  const id   = data.id || (data.earthquake.time + (hypo.name || ""));
  if (displayedIds.has(id)) return;
  displayedIds.add(id);
  tickerQueue.push(data);
  processQueue();
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// WebSocket（P2P地震情報リアルタイム）
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

let ws               = null;
let wsReconnectDelay = 1000;

function connectWebSocket() {
  ws = new WebSocket("wss://api.p2pquake.net/v2/ws");

  ws.onopen = () => {
    console.log("WebSocket接続完了");
    wsReconnectDelay = 1000;
  };

  ws.onmessage = (event) => {
    let data;
    try { data = JSON.parse(event.data); } catch { return; }
    if (data.code !== 551) return;

    const hours = CONFIG.earthquake.initialHistoryHours;
    if (hours > 0 && data.earthquake && !isWithinHours(data.earthquake.time, hours)) return;

    handleEarthquake(data);
  };

  ws.onclose = () => {
    console.log(`WebSocket切断。${wsReconnectDelay / 1000}秒後に再接続...`);
    setTimeout(connectWebSocket, wsReconnectDelay);
    wsReconnectDelay = Math.min(wsReconnectDelay * 2, 30_000);
  };

  ws.onerror = () => ws.close();
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 時計（HH:MM のみ、NHKスタイル）
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function updateClock() {
  const now = new Date();
  const hh  = String(now.getHours()).padStart(2, "0");
  const mm  = String(now.getMinutes()).padStart(2, "0");
  document.getElementById("clock-time").textContent = `${hh}:${mm}`;
}

function initClock() {
  const widget = document.getElementById("clock-widget");
  if (!CONFIG.clock.enabled) { widget.style.display = "none"; return; }
  updateClock();
  setInterval(updateClock, 1000);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 天気予報（切り替え表示）
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

let weatherData  = [];
let weatherIndex = 0;
let weatherTimer = null;

// 18時以降は翌日の天気を表示
function shouldShowTomorrow() {
  return new Date().getHours() >= 18;
}

async function fetchCityWeather(city) {
  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${city.lat}&longitude=${city.lon}` +
    `&current=temperature_2m,weather_code` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min` +
    `&timezone=Asia%2FTokyo&forecast_days=2`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const d = await res.json();
  return {
    name: city.name,
    today: {
      code: d.daily.weather_code[0],
      high: Math.round(d.daily.temperature_2m_max[0]),
      low:  Math.round(d.daily.temperature_2m_min[0]),
    },
    tomorrow: {
      code: d.daily.weather_code[1],
      high: Math.round(d.daily.temperature_2m_max[1]),
      low:  Math.round(d.daily.temperature_2m_min[1]),
    },
  };
}

function renderWeatherSlide() {
  if (weatherData.length === 0) return;

  const city       = weatherData[weatherIndex];
  const isTomorrow = shouldShowTomorrow();
  const day        = isTomorrow ? city.tomorrow : city.today;
  const wmo        = WMO_CODES[day.code] ?? { icon: "❓", text: "不明" };
  const labelText  = isTomorrow ? "明日" : "今日";
  const labelClass = isTomorrow ? "tomorrow" : "today";

  const slide = document.getElementById("weather-slide");
  slide.classList.remove("in");
  void slide.offsetWidth; // reflow でアニメーションをリセット
  slide.classList.add("in");

  slide.innerHTML =
    `<span class="w-label ${labelClass}">${labelText}</span>` +
    `<span class="w-city">${city.name}</span>` +
    `<span class="w-icon">${wmo.icon}</span>` +
    `<span class="w-cond">${wmo.text}</span>` +
    `<span class="w-temp">` +
      `<span class="hi">${day.high}°</span>` +
      `<span class="sep">/</span>` +
      `<span class="lo">${day.low}°</span>` +
    `</span>`;

  weatherIndex = (weatherIndex + 1) % weatherData.length;
}

function startWeatherCycle() {
  renderWeatherSlide();
  weatherTimer = setInterval(renderWeatherSlide, CONFIG.weather.cityInterval);
}

async function fetchAllWeather() {
  const settled = await Promise.allSettled(CONFIG.weather.cities.map(fetchCityWeather));
  const results = settled.filter((r) => r.status === "fulfilled").map((r) => r.value);
  if (results.length > 0) weatherData = results;
}

async function initWeather() {
  const widget = document.getElementById("weather-widget");
  if (!CONFIG.weather.enabled) { widget.style.display = "none"; return; }

  await fetchAllWeather();
  startWeatherCycle();

  setInterval(async () => {
    await fetchAllWeather();
  }, CONFIG.weather.updateInterval);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 初期化
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

document.addEventListener("DOMContentLoaded", () => {
  initClock();
  initWeather();
  connectWebSocket();
});
