import { Box, Button, Stack } from '@mantine/core'
import classes from '@/app/app.module.css'
import Lottie from 'lottie-react'
import noSubAnimate from '@public/assets/anamations/no-sub.json'
import { useTranslations } from 'next-intl'
import { Link } from '@/components/Link/Link'
import { useAppConfigStoreInfo } from '@/store/appConfig'

export function SubscribeCta() {
    const t = useTranslations()

    const { appConfig } = useAppConfigStoreInfo()

    return (
        <Stack gap="xl">
            <Box className={classes.animateBox} w={200}>
                <Lottie animationData={noSubAnimate} loop={true} />
            </Box>
            {appConfig?.buyLink && (
                <Button component={Link} href={appConfig.buyLink} target="_blank" color="cyan">
                    {t('main.page.component.buy')}
                </Button>
            )}
        </Stack>
    )
}
