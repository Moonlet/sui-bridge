import { IconButton, Tooltip } from '@mui/material'
import { useEffect, useRef, useState } from 'react'
import { Iconify } from '../iconify'

// ----------------------------------------------------------------------

type CopyButtonProps = {
    /** The full value to copy to the clipboard */
    value: string
    /** Tooltip label shown before copying (default: "Copy") */
    title?: string
    /** Icon size in px (default: 16) */
    size?: number
}

/**
 * Small icon button that copies `value` to the clipboard and gives
 * visual feedback (checkmark + "Copied!" tooltip) for 2 seconds.
 */
export function CopyButton({ value, title = 'Copy', size = 16 }: CopyButtonProps) {
    const [copied, setCopied] = useState(false)
    const timeoutRef = useRef<ReturnType<typeof setTimeout>>()

    // Clear pending feedback timeout on unmount
    useEffect(() => () => clearTimeout(timeoutRef.current), [])

    const handleCopy = async (event: React.MouseEvent) => {
        event.stopPropagation()
        try {
            await navigator.clipboard.writeText(value)
            setCopied(true)
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
            timeoutRef.current = setTimeout(() => setCopied(false), 2000)
        } catch (error) {
            console.error('Failed to copy to clipboard:', error)
        }
    }

    return (
        <Tooltip title={copied ? 'Copied!' : title}>
            <IconButton
                size="small"
                onClick={handleCopy}
                sx={{ color: copied ? 'success.main' : 'text.secondary' }}
            >
                <Iconify icon={copied ? 'eva:checkmark-fill' : 'eva:copy-outline'} width={size} />
            </IconButton>
        </Tooltip>
    )
}
