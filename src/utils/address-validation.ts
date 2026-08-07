// ----------------------------------------------------------------------
// Shared address / hash format validation for SUI and Ethereum values.

export const ETH_ADDRESS_REGEX = /^0x[0-9a-fA-F]{40}$/
export const HEX_64_REGEX = /^(0x)?[0-9a-fA-F]{64}$/
export const SUI_DIGEST_REGEX = /^[1-9A-HJ-NP-Za-km-z]{32,50}$/

/** Ethereum account address: 0x + 40 hex chars */
export function isValidEthAddress(value: string): boolean {
    return ETH_ADDRESS_REGEX.test(value.trim())
}

/** SUI account address: 64 hex chars, 0x prefix optional */
export function isValidSuiAddress(value: string): boolean {
    return HEX_64_REGEX.test(value.trim())
}
