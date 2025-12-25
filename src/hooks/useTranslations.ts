import { TSubscriptionPageLocalizedText } from '@remnawave/subscription-page-types'
import { useCallback } from 'react'
import { useSubscriptionConfig, useCurrentLang } from '@/store/subscriptionConfig'
import { getLocalizedText } from '@/utils/configParser'

export const useTranslation = () => {
    const config = useSubscriptionConfig()
    const currentLang = useCurrentLang()

    const t = useCallback(
        (textObj: TSubscriptionPageLocalizedText) => getLocalizedText(textObj, currentLang),
        [currentLang]
    )

    return {
        t,
        currentLang,
        baseTranslations: config.baseTranslations
    }
}
