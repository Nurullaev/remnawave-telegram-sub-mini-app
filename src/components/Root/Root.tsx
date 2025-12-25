'use client'

import { type PropsWithChildren, useEffect, useState } from 'react'

import '@mantine/core/styles.layer.css'
import '@mantine/dates/styles.layer.css'
import '@mantine/notifications/styles.layer.css'
import '@mantine/nprogress/styles.layer.css'

initDayjs()

import { Center, Container, MantineProvider, Stack, Title } from '@mantine/core'

import {
    initData,
    useLaunchParams,
    miniApp,
    viewport,
    useSignal,
    initDataRaw as _initDataRaw
} from '@telegram-apps/sdk-react'

import { ErrorBoundary } from '@/components/ErrorBoundary'
import { ErrorPage } from '@/components/ErrorPage'
import { Loading } from '@/components/Loading/Loading'
import { useDidMount } from '@/hooks/useDidMount'
import { setLocale } from '@/core/i18n/locale'
import { theme } from '@/config/theme'
import { fetchUserByTelegramId } from '@/api/fetchUserByTgId'
import { consola } from 'consola/browser'
import {
    useSubscriptionInfoStoreActions,
    useSubscriptionInfoStoreInfo
} from '@/store/subscriptionInfo'
import {
    SubscriptionPageRawConfigSchema,
    TSubscriptionPageRawConfig
} from '@remnawave/subscription-page-types'
import { useSubscriptionConfigStoreActions, useIsConfigLoaded } from '@/store/subscriptionConfig'
import { ofetch } from 'ofetch'
import { ErrorConnection } from '@/components/ErrorConnection/ErrorConnection'
import { initDayjs } from '@/utils/initDayjs'
import { fetchAppEnv } from '@/api/fetchAppEnv'
import { useAppConfigStoreActions } from '@/store/appConfig'

type TConfigsMap = Record<string, TSubscriptionPageRawConfig>

function RootInner({ children }: PropsWithChildren) {
    const lp = useLaunchParams()
    const debug = lp.startParam === 'debug'
    const initDataRaw = useSignal(_initDataRaw)
    const subscriptionActions = useSubscriptionInfoStoreActions()
    const configActions = useSubscriptionConfigStoreActions()
    const appConfigActions = useAppConfigStoreActions()

    const { subscription } = useSubscriptionInfoStoreInfo()
    const isConfigLoaded = useIsConfigLoaded()

    const [errorConnect, setErrorConnect] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    if (miniApp.mount.isAvailable()) {
        miniApp.mount()
    }
    if (miniApp.setHeaderColor.isAvailable()) {
        miniApp.setHeaderColor('#161b22')
        miniApp.headerColor()
    }

    if (miniApp.setBackgroundColor.isAvailable()) {
        miniApp.setBackgroundColor('#161b22')
        miniApp.backgroundColor()
    }

    const initDataUser = useSignal(initData.user)
    // Set the user locale.
    useEffect(() => {
        if (initDataUser) {
            setLocale(initDataUser.language_code)
        }
    }, [initDataUser])

    useEffect(() => {
        if (initDataRaw) {
            const fetchSubscription = async () => {
                // setIsLoading(true)
                try {
                    const subscription = await fetchUserByTelegramId(initDataRaw as string)
                    if (subscription) {
                        // setSubscription(user)
                        subscriptionActions.setSubscriptionInfo({
                            subscription
                        })
                    }
                } catch (error) {
                    const errorMessage =
                        error instanceof Error ? error.message : 'Unknown error occurred'
                    if (errorMessage !== 'Users not found') {
                        setErrorConnect('ERR_FATCH_USER')
                    }
                    consola.error('Failed to fetch subscription:', error)
                } finally {
                    // setSubscriptionLoaded(true)
                    setIsLoading(false)
                }
            }

            fetchSubscription()
        }
    }, [initDataRaw])

    useEffect(() => {
        if (!subscription) return () => {}

        const fetchConfig = async () => {
            try {
                const configs = await ofetch<TConfigsMap>(`/app-data.json?v=${Date.now()}`, {
                    parseResponse: JSON.parse
                })

                let tempConfig
                const targetUuid = '00000000-0000-0000-0000-000000000000'

                if (subscription?.subpageConfigUuid) {
                    tempConfig = configs[subscription?.subpageConfigUuid]
                } else {
                    tempConfig = configs[targetUuid]
                }

                const parsedConfig =
                    await SubscriptionPageRawConfigSchema.safeParseAsync(tempConfig)

                if (!parsedConfig.success) {
                    setErrorConnect('ERR_PARSE_APPCONFIG')
                    consola.error('Failed to parse app config:', parsedConfig.error)
                    return
                }

                configActions.setConfig(parsedConfig.data)
            } catch (error) {
                setErrorConnect('ERR_PARSE_APPCONFIG')
                consola.error('Failed to fetch app config:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchConfig()
    }, [subscription])

    useEffect(() => {
        const fetchAppConfig = async () => {
            try {
                const appConfig = await fetchAppEnv()

                if (appConfig) {
                    appConfigActions.setAppConfig(appConfig)
                }
            } catch (error) {
                consola.error('Failed to fetch app config:', error)
            }
        }

        fetchAppConfig()
    }, [])

    if (isLoading || !isConfigLoaded || !subscription) return <Loading />

    if (errorConnect)
        return (
            <Container my="xl" size="xl">
                <Center>
                    <Stack gap="xl">
                        <Title style={{ textAlign: 'center' }} order={4}>
                            {errorConnect === 'ERR_FATCH_USER'
                                ? 'Error get user'
                                : errorConnect === 'ERR_PARSE_APPCONFIG'
                                  ? 'Error parsing app config'
                                  : JSON.stringify(errorConnect)}
                        </Title>
                        <ErrorConnection />
                    </Stack>
                </Center>
            </Container>
        )

    return <>{children}</>
}

export function Root(props: PropsWithChildren) {
    // Unfortunately, Telegram Mini Apps does not allow us to use all features of
    // the Server Side Rendering. That's why we are showing loader on the server
    // side.
    const didMount = useDidMount()

    return didMount ? (
        <MantineProvider defaultColorScheme="dark" theme={theme}>
            <ErrorBoundary fallback={ErrorPage}>
                <RootInner {...props} />
            </ErrorBoundary>
        </MantineProvider>
    ) : (
        <MantineProvider defaultColorScheme="dark" theme={theme}>
            <Loading />
        </MantineProvider>
    )
}
