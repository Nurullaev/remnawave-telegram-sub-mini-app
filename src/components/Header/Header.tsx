import { Box, Center, Container, Flex, Group, Image, Stack, Title } from '@mantine/core'
import classes from '@/app/app.module.css'
import {
    useSubscriptionConfig,
    useSubscriptionConfigStoreActions,
    useCurrentLang
} from '@/store/subscriptionConfig'

import { RemnawaveLogo } from '@/components/RemnawaveLogo/RemnawaveLogo'
import { SubscriptionLinkWidget } from '@/components/SubscriptionLinkWidget/SubscriptionLinkWidget'
import { useAppConfigStoreInfo } from '@/store/appConfig'

export function Header() {
    const config = useSubscriptionConfig()
    const { appConfig } = useAppConfigStoreInfo()

    const brandName = config.brandingSettings.title
    let hasCustomLogo = !!config.brandingSettings.logoUrl

    if (hasCustomLogo) {
        if (config.brandingSettings.logoUrl.includes('docs.rw')) {
            hasCustomLogo = false
        }
    }

    return (
        <Box className="header-wrapper" py="md" style={{ zIndex: 1 }}>
            <Group justify="space-between" px={{ base: 'md', sm: 'lg', md: 'xl' }}>
                <Group gap="xs">
                    {hasCustomLogo ? (
                        <Image
                            alt="logo"
                            fit="contain"
                            src={config.brandingSettings.logoUrl}
                            style={{
                                width: '32px',
                                height: '32px',
                                flexShrink: 0
                            }}
                        />
                    ) : (
                        <RemnawaveLogo c="cyan" size={32} />
                    )}
                    <Title c={hasCustomLogo ? 'white' : 'cyan'} fw={700} order={4} size="lg">
                        {brandName}
                    </Title>
                </Group>

                <Group gap="xs">
                    {!appConfig?.cryptoLink && (
                        <SubscriptionLinkWidget supportUrl={config.brandingSettings.supportUrl} />
                    )}
                </Group>
            </Group>
        </Box>
    )
}
