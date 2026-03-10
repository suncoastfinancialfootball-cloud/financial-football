import bcrypt from 'bcrypt'
import { SystemSetting } from '../db/models/index.js'

const RESET_MATCH_PASSKEY_SETTING_KEY = 'security.reset-match-passkey'

const RESET_MATCH_PASSKEY_MESSAGES = {
  missing: 'Reset match passkey is required.',
  invalid: 'Invalid reset match passkey.',
  unconfigured: 'Reset match passkey is not configured yet. Ask an admin to set it first.',
}

const normalizePasskey = (passkey) => (typeof passkey === 'string' ? passkey.trim() : '')

const readPasskeyPayload = async () => {
  const setting = await SystemSetting.findOne({ key: RESET_MATCH_PASSKEY_SETTING_KEY }).lean()
  const value = setting?.value || {}
  return {
    hash: typeof value.hash === 'string' ? value.hash : '',
    updatedAt: value.updatedAt ?? setting?.updatedAt ?? null,
    updatedBy: value.updatedBy ?? null,
  }
}

export const getResetMatchPasskeyMeta = async () => {
  const payload = await readPasskeyPayload()
  return {
    configured: Boolean(payload.hash),
    updatedAt: payload.updatedAt,
    updatedBy: payload.updatedBy,
  }
}

export const setResetMatchPasskey = async (passkey, updatedBy = null) => {
  const normalized = normalizePasskey(passkey)
  if (!normalized) {
    const error = new Error(RESET_MATCH_PASSKEY_MESSAGES.missing)
    error.code = 'missing'
    throw error
  }

  const hash = await bcrypt.hash(normalized, 10)
  const updatedAt = new Date().toISOString()

  await SystemSetting.findOneAndUpdate(
    { key: RESET_MATCH_PASSKEY_SETTING_KEY },
    {
      $set: {
        value: {
          hash,
          updatedAt,
          updatedBy,
        },
      },
      $setOnInsert: {
        key: RESET_MATCH_PASSKEY_SETTING_KEY,
      },
    },
    { upsert: true, new: true },
  )

  return {
    configured: true,
    updatedAt,
    updatedBy,
  }
}

export const verifyResetMatchPasskey = async (passkey) => {
  const normalized = normalizePasskey(passkey)
  if (!normalized) {
    return { ok: false, reason: 'missing' }
  }

  const payload = await readPasskeyPayload()
  if (!payload.hash) {
    return { ok: false, reason: 'unconfigured' }
  }

  const isMatch = await bcrypt.compare(normalized, payload.hash)
  if (!isMatch) {
    return { ok: false, reason: 'invalid' }
  }

  return { ok: true }
}

export const getResetMatchPasskeyMessage = (reason) =>
  RESET_MATCH_PASSKEY_MESSAGES[reason] || 'Unable to validate reset match passkey.'
