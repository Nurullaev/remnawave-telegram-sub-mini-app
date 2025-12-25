import { GetSubscriptionInfoByShortUuidCommand } from '@remnawave/backend-contract'

type ExtendedSubscription = GetSubscriptionInfoByShortUuidCommand.Response['response'] & {
    subpageConfigUuid?: string | null
}

export interface IState {
    subscription: ExtendedSubscription | null
}
