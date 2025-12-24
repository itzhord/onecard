import Header from '../components/layout/Header'
import HeroSection from '../components/layout/HeroSection'
import FeaturesSection from '../components/layout/FeaturesSection'
import PricingSection from '../components/layout/PricingSection'
import Footer from '../components/layout/Footer'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <PricingSection />
      </main>
      <Footer />
    </div>
  )
}