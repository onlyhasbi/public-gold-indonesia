import { atomWithStorage } from 'jotai/utils'

export type UserTokenState = string | null;
export type UserDataState = Record<string, any> | null;

// The third parameter creates an empty object default so that we can sync parsing
// the raw token. However, Jotai atomWithStorage handles JSON parsing automatically.

export const authUserAtom = atomWithStorage<UserDataState>('user', null)
export const authTokenAtom = atomWithStorage<UserTokenState>('token', null)

// Admin atoms
export const adminUserAtom = atomWithStorage<UserDataState>('admin_user', null)
export const adminTokenAtom = atomWithStorage<UserTokenState>('admin_token', null)
