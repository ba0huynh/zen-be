import api from "./api";

const URL = "https://hooks.slack.com/services/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"
async function sendMessage(text: string) {
    // await api.fetch(URL, { body: { text }, method: "POST" });
}

const Slack = {
    sendMessage,
} as const

export default Slack