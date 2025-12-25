import { ReactNode } from 'react'
import {
    TSubscriptionPageBlockConfig,
    TSubscriptionPageButtonConfig,
    TSubscriptionPageLanguageCode
} from '@remnawave/subscription-page-types'
import { ButtonVariant } from '@mantine/core'

export interface IBlockRendererProps {
    blocks: TSubscriptionPageBlockConfig[]
    currentLang: TSubscriptionPageLanguageCode
    getIconFromLibrary: (iconKey: string) => string
    renderBlockButtons: (
        buttons: TSubscriptionPageButtonConfig[],
        variant: ButtonVariant
    ) => ReactNode
    svgLibrary: Record<string, string>
}
