import LandingFooter from '../components/landing/LandingFooter'
import LandingHeader from '../components/landing/LandingHeader'
import HeroSection from '../components/landing/HeroSection'
import PlatformOverviewSection from '../components/landing/PlatformOverviewSection'
import { modules, navItems, stats, steps } from '../data/landingPage'

function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto max-w-7xl px-6 py-6 lg:px-10">
        <LandingHeader navItems={navItems} />

        <main className="space-y-8">
          <HeroSection stats={stats} />
          <PlatformOverviewSection modules={modules} steps={steps} />
        </main>
      </div>

      <LandingFooter />
    </div>
  )
}

export default LandingPage
