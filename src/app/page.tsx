'use client'

import { Center, Container, Group, Stack, Title, Image, Box } from '@mantine/core'
import { LanguagePicker } from '@/components/LanguagePicker/LanguagePicker'
import { AnimatedBackground } from '@/components/AnimatedBackground/AnimatedBackground'
import { Snowfall } from 'react-snowfall'
import { TSubscriptionPagePlatformKey } from '@remnawave/subscription-page-types'
import {
    useSubscriptionConfig,
    useSubscriptionConfigStoreActions,
    useCurrentLang
} from '@/store/subscriptionConfig'
import { Header } from '@/components/Header/Header'
import { useOs } from '@mantine/hooks'
import {
    AccordionBlockRenderer,
    CardsBlockRenderer,
    InstallationGuideConnector,
    MinimalBlockRenderer,
    TimelineBlockRenderer
} from '@/components/InstallationGuide'
import {
    SubscriptionInfoCards,
    SubscriptionInfoCollapsed,
    SubscriptionInfoExpanded
} from '@/components/SubscriptionInfo'
import { useAppConfigStoreInfo } from '@/store/appConfig'
import { useSubscription } from '@/store/subscriptionInfo'
import { SubscribeCta } from '@/components/SubscribeCTA/SubscribeCTA'
import { useTranslations } from 'next-intl'

function osToPlatform(os: string): TSubscriptionPagePlatformKey | undefined {
    switch (os) {
        case 'android':
            return 'android'
        case 'ios':
            return 'ios'
        case 'linux':
            return 'linux'
        case 'macos':
            return 'macos'
        case 'windows':
            return 'windows'
        default:
            return undefined
    }
}

const BLOCK_RENDERERS = {
    cards: CardsBlockRenderer,
    timeline: TimelineBlockRenderer,
    accordion: AccordionBlockRenderer,
    minimal: MinimalBlockRenderer
} as const

const SUBSCRIPTION_INFO_BLOCK_RENDERERS = {
    cards: SubscriptionInfoCards,
    collapsed: SubscriptionInfoCollapsed,
    expanded: SubscriptionInfoExpanded,
    hidden: null
} as const

export default function Home() {
    const config = useSubscriptionConfig()

    const t = useTranslations()
    const subscription = useSubscription()
    const currentLang = useCurrentLang()
    const { setLanguage } = useSubscriptionConfigStoreActions()
    const os = useOs({ getValueInEffect: false })
    const { appConfig } = useAppConfigStoreInfo()

    const activeSubscription =
        subscription?.user?.userStatus && subscription?.user?.userStatus === 'ACTIVE'

    const hasPlatformApps: Record<TSubscriptionPagePlatformKey, boolean> = {
        ios: Boolean(config.platforms.ios?.apps.length),
        android: Boolean(config.platforms.android?.apps.length),
        linux: Boolean(config.platforms.linux?.apps.length),
        macos: Boolean(config.platforms.macos?.apps.length),
        windows: Boolean(config.platforms.windows?.apps.length),
        androidTV: Boolean(config.platforms.androidTV?.apps.length),
        appleTV: Boolean(config.platforms.appleTV?.apps.length)
    }

    const atLeastOnePlatformApp = Object.values(hasPlatformApps).some((value) => value)

    const SubscriptionInfoBlockRenderer =
        SUBSCRIPTION_INFO_BLOCK_RENDERERS[config.uiConfig.subscriptionInfoBlockType]

    if (!activeSubscription)
        return (
            <Box
                style={{
                    height: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}
            >
                <Container size="xl">
                    <Stack gap="xl">
                        <Title style={{ textAlign: 'center' }} order={4}>
                            {t('main.page.component.no-sub')}
                        </Title>
                        <SubscribeCta />

                        <Center mt={20}>
                            <LanguagePicker
                                currentLang={currentLang}
                                locales={config.locales}
                                onLanguageChange={setLanguage}
                            />
                        </Center>
                    </Stack>
                </Container>
            </Box>
        )

    return (
        <Box style={{ position: 'relative', marginBottom: 20, padding: 0 }}>
            {appConfig?.isSnowflakeEnabled ? (
                <Snowfall style={{ position: 'fixed', zIndex: 2 }} speed={[0, 1]} />
            ) : (
                <AnimatedBackground />
            )}
            <Header />
            <Container style={{ position: 'relative', marginBottom: 20 }} size="xl">
                <Stack style={{ zIndex: 2 }} gap="xl">
                    {SubscriptionInfoBlockRenderer && <SubscriptionInfoBlockRenderer />}

                    {atLeastOnePlatformApp && (
                        <InstallationGuideConnector
                            BlockRenderer={
                                BLOCK_RENDERERS[config.uiConfig.installationGuidesBlockType]
                            }
                            hasPlatformApps={hasPlatformApps}
                            platform={osToPlatform(os)}
                        />
                    )}
                </Stack>
                <Center mt={20}>
                    <LanguagePicker
                        currentLang={currentLang}
                        locales={config.locales}
                        onLanguageChange={setLanguage}
                    />
                </Center>
            </Container>
        </Box>
    )
}
