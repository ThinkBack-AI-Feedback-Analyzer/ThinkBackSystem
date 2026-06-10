import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import LandingFooter from '../../components/landing/LandingFooter'
import LandingHeader from '../../components/landing/LandingHeader'
import HeroSection from '../../components/landing/HeroSection'
import PlatformOverviewSection from '../../components/landing/PlatformOverviewSection'
import AboutSection from '../../components/landing/AboutSection'
import ContactSection from '../../components/landing/ContactSection'
import { modules, navItems, stats, steps } from '../../data/landingPage'

function LandingPage() {
  const location = useLocation()

  useEffect(() => {
    if (!location.hash) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    const targetElement = document.getElementById(location.hash.slice(1))

    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [location.hash])

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto max-w-7xl px-6 pt-6 lg:px-10">
        <LandingHeader navItems={navItems} />
      </div>

      <main>
        <HeroSection stats={stats} />

        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
          <PlatformOverviewSection modules={modules} steps={steps} />
        </div>

        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
          <AboutSection />
        </div>

        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
          <ContactSection />
        </div>
      </main>

      <LandingFooter />
    </div>
  )
}

export default LandingPage
