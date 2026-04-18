import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

export const isUnlockedAtom = atom<boolean>(false)
export const lockoutExpiryAtom = atomWithStorage<number | null>('portal_lock_expiry', null)
export const attemptsAtom = atom<number>(0)
