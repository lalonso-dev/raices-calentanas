const setCookie = function (
  name,
  value,
  { days = 365, path = "/", sameSite = "Lax", secure = false } = {},
) {
  let cookie = `${name}=${encodeURIComponent(value)}; Path=${path}; SameSite=${sameSite}`;
  if (secure) cookie += "; Secure";
  if (days) {
    const d = new Date();
    d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
    cookie += `; Expires=${d.toUTCString()}`;
  }
  document.cookie = cookie;
};

const getCookie = function (name) {
  const m = document.cookie.match(
    new RegExp(
      "(?:^|; )" + name.replace(/([$?*|{}\[\]\\\/\+^])/g, "\\$1") + "=([^;]*)",
    ),
  );
  return m ? decodeURIComponent(m[1]) : null;
};

const COOKIE_NAME = "rc_dllimit";
const WINDOW_MS = 20 * 60 * 1000;
const MAX_DL = 5;

function readState() {
  try {
    const raw = getCookie(COOKIE_NAME);
    return raw ? JSON.parse(atob(raw)) : { t: [], b: 0 };
  } catch {
    return { t: [], b: 0 };
  }
}
const writeState = function (state) {
  const now = Date.now();
  state.t = (state.t || []).filter((ts) => now - ts <= WINDOW_MS);
  setCookie(COOKIE_NAME, btoa(JSON.stringify(state)), {
    days: 365,
    path: "/",
    sameSite: "Lax",
    secure: location.protocol === "https:",
  });
};

const timeLeft = function (ms) {
  const m = Math.ceil(ms / 60000);
  if (m <= 1) return "≈1 minuto";
  return `≈${m} minutos`;
};

const canDownloadAndMaybeRecord = function (record = false) {
  const now = Date.now();
  const state = readState();

  if (state.b && state.b > now) {
    return { ok: false, waitMs: state.b - now };
  }

  state.t = state.t.filter((ts) => now - ts <= WINDOW_MS);

  if (state.t.length >= MAX_DL) {
    state.b = now + WINDOW_MS;
    writeState(state);
    return { ok: false, waitMs: WINDOW_MS };
  }

  if (record) {
    state.t.push(now);
    if (state.t.length >= MAX_DL) state.b = now + WINDOW_MS;
    writeState(state);
  }
  return { ok: true, remaining: Math.max(0, MAX_DL - state.t.length) };
};

const handleDownloadClick = function (element, type = "") {
  if (!type) return;

  const url = type === "file" ? window?.ufile || "" : window?.ufileMus || "";

  if (!url) return;

  const check = canDownloadAndMaybeRecord(false);
  if (!check.ok) {
    alert(
      `Has alcanzado el límite de descargas.\nVuelve a intentarlo en ${timeLeft(check.waitMs)}.`,
    );
    return;
  }

  const title = element.getAttribute("data-title");

  const a = document.createElement("a");
  a.href = atob(url);
  a.download = title.length > 0 ? title : "Download file";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  canDownloadAndMaybeRecord(true);
};

window.handleDownloadClick = handleDownloadClick;
