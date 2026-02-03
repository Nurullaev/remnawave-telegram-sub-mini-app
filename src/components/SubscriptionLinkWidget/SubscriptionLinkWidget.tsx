import {
    IconBrandDiscord,
    IconBrandTelegram,
    IconBrandVk,
    IconCopy,
    IconLink,
    IconMessageChatbot
} from '@tabler/icons-react'
import { ActionIcon, Button, Group, Image, Modal, Stack, Text } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { useClipboard } from '@mantine/hooks'
import { renderSVG } from 'uqr'

import { useState } from 'react'
import { useTranslation } from '@/hooks/useTranslations'
import { useSubscription } from '@/store/subscriptionInfo'
import { useAppConfigStoreInfo } from '@/store/appConfig'

export const SubscriptionLinkWidget = ({ supportUrl }: { supportUrl: string }) => {
    const { t, baseTranslations } = useTranslation()
    const subscription = useSubscription()
    const { appConfig } = useAppConfigStoreInfo()

    const clipboard = useClipboard({ timeout: 10000 })

    const subscriptionQrCode = renderSVG(subscription.subscriptionUrl, {
        whiteColor: '#161B22',
        blackColor: '#22d3ee'
    })

    const [open, setOpen] = useState(false)

    if (!subscription) return null

    const handleCopy = () => {
        notifications.show({
            title: t(baseTranslations.linkCopied),
            message: t(baseTranslations.linkCopiedToClipboard),
            color: 'cyan'
        })
        clipboard.copy(subscription.subscriptionUrl)
    }

    const renderSupportLink = (supportUrl: string) => {
        const iconConfig = {
            't.me': { icon: IconBrandTelegram, color: '#0088cc' },
            'discord.com': { icon: IconBrandDiscord, color: '#5865F2' },
            'vk.com': { icon: IconBrandVk, color: '#0077FF' }
        }

        const matchedPlatform = Object.entries(iconConfig).find(([domain]) =>
            supportUrl.includes(domain)
        )

        const { icon: Icon, color } = matchedPlatform
            ? matchedPlatform[1]
            : { icon: IconMessageChatbot, color: 'cyan' }

        return (
            <ActionIcon
                c={color}
                component="a"
                radius="md"
                href={supportUrl}
                rel="noopener noreferrer"
                size="xl"
                target="_blank"
                variant="default"
                style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    transition: 'all 0.2s ease'
                }}
            >
                <Icon />
            </ActionIcon>
        )
    }

    return (
        <>
            <Modal opened={open} onClose={() => setOpen(false)} title={t(baseTranslations.getLink)}>
                {subscriptionQrCode && (
                    <Stack align="center">
                        <Image
                            src={`data:image/svg+xml;utf8,${encodeURIComponent(subscriptionQrCode)}`}
                            style={{ borderRadius: 'var(--mantine-radius-md)' }}
                        />
                        <Text fw={600} size="lg" ta="center" c="white">
                            {t(baseTranslations.scanQrCode)}
                        </Text>

                        {!appConfig?.cryptoLink && (
                            <>
                                <Text c="dimmed" size="sm" ta="center">
                                    {t(baseTranslations.scanQrCodeDescription)}
                                </Text>

                                <Button
                                    fullWidth
                                    onClick={handleCopy}
                                    variant="light"
                                    radius="md"
                                    leftSection={<IconCopy />}
                                >
                                    {t(baseTranslations.copyLink)}
                                </Button>
                            </>
                        )}
                    </Stack>
                )}
            </Modal>
            <Group gap="xs">
                <ActionIcon
                    onClick={() => {
                        setOpen(true)
                    }}
                    size="xl"
                    radius="md"
                    variant="default"
                    style={{
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        transition: 'all 0.2s ease'
                    }}
                >
                    <IconLink />
                </ActionIcon>

                {supportUrl !== '' && renderSupportLink(supportUrl)}
            </Group>
        </>
    )
}
