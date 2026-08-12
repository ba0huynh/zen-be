const ESCAPES: Record<string, string> = {
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
}

function escapeHtml(value: string) {
    return value.replace(/[&<>"']/g, (char) => ESCAPES[char]!)
}

export default escapeHtml
