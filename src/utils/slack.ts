import api from "./api";

const URL = "https://hooks.slack.com/services/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"
async function sendMessage(text: string) {
    await api.fetch(URL, { body: { text }, method: "POST" });
}

const Slack = {
    sendMessage,
} as const

export default Slack