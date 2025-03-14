import { NETWORK } from 'src/hooks/get-network-storage'

export type CoinType = {
    id: number
    name: string
    deno: number
    priceUSD: number
}

export type NetworkConfigType = {
    networkId: {
        SUI: number
        ETH: number
    }
    coins: Record<number, CoinType>
}

export type TokenColorInfo = {
    name: string
    color: string
    ticker: string
    icon: string
}

export type ChainType = 'ETH' | 'SUI'

export const getTokensList: (network: NETWORK) => TokenColorInfo[] = (network: NETWORK) => {
    return network === NETWORK.MAINNET
        ? [
              {
                  ticker: 'ETH',
                  name: 'Ethereum',
                  color: '#5c6bc0',
                  icon: '/assets/icons/brands/eth.svg',
              },
              {
                  ticker: 'WBTC',
                  name: 'Bitcoin',
                  color: '#f7941a',
                  icon: '/assets/icons/brands/btc.svg',
              },
              {
                  ticker: 'WLBTC',
                  name: 'Bitcoin',
                  color: '#f7941a',
                  icon: '/assets/icons/brands/btc.svg',
              },
              {
                  ticker: 'USDT',
                  name: 'USDT',
                  color: '#26A17B',
                  icon: '/assets/icons/brands/usdt.svg',
              },
          ]
        : [
              {
                  ticker: 'ETH',
                  name: 'Ethereum',
                  color: '#5c6bc0',
                  icon: '/assets/icons/brands/eth.svg',
              },
              {
                  ticker: 'WBTC',
                  name: 'Bitcoin',
                  color: '#f7941a',
                  icon: '/assets/icons/brands/btc.svg',
              },
              {
                  ticker: 'USDC',
                  name: 'USDC',
                  color: '#2775CA',
                  icon: '/assets/icons/brands/usdc.png',
              },
              {
                  ticker: 'Pepe',
                  name: 'Pepe',
                  color: '#20672c',
                  icon: '/assets/icons/brands/pepe.webp',
              },
              {
                  ticker: 'USDT',
                  name: 'USDT',
                  color: '#26A17B',
                  icon: '/assets/icons/brands/usdt.svg',
              },
          ]
}

export type TokenRespType = {
    token_id: number
    total_unique_addresses: string
    total_count: number | null
    total_volume: number | null
    total_volume_usd: number | null
    token_info: {
        name: string
        deno: number
        priceUSD: number
        id: number
    }
    destination_chain: string | null
}

export type CardType = {
    title: string
    value: any
    color: string
    dollars: boolean
    icon?: string
    percentageChange?: number // percentage change
}

export type TransactionType = {
    tx_hash: string
    sender_address: string
    recipient_address: string
    chain_id: number
    destination_chain: ChainType
    nonce: string
    block_height: string
    timestamp_ms: string
    token_id: number
    amount: number
    amount_usd: number
    token_info: {
        name: string
        deno: number
        priceUSD: number
        id: number
    }
    from_chain: ChainType
}

export type TransactionHistoryType = {
    tx_hash: string
    txn_sender: string
    chain_id: number
    nonce: string
    status: string
    block_height: number
    timestamp_ms: number
    gas_usage: number
    data_source: ChainType
    is_finalized: boolean
}
