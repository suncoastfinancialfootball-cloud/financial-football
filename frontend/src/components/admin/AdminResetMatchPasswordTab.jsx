import { useMemo, useState } from 'react'

export default function AdminResetMatchPasswordTab({ passkeyMeta, onSetResetMatchPasskey }) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const lastUpdatedLabel = useMemo(() => {
    const value = passkeyMeta?.updatedAt
    if (!value) return 'Never'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return 'Unknown'
    return date.toLocaleString()
  }, [passkeyMeta?.updatedAt])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    const trimmedPassword = password.trim()
    const trimmedConfirm = confirmPassword.trim()

    if (!trimmedPassword) {
      setError('Password is required.')
      return
    }

    if (trimmedPassword !== trimmedConfirm) {
      setError('Passwords do not match.')
      return
    }

    try {
      setSaving(true)
      await onSetResetMatchPasskey?.(trimmedPassword)
      setPassword('')
      setConfirmPassword('')
      setSuccess('Reset match password updated successfully.')
    } catch (submissionError) {
      setError(submissionError?.message || 'Failed to update reset match password.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-sky-400">Security</p>
        <h1 className="text-3xl font-semibold text-white">Reset Match Password</h1>
        <p className="mt-2 text-sm text-slate-300">
          Moderators must enter this passkey before they can reset any live match.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6 shadow-lg shadow-slate-900/30">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-sm">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Configured</p>
            <p className="mt-2 text-lg font-semibold text-white">{passkeyMeta?.configured ? 'Yes' : 'No'}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-sm">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Last Updated</p>
            <p className="mt-2 text-lg font-semibold text-white">{lastUpdatedLabel}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-200">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">New passkey</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100"
                placeholder="Enter new passkey"
                autoComplete="new-password"
              />
            </label>
            <label className="space-y-2 text-sm text-slate-200">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">Confirm passkey</span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100"
                placeholder="Confirm passkey"
                autoComplete="new-password"
              />
            </label>
          </div>

          {error ? <p className="text-sm text-rose-300">{error}</p> : null}
          {success ? <p className="text-sm text-emerald-300">{success}</p> : null}

          <button
            type="submit"
            disabled={saving}
            className="rounded-full border border-emerald-500/60 bg-emerald-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-200 transition hover:border-emerald-400 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Update Passkey'}
          </button>
        </form>
      </div>
    </div>
  )
}
