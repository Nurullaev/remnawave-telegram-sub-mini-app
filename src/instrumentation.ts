// instrumentation.js
import {
    GetSubscriptionPageConfigCommand,
    GetSubscriptionPageConfigsCommand
} from '@remnawave/backend-contract'
import { consola } from 'consola/browser'
import {
    SubscriptionPageRawConfigSchema,
    TSubscriptionPageRawConfig
} from '@remnawave/subscription-page-types'
import { instance } from '@/axios/instance'

export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        const fs = await import('fs')
        const path = await import('path')

        const subpageConfigMap = new Map<string, TSubscriptionPageRawConfig>()

        // const baseUrl = process.env.REMNAWAVE_PANEL_URL
        //
        // const instance = axios.create({
        //     baseURL: baseUrl,
        //     headers: {
        //         'user-agent': 'Remnawave Mini App Subscription Page',
        //         Authorization: `Bearer ${process.env.REMNAWAVE_TOKEN}`
        //     }
        // })
        //
        // if (baseUrl ? baseUrl.startsWith('http://') : false) {
        //     instance.defaults.headers.common['x-forwarded-for'] = '127.0.0.1'
        //     instance.defaults.headers.common['x-forwarded-proto'] = 'https'
        // }
        //
        // if (process.env.AUTH_API_KEY) {
        //     instance.defaults.headers.common['X-Api-Key'] = `${process.env.AUTH_API_KEY}`
        //     }

        try {
            const response = await instance.request<GetSubscriptionPageConfigsCommand.Response>({
                method: GetSubscriptionPageConfigsCommand.endpointDetails.REQUEST_METHOD,
                url: GetSubscriptionPageConfigsCommand.url
            })

            const validationResult =
                await GetSubscriptionPageConfigsCommand.ResponseSchema.parseAsync(response.data)

            if (!validationResult) {
                consola.error('Subscription page config list cannot be fetched')
            }

            const subscriptionPageConfigList = validationResult.response.configs.map(
                (config) => config.uuid
            )

            for (const configUuid of subscriptionPageConfigList) {
                const subscriptionPageConfig =
                    await instance.request<GetSubscriptionPageConfigCommand.Response>({
                        method: GetSubscriptionPageConfigCommand.endpointDetails.REQUEST_METHOD,
                        url: GetSubscriptionPageConfigCommand.url(configUuid)
                    })

                if (!subscriptionPageConfig.data.response.config) {
                    consola.error(`Subscription page config ${configUuid} cannot be fetched`)
                    continue
                }

                const parsedConfig = await SubscriptionPageRawConfigSchema.safeParseAsync(
                    subscriptionPageConfig.data.response.config
                )

                if (!parsedConfig.success) {
                    consola.error(
                        `[ERROR] ${configUuid} is not valid: ${JSON.stringify(parsedConfig.error)}`
                    )

                    continue
                }

                consola.success(`✅ [OK] ${configUuid}`)
                subpageConfigMap.set(configUuid, parsedConfig.data)
            }

            const dirPath = path.join(process.cwd(), 'public')
            const filePath = path.join(dirPath, 'app-data.json')

            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, { recursive: true })
            }

            const obj = Object.fromEntries(subpageConfigMap)
            fs.writeFileSync(filePath, JSON.stringify(obj, null, 2))
            consola.log('✅ Subscription configs have been successfully added to the application')
        } catch (error) {
            // @ts-ignore
            consola.error('❌ Error initial subscription config:', error.message)
        }
    }
}
