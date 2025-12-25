import axios from "axios";

const baseUrl = process.env.REMNAWAVE_PANEL_URL

export const instance = axios.create({
    baseURL: baseUrl,
    headers: {
        'user-agent': 'Remnawave Mini App Subscription Page',
        Authorization: `Bearer ${process.env.REMNAWAVE_TOKEN}`
    }
})

if (baseUrl ? baseUrl.startsWith('http://') : false) {
    instance.defaults.headers.common['x-forwarded-for'] = '127.0.0.1'
    instance.defaults.headers.common['x-forwarded-proto'] = 'https'
}

if (process.env.AUTH_API_KEY) {
    instance.defaults.headers.common['X-Api-Key'] = `${process.env.AUTH_API_KEY}`
    }
