/**
 * Sri Lanka NIC:
 *  - Old: 9 digits + [VvXx]  (e.g., 123456789V)
 *  - New: 12 digits          (e.g., 200012345678)
 */
export const SL_NIC_REGEX = /^(?:\d{9}[VvXx]|\d{12})$/

export function isValidNIC(nic: string) {
  return SL_NIC_REGEX.test(nic.trim())
}
