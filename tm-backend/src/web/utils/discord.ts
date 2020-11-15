import axios from 'axios'
import qs from 'qs'
import camelcaseKeys from 'camelcase-keys'
import { DiscordUserData, DiscordTokenData } from '../../common/interfaces'

const TOKEN_URL = 'https://discordapp.com/api/oauth2/token'
const DISCORD_API_BASE = 'https://discordapp.com/api/v6'

export async function fetchTokenFromCode(code: string) {
	let res = await axios.post(
		TOKEN_URL,
		qs.stringify({
			client_id: process.env.DISCORD_CLIENT_ID,
			client_secret: process.env.DISCORD_CLIENT_SECRET,
			grant_type: 'authorization_code',
			code,
			redirect_uri: `${process.env.API_BASE_URI}/auth/discord`,
			scope: 'identify email'
		}),
		{
			headers: {
				'content-type': 'application/x-www-form-urlencoded'
			}
		}
	)

	return (camelcaseKeys(res.data) as unknown) as DiscordTokenData
}

export async function fetchUser(userId: string, token: DiscordTokenData) {
	let res = await axios.request({
		method: 'get',
		url: `${DISCORD_API_BASE}/users/${userId}`,
		headers: {
			authorization: `${token.tokenType} ${token.accessToken}`
		}
	})

	return (camelcaseKeys(res.data) as unknown) as DiscordUserData
}
