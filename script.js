// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 天気SVGアイコン
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function _svg(body) {
  return (
    `<svg width="44" height="44" viewBox="0 0 48 48" fill="none" ` +
    `xmlns="http://www.w3.org/2000/svg" ` +
    `style="filter:drop-shadow(0 1px 4px rgba(0,0,0,0.7))">${body}</svg>`
  );
}

// 雲（楕円3つ＋矩形で構成）
function _cloud(col = "#ffffff", dx = 0, dy = 0) {
  const x = dx, y = dy;
  return (
    `<ellipse cx="${18 + x}" cy="${31 + y}" rx="8.5" ry="6.5" fill="${col}"/>` +
    `<ellipse cx="${27 + x}" cy="${25 + y}" rx="10.5" ry="8.5" fill="${col}"/>` +
    `<ellipse cx="${36 + x}" cy="${30 + y}" rx="7.5"  ry="6"   fill="${col}"/>` +
    `<rect x="${18 + x}" y="${29 + y}" width="18" height="8" fill="${col}"/>`
  );
}

// 太陽（円＋8本の光線）
function _sun(cx, cy, r, r1, r2) {
  let rays = "";
  for (let i = 0; i < 8; i++) {
    const a  = (i / 8) * Math.PI * 2;
    const x1 = (cx + Math.cos(a) * r1).toFixed(1);
    const y1 = (cy + Math.sin(a) * r1).toFixed(1);
    const x2 = (cx + Math.cos(a) * r2).toFixed(1);
    const y2 = (cy + Math.sin(a) * r2).toFixed(1);
    rays += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#FFE44D" stroke-width="2.5" stroke-linecap="round"/>`;
  }
  return rays + `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#FFE44D"/>`;
}

// 雨粒（斜め線）
function _drop(x, y, col = "#7ec8ff") {
  return `<line x1="${x}" y1="${y}" x2="${x - 1.5}" y2="${y + 5.5}" stroke="${col}" stroke-width="2.5" stroke-linecap="round"/>`;
}

// 雪の結晶（3方向の線）
function _flake(cx, cy) {
  let s = "";
  for (let i = 0; i < 3; i++) {
    const a  = (i / 3) * Math.PI;
    const r  = 4;
    const x1 = (cx - Math.cos(a) * r).toFixed(1);
    const y1 = (cy - Math.sin(a) * r).toFixed(1);
    const x2 = (cx + Math.cos(a) * r).toFixed(1);
    const y2 = (cy + Math.sin(a) * r).toFixed(1);
    s += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#aacfff" stroke-width="2" stroke-linecap="round"/>`;
  }
  return s;
}

// 霧（横線）
function _fogLines() {
  return (
    `<line x1="6"  y1="14" x2="42" y2="14" stroke="#8899aa" stroke-width="3"   stroke-linecap="round"/>` +
    `<line x1="4"  y1="22" x2="44" y2="22" stroke="#8899aa" stroke-width="3.5" stroke-linecap="round"/>` +
    `<line x1="6"  y1="30" x2="42" y2="30" stroke="#8899aa" stroke-width="3"   stroke-linecap="round"/>` +
    `<line x1="10" y1="38" x2="38" y2="38" stroke="#8899aa" stroke-width="2.5" stroke-linecap="round"/>`
  );
}

// 稲妻
function _lightning() {
  return `<path d="M26,36 L22,36 L24,42 L20,42 L28,48 L25,42 L30,42Z" fill="#FFE44D"/>`;
}

// ── アイコン定義 ──────────────────────────────────
const WEATHER_ICONS = {
  sunny:       _svg(_sun(24, 24, 10, 14, 22)),
  mostlySunny: _svg(_sun(31, 18, 8, 11, 17) + _cloud("#e8f2fa", 0, 2)),
  partlyCloudy:_svg(_sun(33, 16, 7, 10, 15) + _cloud()),
  overcast:    _svg(_cloud("#b8c8d8", 0, -2) + _cloud()),
  fog:         _svg(_fogLines()),
  drizzle:     _svg(_cloud("#ccdded") + _drop(20, 40) + _drop(28, 43) + _drop(36, 40)),
  rain:        _svg(_cloud("#c0d4e8") + _drop(17, 39) + _drop(23, 42) + _drop(30, 39) + _drop(37, 42)),
  heavyRain:   _svg(_cloud("#b0c4dc") + _drop(14, 38) + _drop(20, 41) + _drop(26, 38) + _drop(32, 41) + _drop(38, 38)),
  snow:        _svg(_cloud("#cce0f4") + _flake(18, 42) + _flake(27, 45) + _flake(36, 42)),
  sleet:       _svg(_cloud("#c0d4e8") + _drop(17, 39) + _flake(27, 43) + _drop(37, 39)),
  thunder:     _svg(_cloud("#7888a0") + _lightning()),
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// WMO天気コード（Open-Meteo）→ 日本語テキスト + SVGアイコン
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const WMO_CODES = {
  0:  { text: "快晴",           icon: WEATHER_ICONS.sunny },
  1:  { text: "晴れ",           icon: WEATHER_ICONS.mostlySunny },
  2:  { text: "晴れ時々くもり", icon: WEATHER_ICONS.partlyCloudy },
  3:  { text: "くもり",         icon: WEATHER_ICONS.overcast },
  45: { text: "霧",             icon: WEATHER_ICONS.fog },
  48: { text: "着氷霧",         icon: WEATHER_ICONS.fog },
  51: { text: "霧雨",           icon: WEATHER_ICONS.drizzle },
  53: { text: "霧雨",           icon: WEATHER_ICONS.drizzle },
  55: { text: "強い霧雨",       icon: WEATHER_ICONS.drizzle },
  61: { text: "小雨",           icon: WEATHER_ICONS.rain },
  63: { text: "雨",             icon: WEATHER_ICONS.rain },
  65: { text: "大雨",           icon: WEATHER_ICONS.heavyRain },
  71: { text: "小雪",           icon: WEATHER_ICONS.snow },
  73: { text: "雪",             icon: WEATHER_ICONS.snow },
  75: { text: "大雪",           icon: WEATHER_ICONS.snow },
  77: { text: "霰",             icon: WEATHER_ICONS.sleet },
  80: { text: "にわか雨",       icon: WEATHER_ICONS.drizzle },
  81: { text: "雨",             icon: WEATHER_ICONS.rain },
  82: { text: "強いにわか雨",   icon: WEATHER_ICONS.heavyRain },
  85: { text: "にわか雪",       icon: WEATHER_ICONS.snow },
  86: { text: "強いにわか雪",   icon: WEATHER_ICONS.snow },
  95: { text: "雷雨",           icon: WEATHER_ICONS.thunder },
  96: { text: "雷雨（雹）",     icon: WEATHER_ICONS.thunder },
  99: { text: "激しい雷雨",     icon: WEATHER_ICONS.thunder },
};

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
// 時計（HH:MM のみ・縁取り）
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
  const wmo        = WMO_CODES[day.code] ?? { icon: WEATHER_ICONS.overcast, text: "不明" };
  const labelText  = isTomorrow ? "明日" : "今日";
  const labelClass = isTomorrow ? "tomorrow" : "today";

  const slide = document.getElementById("weather-slide");
  slide.classList.remove("in");
  void slide.offsetWidth;
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

async function fetchAllWeather() {
  const settled = await Promise.allSettled(CONFIG.weather.cities.map(fetchCityWeather));
  const results = settled.filter((r) => r.status === "fulfilled").map((r) => r.value);
  if (results.length > 0) weatherData = results;
}

async function initWeather() {
  const widget = document.getElementById("weather-widget");
  if (!CONFIG.weather.enabled) { widget.style.display = "none"; return; }

  await fetchAllWeather();
  renderWeatherSlide();
  setInterval(renderWeatherSlide, CONFIG.weather.cityInterval);
  setInterval(fetchAllWeather, CONFIG.weather.updateInterval);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 初期化
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

document.addEventListener("DOMContentLoaded", () => {
  initClock();
  initWeather();
  connectWebSocket();
});
