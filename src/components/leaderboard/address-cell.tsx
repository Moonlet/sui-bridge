import { Box, Tooltip, Typography } from '@mui/material'
import { useTheme, alpha } from '@mui/material/styles'
import { CopyButton } from 'src/components/copy-button'
import { truncateAddress } from 'src/config/helper'

interface AddressCellProps {
    address: string
    addressType: 'sui' | 'eth'
    onClick?: () => void
}

export function AddressCell({ address, addressType, onClick }: AddressCellProps) {
    const theme = useTheme()

    const chainColor = addressType === 'sui' ? '#4DA2FF' : '#627EEA'
    const chainIcon =
        addressType === 'sui' ? '/assets/icons/brands/sui.svg' : '/assets/icons/brands/eth.svg'

    return (
        <Box
            onClick={onClick}
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                cursor: onClick ? 'pointer' : 'default',
                padding: '4px 8px',
                borderRadius: 1,
                transition: 'background-color 0.2s',
                '&:hover': onClick
                    ? {
                          bgcolor: alpha(theme.palette.primary.main, 0.08),
                      }
                    : {},
            }}
        >
            {/* Chain icon */}
            <Tooltip title={addressType === 'sui' ? 'SUI Address' : 'Ethereum Address'}>
                <Box
                    sx={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        bgcolor: alpha(chainColor, 0.12),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                    }}
                >
                    <img src={chainIcon} alt={addressType} style={{ width: 16, height: 16 }} />
                </Box>
            </Tooltip>

            {/* Address text */}
            <Typography
                variant="body2"
                sx={{
                    fontFamily: 'monospace',
                    fontSize: '0.85rem',
                    color: onClick ? theme.palette.primary.main : theme.palette.text.primary,
                    fontWeight: 500,
                }}
            >
                {truncateAddress(address, 6)}
            </Typography>

            {/* Copy button */}
            <CopyButton value={`0x${address}`} title="Copy address" />
        </Box>
    )
}
