import dayjs from 'dayjs'
import { useTranslations } from 'next-intl'
import 'dayjs/locale/en'
import 'dayjs/locale/ru'
import relativeTime from 'dayjs/plugin/relativeTime'
import prettyBytes from 'pretty-bytes'
import {
    TSubscriptionPageLanguageCode,
    TSubscriptionPageRawConfig
} from '@remnawave/subscription-page-types'
import { getLocalizedText } from '@/utils/configParser'

dayjs.extend(relativeTime)

export function bytesToGigabytes(bytes: number | string, decimals: number = 2): string {
    if (Number(bytes) < 0) {
        throw new Error('Количество байтов не может быть отрицательным')
    }
    return prettyBytes(Number(bytes), {
        maximumFractionDigits: 2
    })
}
