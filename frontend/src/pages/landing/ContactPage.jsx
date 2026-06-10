import { useState } from 'react'
import LandingHeader from '../../components/landing/LandingHeader'
import LandingFooter from '../../components/landing/LandingFooter'
import { navItems } from '../../data/landingPage'

const contactInfo = [
  {
    label: 'Address',
    value: '123 ThinkBack Street, Colombo, Sri Lanka',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    label: 'Phone',
    value: '+94 77 123 4567',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    ),
  },
  {
    label: 'Email',
    value: 'support@thinkback.ai',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
]

function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sent, setSent] = useState(false)

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    setSent(true)
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">

      {/* Header */}
      <div className="mx-auto max-w-7xl px-6 pt-6 lg:px-10">
        <LandingHeader navItems={navItems} />
      </div>

      {/* Hero banner */}
      <section className="bg-[linear-gradient(135deg,#214f39_0%,#184d35_42%,#102d1d_100%)] py-16 text-white">
        <div className="mx-auto max-w-7xl px-6 text-center lg:px-10">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-[#d5eadc]">
            Get in touch
          </div>
          <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
            Contact <span className="text-[#d5eadc]">Us</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-white/70">
            Have questions, feedback, or want to see a demo? We'd love to hear from you.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-6 py-16 lg:px-10">

        {/* Info cards */}
        <section className="grid gap-5 sm:grid-cols-3 mb-16">
          {contactInfo.map(({ label, value, icon }) => (
            <div
              key={label}
              className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:shadow-md hover:-translate-y-0.5"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#184d35]/10 text-[#184d35]">
                {icon}
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
                <p className="mt-0.5 text-sm font-medium text-slate-700">{value}</p>
              </div>
            </div>
          ))}
        </section>

        {/* Form + side panel */}
        <section className="grid gap-10 lg:grid-cols-[1fr_400px] lg:items-start">

          {/* Form */}
          <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
            <h2 className="mb-6 text-xl font-semibold text-slate-800">Send us a message</h2>

            {sent ? (
              <div className="flex flex-col items-center py-10 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
                  <svg className="h-7 w-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-slate-800">Message sent!</h3>
                <p className="mt-1 text-sm text-slate-500">We'll get back to you within 24 hours.</p>
                <button
                  onClick={() => { setSent(false); setForm({ name: '', email: '', subject: '', message: '' }) }}
                  className="mt-6 text-sm font-medium text-[#184d35] hover:underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">Name</label>
                    <input
                      name="name"
                      type="text"
                      required
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Your name"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
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
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
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
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">Message</label>
                  <textarea
                    name="message"
                    rows={5}
                    required
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Tell us more…"
                    className="w-full resize-none rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-[#184d35] py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0f3a26]"
                >
                  Send Message
                </button>
              </form>
            )}
          </div>

          {/* Side panel */}
          <div className="flex flex-col gap-5">
            <div className="rounded-2xl bg-[linear-gradient(135deg,#214f39_0%,#184d35_55%,#102d1d_100%)] p-7 text-white">
              <h3 className="mb-2 text-base font-semibold">Response time</h3>
              <p className="text-sm leading-6 text-white/70">
                We typically respond within <strong className="text-white">24 hours</strong> on business days. For urgent matters, please call us directly.
              </p>
            </div>

          </div>

        </section>
      </main>

      <LandingFooter />
    </div>
  )
}

export default ContactPage
