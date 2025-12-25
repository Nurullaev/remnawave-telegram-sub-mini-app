import { AppConfig, IState } from './state.interface'

export interface IActions {
    actions: {
        getInitialState: () => IState
        resetState: () => Promise<void>
        setAppConfig: (appConfig: AppConfig) => void
    }
}
