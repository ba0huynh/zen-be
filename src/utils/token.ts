import { createHmac, timingSafeEqual } from "node:crypto"
import env from "../../env"

function sign(value: string) {
    return createHmac("sha256", env.app.secret).update(value).digest("base64url")
}

function verify(value: string, token: string) {
    const expected = Buffer.from(sign(value))
    const actual = Buffer.from(token)
    return expected.length === actual.length && timingSafeEqual(expected, actual)
}

const appToken = {
    sign,
    verify,
} as const

export default appToken
