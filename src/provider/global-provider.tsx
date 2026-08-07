'use client'

import { createContext, ReactNode, useContext, useEffect, useState } from 'react'
import { TIME_PERIODS, TimePeriod } from 'src/config/helper'
import { readQueryParam, writeQueryParams } from 'src/hooks/use-query-param-state'
import { NETWORK } from 'src/hooks/get-network-storage'
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { WagmiProvider } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
    createNetworkConfig,
    SuiClientProvider,
    WalletProvider as SuiWalletProvider,
} from '@mysten/dapp-kit'
import { getFullnodeUrl } from '@mysten/sui/client'

interface GlobalContextProps {
    network: NETWORK
    timePeriod: TimePeriod
    selectedTokens: string[]
    setTimePeriod: (timePeriod: TimePeriod) => void
    setSelectedTokens: (tokens: string[]) => void
    toggleNetwork: () => void
    setNetwork: (network: NETWORK) => void
}

const GlobalContext = createContext<GlobalContextProps | undefined>(undefined)

// Ethereum wagmi + RainbowKit config
const config = getDefaultConfig({
    appName: 'Sui Bridge',
    projectId: '09f18e7b8dd3f981804e0f45c18b15c3', // Replace with your WalletConnect projectId
    chains: [mainnet, sepolia],
    ssr: true,
})

// Sui dapp-kit network config
const { networkConfig } = createNetworkConfig({
    mainnet: { url: getFullnodeUrl('mainnet') },
    testnet: { url: getFullnodeUrl('testnet') },
})
const queryClient = new QueryClient()

export const GlobalProvider = ({ children }: { children: ReactNode }) => {
    const [network, setNetworkState] = useState<NETWORK>(NETWORK.MAINNET)
    const [isMounted, setIsMounted] = useState(false)
    const [timePeriod, setTimePeriodState] = useState<TimePeriod>('Last Month')
    const [selectedTokens, setSelectedTokensState] = useState<string[]>(['All'])

    // Update URL + local storage + state when timePeriod changes
    const setTimePeriod = (newTimePeriod: TimePeriod) => {
        setTimePeriodState(newTimePeriod)
        localStorage.setItem('timePeriod', newTimePeriod)
        writeQueryParams({ period: newTimePeriod === 'Last Month' ? null : newTimePeriod })
    }

    // Update URL + local storage + state when selectedTokens changes
    const setSelectedTokens = (newTokens: string[]) => {
        setSelectedTokensState(newTokens)
        localStorage.setItem('selectedTokens', JSON.stringify(newTokens))
        const isDefault =
            newTokens.length === 0 || (newTokens.length === 1 && newTokens[0] === 'All')
        writeQueryParams({ tokens: isDefault ? null : newTokens.join(',') })
    }

    useEffect(() => {
        // Load initial values when the component mounts.
        // Shareable URL params take precedence over local storage.
        const urlPeriod = readQueryParam('period')
        const urlTokens = readQueryParam('tokens')
        const storedTokens = localStorage.getItem('selectedTokens')

        if (urlPeriod && TIME_PERIODS.includes(urlPeriod as TimePeriod)) {
            setTimePeriodState(urlPeriod as TimePeriod)
            localStorage.setItem('timePeriod', urlPeriod)
        } else {
            setTimePeriodState((localStorage.getItem('timePeriod') || 'Last Month') as TimePeriod)
        }

        if (urlTokens) {
            const tokens = urlTokens.split(',').filter(Boolean)
            if (tokens.length > 0) {
                setSelectedTokensState(tokens)
                localStorage.setItem('selectedTokens', JSON.stringify(tokens))
                return
            }
        }
        setSelectedTokensState(storedTokens ? JSON.parse(storedTokens) : ['All'])
    }, [])

    useEffect(() => {
        // Set mounted to true once component is mounted
        setIsMounted(true)
    }, [])

    useEffect(() => {
        if (isMounted) {
            const savedNetwork = localStorage.getItem('network') as NETWORK
            if (savedNetwork) {
                setNetworkState(savedNetwork)
            }
        }
    }, [isMounted])

    const toggleNetwork = () => {
        const newNetwork = network === NETWORK.MAINNET ? NETWORK.TESTNET : NETWORK.MAINNET
        setNetworkState(newNetwork)
        localStorage.setItem('network', newNetwork)
    }

    const setNetwork = (newNetwork: NETWORK) => {
        setNetworkState(newNetwork)
        localStorage.setItem('network', newNetwork)
    }

    return (
        <QueryClientProvider client={queryClient}>
            <WagmiProvider config={config} reconnectOnMount={false}>
                <RainbowKitProvider>
                    <SuiClientProvider networks={networkConfig} defaultNetwork="mainnet">
                        <SuiWalletProvider>
                            <GlobalContext.Provider
                                value={{
                                    network,
                                    toggleNetwork,
                                    setNetwork,
                                    timePeriod,
                                    setTimePeriod,
                                    selectedTokens,
                                    setSelectedTokens,
                                }}
                            >
                                {children}
                            </GlobalContext.Provider>
                        </SuiWalletProvider>
                    </SuiClientProvider>
                </RainbowKitProvider>
            </WagmiProvider>
        </QueryClientProvider>
    )
}

export const useGlobalContext = (): GlobalContextProps => {
    const context = useContext(GlobalContext)
    if (!context) {
        throw new Error('useGlobalContext must be used within a GlobalProvider')
    }
    return context
}
