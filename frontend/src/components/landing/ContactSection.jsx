import { useState } from 'react'
import api from '../../services/api'

function ContactSection() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sent, setSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => { setForm((prev) => ({ ...prev, [e.target.name]: e.target.value })); setError('') }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await api.post('/superadmin/contact-messages/', form)
      setSent(true)
    } catch {
      setError('Failed to send message. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section id="contact" className="scroll-mt-8">

      {/* Section heading */}
      <div className="mb-10 text-center">
        <p className="text-sm uppercase tracking-[0.25em] text-[#56836c]">Get in touch</p>
        <h2 className="mt-3 text-3xl font-semibold text-[#184d35]">Contact Us</h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500">
          Have questions or want to see a demo? We'd love to hear from you.
        </p>
      </div>

      {/* Main two-column layout */}
      <div className="grid gap-6 lg:grid-cols-[1fr_340px] lg:items-stretch">

        {/* Left — form */}
        <div className="rounded-3xl border border-[#dbe4db] bg-[linear-gradient(180deg,#ffffff_0%,#f7faf6_100%)] p-8 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
          <h3 className="mb-6 text-xl font-semibold text-slate-800">Send us a message</h3>

          {sent ? (
            <div className="flex flex-col items-center py-12 text-center">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#184d35]/10">
                <svg className="h-8 w-8 text-[#184d35]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-slate-800">Message sent!</h4>
              <p className="mt-2 text-sm text-slate-500">We'll get back to you within 24 hours.</p>
              <button
                onClick={() => { setSent(false); setForm({ name: '', email: '', subject: '', message: '' }) }}
                className="mt-6 rounded-xl border border-[#184d35]/20 bg-[#184d35]/5 px-5 py-2 text-sm font-medium text-[#184d35] transition hover:bg-[#184d35]/10"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">{error}</div>
              )}
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">Name</label>
                  <input
                    name="name"
                    type="text"
                    required
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#184d35]/50 focus:ring-2 focus:ring-[#184d35]/10"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">Email</label>
                  <input
                    name="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#184d35]/50 focus:ring-2 focus:ring-[#184d35]/10"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Subject</label>
                <input
                  name="subject"
                  type="text"
                  required
                  value={form.subject}
                  onChange={handleChange}
                  placeholder="How can we help?"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#184d35]/50 focus:ring-2 focus:ring-[#184d35]/10"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Message</label>
                <textarea
                  name="message"
                  rows={4}
                  required
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Tell us more…"
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#184d35]/50 focus:ring-2 focus:ring-[#184d35]/10"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-[linear-gradient(135deg,#2e7b56_0%,#184d35_56%,#0f2f1e_100%)] py-3 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(24,77,53,0.22)] transition hover:brightness-110 hover:-translate-y-px disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? 'Sending…' : 'Send Message'}
              </button>
            </form>
          )}
        </div>

        {/* Right — info panel */}
        <div className="flex flex-col gap-5">

          {/* Dark card */}
          <div className="rounded-3xl bg-[linear-gradient(135deg,#214f39_0%,#184d35_42%,#102d1d_100%)] p-7 text-white shadow-[0_24px_60px_rgba(24,77,53,0.16)]">
            <p className="text-xs uppercase tracking-[0.22em] text-[#d5eadc] mb-5">Reach us directly</p>

            <div className="space-y-5">
              {[
                {
                  label: 'Email',
                  value: 'support@thinkback.ai',
                  icon: (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  ),
                },
                {
                  label: 'Phone',
                  value: '+94 77 123 4567',
                  icon: (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  ),
                },
                {
                  label: 'Address',
                  value: '123 ThinkBack Street, Colombo, Sri Lanka',
                  icon: (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  ),
                },
              ].map(({ label, value, icon }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/10 text-[#d5eadc]">
                    {icon}
                  </div>
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wide text-white/40">{label}</p>
                    <p className="mt-0.5 text-sm text-white/80">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Response time card */}
          <div className="rounded-3xl border border-[#dbe4db] bg-[linear-gradient(180deg,#ffffff_0%,#f4f8f4_100%)] p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-sm font-semibold text-slate-700">Typically replies within 24 hrs</p>
            </div>
            <p className="text-xs leading-5 text-slate-500">
              Our team is available Monday to Friday. We aim to respond to all enquiries within one business day.
            </p>
          </div>

        </div>
      </div>
    </section>
  )
}

export default ContactSection
