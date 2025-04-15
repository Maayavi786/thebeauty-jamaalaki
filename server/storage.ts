import { 
  User, InsertUser, Salon, InsertSalon, Service, InsertService, 
  Booking, InsertBooking, Review, InsertReview 
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;

  // Salon operations
  getSalon(id: number): Promise<Salon | undefined>;
  getSalons(filters?: Partial<{
    isLadiesOnly: boolean;
    hasPrivateRooms: boolean;
    isHijabFriendly: boolean;
    city: string;
  }>): Promise<Salon[]>;
  createSalon(salon: InsertSalon): Promise<Salon>;
  updateSalon(id: number, salonData: Partial<Salon>): Promise<Salon | undefined>;
  getSalonsByOwner(ownerId: number): Promise<Salon[]>;

  // Service operations
  getService(id: number): Promise<Service | undefined>;
  getServicesBySalon(salonId: number): Promise<Service[]>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: number, serviceData: Partial<Service>): Promise<Service | undefined>;
  deleteService(id: number): Promise<boolean>;

  // Booking operations
  getBooking(id: number): Promise<Booking | undefined>;
  getBookingsByUser(userId: number): Promise<Booking[]>;
  getBookingsBySalon(salonId: number): Promise<Booking[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBookingStatus(id: number, status: Booking['status']): Promise<Booking | undefined>;

  // Review operations
  getReviewsByUser(userId: number): Promise<Review[]>;
  getReviewsBySalon(salonId: number): Promise<Review[]>;
  getAllReviews(): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private salons: Map<number, Salon>;
  private services: Map<number, Service>;
  private bookings: Map<number, Booking>;
  private reviews: Map<number, Review>;

  private userIdCounter: number;
  private salonIdCounter: number;
  private serviceIdCounter: number;
  private bookingIdCounter: number;
  private reviewIdCounter: number;

  constructor() {
    this.users = new Map();
    this.salons = new Map();
    this.services = new Map();
    this.bookings = new Map();
    this.reviews = new Map();

    this.userIdCounter = 1;
    this.salonIdCounter = 1;
    this.serviceIdCounter = 1;
    this.bookingIdCounter = 1;
    this.reviewIdCounter = 1;

    // Add admin user
    this.createUser({
      username: "admin",
      password: "admin123",
      email: "admin@glamhaven.com",
      fullName: "Admin",
      role: "admin",
      preferredLanguage: "en"
    });

    // Add some sample data
    this.initializeSampleData();
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async createUser(userData: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const createdAt = new Date();
    const user: User = { 
      ...userData, 
      id, 
      createdAt,
      loyaltyPoints: 0,
      phone: userData.phone ?? null,
      role: userData.role ?? 'customer',
      preferredLanguage: userData.preferredLanguage ?? 'en'
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;

    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Salon operations
  async getSalon(id: number): Promise<Salon | undefined> {
    return this.salons.get(id);
  }

  async getSalons(filters?: Partial<{
    isLadiesOnly: boolean;
    hasPrivateRooms: boolean;
    isHijabFriendly: boolean;
    city: string;
  }>): Promise<Salon[]> {
    let result = Array.from(this.salons.values());

    if (filters) {
      if (filters.isLadiesOnly !== undefined) {
        result = result.filter(salon => salon.isLadiesOnly === filters.isLadiesOnly);
      }

      if (filters.hasPrivateRooms !== undefined) {
        result = result.filter(salon => salon.hasPrivateRooms === filters.hasPrivateRooms);
      }

      if (filters.isHijabFriendly !== undefined) {
        result = result.filter(salon => salon.isHijabFriendly === filters.isHijabFriendly);
      }

      if (filters.city) {
        result = result.filter(salon => 
          salon.city.toLowerCase().includes(filters.city!.toLowerCase())
        );
      }
    }

    return result;
  }

  async createSalon(salonData: InsertSalon): Promise<Salon> {
    const id = this.salonIdCounter++;
    const createdAt = new Date();
    const salon: Salon = { 
      ...salonData, 
      id, 
      createdAt, 
      rating: 0,
      email: salonData.email ?? null,
      imageUrl: salonData.imageUrl ?? null,
      descriptionEn: salonData.descriptionEn ?? null,
      descriptionAr: salonData.descriptionAr ?? null,
      priceRange: salonData.priceRange ?? null,
      isVerified: false,
      isLadiesOnly: salonData.isLadiesOnly ?? true,
      hasPrivateRooms: salonData.hasPrivateRooms ?? false,
      isHijabFriendly: salonData.isHijabFriendly ?? false
    };
    this.salons.set(id, salon);
    return salon;
  }

  async updateSalon(id: number, salonData: Partial<Salon>): Promise<Salon | undefined> {
    const salon = await this.getSalon(id);
    if (!salon) return undefined;

    const updatedSalon = { ...salon, ...salonData };
    this.salons.set(id, updatedSalon);
    return updatedSalon;
  }

  async getSalonsByOwner(ownerId: number): Promise<Salon[]> {
    return Array.from(this.salons.values()).filter(
      salon => salon.ownerId === ownerId
    );
  }

  // Service operations
  async getService(id: number): Promise<Service | undefined> {
    return this.services.get(id);
  }

  async getServicesBySalon(salonId: number): Promise<Service[]> {
    return Array.from(this.services.values()).filter(
      service => service.salonId === salonId
    );
  }

  async createService(serviceData: InsertService): Promise<Service> {
    const id = this.serviceIdCounter++;
    const service: Service = { 
      ...serviceData, 
      id,
      descriptionEn: serviceData.descriptionEn ?? null,
      descriptionAr: serviceData.descriptionAr ?? null,
      imageUrl: serviceData.imageUrl ?? null
    };
    this.services.set(id, service);
    return service;
  }

  async updateService(id: number, serviceData: Partial<Service>): Promise<Service | undefined> {
    const service = await this.getService(id);
    if (!service) return undefined;

    const updatedService = { ...service, ...serviceData };
    this.services.set(id, updatedService);
    return updatedService;
  }

  async deleteService(id: number): Promise<boolean> {
    return this.services.delete(id);
  }

  // Booking operations
  async getBooking(id: number): Promise<Booking | undefined> {
    return this.bookings.get(id);
  }

  async getBookingsByUser(userId: number): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(
      booking => booking.userId === userId
    );
  }

  async getBookingsBySalon(salonId: number): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(
      booking => booking.salonId === salonId
    );
  }

  async createBooking(bookingData: InsertBooking): Promise<Booking> {
    const id = this.bookingIdCounter++;
    const createdAt = new Date();
    const points = Math.floor(bookingData.serviceId % 10) * 10; // Mock points calculation

    const booking: Booking = { 
      ...bookingData, 
      id, 
      createdAt, 
      status: bookingData.status ?? 'pending',
      notes: bookingData.notes ?? null,
      pointsEarned: points
    };
    this.bookings.set(id, booking);

    // Update user loyalty points
    const user = await this.getUser(bookingData.userId);
    if (user) {
      await this.updateUser(user.id, { 
        loyaltyPoints: user.loyaltyPoints + points
      });
    }

    return booking;
  }

  async updateBookingStatus(id: number, status: Booking['status']): Promise<Booking | undefined> {
    const booking = await this.getBooking(id);
    if (!booking) return undefined;

    const updatedBooking = { ...booking, status };
    this.bookings.set(id, updatedBooking);
    return updatedBooking;
  }

  // Review operations
  async getReviewsByUser(userId: number): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(
      review => review.userId === userId
    );
  }

  async getReviewsBySalon(salonId: number): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(
      review => review.salonId === salonId
    );
  }

  async createReview(reviewData: InsertReview): Promise<Review> {
    const id = this.reviewIdCounter++;
    const createdAt = new Date();
    const review: Review = { 
      ...reviewData, 
      id, 
      createdAt,
      comment: reviewData.comment ?? null
    };
    this.reviews.set(id, review);

    // Update salon rating
    const salonReviews = await this.getReviewsBySalon(reviewData.salonId);
    if (salonReviews.length > 0) {
      const totalRating = salonReviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = Math.round(totalRating / salonReviews.length);

      const salon = await this.getSalon(reviewData.salonId);
      if (salon) {
        await this.updateSalon(salon.id, { rating: averageRating });
      }
    }

    return review;
  }

  async getAllReviews(): Promise<Review[]> {
    return Array.from(this.reviews.values());
  }

  // Initialize sample data
  private async initializeSampleData() {
    // Create salon owner
    const owner = await this.createUser({
      username: "salonowner",
      password: "owner123",
      email: "owner@glamhaven.com",
      fullName: "Salon Owner",
      role: "salon_owner",
      preferredLanguage: "en"
    });

    // Create customer
    const customer = await this.createUser({
      username: "customer",
      password: "customer123",
      email: "customer@example.com",
      fullName: "Sarah Abdullah",
      role: "customer",
      preferredLanguage: "en"
    });

    // Create salons
    const salon1 = await this.createSalon({
      ownerId: owner.id,
      nameEn: "Elegance Spa & Beauty",
      nameAr: "إليجانس سبا آند بيوتي",
      descriptionEn: "Luxury spa and beauty services in the heart of Al Ahsa",
      descriptionAr: "خدمات سبا وتجميل فاخرة في قلب الأحساء",
      address: "King Fahd Road",
      city: "Al Ahsa",
      phone: "+966123456789",
      email: "info@elegancespa.com",
      imageUrl: "https://images.unsplash.com/photo-1560066984-138dadb4c035",
      isLadiesOnly: true,
      hasPrivateRooms: true,
      isHijabFriendly: true,
      priceRange: "250-800 SAR"
    });

    const salon2 = await this.createSalon({
      ownerId: owner.id,
      nameEn: "Royal Beauty Lounge",
      nameAr: "رويال بيوتي لاونج",
      descriptionEn: "Premium beauty services with a royal touch in Al Ahsa",
      descriptionAr: "خدمات تجميل متميزة بلمسة ملكية في الأحساء",
      address: "Prince Sultan Road",
      city: "Al Ahsa",
      phone: "+966123456788",
      email: "info@royalbeauty.com",
      imageUrl: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9",
      isLadiesOnly: true,
      hasPrivateRooms: false,
      isHijabFriendly: true,
      priceRange: "180-500 SAR"
    });

    const salon3 = await this.createSalon({
      ownerId: owner.id,
      nameEn: "Serenity Beauty Center",
      nameAr: "سيرينتي بيوتي سنتر",
      descriptionEn: "Relax and rejuvenate with our premium services in Al Ahsa",
      descriptionAr: "استرخي وجددي شبابك مع خدماتنا المتميزة في الأحساء",
      address: "Tahlia Street",
      city: "Al Ahsa",
      phone: "+966123456787",
      email: "info@serenitybeauty.com",
      imageUrl: "https://images.unsplash.com/photo-1560750588-73207b1ef5b8",
      isLadiesOnly: true,
      hasPrivateRooms: true,
      isHijabFriendly: true,
      priceRange: "200-600 SAR"
    });

    const salon4 = await this.createSalon({
      ownerId: owner.id,
      nameEn: "Glamour & Grace",
      nameAr: "جلامور وجريس",
      descriptionEn: "Experience luxury beauty treatments in Al Ahsa",
      descriptionAr: "اختبري علاجات التجميل الفاخرة في الأحساء",
      address: "Al Khalidiyah",
      city: "Al Ahsa",
      phone: "+966123456786",
      email: "info@glamourgrace.com",
      imageUrl: "https://images.unsplash.com/photo-1600948836101-f9ffda59d250",
      isLadiesOnly: true,
      hasPrivateRooms: true,
      isHijabFriendly: true,
      priceRange: "150-450 SAR"
    });

    const salon5 = await this.createSalon({
      ownerId: owner.id,
      nameEn: "Elite Beauty Lounge",
      nameAr: "إيليت بيوتي لاونج",
      descriptionEn: "Exclusive beauty services in the heart of Al Ahsa",
      descriptionAr: "خدمات تجميل حصرية في قلب الأحساء",
      address: "Al Hofuf",
      city: "Al Ahsa",
      phone: "+966123456785",
      email: "info@elitebeauty.com",
      imageUrl: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9",
      isLadiesOnly: true,
      hasPrivateRooms: true,
      isHijabFriendly: true,
      priceRange: "300-800 SAR"
    });

    // Create services for each salon

    // Salon 1 services
    await this.createService({
      salonId: salon1.id,
      nameEn: "Luxury Facial",
      nameAr: "فيشل فاخر",
      descriptionEn: "Comprehensive facial treatment with premium products",
      descriptionAr: "علاج شامل للوجه بمنتجات فاخرة",
      duration: 60,
      price: 350,
      category: "Facial",
      imageUrl: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=800&q=80"
    });

    await this.createService({
      salonId: salon1.id,
      nameEn: "Hair Styling",
      nameAr: "تصفيف الشعر",
      descriptionEn: "Expert hair styling for any occasion",
      descriptionAr: "تصفيف شعر احترافي لأي مناسبة",
      duration: 45,
      price: 250,
      category: "Hair",
      imageUrl: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=800&q=80"
    });

    // Salon 2 services
    await this.createService({
      salonId: salon2.id,
      nameEn: "Manicure & Pedicure",
      nameAr: "مانيكير وباديكير",
      descriptionEn: "Complete nail care for hands and feet",
      descriptionAr: "عناية كاملة بالأظافر لليدين والقدمين",
      duration: 90,
      price: 180,
      category: "Nails",
      imageUrl: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=800&q=80"
    });

    await this.createService({
      salonId: salon2.id,
      nameEn: "Makeup Application",
      nameAr: "تطبيق المكياج",
      descriptionEn: "Professional makeup for special occasions",
      descriptionAr: "مكياج احترافي للمناسبات الخاصة",
      duration: 60,
      price: 300,
      category: "Makeup",
      imageUrl: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=800&q=80"
    });

    // Salon 3 services
    await this.createService({
      salonId: salon3.id,
      nameEn: "Relaxing Massage",
      nameAr: "مساج استرخاء",
      descriptionEn: "Full body massage to relieve stress",
      descriptionAr: "مساج كامل للجسم لتخفيف التوتر",
      duration: 60,
      price: 280,
      category: "Massage",
      imageUrl: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=800&q=80"
    });

    await this.createService({
      salonId: salon3.id,
      nameEn: "Hair Coloring",
      nameAr: "صبغ الشعر",
      descriptionEn: "Professional hair coloring service",
      descriptionAr: "خدمة صبغ شعر احترافية",
      duration: 120,
      price: 400,
      category: "Hair",
      imageUrl: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=800&q=80"
    });

    // Create reviews
    await this.createReview({
      userId: customer.id,
      salonId: salon1.id,
      rating: 5,
      comment: "Excellent service, very comfortable environment!"
    });

    await this.createReview({
      userId: customer.id,
      salonId: salon2.id,
      rating: 4,
      comment: "Great service and friendly staff"
    });
  }
}

// Import the DatabaseStorage
import { DatabaseStorage } from './storage.db';

// Export an instance of DatabaseStorage instead of MemStorage
export const storage = new DatabaseStorage();