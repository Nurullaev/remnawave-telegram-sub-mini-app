export type AppConfig = {
    cryptoLink: boolean
    buyLink: string
    redirectLink: string
    isSnowflakeEnabled: boolean
}

export interface IState {
    appConfig: AppConfig | null
}
