import LandingFooter from '../components/landing/LandingFooter'
import LandingHeader from '../components/landing/LandingHeader'
import HeroSection from '../components/landing/HeroSection'
import PlatformOverviewSection from '../components/landing/PlatformOverviewSection'
import { modules, navItems, stats, steps } from '../data/landingPage'

function LandingPage() {
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
      </main>

      <LandingFooter />
    </div>
  )
}

export default LandingPage
