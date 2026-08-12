'use client'

import { usePathname } from 'next/navigation'
import { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react'
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

const DEFAULT_PERIOD: TimePeriod = 'Last Month'
const DEFAULT_TOKENS = ['All']

const isDefaultTokens = (tokens: string[]) =>
    tokens.length === 0 || (tokens.length === 1 && tokens[0] === 'All')

/** Validate a raw period value (URL/localStorage) against the known list */
const parsePeriod = (raw: string | null): TimePeriod | null =>
    raw && TIME_PERIODS.includes(raw as TimePeriod) ? (raw as TimePeriod) : null

export const GlobalProvider = ({ children }: { children: ReactNode }) => {
    const pathname = usePathname()
    const [network, setNetworkState] = useState<NETWORK>(NETWORK.MAINNET)
    const [isMounted, setIsMounted] = useState(false)
    const [timePeriod, setTimePeriodState] = useState<TimePeriod>(DEFAULT_PERIOD)
    const [selectedTokens, setSelectedTokensState] = useState<string[]>(DEFAULT_TOKENS)
    const isHydrated = useRef(false)

    // Update URL + local storage + state when timePeriod changes
    const setTimePeriod = (newTimePeriod: TimePeriod) => {
        setTimePeriodState(newTimePeriod)
        localStorage.setItem('timePeriod', newTimePeriod)
        writeQueryParams({ period: newTimePeriod === DEFAULT_PERIOD ? null : newTimePeriod })
    }

    // Update URL + local storage + state when selectedTokens changes
    const setSelectedTokens = (newTokens: string[]) => {
        setSelectedTokensState(newTokens)
        localStorage.setItem('selectedTokens', JSON.stringify(newTokens))
        writeQueryParams({ tokens: isDefaultTokens(newTokens) ? null : newTokens.join(',') })
    }

    useEffect(() => {
        // Load initial values when the component mounts.
        // Shareable URL params take precedence over local storage; invalid or
        // default-valued params are removed to keep shared URLs clean.
        const urlPeriodRaw = readQueryParam('period')
        const urlPeriod = parsePeriod(urlPeriodRaw)
        const urlTokensRaw = readQueryParam('tokens')
        const urlTokens = urlTokensRaw ? urlTokensRaw.split(',').filter(Boolean) : []

        if (urlPeriod) {
            setTimePeriodState(urlPeriod)
            localStorage.setItem('timePeriod', urlPeriod)
            if (urlPeriod === DEFAULT_PERIOD) {
                writeQueryParams({ period: null })
            }
        } else {
            if (urlPeriodRaw !== null) {
                // Present but invalid — drop it
                writeQueryParams({ period: null })
            }
            // Validate localStorage too (may hold stale/renamed values)
            setTimePeriodState(parsePeriod(localStorage.getItem('timePeriod')) ?? DEFAULT_PERIOD)
        }

        if (urlTokens.length > 0 && !isDefaultTokens(urlTokens)) {
            setSelectedTokensState(urlTokens)
            localStorage.setItem('selectedTokens', JSON.stringify(urlTokens))
        } else {
            if (urlTokensRaw !== null) {
                // Present but empty/default — drop it
                writeQueryParams({ tokens: null })
            }
            const storedTokens = localStorage.getItem('selectedTokens')
            setSelectedTokensState(storedTokens ? JSON.parse(storedTokens) : DEFAULT_TOKENS)
        }

        isHydrated.current = true
    }, [])

    // On client-side navigation the new URL starts bare — re-serialize the
    // active global filters into it so copying the address bar after
    // navigating still reproduces the current view.
    useEffect(() => {
        if (!isHydrated.current) {
            return
        }
        // If the destination URL itself carries filter params (e.g. a shared
        // link opened via client navigation), let them win over current state.
        const urlPeriod = parsePeriod(readQueryParam('period'))
        const urlTokensRaw = readQueryParam('tokens')
        const urlTokens = urlTokensRaw ? urlTokensRaw.split(',').filter(Boolean) : []

        if (urlPeriod && urlPeriod !== timePeriod) {
            setTimePeriodState(urlPeriod)
            localStorage.setItem('timePeriod', urlPeriod)
            return
        }
        if (urlTokens.length > 0 && urlTokens.join(',') !== selectedTokens.join(',')) {
            setSelectedTokensState(urlTokens)
            localStorage.setItem('selectedTokens', JSON.stringify(urlTokens))
            return
        }

        writeQueryParams({
            period: timePeriod === DEFAULT_PERIOD ? null : timePeriod,
            tokens: isDefaultTokens(selectedTokens) ? null : selectedTokens.join(','),
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname])

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
