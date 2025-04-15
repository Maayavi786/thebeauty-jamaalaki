import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/contexts/LanguageContext';
import { MapPin, Mail, Phone } from 'lucide-react';
import { getIslamicPatternSvg } from '@/lib/utils';

const About = () => {
  const { t } = useTranslation('about');
  const { isRtl } = useLanguage();

  // Team members data
  const teamMembers = [
    {
      name: "Sarah Al-Ghamdi",
      role: "founder",
      image: "https://ui-avatars.com/api/?name=Sarah+Al-Ghamdi&background=FF69B4&color=fff&size=200",
    },
    {
      name: "Fatima Al-Harbi",
      role: "operations",
      image: "https://ui-avatars.com/api/?name=Fatima+Al-Harbi&background=FF69B4&color=fff&size=200",
    },
    {
      name: "Noura Al-Sulaiman",
      role: "marketing",
      image: "https://ui-avatars.com/api/?name=Noura+Al-Sulaiman&background=FF69B4&color=fff&size=200",
    },
  ];

  return (
    <div className={`container mx-auto py-12 px-4 ${isRtl ? 'font-tajawal' : ''}`}>
      {/* Hero Section */}
      <div className="relative overflow-hidden py-16 lg:py-24 bg-gradient-to-r from-secondary/30 to-accent/30 dark:from-neutral-900 dark:to-neutral-900 rounded-xl overflow-hidden mb-20">
        <div 
          className="absolute inset-0 opacity-20"
          style={{ 
            backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(getIslamicPatternSvg('#ffffff'))}")`, 
            backgroundSize: '300px' 
          }}
        ></div>
        <div className="relative z-10 py-20 px-6 text-center max-w-3xl mx-auto">
          <h1 className={`text-4xl md:text-5xl font-bold mb-6 ${isRtl ? 'font-tajawal' : 'font-playfair'}`}>
            {t('aboutTitle')}
          </h1>
          <p className={`text-lg mb-8 text-muted-foreground ${isRtl ? 'font-tajawal' : ''}`}>
            {t('aboutSubtitle')}
          </p>
        </div>
      </div>

      {/* Our Story Section */}
      <div className="mb-20 bg-gradient-to-r from-secondary/30 to-accent/30 dark:from-neutral-900 dark:to-neutral-900 rounded-xl p-8">
        <h2 className="text-3xl font-bold mb-8 text-center">{t('ourStory')}</h2>
        <div className="max-w-3xl mx-auto">
          <p className="mb-4 text-lg">{t('ourStoryP1')}</p>
          <p className="mb-4 text-lg">{t('ourStoryP2')}</p>
          <p className="mb-4 text-lg">{t('ourStoryP3')}</p>
        </div>
      </div>

      {/* Our Values Section */}
      <div className="mb-20 bg-gradient-to-r from-secondary/30 to-accent/30 dark:from-neutral-900 dark:to-neutral-900 rounded-xl p-8">
        <h2 className="text-3xl font-bold mb-8 text-center">{t('ourValues')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-background dark:bg-neutral-900 rounded-xl shadow-md p-6 border-t-4 border-primary hover:shadow-lg transition-all">
            <h3 className="text-xl font-bold mb-4">{t('customerCentric')}</h3>
            <p>{t('customerCentricDesc')}</p>
          </div>
          <div className="bg-background dark:bg-neutral-900 rounded-xl shadow-md p-6 border-t-4 border-primary hover:shadow-lg transition-all">
            <h3 className="text-xl font-bold mb-4">{t('quality')}</h3>
            <p>{t('qualityDesc')}</p>
          </div>
          <div className="bg-background dark:bg-neutral-900 rounded-xl shadow-md p-6 border-t-4 border-primary hover:shadow-lg transition-all">
            <h3 className="text-xl font-bold mb-4">{t('convenience')}</h3>
            <p>{t('convenienceDesc')}</p>
          </div>
          <div className="bg-background dark:bg-neutral-900 rounded-xl shadow-md p-6 border-t-4 border-primary hover:shadow-lg transition-all">
            <h3 className="text-xl font-bold mb-4">{t('community')}</h3>
            <p>{t('communityDesc')}</p>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <section className="py-16 bg-gradient-to-r from-secondary/30 to-accent/30 dark:from-neutral-900 dark:to-neutral-900 rounded-xl">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">{t("meetOurTeam")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="text-center">
                <div className="w-48 h-48 mx-auto mb-4 rounded-full overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-semibold mb-2">{member.name}</h3>
                <p className="text-muted-foreground">{t(member.role)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <div className="bg-gradient-to-r from-secondary/30 to-accent/30 dark:from-neutral-900 dark:to-neutral-900 rounded-xl p-8">
        <h2 className="text-3xl font-bold mb-8 text-center">{t('getInTouch')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="bg-background dark:bg-neutral-900 rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-all">
            <div className="mb-4 flex justify-center">
              <MapPin className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">{t('visitUs')}</h3>
            <p className={`${isRtl ? 'font-tajawal' : ''}`}>
              {t('address')}
            </p>
          </div>
          <div className="bg-background dark:bg-neutral-900 rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-all">
            <div className="mb-4 flex justify-center">
              <Mail className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">{t('emailUs')}</h3>
            <p>{t('infoEmail')}</p>
            <p>{t('supportEmail')}</p>
          </div>
          <div className="bg-background dark:bg-neutral-900 rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-all">
            <div className="mb-4 flex justify-center">
              <Phone className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">{t('callUs')}</h3>
            <p>{t('phone1')}</p>
            <p>{t('phone2')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;