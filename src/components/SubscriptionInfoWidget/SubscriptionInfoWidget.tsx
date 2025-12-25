import { useLocale, useTranslations } from 'next-intl'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { Card, Group, SimpleGrid, Stack, Text, ThemeIcon, Title } from '@mantine/core'
import {
    IconAlertCircle,
    IconArrowsUpDown,
    IconCalendar,
    IconCheck,
    IconUser,
    IconX
} from '@tabler/icons-react'
import { InfoBlock } from '@/components/InfoBlock/InfoBlock'

import { calculateDaysLeft, getExpirationTextUtil } from '@/utils/configParser'
import { GetSubscriptionInfoByShortUuidCommand } from '@remnawave/backend-contract'
import { useMediaQuery } from '@mantine/hooks'

dayjs.extend(relativeTime)

export const SubscriptionInfoWidget = ({
    user
}: {
    user: GetSubscriptionInfoByShortUuidCommand.Response['response']
}) => {
    const t = useTranslations()
    const lang = useLocale()
    const isMobile = useMediaQuery('(max-width: 30em)')

    if (!user) return null

    const daysLeft = calculateDaysLeft(user.user.expiresAt)

    const formatDate = (dateStr: Date | string) => {
        return dayjs(dateStr).format('DD.MM.YYYY')
    }

    const getStatusAndIcon = (): {
        color: string
        icon: React.ReactNode
        status: string
    } => {
        if (user.user.userStatus === 'ACTIVE' && daysLeft > 0) {
            return {
                color: 'teal',
                icon: <IconCheck size={isMobile ? 18 : 22} />,
                status: t('subscription-info.widget.active')
            }
        }
        if (
            (user.user.userStatus === 'ACTIVE' && daysLeft === 0) ||
            (daysLeft >= 0 && daysLeft <= 3)
        ) {
            return {
                color: 'orange',
                icon: <IconAlertCircle size={isMobile ? 18 : 22} />,
                status: t('subscription-info.widget.active')
            }
        }

        return {
            color: 'red',
            icon: <IconX size={isMobile ? 18 : 22} />,
            status: t('subscription-info.widget.inactive')
        }
    }

    const statusInfo = getStatusAndIcon()

    return (
        <Card p={{ base: 'sm', xs: 'md', sm: 'lg', md: 'xl' }} radius="lg" className="glass-card">
            <Stack gap={isMobile ? 'sm' : 'md'}>
                <Group justify="space-between" gap="sm">
                    <Group
                        gap={isMobile ? 'xs' : 'sm'}
                        wrap="nowrap"
                        style={{ minWidth: 0, flex: 1 }}
                    >
                        <ThemeIcon
                            color={statusInfo.color}
                            size={isMobile ? 36 : 44}
                            radius="xl"
                            variant="light"
                            style={{
                                background: `linear-gradient(135deg, var(--mantine-color-${statusInfo.color}-filled) 0%, var(--mantine-color-${statusInfo.color}-light) 100%)`,
                                border: `1px solid var(--mantine-color-${statusInfo.color}-4)`,
                                flexShrink: 0
                            }}
                        >
                            {statusInfo.icon}
                        </ThemeIcon>
                        <Stack gap={2} style={{ minWidth: 0, flex: 1 }}>
                            <Title
                                order={5}
                                c="white"
                                fw={600}
                                style={{
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                {user.user.username}
                            </Title>
                            <Text
                                c={user.user.daysLeft === 0 ? 'red' : 'dimmed'}
                                size={isMobile ? 'xs' : 'sm'}
                                fw={600}
                            >
                                {getExpirationTextUtil(user.user.expiresAt, t, lang)}
                            </Text>
                        </Stack>
                    </Group>
                </Group>
                <SimpleGrid cols={{ base: 2, xs: 2, sm: 2 }} spacing="xs" verticalSpacing="xs">
                    <InfoBlock
                        color="blue"
                        icon={<IconUser size={16} />}
                        title={t('subscription-info.widget.name')}
                        value={user.user.username}
                    />

                    <InfoBlock
                        color={user.user.userStatus === 'ACTIVE' ? 'green' : 'red'}
                        icon={
                            user.user.userStatus === 'ACTIVE' ? (
                                <IconCheck size={16} />
                            ) : (
                                <IconX size={16} />
                            )
                        }
                        title={t('subscription-info.widget.status')}
                        value={
                            user.user.userStatus === 'ACTIVE'
                                ? t('subscription-info.widget.active')
                                : t('subscription-info.widget.inactive')
                        }
                    />

                    <InfoBlock
                        color="red"
                        icon={<IconCalendar size={16} />}
                        title={t('subscription-info.widget.expires')}
                        value={(() => {
                            if (!user.user.expiresAt) return '—'

                            const fiftyYearsFromNow = new Date()
                            fiftyYearsFromNow.setFullYear(fiftyYearsFromNow.getFullYear() + 50)

                            const expireDate = new Date(user.user.expiresAt)

                            if (expireDate > fiftyYearsFromNow) {
                                return '∞'
                            } else {
                                return formatDate(user.user.expiresAt)
                            }
                        })()}
                    />

                    <InfoBlock
                        color="yellow"
                        icon={<IconArrowsUpDown size={16} />}
                        title={t('subscription-info.widget.bandwidth')}
                        value={`${user.user.trafficUsed} / ${
                            user.user.trafficLimit === '0' ? '∞' : user.user.trafficLimit
                        }`}
                    />
                </SimpleGrid>
            </Stack>
        </Card>
    )
}
