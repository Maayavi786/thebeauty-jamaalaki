import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Layers } from "lucide-react";
import { 
  FaFacebookF, 
  FaInstagram, 
  FaTwitter, 
  FaSnapchat 
} from "react-icons/fa";

const Footer = () => {
  const { t } = useTranslation("footer");
  const { isLtr, isRtl } = useLanguage();

  return (
    <footer className="bg-gradient-to-r from-secondary/30 to-accent/30 dark:from-neutral-900 dark:to-neutral-900 text-foreground border-t pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Column 1 - About */}
          <div>
            <h3 className={`font-bold text-xl mb-4 ${isLtr ? 'font-playfair' : 'font-tajawal'}`}>
              {isLtr ? "The Beauty" : "جمالكِ"}
            </h3>
            
            <p className={`text-muted-foreground text-sm mb-4 ${isRtl ? 'font-tajawal' : ''}`}>
              {t("about")}
            </p>
            
            <div className="flex gap-4">
              <button className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                <FaFacebookF />
              </button>
              <button className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                <FaInstagram />
              </button>
              <button className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                <FaTwitter />
              </button>
              <button className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                <FaSnapchat />
              </button>
            </div>
          </div>
          
          {/* Column 2 - Quick Links */}
          <div>
            <h3 className={`font-medium text-xl mb-4 ${isRtl ? 'font-tajawal' : ''}`}>
              {isLtr ? "Quick Links" : "روابط سريعة"}
            </h3>
            
            <ul className={`space-y-2 text-muted-foreground ${isRtl ? 'font-tajawal' : ''}`}>
              <li>
                <Link href="/">
                  <span className="hover:text-primary transition-colors cursor-pointer">
                    {isLtr ? "Home" : "الرئيسية"}
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/services">
                  <span className="hover:text-primary transition-colors cursor-pointer">
                    {isLtr ? "Services" : "الخدمات"}
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/about">
                  <span className="hover:text-primary transition-colors cursor-pointer">
                    {isLtr ? "About" : "من نحن"}
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/salon-owners">
                  <span className="hover:text-primary transition-colors cursor-pointer">
                    {isLtr ? "For Salon Owners" : "لأصحاب الصالونات"}
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/loyalty">
                  <span className="hover:text-primary transition-colors cursor-pointer">
                    {isLtr ? "Loyalty Program" : "برنامج الولاء"}
                  </span>
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Column 3 - Help & Support */}
          <div>
            <h3 className={`font-medium text-xl mb-4 ${isRtl ? 'font-tajawal' : ''}`}>
              {t("helpSupport")}
            </h3>
            
            <ul className={`space-y-2 text-muted-foreground ${isRtl ? 'font-tajawal' : ''}`}>
              <li>
                <Link href="/faq">
                  <span className="hover:text-primary transition-colors cursor-pointer">{t("faq")}</span>
                </Link>
              </li>
              <li>
                <Link href="/privacy">
                  <span className="hover:text-primary transition-colors cursor-pointer">{t("privacyPolicy")}</span>
                </Link>
              </li>
              <li>
                <Link href="/terms">
                  <span className="hover:text-primary transition-colors cursor-pointer">{t("termsOfService")}</span>
                </Link>
              </li>
              <li>
                <Link href="/contact">
                  <span className="hover:text-primary transition-colors cursor-pointer">{t("contactUs")}</span>
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Column 4 - Newsletter */}
          <div>
            <h3 className={`font-medium text-xl mb-4 ${isRtl ? 'font-tajawal' : ''}`}>
              {t("stayUpdated")}
            </h3>
            
            <p className={`text-muted-foreground text-sm mb-4 ${isRtl ? 'font-tajawal' : ''}`}>
              {t("newsletter")}
            </p>
            
            <div className="flex">
              <Input 
                type="email" 
                className="bg-muted border border-input rounded-l-lg py-2 px-4 w-full focus:outline-none focus:ring-1 focus:ring-primary" 
                placeholder={t("emailPlaceholder")}
              />
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 rounded-r-lg transition-colors">
                <Layers className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className={`text-muted-foreground text-sm mb-4 md:mb-0 ${isRtl ? 'font-tajawal' : ''}`}>
            {t("allRightsReserved")}
          </p>
          
          <div className="flex items-center gap-4">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/200px-Visa_Inc._logo.svg.png" 
              alt="Visa" 
              className="h-6 object-contain"
            />
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/200px-Mastercard-logo.svg.png" 
              alt="Mastercard" 
              className="h-6 object-contain"
            />
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Mada_Logo.svg/330px-Mada_Logo.svg.png" 
              alt="Mada" 
              className="h-6 object-contain"
            />
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Stc_pay.svg/320px-Stc_pay.svg.png" 
              alt="STC Pay" 
              className="h-6 object-contain"
            />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
