export type AuthMode = 'optional' | 'required'

const configuredMode = process.env.NEXT_PUBLIC_AUTH_MODE?.trim().toLowerCase()

/**
 * Central switch for the app's entry policy. Unknown or missing values default
 * to optional so a deployment cannot accidentally lock learners out.
 */
export const AUTH_MODE: AuthMode = configuredMode === 'required' ? 'required' : 'optional'

export const isAuthRequired = AUTH_MODE === 'required'
export const isAuthOptional = !isAuthRequired

