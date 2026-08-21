import env from "../../env";
import api from "./api";

async function sendMessage(text: string) {
    await api.fetch(env.slack.url!, { body: { text }, method: "POST" });
}

const Slack = {
    sendMessage,
} as const

export default Slack