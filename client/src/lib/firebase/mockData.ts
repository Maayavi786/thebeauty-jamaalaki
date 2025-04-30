/**
 * Mock data for local Firebase testing
 * This simulates the data that would be returned from Firestore
 */

// Mock users
export const mockUsers = [
  // Customers
  {
    id: 'user1',
    email: 'customer@example.com',
    fullName: 'Sarah Johnson',
    role: 'customer',
    preferredLanguage: 'en',
    photoURL: 'https://randomuser.me/api/portraits/women/12.jpg',
    phone: '+971-50-123-4567',
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days ago
    updatedAt: new Date().toISOString()
  },
  {
    id: 'user3',
    email: 'fatima@example.com',
    fullName: 'Fatima Al-Khalid',
    role: 'customer',
    preferredLanguage: 'ar',
    photoURL: 'https://randomuser.me/api/portraits/women/32.jpg',
    phone: '+971-50-987-6543',
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(), // 45 days ago
    updatedAt: new Date().toISOString()
  },
  {
    id: 'user4',
    email: 'amina@example.com',
    fullName: 'Amina Rahman',
    role: 'customer',
    preferredLanguage: 'en',
    photoURL: 'https://randomuser.me/api/portraits/women/45.jpg',
    phone: '+971-55-111-2222',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
    updatedAt: new Date().toISOString()
  },
  {
    id: 'user5',
    email: 'james@example.com',
    fullName: 'James Wilson',
    role: 'customer',
    preferredLanguage: 'en',
    photoURL: 'https://randomuser.me/api/portraits/men/22.jpg',
    phone: '+971-55-333-4444',
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), // 20 days ago
    updatedAt: new Date().toISOString()
  },
  
  // Salon Owners
  {
    id: 'user2',
    email: 'owner@example.com',
    fullName: 'Mohammed Al-Farsi',
    role: 'salon_owner',
    preferredLanguage: 'en',
    photoURL: 'https://randomuser.me/api/portraits/men/32.jpg',
    phone: '+971-56-777-8888',
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days ago
    updatedAt: new Date().toISOString()
  },
  {
    id: 'user6',
    email: 'leila@example.com',
    fullName: 'Leila Hakim',
    role: 'salon_owner',
    preferredLanguage: 'ar',
    photoURL: 'https://randomuser.me/api/portraits/women/67.jpg',
    phone: '+971-56-555-6666',
    createdAt: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000).toISOString(), // 70 days ago
    updatedAt: new Date().toISOString()
  },
  {
    id: 'user7',
    email: 'aisha@example.com',
    fullName: 'Aisha Mansour',
    role: 'salon_owner',
    preferredLanguage: 'ar',
    photoURL: 'https://randomuser.me/api/portraits/women/55.jpg',
    phone: '+971-54-123-7890',
    createdAt: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString(), // 50 days ago
    updatedAt: new Date().toISOString()
  },
  
  // Admin user
  {
    id: 'admin1',
    email: 'admin@example.com',
    fullName: 'System Administrator',
    role: 'admin',
    preferredLanguage: 'en',
    photoURL: 'https://randomuser.me/api/portraits/men/1.jpg',
    phone: '+971-50-000-0000',
    createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(), // 120 days ago
    updatedAt: new Date().toISOString()
  }
];

// Mock salons
export const mockSalons = [
  {
    id: 'salon1',
    owner_id: 'user2',
    name_en: 'Luxury Beauty Salon',
    name_ar: 'صالون الجمال الفاخر',
    description_en: 'A high-end beauty salon offering premium services for the most discerning clients. Our expert stylists use only the finest products.',
    description_ar: 'صالون تجميل راقي يقدم خدمات متميزة لأكثر العملاء تمييزًا. يستخدم مصففو الشعر لدينا أفضل المنتجات.',
    address: '123 Main Street, Downtown Dubai',
    location: { lat: 25.204849, lng: 55.270782 },
    phone: '+971-4-123-4567',
    email: 'info@luxurybeauty.com',
    image_url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1470259078422-826894b933aa?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop'
    ],
    rating: 4.8,
    review_count: 156,
    is_featured: true,
    ladies_only: true,
    private_rooms: true,
    accepts_card: true,
    wifi_available: true,
    amenities: ['Refreshments', 'Magazines', 'TV', 'Air Conditioning'],
    business_hours: {
      monday: { open: '09:00', close: '21:00' },
      tuesday: { open: '09:00', close: '21:00' },
      wednesday: { open: '09:00', close: '21:00' },
      thursday: { open: '09:00', close: '21:00' },
      friday: { open: '09:00', close: '21:00' },
      saturday: { open: '10:00', close: '22:00' },
      sunday: { open: '10:00', close: '22:00' },
    },
    createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'salon2',
    owner_id: 'user2',
    name_en: 'Modern Cuts',
    name_ar: 'قصات عصرية',
    description_en: 'Contemporary hair salon with latest styling techniques. We specialize in modern trends for all hair types.',
    description_ar: 'صالون شعر معاصر مع أحدث تقنيات التصميم. نحن متخصصون في الاتجاهات الحديثة لجميع أنواع الشعر.',
    address: '456 Park Avenue, Jumeirah',
    location: { lat: 25.198765, lng: 55.269270 },
    phone: '+971-4-987-6543',
    email: 'info@moderncuts.com',
    image_url: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=800&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800&auto=format&fit=crop'
    ],
    rating: 4.5,
    review_count: 92,
    is_featured: false,
    ladies_only: false,
    private_rooms: true,
    accepts_card: true,
    wifi_available: true,
    amenities: ['Refreshments', 'Free WiFi', 'Magazines'],
    business_hours: {
      monday: { open: '10:00', close: '20:00' },
      tuesday: { open: '10:00', close: '20:00' },
      wednesday: { open: '10:00', close: '20:00' },
      thursday: { open: '10:00', close: '20:00' },
      friday: { open: '10:00', close: '20:00' },
      saturday: { open: '11:00', close: '19:00' },
      sunday: { open: '11:00', close: '19:00' },
    },
    createdAt: new Date(Date.now() - 270 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'salon3',
    owner_id: 'user6',
    name_en: 'Serene Family Spa',
    name_ar: 'سبا العائلة الهادئ',
    description_en: 'A family-friendly spa offering relaxation services for all family members. Special packages for mothers and daughters.',
    description_ar: 'سبا عائلي يقدم خدمات الاسترخاء لجميع أفراد الأسرة. باقات خاصة للأمهات والبنات.',
    address: '789 Family Lane, Al Barsha',
    location: { lat: 25.213456, lng: 55.278954 },
    phone: '+971-4-456-7890',
    email: 'info@serenefamily.com',
    image_url: 'https://images.unsplash.com/photo-1610555356070-d0efb6505f81?w=800&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=800&auto=format&fit=crop'
    ],
    rating: 4.7,
    review_count: 73,
    is_featured: true,
    ladies_only: false,
    private_rooms: true,
    accepts_card: true,
    wifi_available: true,
    amenities: ['Family Packages', 'Kid-friendly Area', 'Refreshments', 'TV'],
    business_hours: {
      monday: { open: '10:00', close: '20:00' },
      tuesday: { open: '10:00', close: '20:00' },
      wednesday: { open: '10:00', close: '20:00' },
      thursday: { open: '10:00', close: '20:00' },
      friday: { open: '14:00', close: '22:00' },
      saturday: { open: '09:00', close: '21:00' },
      sunday: { open: '09:00', close: '21:00' },
    },
    createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'salon4',
    owner_id: 'user7',
    name_en: 'Elite Nails & Spa',
    name_ar: 'إيليت للأظافر والسبا',
    description_en: 'Premium nail salon offering luxury manicures, pedicures, and nail art. Using only the highest quality products.',
    description_ar: 'صالون أظافر متميز يقدم خدمات المانيكير والباديكير وفن الأظافر الفاخرة. باستخدام منتجات عالية الجودة.',
    address: '123 Luxury Boulevard, Dubai Marina',
    location: { lat: 25.092362, lng: 55.143764 },
    phone: '+971-4-333-4444',
    email: 'appointments@elitenails.com',
    image_url: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1607779097040-f68a475f9802?w=800&auto=format&fit=crop'
    ],
    rating: 4.9,
    review_count: 128,
    is_featured: true,
    ladies_only: true,
    private_rooms: false,
    accepts_card: true,
    wifi_available: true,
    amenities: ['Complimentary Drinks', 'Luxury Seating', 'TV', 'Premium Products'],
    business_hours: {
      monday: { open: '09:00', close: '21:00' },
      tuesday: { open: '09:00', close: '21:00' },
      wednesday: { open: '09:00', close: '21:00' },
      thursday: { open: '09:00', close: '21:00' },
      friday: { open: '10:00', close: '22:00' },
      saturday: { open: '10:00', close: '22:00' },
      sunday: { open: '12:00', close: '20:00' },
    },
    createdAt: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'salon5',
    owner_id: 'user2',
    name_en: 'The Gentleman\'s Barber',
    name_ar: 'حلاق الرجل النبيل',
    description_en: 'Traditional barber shop offering classic haircuts, hot towel shaves, and beard trimming in a relaxed atmosphere.',
    description_ar: 'صالون حلاقة تقليدي يقدم قصات شعر كلاسيكية وحلاقة بالمناشف الساخنة وتشذيب اللحية في جو مريح.',
    address: '25 Heritage Street, Old Dubai',
    location: { lat: 25.263896, lng: 55.298675 },
    phone: '+971-4-222-3333',
    email: 'appointments@gentlemansbarber.com',
    image_url: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=800&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&auto=format&fit=crop'
    ],
    rating: 4.6,
    review_count: 87,
    is_featured: false,
    ladies_only: false,
    private_rooms: false,
    accepts_card: true,
    wifi_available: true,
    amenities: ['Coffee & Tea', 'Classic Music', 'Magazines', 'TV'],
    business_hours: {
      monday: { open: '10:00', close: '20:00' },
      tuesday: { open: '10:00', close: '20:00' },
      wednesday: { open: '10:00', close: '20:00' },
      thursday: { open: '10:00', close: '22:00' },
      friday: { open: '14:00', close: '22:00' },
      saturday: { open: '09:00', close: '21:00' },
      sunday: { open: '09:00', close: '18:00' },
    },
    createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Mock services
export const mockServices = [
  // Luxury Beauty Salon (salon1) services
  {
    id: 'service1',
    salon_id: 'salon1',
    name_en: 'Premium Haircut & Styling',
    name_ar: 'قص وتصفيف شعر مميز',
    description_en: 'Professional haircut and styling by our expert senior stylists using premium products. Includes consultation, hair wash, scalp massage, precision cut, and styling.',
    description_ar: 'قص شعر احترافي وتصفيف من قبل كبار مصففي الشعر لدينا باستخدام منتجات ممتازة. يشمل الاستشارة وغسل الشعر وتدليك فروة الرأس والقص الدقيق والتصفيف.',
    price: 220,
    duration: 75,
    image_url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&auto=format&fit=crop',
    is_featured: true,
    category: 'Hair',
    popular: true,
    discount: null,
    createdAt: new Date(Date.now() - 350 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'service2',
    salon_id: 'salon1',
    name_en: 'Luxury Manicure',
    name_ar: 'مانيكير فاخر',
    description_en: 'Premium nail treatment including hand soak, exfoliation, cuticle care, moisturizing massage, shape, buff, and polish with high-end products.',
    description_ar: 'علاج فاخر للأظافر يشمل نقع اليدين والتقشير والعناية بالجلد الميت وتدليك مرطب وتشكيل وتلميع وطلاء الأظافر بمنتجات راقية.',
    price: 150,
    duration: 60,
    image_url: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&auto=format&fit=crop',
    is_featured: true,
    category: 'Nails',
    popular: true,
    discount: 10,
    createdAt: new Date(Date.now() - 320 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'service3',
    salon_id: 'salon1',
    name_en: 'Signature Facial',
    name_ar: 'تنظيف بشرة مميز',
    description_en: 'Our signature facial combines deep cleansing, exfoliation, steam, extraction, masking, and facial massage using premium organic products customized for your skin type.',
    description_ar: 'تنظيف البشرة المميز الخاص بنا يجمع بين التنظيف العميق والتقشير والبخار والاستخراج والأقنعة وتدليك الوجه باستخدام منتجات عضوية فاخرة مخصصة لنوع بشرتك.',
    price: 300,
    duration: 90,
    image_url: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&auto=format&fit=crop',
    is_featured: true,
    category: 'Facial',
    popular: true,
    discount: null,
    createdAt: new Date(Date.now() - 300 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'service4',
    salon_id: 'salon1',
    name_en: 'Full Body Massage',
    name_ar: 'مساج كامل للجسم',
    description_en: 'Indulge in a luxurious full-body massage that combines Swedish and deep tissue techniques to relieve tension, improve circulation, and promote total relaxation.',
    description_ar: 'استمتع بتدليك فاخر للجسم بالكامل يجمع بين تقنيات التدليك السويدي والأنسجة العميقة لتخفيف التوتر وتحسين الدورة الدموية وتعزيز الاسترخاء التام.',
    price: 350,
    duration: 120,
    image_url: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&auto=format&fit=crop',
    is_featured: true,
    category: 'Massage',
    popular: true,
    discount: 15,
    createdAt: new Date(Date.now() - 280 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'service5',
    salon_id: 'salon1',
    name_en: 'Bridal Makeup Package',
    name_ar: 'باقة مكياج العروس',
    description_en: 'Complete bridal beauty package including trial session, wedding day makeup, hairstyling, manicure, pedicure, and touch-up service for the perfect wedding look.',
    description_ar: 'باقة جمال كاملة للعروس تشمل جلسة تجريبية ومكياج يوم الزفاف وتصفيف الشعر والمانيكير والباديكير وخدمة اللمسات الأخيرة للحصول على إطلالة زفاف مثالية.',
    price: 2500,
    duration: 300,
    image_url: 'https://images.unsplash.com/photo-1597225244660-1cd128c64284?w=400&auto=format&fit=crop',
    is_featured: true,
    category: 'Bridal',
    popular: true,
    discount: null,
    createdAt: new Date(Date.now() - 260 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  
  // Modern Cuts (salon2) services
  {
    id: 'service6',
    salon_id: 'salon2',
    name_en: 'Men\'s Designer Haircut',
    name_ar: 'قص شعر رجالي مصمم',
    description_en: 'Precision haircut tailored to your face shape and style preferences. Includes consultation, wash, cut, and styling with premium products.',
    description_ar: 'قصة شعر دقيقة مصممة خصيصًا لشكل وجهك وتفضيلات أسلوبك. تشمل الاستشارة والغسل والقص والتصفيف بمنتجات ممتازة.',
    price: 120,
    duration: 45,
    image_url: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&auto=format&fit=crop',
    is_featured: true,
    category: 'Hair',
    popular: true,
    discount: null,
    createdAt: new Date(Date.now() - 250 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'service7',
    salon_id: 'salon2',
    name_en: 'Hair Coloring',
    name_ar: 'صبغ الشعر',
    description_en: 'Professional hair coloring service using high-quality, ammonia-free dyes. Includes consultation to find your perfect shade, application, processing, and styling.',
    description_ar: 'خدمة صبغ الشعر الاحترافية باستخدام أصباغ عالية الجودة خالية من الأمونيا. تشمل الاستشارة للعثور على اللون المثالي لك والتطبيق والمعالجة والتصفيف.',
    price: 250,
    duration: 120,
    image_url: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400&auto=format&fit=crop',
    is_featured: true,
    category: 'Hair',
    popular: true,
    discount: 10,
    createdAt: new Date(Date.now() - 240 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  
  // Serene Family Spa (salon3) services
  {
    id: 'service8',
    salon_id: 'salon3',
    name_en: 'Family Spa Package',
    name_ar: 'باقة سبا العائلة',
    description_en: 'Family spa experience with private area for 2-4 family members. Includes foot soak, mini facials, light massage, and refreshments.',
    description_ar: 'تجربة سبا عائلية مع منطقة خاصة لـ 2-4 أفراد من العائلة. تشمل حمام القدمين وتنظيف الوجه المصغر والتدليك الخفيف والمرطبات.',
    price: 600,
    duration: 150,
    image_url: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=400&auto=format&fit=crop',
    is_featured: true,
    category: 'Spa',
    popular: true,
    discount: null,
    createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'service9',
    salon_id: 'salon3',
    name_en: 'Mother-Daughter Spa Day',
    name_ar: 'يوم سبا للأم والابنة',
    description_en: 'Special bonding experience for mothers and daughters with matching treatments including facials, manicures, and hair styling.',
    description_ar: 'تجربة ترابط خاصة للأمهات والبنات مع علاجات متطابقة تشمل تنظيف الوجه والعناية بالأظافر وتصفيف الشعر.',
    price: 450,
    duration: 180,
    image_url: 'https://images.unsplash.com/photo-1607008829749-c0f284a49781?w=400&auto=format&fit=crop',
    is_featured: true,
    category: 'Spa',
    popular: true,
    discount: 10,
    createdAt: new Date(Date.now() - 170 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'service10',
    salon_id: 'salon3',
    name_en: 'Kid\'s First Haircut',
    name_ar: 'أول قصة شعر للطفل',
    description_en: 'Special gentle haircut experience for children with patience and care. Includes a certificate and photo to commemorate the moment.',
    description_ar: 'تجربة قص شعر لطيفة خاصة للأطفال مع الصبر والعناية. تشمل شهادة وصورة للاحتفال باللحظة.',
    price: 80,
    duration: 30,
    image_url: 'https://images.unsplash.com/photo-1569234817121-a2270384ba24?w=400&auto=format&fit=crop',
    is_featured: false,
    category: 'Hair',
    popular: false,
    discount: null,
    createdAt: new Date(Date.now() - 160 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  
  // Elite Nails & Spa (salon4) services
  {
    id: 'service11',
    salon_id: 'salon4',
    name_en: 'Deluxe Gel Manicure',
    name_ar: 'مانيكير جل فاخر',
    description_en: 'Long-lasting gel manicure with premium polish, hand massage, and nail art options. Designed to last 2-3 weeks with no chipping.',
    description_ar: 'مانيكير جل طويل الأمد مع طلاء ممتاز وتدليك اليد وخيارات فن الأظافر. مصمم ليستمر من 2-3 أسابيع بدون تقشير.',
    price: 180,
    duration: 75,
    image_url: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&auto=format&fit=crop',
    is_featured: true,
    category: 'Nails',
    popular: true,
    discount: null,
    createdAt: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'service12',
    salon_id: 'salon4',
    name_en: 'Signature Pedicure',
    name_ar: 'باديكير مميز',
    description_en: 'Luxury pedicure treatment with exfoliation, callus removal, extended massage, hot stones, paraffin wax, and premium polish.',
    description_ar: 'علاج باديكير فاخر مع التقشير وإزالة الجلد الميت وتدليك ممتد وأحجار ساخنة وشمع البارافين وطلاء ممتاز.',
    price: 200,
    duration: 90,
    image_url: 'https://images.unsplash.com/photo-1519751138087-5bf79df62d5b?w=400&auto=format&fit=crop',
    is_featured: true,
    category: 'Nails',
    popular: true,
    discount: 5,
    createdAt: new Date(Date.now() - 140 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'service13',
    salon_id: 'salon4',
    name_en: 'Nail Art Design',
    name_ar: 'تصميم فن الأظافر',
    description_en: 'Custom nail art designs from simple to elaborate. Options include French tips, ombre, marble, glitter, rhinestones, and hand-painted designs.',
    description_ar: 'تصاميم فن الأظافر المخصصة من البسيطة إلى المعقدة. تشمل الخيارات الأطراف الفرنسية والأومبري والرخام والجليتر والأحجار وتصاميم مرسومة باليد.',
    price: 120,
    duration: 60,
    image_url: 'https://images.unsplash.com/photo-1607779097040-f68a475f9802?w=400&auto=format&fit=crop',
    is_featured: false,
    category: 'Nails',
    popular: true,
    discount: null,
    createdAt: new Date(Date.now() - 130 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  
  // The Gentleman's Barber (salon5) services
  {
    id: 'service14',
    salon_id: 'salon5',
    name_en: 'Traditional Hot Towel Shave',
    name_ar: 'حلاقة بالمناشف الساخنة التقليدية',
    description_en: 'Classic straight razor shave with hot towel preparation, pre-shave oil, premium shaving cream, aftershave balm, and facial massage.',
    description_ar: 'حلاقة كلاسيكية بالموس المستقيم مع تحضير المناشف الساخنة وزيت ما قبل الحلاقة وكريم حلاقة ممتاز وبلسم ما بعد الحلاقة وتدليك الوجه.',
    price: 120,
    duration: 45,
    image_url: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&auto=format&fit=crop',
    is_featured: true,
    category: 'Shaving',
    popular: true,
    discount: null,
    createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'service15',
    salon_id: 'salon5',
    name_en: 'Executive Grooming Package',
    name_ar: 'باقة العناية التنفيذية',
    description_en: 'Complete package for the distinguished gentleman, including haircut, hot towel shave, facial, eyebrow and ear/nose trim, and scalp massage.',
    description_ar: 'حزمة كاملة للرجل المميز، بما في ذلك قص الشعر والحلاقة بالمناشف الساخنة وتنظيف الوجه وتشذيب الحاجب والأذن/الأنف وتدليك فروة الرأس.',
    price: 300,
    duration: 120,
    image_url: 'https://images.unsplash.com/photo-1622296089863-eb7fc530daa8?w=400&auto=format&fit=crop',
    is_featured: true,
    category: 'Package',
    popular: true,
    discount: 10,
    createdAt: new Date(Date.now() - 110 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'service16',
    salon_id: 'salon5',
    name_en: 'Beard Trim & Styling',
    name_ar: 'تشذيب وتصفيف اللحية',
    description_en: 'Precision beard trim and styling with professional advice on beard care. Includes hot towel preparation and beard oils/balms.',
    description_ar: 'تشذيب وتصفيف اللحية بدقة مع نصائح احترافية حول العناية باللحية. يشمل تحضير المناشف الساخنة وزيوت/بلسم اللحية.',
    price: 90,
    duration: 30,
    image_url: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400&auto=format&fit=crop',
    is_featured: false,
    category: 'Shaving',
    popular: true,
    discount: null,
    createdAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Mock bookings
export const mockBookings = [
  // Current active bookings
  {
    id: 'booking1',
    user_id: 'user1',
    salon_id: 'salon1',
    service_id: 'service1',
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 days from now
    time: '10:00',
    duration: 75,
    status: 'confirmed',
    notes: 'First appointment, consultation needed for hair thinning concerns',
    payment_method: 'card',
    amount_paid: 220,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'booking2',
    user_id: 'user3',
    salon_id: 'salon2',
    service_id: 'service7',
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5 days from now
    time: '14:00',
    duration: 120,
    status: 'confirmed',
    notes: 'Wants blonde highlights, bringing reference photos',
    payment_method: null,
    amount_paid: 0,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'booking3',
    user_id: 'user4',
    salon_id: 'salon3',
    service_id: 'service9',
    date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 4 days from now
    time: '11:30',
    duration: 180,
    status: 'pending',
    notes: 'Mother-daughter birthday celebration, request for champagne service',
    payment_method: null,
    amount_paid: 0,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'booking4',
    user_id: 'user5',
    salon_id: 'salon5',
    service_id: 'service15',
    date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Tomorrow
    time: '16:00',
    duration: 120,
    status: 'confirmed',
    notes: 'Business meeting preparation, needs executive look',
    payment_method: 'cash',
    amount_paid: 300,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  
  // Today's bookings
  {
    id: 'booking5',
    user_id: 'user3',
    salon_id: 'salon4',
    service_id: 'service12',
    date: new Date().toISOString().split('T')[0], // Today
    time: '14:30',
    duration: 90,
    status: 'confirmed',
    notes: 'Allergic to certain nail polishes, prefers OPI brand',
    payment_method: 'card',
    amount_paid: 190, // With discount
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'booking6',
    user_id: 'user1',
    salon_id: 'salon3',
    service_id: 'service8',
    date: new Date().toISOString().split('T')[0], // Today
    time: '10:00',
    duration: 150,
    status: 'in_progress',
    notes: 'Family outing with husband and 2 children',
    payment_method: 'card',
    amount_paid: 600,
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  
  // Past completed bookings
  {
    id: 'booking7',
    user_id: 'user1',
    salon_id: 'salon1',
    service_id: 'service4',
    date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 14 days ago
    time: '15:00',
    duration: 120,
    status: 'completed',
    notes: 'Enjoyed the massage, requested same therapist for next time',
    payment_method: 'card',
    amount_paid: 297.50, // With discount
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'booking8',
    user_id: 'user4',
    salon_id: 'salon5',
    service_id: 'service14',
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days ago
    time: '11:00',
    duration: 45,
    status: 'completed',
    notes: 'First time for traditional shave, very satisfied',
    payment_method: 'cash',
    amount_paid: 120,
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'booking9',
    user_id: 'user3',
    salon_id: 'salon1',
    service_id: 'service5',
    date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 45 days ago
    time: '09:00',
    duration: 300,
    status: 'completed',
    notes: 'Wedding preparation, very happy with results',
    payment_method: 'card',
    amount_paid: 2500,
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
  },
  
  // Cancelled bookings
  {
    id: 'booking10',
    user_id: 'user5',
    salon_id: 'salon4',
    service_id: 'service11',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5 days ago
    time: '13:00',
    duration: 75,
    status: 'cancelled',
    notes: 'Client had to travel for business',
    payment_method: null,
    amount_paid: 0,
    cancellation_reason: 'client_emergency',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'booking11',
    user_id: 'user1',
    salon_id: 'salon2',
    service_id: 'service6',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days ago
    time: '17:30',
    duration: 45,
    status: 'cancelled',
    notes: 'Salon had to close early due to staff shortage',
    payment_method: null,
    amount_paid: 0,
    cancellation_reason: 'salon_issue',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  
  // No-show bookings
  {
    id: 'booking12',
    user_id: 'user4',
    salon_id: 'salon1',
    service_id: 'service2',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 days ago
    time: '12:00',
    duration: 60,
    status: 'no_show',
    notes: 'Client did not appear for appointment',
    payment_method: null,
    amount_paid: 0,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// Mock reviews
export const mockReviews = [
  // Completed bookings with reviews
  {
    id: 'review1',
    user_id: 'user1',
    salon_id: 'salon1',
    service_id: 'service4',
    booking_id: 'booking7',
    rating: 5,
    review_text: 'The massage was absolutely heavenly! The therapist was skilled and attentive to my problem areas. The ambiance was perfect with soft music and aromatherapy. I left feeling completely rejuvenated. Will definitely be back soon!',
    images: ['https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=400&auto=format&fit=crop'],
    createdAt: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'review2',
    user_id: 'user4',
    salon_id: 'salon5',
    service_id: 'service14',
    booking_id: 'booking8',
    rating: 4.5,
    review_text: 'First time getting a traditional hot towel shave and I was impressed! The barber was very professional and explained the process. The hot towels felt amazing and my skin was so smooth afterward. Only small complaint is that I had to wait about 10 minutes past my appointment time.',
    images: [],
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'review3',
    user_id: 'user3',
    salon_id: 'salon1',
    service_id: 'service5',
    booking_id: 'booking9',
    rating: 5,
    review_text: 'My bridal makeup and hair was absolutely perfect! The team was punctual, professional, and made me feel like a princess. My wedding photos turned out gorgeous thanks to their amazing work. I received so many compliments! The trial session was also very helpful in determining my final look.',
    images: [
      'https://images.unsplash.com/photo-1597225244660-1cd128c64284?w=400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&auto=format&fit=crop'
    ],
    createdAt: new Date(Date.now() - 44 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 44 * 24 * 60 * 60 * 1000).toISOString()
  },
  
  // Older reviews (not linked to bookings in mock data)
  {
    id: 'review4',
    user_id: 'user3',
    salon_id: 'salon2',
    service_id: 'service7',
    booking_id: null,
    rating: 3,
    review_text: 'The hair coloring was not exactly what I asked for - it came out darker than the reference photo I brought. The stylist was friendly but didn\'t seem to listen carefully to my requests. The salon environment was nice though, and they did offer to fix it when I complained.',
    images: [],
    createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'review5',
    user_id: 'user4',
    salon_id: 'salon3',
    service_id: 'service9',
    booking_id: null,
    rating: 5,
    review_text: 'Such a delightful mother-daughter day at the spa! The staff made us feel special, and the matching treatments were perfect. The private room was beautifully set up and we enjoyed the complimentary refreshments. A perfect bonding experience that we will cherish forever.',
    images: ['https://images.unsplash.com/photo-1607008829749-c0f284a49781?w=400&auto=format&fit=crop'],
    createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'review6',
    user_id: 'user5',
    salon_id: 'salon4',
    service_id: 'service11',
    booking_id: null,
    rating: 4,
    review_text: 'The gel manicure lasted nearly 3 weeks without any chips, which is impressive. The nail technician had great attention to detail and was very friendly. The salon is a bit small which makes it noisy at times, but the service quality makes up for it.',
    images: [],
    createdAt: new Date(Date.now() - 155 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 155 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'review7',
    user_id: 'user1',
    salon_id: 'salon5',
    service_id: 'service15',
    booking_id: null,
    rating: 5,
    review_text: 'The Executive Grooming Package was worth every dirham! I felt completely transformed after the haircut, shave, and facial. The attention to detail is remarkable, and the complimentary drink was a nice touch. The barber provided great conversation without being intrusive. Perfect for business professionals who need to look their best.',
    images: [],
    createdAt: new Date(Date.now() - 165 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 165 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'review8',
    user_id: 'user3',
    salon_id: 'salon1',
    service_id: 'service3',
    booking_id: null,
    rating: 4.5,
    review_text: 'The Signature Facial left my skin glowing for days! The esthetician analyzed my skin carefully before selecting the right products. The extraction was thorough but not painful, and the facial massage was so relaxing I nearly fell asleep. I\'ve already booked my next appointment.',
    images: [],
    createdAt: new Date(Date.now() - 210 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 210 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'review9',
    user_id: 'user5',
    salon_id: 'salon2',
    service_id: 'service6',
    booking_id: null,
    rating: 2,
    review_text: 'Disappointing experience. The haircut was rushed and uneven - I had to go to another salon to fix it. The stylist seemed distracted and kept taking phone calls during my appointment. The receptionist was apologetic but couldn\'t offer a solution. Would not recommend.',
    images: [],
    createdAt: new Date(Date.now() - 195 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 195 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'review10',
    user_id: 'user4',
    salon_id: 'salon4',
    service_id: 'service13',
    booking_id: null,
    rating: 5,
    review_text: 'The nail art design exceeded my expectations! The technician was a true artist and created exactly what I wanted based on my reference photos. The designs were intricate and perfectly executed. Everyone has been asking where I got my nails done. Absolutely worth the price!',
    images: ['https://images.unsplash.com/photo-1607779097040-f68a475f9802?w=400&auto=format&fit=crop'],
    createdAt: new Date(Date.now() - 225 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 225 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// Helper function to get mock user
export const getMockUser = (userId?: string) => {
  if (!userId) {
    return mockUsers[0]; // Default to first user
  }
  return mockUsers.find(user => user.id === userId) || mockUsers[0];
};

// Helper function to get mock salon
export const getMockSalon = (salonId?: string) => {
  if (!salonId) {
    return mockSalons[0]; // Default to first salon
  }
  return mockSalons.find(salon => salon.id === salonId) || mockSalons[0];
};

// Helper function to get mock service
export const getMockService = (serviceId?: string) => {
  if (!serviceId) {
    return mockServices[0]; // Default to first service
  }
  return mockServices.find(service => service.id === serviceId) || mockServices[0];
};

// Helper function to get mock booking
export const getMockBooking = (bookingId?: string) => {
  if (!bookingId) {
    return mockBookings[0]; // Default to first booking
  }
  return mockBookings.find(booking => booking.id === bookingId) || mockBookings[0];
};

// Helper function to get mock review
export const getMockReview = (reviewId?: string) => {
  if (!reviewId) {
    return mockReviews[0]; // Default to first review
  }
  return mockReviews.find(review => review.id === reviewId) || mockReviews[0];
};

// Helper function to get mock salon services
export const getMockSalonServices = (salonId: string) => {
  return mockServices.filter(service => service.salon_id === salonId);
};

// Helper function to get mock user bookings
export const getMockUserBookings = (userId: string) => {
  return mockBookings.filter(booking => booking.user_id === userId);
};

// Helper function to get mock salon bookings
export const getMockSalonBookings = (salonId: string) => {
  return mockBookings.filter(booking => booking.salon_id === salonId);
};
