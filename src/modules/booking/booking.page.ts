import escapeHtml from "../../utils/escape-html"

type Detail = { label: string, value: string }

type ResultPage = {
    ok: boolean
    title: string
    message: string
    details?: Detail[]
}

type ConfirmPage = {
    title: string
    message: string
    details?: Detail[]
    action: string
    fields: Record<string, string>
    submitLabel: string
}

const CHECK_ICON = `<path d="M20 6 9 17l-5-5" />`
const CROSS_ICON = `<path d="M18 6 6 18M6 6l12 12" />`
const WARN_ICON = `<path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />`

function rowsHtml(details: Detail[]) {
    if (!details.length) return ""
    const rows = details
        .map(({ label, value }) => `<div class="row"><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`)
        .join("")
    return `<dl>${rows}</dl>`
}

function shell({ state, icon, title, body }: { state: string, icon: string, title: string, body: string }) {
    return `<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex" />
<title>${escapeHtml(title)} — Zen</title>
<style>
:root {
  color-scheme: light dark;
  --bg: #f4f6f4;
  --card: #ffffff;
  --border: #e2e7e3;
  --text: #1b241f;
  --muted: #6d7a72;
  --accent: #2f7a5a;
  --accent-soft: #e6f2ec;
  --on-accent: #ffffff;
}
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #12160f;
    --card: #1b211b;
    --border: #2c342d;
    --text: #eef2ee;
    --muted: #9aa89f;
    --accent: #6cc196;
    --accent-soft: #1f3029;
    --on-accent: #10201a;
  }
}
[data-state="error"] { --accent: #b4453a; --accent-soft: #fbeae8; }
[data-state="warn"] { --accent: #a8641f; --accent-soft: #fbf1e3; }
@media (prefers-color-scheme: dark) {
  [data-state="error"] { --accent: #e88a80; --accent-soft: #33211f; }
  [data-state="warn"] { --accent: #e0a463; --accent-soft: #2f2517; }
}
* { box-sizing: border-box; }
body {
  margin: 0;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: var(--bg);
  color: var(--text);
  font: 16px/1.55 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
}
.card {
  width: 100%;
  max-width: 420px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 36px 28px 24px;
  text-align: center;
  box-shadow: 0 1px 2px rgba(0,0,0,.04), 0 12px 32px rgba(0,0,0,.06);
}
.icon {
  width: 60px;
  height: 60px;
  margin: 0 auto 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--accent-soft);
  color: var(--accent);
}
.icon svg { width: 28px; height: 28px; }
h1 { margin: 0 0 8px; font-size: 21px; font-weight: 650; letter-spacing: -.01em; }
.message { margin: 0; color: var(--muted); font-size: 15px; }
dl { margin: 26px 0 0; text-align: left; border-top: 1px solid var(--border); }
.row {
  display: flex;
  gap: 16px;
  justify-content: space-between;
  align-items: baseline;
  padding: 11px 2px;
  border-bottom: 1px solid var(--border);
  font-size: 14px;
}
dt { color: var(--muted); flex: none; }
dd { margin: 0; text-align: right; font-weight: 550; overflow-wrap: anywhere; }
button {
  width: 100%;
  margin-top: 24px;
  padding: 14px 24px;
  border: 0;
  border-radius: 10px;
  background: var(--accent);
  color: var(--on-accent);
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}
button:hover { opacity: .9; }
footer {
  margin-top: 24px;
  color: var(--muted);
  font-size: 12px;
  letter-spacing: .06em;
  text-transform: uppercase;
}
</style>
</head>
<body data-state="${state}">
<main class="card">
  <div class="icon">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      ${icon}
    </svg>
  </div>
  <h1>${escapeHtml(title)}</h1>
  ${body}
  <footer>Zen Massage</footer>
</main>
</body>
</html>`
}

function result({ ok, title, message, details = [] }: ResultPage) {
    return shell({
        state: ok ? "success" : "error",
        icon: ok ? CHECK_ICON : CROSS_ICON,
        title,
        body: `<p class="message">${escapeHtml(message)}</p>
  ${rowsHtml(details)}`,
    })
}

function confirm({ title, message, details = [], action, fields, submitLabel }: ConfirmPage) {
    const inputs = Object.entries(fields)
        .map(([name, value]) => `<input type="hidden" name="${escapeHtml(name)}" value="${escapeHtml(value)}" />`)
        .join("")

    return shell({
        state: "warn",
        icon: WARN_ICON,
        title,
        body: `<p class="message">${escapeHtml(message)}</p>
  ${rowsHtml(details)}
  <form method="post" action="${escapeHtml(action)}">${inputs}<button type="submit">${escapeHtml(submitLabel)}</button></form>`,
    })
}

const bookingPage = {
    result,
    confirm,
} as const

export default bookingPage
