import { useCallback, useState } from 'react'
import { FaTimes } from 'react-icons/fa'
import { inviteUser } from '../../services/users'

function InviteUserModal({ isOpen, onClose, onSuccess }) {
  const [form, setForm] = useState({ full_name: '', email: '', role: 'lecturer' })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = useCallback((e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setError('')
  }, [])

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault()
      setError('')
      setIsSubmitting(true)

      try {
        await inviteUser(form)
        setForm({ full_name: '', email: '', role: 'lecturer' })
        onSuccess()
      } catch (err) {
        const data = err?.response?.data
        if (data) {
          const first = Object.values(data).flat()[0]
          setError(typeof first === 'string' ? first : 'Something went wrong.')
        } else {
          setError('Failed to send invitation. Please try again.')
        }
      } finally {
        setIsSubmitting(false)
      }
    },
    [form, onSuccess],
  )

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-base font-semibold text-slate-800">Add Staff Member</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <FaTimes className="text-sm" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="invite-name" className="mb-1.5 block text-sm font-semibold text-slate-700">
              Full Name
            </label>
            <input
              id="invite-name"
              name="full_name"
              type="text"
              required
              value={form.full_name}
              onChange={handleChange}
              placeholder="Dr. Jane Smith"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div>
            <label htmlFor="invite-email" className="mb-1.5 block text-sm font-semibold text-slate-700">
              Email Address
            </label>
            <input
              id="invite-email"
              name="email"
              type="email"
              required
              value={form.email}
              onChange={handleChange}
              placeholder="jane.smith@university.edu"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div>
            <label htmlFor="invite-role" className="mb-1.5 block text-sm font-semibold text-slate-700">
              Role
            </label>
            <select
              id="invite-role"
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="lecturer">Lecturer</option>
              <option value="coordinator">Coordinator</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-xl bg-[#13462D] py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0f3a26] disabled:opacity-60"
            >
              {isSubmitting ? 'Sending…' : 'Add & Send Invitation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default InviteUserModal
