import { Box, Link, TableCell, TableRow, Typography } from '@mui/material'
import { formatDistanceToNow } from 'date-fns'
import { useEffect, useState } from 'react'
import { formatExplorerUrl, truncateAddress } from 'src/config/helper'
import { getNetwork, NETWORK } from 'src/hooks/get-network-storage'
import { useRouter } from 'src/routes/hooks'
import { paths } from 'src/routes/paths'
import { endpoints, fetcher } from 'src/utils/axios'
import { fNumber } from 'src/utils/format-number'
import { buildProfileQuery } from 'src/utils/helper'
import { AllTxsResponse, getTokensList, TransactionType } from 'src/utils/types'
import useSWR from 'swr'
import { Iconify } from '../iconify'
import { CustomTable } from '../table/table'

export function TransactionsTable({
    ethAddress,
    suiAddress,
    limit = 48,
    autoRefresh,
    hidePagination = false,
    showTitleLink = false,
    minHeight = 800,
}: {
    ethAddress?: string
    suiAddress?: string
    limit?: number
    autoRefresh?: number | (() => void)
    hidePagination?: boolean
    showTitleLink?: boolean
    minHeight?: number
}) {
    const network = getNetwork()
    const router = useRouter()
    const [page, setPage] = useState(0)
    const [totalItems, setTotalItems] = useState(0)
    const pageSize = limit

    // Fetch paginated data
    const { data, isLoading, mutate } = useSWR<AllTxsResponse>(
        `${endpoints.transactions}?network=${network}&offset=${pageSize * page}&limit=${pageSize}&ethAddress=${ethAddress || ''}&suiAddress=${suiAddress || ''} `,
        fetcher,
    )

    // Force refresh when autoRefresh changes
    useEffect(() => {
        if (autoRefresh) {
            mutate()
        }
    }, [autoRefresh, mutate])

    useEffect(() => {
        if (data?.total && totalItems !== data?.total) {
            setTotalItems(data?.total)
        }
    }, [data?.total])

    const onNavigateTx = (tx: string) => {
        router.push(`${paths.transactions.root}/${tx}`)
    }

    return (
        <Box>
            <CustomTable
                headLabel={[
                    { id: 'chain', label: 'Flow' },
                    { id: 'sender', label: 'Sender' },
                    { id: 'recipient', label: 'Recipient' },
                    { id: 'amount', label: 'Amount' },
                    { id: 'tx', label: 'Tx' },
                    { id: 'timestamp_ms', label: 'Date' },
                    { id: 'view', label: 'More details', align: 'center' },
                ]}
                tableData={data?.transactions || []}
                loading={isLoading}
                title={
                    (showTitleLink ? (
                        <Link
                            href={paths.transactions.root}
                            rel="noopener noreferrer"
                            underline="hover"
                            color="inherit"
                            fontWeight="bold"
                            sx={{ display: 'flex', alignItems: 'center' }}
                        >
                            <Typography variant="h6" fontWeight="bold" sx={{ mr: 1 }}>
                                Latest Bridge Transactions
                            </Typography>
                            <Iconify icon="solar:arrow-right-up-outline" />
                        </Link>
                    ) : (
                        <Typography variant="h6" fontWeight="bold">
                            Latest Bridge Transactions
                        </Typography>
                    )) as any
                }
                rowHeight={85}
                minHeight={minHeight}
                RowComponent={props => (
                    <ActivitiesRow {...props} network={network} onNavigateTx={onNavigateTx} />
                )}
                pagination={
                    !hidePagination
                        ? {
                              count: totalItems,
                              page,
                              rowsPerPage: pageSize,
                              onPageChange: newPage => setPage(newPage),
                          }
                        : undefined
                }
            />
        </Box>
    )
}

const ActivitiesRow: React.FC<{
    row: TransactionType
    network: NETWORK
    onNavigateTx: (tx: string) => void
}> = ({ row, network, onNavigateTx }) => {
    const relativeTime = formatDistanceToNow(Number(row.timestamp_ms), { addSuffix: true })
    const isInflow = row.destination_chain === 'SUI'

    return (
        <TableRow
            hover
            sx={{
                height: 85,
                borderRadius: 2,
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                    transform: 'scale(1.01)',
                },
            }}
        >
            {/* Flow Column with Icons & Stylish Arrow */}
            <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <img
                        src={`/assets/icons/brands/eth.svg`}
                        alt={row.from_chain}
                        style={{ width: 24, height: 24 }}
                    />

                    <Iconify
                        width={20}
                        icon={
                            isInflow
                                ? 'solar:round-arrow-right-bold-duotone'
                                : 'solar:round-arrow-left-bold-duotone'
                        }
                        sx={{ flexShrink: 0, color: isInflow ? '#38B137' : '#FA3913' }}
                    />

                    <img
                        src={`/assets/icons/brands/sui.svg`}
                        alt={row.destination_chain}
                        style={{ width: 24, height: 24 }}
                    />
                </Box>
            </TableCell>

            {/* Sender with Improved Visibility */}
            <TableCell>
                <Box sx={{ display: 'flex' }}>
                    <Link
                        href={formatExplorerUrl({
                            network,
                            address: row.sender_address,
                            isAccount: true,
                            chain: row.from_chain,
                        })}
                        target="_blank"
                        rel="noopener noreferrer"
                        underline="hover"
                        color="primary"
                        fontWeight="bold"
                    >
                        {truncateAddress(row.sender_address)}
                    </Link>
                    <Link
                        color="inherit"
                        href={buildProfileQuery(
                            !isInflow
                                ? { suiAddress: row.sender_address }
                                : { ethAddress: row.sender_address },
                        )}
                    >
                        <Iconify icon="solar:arrow-right-up-outline" />
                    </Link>
                </Box>
            </TableCell>

            {/* Recipient with Improved Visibility */}
            <TableCell>
                <Box sx={{ display: 'flex' }}>
                    <Link
                        href={formatExplorerUrl({
                            network,
                            address: row.recipient_address,
                            isAccount: true,
                            chain: isInflow ? 'SUI' : 'ETH',
                        })}
                        target="_blank"
                        rel="noopener noreferrer"
                        underline="hover"
                        color="primary"
                        fontWeight="bold"
                    >
                        {truncateAddress(row.recipient_address)}
                    </Link>

                    <Link
                        color="inherit"
                        href={buildProfileQuery(
                            isInflow
                                ? { suiAddress: row.recipient_address }
                                : { ethAddress: row.recipient_address },
                        )}
                    >
                        <Iconify icon="solar:arrow-right-up-outline" />
                    </Link>
                </Box>
            </TableCell>

            {/* Amount with Token Icon */}
            <TableCell>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'start',
                        padding: '4px 8px',
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {row.token_info.name && (
                            <img
                                src={
                                    getTokensList(network)?.find(
                                        it => it.ticker === row.token_info.name,
                                    )?.icon
                                }
                                alt={row.token_info.name}
                                style={{ width: 20, height: 20, marginRight: 6 }}
                            />
                        )}
                        <Typography variant="h6" fontWeight="bold">
                            {fNumber(row.amount)}
                        </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                        ≈ ${fNumber(row.amount_usd)}
                    </Typography>
                </Box>
            </TableCell>

            {/* Transaction Link */}
            <TableCell>
                <Link
                    href={formatExplorerUrl({
                        network,
                        address: row.tx_hash,
                        isAccount: false,
                        chain: row.from_chain,
                    })}
                    target="_blank"
                    rel="noopener noreferrer"
                    underline="hover"
                    color="primary"
                    fontWeight="bold"
                >
                    {truncateAddress(row.tx_hash)}
                </Link>
            </TableCell>

            {/* Timestamp */}
            <TableCell>
                <Typography variant="caption" fontWeight="bold" color="text.secondary">
                    {relativeTime}
                </Typography>
            </TableCell>
            <TableCell style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                <Link
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    sx={{ marginLeft: 1 }}
                    color="inherit"
                    href={`${paths.transactions.root}/${row.tx_hash}`}
                >
                    <Iconify icon="solar:eye-bold" />
                </Link>
            </TableCell>
        </TableRow>
    )
}
