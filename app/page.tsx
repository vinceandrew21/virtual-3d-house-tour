import ThemeProvider from '@/components/landing/ThemeProvider';
import LoadingIntro from '@/components/landing/LoadingIntro';
import LandingHeader from '@/components/landing/LandingHeader';
import HeroSection from '@/components/landing/HeroSection';
import HeroImage from '@/components/landing/HeroImage';
import ServicesSection from '@/components/landing/ServicesSection';
import ShowcaseSection from '@/components/landing/ShowcaseSection';
import AboutSection from '@/components/landing/AboutSection';
import CTASection from '@/components/landing/CTASection';
import LandingFooter from '@/components/landing/LandingFooter';

export default function HomePage() {
  return (
    <ThemeProvider>
      <div className="landing-page">
        <LoadingIntro />
        <LandingHeader />
        <main>
          <HeroSection />
          <HeroImage />
          <ServicesSection />
          <ShowcaseSection />
          <AboutSection />
          <CTASection />
        </main>
        <LandingFooter />
      </div>
    </ThemeProvider>
  );
}
