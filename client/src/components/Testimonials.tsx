import { useTranslation } from "react-i18next";
import { useLanguage } from "@/contexts/LanguageContext";
import { Star } from "lucide-react";

interface Testimonial {
  id: number;
  name: string;
  nameAr: string;
  avatar: string;
  rating: number;
  comment: string;
  commentAr: string;
}

const Testimonials = () => {
  const { t } = useTranslation("home");
  const { isLtr, isRtl } = useLanguage();

  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: "Sarah Abdullah",
      nameAr: "سارة عبدالله",
      avatar: "https://ui-avatars.com/api/?name=Sarah+Abdullah&background=FF69B4&color=fff&size=200",
      rating: 5,
      comment: "The booking process was so simple, and I loved how I could filter for hijab-friendly salons. The service was amazing and I felt completely comfortable.",
      commentAr: "كانت عملية الحجز بسيطة للغاية، وأحببت كيف يمكنني تصفية الصالونات الصديقة للحجاب. كانت الخدمة رائعة وشعرت بالراحة التامة."
    },
    {
      id: 2,
      name: "Lina Mohammed",
      nameAr: "لينا محمد",
      avatar: "https://ui-avatars.com/api/?name=Lina+Mohammed&background=D4AF37&color=fff&size=200",
      rating: 4.5,
      comment: "I appreciate the private room option for my styling sessions. The app is so easy to use in both Arabic and English. Highly recommend!",
      commentAr: "أقدر خيار الغرفة الخاصة لجلسات التصفيف الخاصة بي. التطبيق سهل الاستخدام للغاية باللغتين العربية والإنجليزية. أوصي به بشدة!"
    },
    {
      id: 3,
      name: "Amal Khalid",
      nameAr: "أمل خالد",
      avatar: "https://ui-avatars.com/api/?name=Amal+Khalid&background=FFB6C1&color=fff&size=200",
      rating: 5,
      comment: "The loyalty points system is amazing! I've booked three services and already earned enough for a discount. The notifications also help me remember my appointments.",
      commentAr: "نظام نقاط الولاء رائع! لقد حجزت ثلاث خدمات وكسبت بالفعل ما يكفي للحصول على خصم. تساعدني الإشعارات أيضًا على تذكر مواعيدي."
    }
  ];

  return (
    <section data-aos="fade-up" className="py-16 bg-gradient-to-r from-secondary/30 to-accent/30 dark:from-neutral-900 dark:to-neutral-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h4 className="text-primary uppercase tracking-wider text-sm font-medium">
            {t("testimonials")}
          </h4>
          <h3 className={`font-bold text-3xl mt-2 mb-4 ${isLtr ? 'font-playfair' : 'font-tajawal'}`}>
            {t("customerSay")}
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-muted/30 dark:bg-neutral-800/50 p-6 rounded-xl">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full overflow-hidden mr-4 rtl:ml-4 rtl:mr-0">
                  <img 
                    src={testimonial.avatar} 
                    alt={isLtr ? testimonial.name : testimonial.nameAr} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h5 className={`font-medium ${isRtl ? 'font-tajawal' : ''}`}>
                    {isLtr ? testimonial.name : testimonial.nameAr}
                  </h5>
                  <div className="flex text-primary text-xs">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${
                          i < Math.floor(testimonial.rating)
                            ? "fill-primary"
                            : i < testimonial.rating
                            ? "fill-primary"
                            : "stroke-primary fill-none"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <p className={`text-muted-foreground text-sm italic ${isRtl ? 'font-tajawal' : ''}`}>
                "{isLtr ? testimonial.comment : testimonial.commentAr}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
