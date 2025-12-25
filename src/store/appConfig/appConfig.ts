import { create } from 'zustand'

import { AppConfig, IActions, IState } from './interfaces'

const initialState: IState = {
    appConfig: null
}

export const useAppConfigStore = create<IActions & IState>()((set) => ({
    ...initialState,
    actions: {
        setAppConfig: (appConfig: AppConfig) => {
            set((state) => ({
                ...state,
                appConfig
            }))
        },
        getInitialState: () => {
            return initialState
        },
        resetState: async () => {
            set({ ...initialState })
        }
    }
}))

export const useAppConfigStoreActions = () => useAppConfigStore((store) => store.actions)

export const useAppConfigStoreInfo = () => useAppConfigStore((state) => state)

export const useAppConfig = (): AppConfig => {
    const appConfig = useAppConfigStore((state) => state.appConfig)
    if (!appConfig) {
        throw new Error(
            'useSubscription must be used after subscription is loaded (after RootLayout gate)'
        )
    }
    return appConfig
}
