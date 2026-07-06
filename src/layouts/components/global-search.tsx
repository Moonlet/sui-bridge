'use client'

import {
    Box,
    Dialog,
    IconButton,
    InputAdornment,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material'
import { useTheme, alpha } from '@mui/material/styles'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Iconify } from 'src/components/iconify'
import { truncateAddress } from 'src/config/helper'
import { useRouter } from 'src/routes/hooks'
import { paths } from 'src/routes/paths'

// ----------------------------------------------------------------------

const ETH_ADDRESS_REGEX = /^0x[0-9a-fA-F]{40}$/
const HEX_64_REGEX = /^(0x)?[0-9a-fA-F]{64}$/
const SUI_DIGEST_REGEX = /^[1-9A-HJ-NP-Za-km-z]{32,50}$/

type SearchResult = {
    key: string
    label: string
    description: string
    icon: string
    href: string
}

/**
 * Detects what the user pasted (ETH address, SUI address, transaction hash or
 * SUI digest) and returns the matching navigation targets. A 0x + 64 hex chars
 * value is ambiguous (ETH tx hash or SUI address), so both options are offered.
 */
export function detectSearchResults(rawQuery: string): SearchResult[] {
    const query = rawQuery.trim()

    if (!query) {
        return []
    }

    const results: SearchResult[] = []

    if (ETH_ADDRESS_REGEX.test(query)) {
        results.push({
            key: 'eth-profile',
            label: `Ethereum address ${truncateAddress(query, 6)}`,
            description: 'View bridge profile and transaction history',
            icon: 'eva:person-outline',
            href: `${paths.profile.root}?ethAddress=${query}`,
        })
        return results
    }

    if (HEX_64_REGEX.test(query)) {
        const withPrefix = query.startsWith('0x') ? query : `0x${query}`
        results.push({
            key: 'tx',
            label: `Transaction ${truncateAddress(withPrefix, 6)}`,
            description: 'View bridge transaction details and timeline',
            icon: 'mdi:fingerprint',
            href: `${paths.transactions.root}/${withPrefix}`,
        })
        results.push({
            key: 'sui-profile',
            label: `SUI address ${truncateAddress(withPrefix, 6)}`,
            description: 'View bridge profile and transaction history',
            icon: 'eva:person-outline',
            href: `${paths.profile.root}?suiAddress=${withPrefix}`,
        })
        return results
    }

    if (SUI_DIGEST_REGEX.test(query)) {
        results.push({
            key: 'sui-tx',
            label: `SUI transaction ${truncateAddress(query, 6)}`,
            description: 'View bridge transaction details and timeline',
            icon: 'mdi:fingerprint',
            href: `${paths.transactions.root}/${query}`,
        })
        return results
    }

    return results
}

// ----------------------------------------------------------------------

export function GlobalSearch() {
    const theme = useTheme()
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [query, setQuery] = useState('')
    const inputRef = useRef<HTMLInputElement>(null)

    const focusInput = () => {
        // Focus and select any leftover text so a new paste replaces it
        inputRef.current?.focus()
        inputRef.current?.select()
    }

    const results = useMemo(() => detectSearchResults(query), [query])
    const showNoMatch = query.trim().length > 0 && results.length === 0

    // Open with Cmd+K / Ctrl+K
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
                event.preventDefault()
                setOpen(prev => {
                    if (prev) {
                        // Already open — just put the caret back in the input
                        focusInput()
                        return prev
                    }
                    return true
                })
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

    const handleClose = () => {
        setOpen(false)
        setQuery('')
    }

    const handleNavigate = (href: string) => {
        handleClose()
        router.push(href)
    }

    const handleKeyDownInput = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter' && results.length > 0) {
            handleNavigate(results[0].href)
        }
    }

    return (
        <>
            <Tooltip title="Search tx hash or address (⌘K)">
                <IconButton onClick={() => setOpen(true)} aria-label="Search">
                    <Iconify icon="eva:search-fill" width={22} />
                </IconButton>
            </Tooltip>

            <Dialog
                open={open}
                onClose={handleClose}
                fullWidth
                maxWidth="sm"
                sx={{ '& .MuiDialog-container': { alignItems: 'center' } }}
                PaperProps={{ sx: { borderRadius: 2 } }}
                slotProps={{
                    backdrop: {
                        sx: { backgroundColor: alpha(theme.palette.common.black, 0.8) },
                    },
                }}
                TransitionProps={{ onEntered: focusInput }}
            >
                <Box sx={{ p: 2 }}>
                    <TextField
                        autoFocus
                        inputRef={inputRef}
                        fullWidth
                        placeholder="Paste a transaction hash or address…"
                        value={query}
                        onChange={event => setQuery(event.target.value)}
                        onKeyDown={handleKeyDownInput}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Iconify
                                        icon="eva:search-fill"
                                        width={20}
                                        sx={{ color: 'text.disabled' }}
                                    />
                                </InputAdornment>
                            ),
                            endAdornment: query ? (
                                <InputAdornment position="end">
                                    <IconButton size="small" onClick={() => setQuery('')}>
                                        <Iconify icon="eva:close-fill" width={18} />
                                    </IconButton>
                                </InputAdornment>
                            ) : undefined,
                        }}
                    />

                    {results.length > 0 && (
                        <List sx={{ mt: 1, pb: 0 }}>
                            {results.map(result => (
                                <ListItemButton
                                    key={result.key}
                                    onClick={() => handleNavigate(result.href)}
                                    sx={{
                                        borderRadius: 1,
                                        '&:hover': {
                                            bgcolor: alpha(theme.palette.primary.main, 0.08),
                                        },
                                    }}
                                >
                                    <ListItemIcon sx={{ minWidth: 36 }}>
                                        <Iconify icon={result.icon} width={20} />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={result.label}
                                        secondary={result.description}
                                        primaryTypographyProps={{
                                            variant: 'body2',
                                            fontWeight: 'bold',
                                        }}
                                        secondaryTypographyProps={{ variant: 'caption' }}
                                    />
                                    <Iconify
                                        icon="eva:arrow-ios-forward-fill"
                                        width={16}
                                        sx={{ color: 'text.disabled' }}
                                    />
                                </ListItemButton>
                            ))}
                        </List>
                    )}

                    {showNoMatch && (
                        <Box sx={{ py: 3, textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary">
                                No match — paste a full transaction hash, SUI or Ethereum address
                            </Typography>
                        </Box>
                    )}

                    {!query && (
                        <Box sx={{ pt: 1.5, px: 0.5 }}>
                            <Typography variant="caption" color="text.disabled">
                                Search a bridge transaction by hash, or look up a SUI / Ethereum
                                address profile
                            </Typography>
                        </Box>
                    )}
                </Box>
            </Dialog>
        </>
    )
}
