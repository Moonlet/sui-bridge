'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

// ----------------------------------------------------------------------

/**
 * Read a query param from the current URL (client side only).
 */
export function readQueryParam(key: string): string | null {
    if (typeof window === 'undefined') {
        return null
    }
    return new URLSearchParams(window.location.search).get(key)
}

/**
 * Write query params into the current URL without triggering a Next.js
 * navigation (no re-render, no scroll reset). Passing `null`/`undefined`/''
 * as a value removes the param, keeping shared URLs clean.
 */
export function writeQueryParams(params: Record<string, string | null | undefined>) {
    if (typeof window === 'undefined') {
        return
    }
    const searchParams = new URLSearchParams(window.location.search)

    Object.entries(params).forEach(([key, value]) => {
        if (value === null || value === undefined || value === '') {
            searchParams.delete(key)
        } else {
            searchParams.set(key, value)
        }
    })

    const query = searchParams.toString()
    const newUrl = `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`
    window.history.replaceState(window.history.state, '', newUrl)
}

// ----------------------------------------------------------------------

type Options<T> = {
    /** Serialized value equal to this is removed from the URL (keeps links clean) */
    defaultValue: T
    /** Convert the state value to its URL string representation */
    serialize?: (value: T) => string
    /** Convert the URL string back to a state value; return null to reject invalid input */
    deserialize?: (raw: string) => T | null
}

/**
 * `useState` that mirrors its value into a URL query param, making the view
 * shareable. To stay SSR/hydration-safe, the first render always uses
 * `defaultValue`; the URL value is applied in a mount effect. Updates rewrite
 * the URL in place via `history.replaceState` — no navigation, no scroll jump.
 */
export function useQueryParamState<T>(
    key: string,
    { defaultValue, serialize, deserialize }: Options<T>,
): [T, (value: T) => void] {
    const serializeFn = serialize ?? ((value: T) => String(value))
    const deserializeFn = deserialize ?? ((raw: string) => raw as unknown as T)

    // Server render and first client render must match → start with default
    const [value, setValue] = useState<T>(defaultValue)

    // Keep latest fns without re-running effects/callbacks
    const serializeRef = useRef(serializeFn)
    serializeRef.current = serializeFn
    const deserializeRef = useRef(deserializeFn)
    deserializeRef.current = deserializeFn
    const defaultSerializedRef = useRef(serializeFn(defaultValue))
    defaultSerializedRef.current = serializeFn(defaultValue)

    // After mount, hydrate state from the URL (shareable link support)
    useEffect(() => {
        const raw = readQueryParam(key)
        if (raw === null) {
            return
        }
        const parsed = deserializeRef.current(raw)
        if (parsed === null) {
            // Invalid param value — drop it from the URL
            writeQueryParams({ [key]: null })
            return
        }
        setValue(parsed)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key])

    const update = useCallback(
        (newValue: T) => {
            setValue(newValue)
            const serialized = serializeRef.current(newValue)
            writeQueryParams({
                [key]: serialized === defaultSerializedRef.current ? null : serialized,
            })
        },
        [key],
    )

    return [value, update]
}
