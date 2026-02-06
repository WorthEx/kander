import jwt from 'jsonwebtoken'
import {H3Event} from "h3";

export const issueTokenPair = (payload: Object, jwtSecret: string, event: H3Event) => {
    const newAccessToken = jwt.sign(payload, jwtSecret, {expiresIn: '5m'})

    const newRefreshToken = jwt.sign(payload, jwtSecret, {expiresIn: '1w'})

    setCookie(event, 'accessToken', newAccessToken, {
        expires: new Date(Date.now() + (1000 * 60 * 5)),
    })
    setCookie(event, 'refreshToken', newRefreshToken, {
        expires: new Date(Date.now() + (1000 * 60 * 60 * 24 * 7)),
    })

    return {newAccessToken, newRefreshToken}
}