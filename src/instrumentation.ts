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

const delay = (ms: number | undefined) => new Promise((res) => setTimeout(res, ms))

export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        const fs = await import('fs')
        const path = await import('path')

        const subpageConfigMap = new Map<string, TSubscriptionPageRawConfig>()
        let response = null
        let isConnected = false

        while (!isConnected) {
            try {
                consola.info('🔄 Trying to fetch subscription configs...')
                response = await instance.request({
                    method: GetSubscriptionPageConfigsCommand.endpointDetails.REQUEST_METHOD,
                    url: GetSubscriptionPageConfigsCommand.url
                })

                isConnected = true
            } catch (error) {
                // @ts-ignore
                consola.warn('⚠️ API not available yet, retrying in 5 seconds...', error.message)
                await delay(5000)
            }
        }

        try {
            // const response = await instance.request<GetSubscriptionPageConfigsCommand.Response>({
            //     method: GetSubscriptionPageConfigsCommand.endpointDetails.REQUEST_METHOD,
            //     url: GetSubscriptionPageConfigsCommand.url
            // })
            const validationResult =
                await GetSubscriptionPageConfigsCommand.ResponseSchema.parseAsync(response?.data)

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
            const version = process.env.npm_package_version || 'unknown'
            const label = `Reway subscription mini app v${version} started`

            const green = '\x1b[32m'
            const bold = '\x1b[1m'
            const reset = '\x1b[0m'

            const line = '━'.repeat(label.length + 8)

            console.log(`
${green}${bold}┏${line}┓
┃    ${label}    ┃
┗${line}┛${reset}
`)
        } catch (error) {
            // @ts-ignore
            consola.error('❌ Error initial subscription config:', error.message)
        }
    }
}
