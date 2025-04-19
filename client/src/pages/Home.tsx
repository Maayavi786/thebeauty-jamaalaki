import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet";
import { useLanguage } from "@/contexts/LanguageContext";
import HeroSection from "@/components/HeroSection";
import FeaturedFilters from "@/components/FeaturedFilters";
import SearchBar from "@/components/SearchBar";
import FeaturedSalons from "@/components/FeaturedSalons";
import ServicesSection from "@/components/ServicesSection";
import BookingSteps from "@/components/BookingSteps";
import Testimonials from "@/components/Testimonials";
import CTASection from "@/components/CTASection";
import { useLocation } from "wouter";
import { getIslamicPatternSvg } from "@/lib/utils";

const Home = () => {
  const { t } = useTranslation("common");
  const { isLtr } = useLanguage();
  const [_, navigate] = useLocation();

  useEffect(() => {
    // Create pattern SVG background
    const patternSvg = getIslamicPatternSvg();
    const patternBg = document.createElement('div');
    patternBg.className = 'pattern-bg';
    patternBg.style.backgroundImage = `url('data:image/svg+xml;charset=utf-8,${encodeURIComponent(patternSvg)}')`;
    
    // Add to DOM
    document.body.appendChild(patternBg);
    
    // Cleanup on unmount
    return () => {
      document.body.removeChild(patternBg);
    };
  }, []);

  const handleSearch = (searchParams: any) => {
    // Convert search params to URL query parameters
    const queryParams = new URLSearchParams();
    
    if (searchParams.searchTerm) {
      queryParams.append('q', searchParams.searchTerm);
    }
    
    if (searchParams.serviceType && searchParams.serviceType !== 'all') {
      queryParams.append('service', searchParams.serviceType);
    }
    
    // Add filter parameters
    if (searchParams.ladiesOnly) {
      queryParams.append('isLadiesOnly', 'true');
    }
    
    if (searchParams.privateRoom) {
      queryParams.append('hasPrivateRooms', 'true');
    }
    
    if (searchParams.hijabFriendly) {
      queryParams.append('isHijabFriendly', 'true');
    }
    
    // Navigate to salons page with filter parameters
    const queryString = queryParams.toString();
    navigate(`/salons${queryString ? `?${queryString}` : ''}`);
  };

  return (
    <>
      <Helmet>
        <title>The Beauty - {isLtr ? "Luxury Salon Booking" : "حجز صالون الرفاهية"}</title>
        <meta name="description" content={isLtr 
          ? "Book luxury salon services designed specifically for women in Saudi Arabia"
          : "احجزي خدمات صالون فاخرة مصممة خصيصًا للنساء في المملكة العربية السعودية"
        } />
      </Helmet>

      <section
        className="relative py-16 px-4 sm:px-8 lg:px-16"
        data-aos="fade-up"
      >
        {/* Hero Section */}
        <HeroSection />
      </section>

      {/* Featured Filters */}
      <FeaturedFilters />
      
      {/* Search Section */}
      <section className="py-12 bg-gradient-to-r from-secondary/30 to-accent/30 dark:from-neutral-900 dark:to-neutral-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h3 className={`font-bold text-3xl mb-4 ${isLtr ? 'font-playfair' : 'font-tajawal'}`}>
                {t("findYourPerfectSalon")}
              </h3>
              
              <p className="text-muted-foreground max-w-lg mx-auto">
                {isLtr 
                  ? "Search for salons based on your needs, location and preferences"
                  : "ابحثي عن الصالونات بناءً على احتياجاتك وموقعك وتفضيلاتك"
                }
              </p>
            </div>
            
            <SearchBar onSearch={handleSearch} />
          </div>
        </div>
      </section>
      
      <section className="my-12" data-aos="fade-up">
        {/* Featured Salons */}
        <FeaturedSalons />
      </section>

      <section className="my-12" data-aos="fade-up">
        {/* Services Section */}
        <ServicesSection />
      </section>

      <section className="my-12" data-aos="fade-up">
        {/* Booking Process Steps */}
        <BookingSteps />
      </section>

      <section className="my-12" data-aos="fade-up">
        {/* Testimonials */}
        <Testimonials />
      </section>

      <section className="my-12" data-aos="fade-up">
        {/* CTA Section */}
        <CTASection />
      </section>
    </>
  );
};

export default Home;
