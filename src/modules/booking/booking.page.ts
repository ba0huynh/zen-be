type ResultPage = {
    ok: boolean
    title: string
    message: string
    details?: { label: string, value: string }[]
}

const ESCAPES: Record<string, string> = {
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
}
function escape(value: string) {
    return value.replace(/[&<>"']/g, (char) => ESCAPES[char]!)
}

const CHECK_ICON = `<path d="M20 6 9 17l-5-5" />`
const CROSS_ICON = `<path d="M18 6 6 18M6 6l12 12" />`

function result({ ok, title, message, details = [] }: ResultPage) {
    const rows = details
        .map(({ label, value }) => `<div class="row"><dt>${escape(label)}</dt><dd>${escape(value)}</dd></div>`)
        .join("")

    return `<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex" />
<title>${escape(title)} — Zen</title>
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
  }
}
[data-state="error"] {
  --accent: #b4453a;
  --accent-soft: #fbeae8;
}
@media (prefers-color-scheme: dark) {
  [data-state="error"] {
    --accent: #e88a80;
    --accent-soft: #33211f;
  }
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
h1 {
  margin: 0 0 8px;
  font-size: 21px;
  font-weight: 650;
  letter-spacing: -.01em;
}
.message {
  margin: 0;
  color: var(--muted);
  font-size: 15px;
}
dl {
  margin: 26px 0 0;
  text-align: left;
  border-top: 1px solid var(--border);
}
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
dd {
  margin: 0;
  text-align: right;
  font-weight: 550;
  overflow-wrap: anywhere;
}
footer {
  margin-top: 24px;
  color: var(--muted);
  font-size: 12px;
  letter-spacing: .06em;
  text-transform: uppercase;
}
</style>
</head>
<body data-state="${ok ? "success" : "error"}">
<main class="card">
  <div class="icon">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      ${ok ? CHECK_ICON : CROSS_ICON}
    </svg>
  </div>
  <h1>${escape(title)}</h1>
  <p class="message">${escape(message)}</p>
  ${rows ? `<dl>${rows}</dl>` : ""}
  <footer>Zen Massage</footer>
</main>
</body>
</html>`
}

const bookingPage = {
    result,
} as const

export default bookingPage
