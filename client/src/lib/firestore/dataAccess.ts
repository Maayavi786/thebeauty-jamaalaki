import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  Timestamp, 
  DocumentData,
  WhereFilterOp,
  QueryConstraint
} from 'firebase/firestore';
import { db } from '../firebase';
import { COLLECTIONS } from './schema';
import type { 
  UserData, 
  SalonData, 
  ServiceData, 
  BookingData, 
  ReviewData, 
  PromotionData 
} from './schema';

// Generic function to get a document by its ID
export const getDocumentById = async <T>(collectionName: string, docId: string): Promise<T | null> => {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as T;
    } else {
      console.log(`No document found with ID: ${docId} in collection: ${collectionName}`);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching document ${docId} from ${collectionName}:`, error);
    throw error;
  }
};

// Generic function to query documents with filters
export const queryDocuments = async <T>(
  collectionName: string,
  conditions: Array<{
    field: string;
    operator: WhereFilterOp;
    value: any;
  }> = [],
  orderByField?: string,
  orderDirection?: 'asc' | 'desc',
  limitCount?: number
): Promise<T[]> => {
  try {
    const collectionRef = collection(db, collectionName);
    
    const constraints: QueryConstraint[] = [];
    
    // Add where conditions
    conditions.forEach(condition => {
      constraints.push(where(condition.field, condition.operator, condition.value));
    });
    
    // Add ordering if specified
    if (orderByField) {
      constraints.push(orderBy(orderByField, orderDirection || 'asc'));
    }
    
    // Add limit if specified
    if (limitCount) {
      constraints.push(limit(limitCount));
    }
    
    const q = query(collectionRef, ...constraints);
    const querySnapshot = await getDocs(q);
    
    const results: T[] = [];
    querySnapshot.forEach((doc) => {
      results.push({ id: doc.id, ...doc.data() } as T);
    });
    
    return results;
  } catch (error) {
    console.error(`Error querying documents from ${collectionName}:`, error);
    throw error;
  }
};

// Generic function to create a document
export const createDocument = async <T extends DocumentData>(
  collectionName: string, 
  data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>
): Promise<T> => {
  try {
    const timestamp = new Date().toISOString();
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: timestamp,
      updatedAt: timestamp
    });
    
    return {
      id: docRef.id,
      ...data,
      createdAt: timestamp,
      updatedAt: timestamp
    } as T;
  } catch (error) {
    console.error(`Error creating document in ${collectionName}:`, error);
    throw error;
  }
};

// Generic function to update a document
export const updateDocument = async <T>(
  collectionName: string, 
  docId: string, 
  data: Partial<T>
): Promise<void> => {
  try {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error(`Error updating document ${docId} in ${collectionName}:`, error);
    throw error;
  }
};

// Generic function to delete a document
export const deleteDocument = async (
  collectionName: string, 
  docId: string
): Promise<void> => {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Error deleting document ${docId} from ${collectionName}:`, error);
    throw error;
  }
};

// User-specific functions
export const getUserById = (userId: string): Promise<UserData | null> => {
  return getDocumentById<UserData>(COLLECTIONS.USERS, userId);
};

export const getUserByEmail = async (email: string): Promise<UserData | null> => {
  const users = await queryDocuments<UserData>(COLLECTIONS.USERS, [
    { field: 'email', operator: '==', value: email }
  ]);
  return users.length > 0 ? users[0] : null;
};

// Salon-specific functions
export const getSalonById = (salonId: string): Promise<SalonData | null> => {
  return getDocumentById<SalonData>(COLLECTIONS.SALONS, salonId);
};

export const getSalonByOwnerId = async (ownerId: string): Promise<SalonData | null> => {
  const salons = await queryDocuments<SalonData>(COLLECTIONS.SALONS, [
    { field: 'owner_id', operator: '==', value: ownerId }
  ]);
  return salons.length > 0 ? salons[0] : null;
};

export const getFeaturedSalons = (count: number = 6): Promise<SalonData[]> => {
  return queryDocuments<SalonData>(
    COLLECTIONS.SALONS,
    [{ field: 'is_featured', operator: '==', value: true }],
    'rating',
    'desc',
    count
  );
};

export const getSalonsByFilter = (
  filters: {
    search?: string;
    ladies_only?: boolean;
    private_rooms?: boolean;
    rating?: number;
  }
): Promise<SalonData[]> => {
  const conditions: Array<{field: string; operator: WhereFilterOp; value: any}> = [];
  
  if (filters.ladies_only) {
    conditions.push({ field: 'ladies_only', operator: '==', value: true });
  }
  
  if (filters.private_rooms) {
    conditions.push({ field: 'private_rooms', operator: '==', value: true });
  }
  
  if (filters.rating) {
    conditions.push({ field: 'rating', operator: '>=', value: filters.rating });
  }
  
  // Note: Firestore doesn't support text search natively
  // For a real app, you'd use a service like Algolia or implement your own text search
  
  return queryDocuments<SalonData>(
    COLLECTIONS.SALONS,
    conditions,
    'rating',
    'desc'
  );
};

// Service-specific functions
export const getServiceById = (serviceId: string): Promise<ServiceData | null> => {
  return getDocumentById<ServiceData>(COLLECTIONS.SERVICES, serviceId);
};

export const getServicesBySalonId = (salonId: string): Promise<ServiceData[]> => {
  return queryDocuments<ServiceData>(
    COLLECTIONS.SERVICES,
    [{ field: 'salon_id', operator: '==', value: salonId }],
    'category',
    'asc'
  );
};

export const getFeaturedServices = (count: number = 6): Promise<ServiceData[]> => {
  return queryDocuments<ServiceData>(
    COLLECTIONS.SERVICES,
    [{ field: 'is_featured', operator: '==', value: true }],
    'price',
    'asc',
    count
  );
};

// Booking-specific functions
export const getBookingById = (bookingId: string): Promise<BookingData | null> => {
  return getDocumentById<BookingData>(COLLECTIONS.BOOKINGS, bookingId);
};

export const getBookingsByUserId = (userId: string): Promise<BookingData[]> => {
  return queryDocuments<BookingData>(
    COLLECTIONS.BOOKINGS,
    [{ field: 'user_id', operator: '==', value: userId }],
    'date',
    'desc'
  );
};

export const getBookingsBySalonId = (salonId: string): Promise<BookingData[]> => {
  return queryDocuments<BookingData>(
    COLLECTIONS.BOOKINGS,
    [{ field: 'salon_id', operator: '==', value: salonId }],
    'date',
    'desc'
  );
};

export const getRecentBookingsBySalonId = (
  salonId: string, 
  count: number = 5
): Promise<BookingData[]> => {
  return queryDocuments<BookingData>(
    COLLECTIONS.BOOKINGS,
    [{ field: 'salon_id', operator: '==', value: salonId }],
    'createdAt',
    'desc',
    count
  );
};

// Review-specific functions
export const getReviewById = (reviewId: string): Promise<ReviewData | null> => {
  return getDocumentById<ReviewData>(COLLECTIONS.REVIEWS, reviewId);
};

export const getReviewsBySalonId = (salonId: string): Promise<ReviewData[]> => {
  return queryDocuments<ReviewData>(
    COLLECTIONS.REVIEWS,
    [{ field: 'salon_id', operator: '==', value: salonId }],
    'createdAt',
    'desc'
  );
};

export const getReviewsByUserId = (userId: string): Promise<ReviewData[]> => {
  return queryDocuments<ReviewData>(
    COLLECTIONS.REVIEWS,
    [{ field: 'user_id', operator: '==', value: userId }],
    'createdAt',
    'desc'
  );
};

// Promotion-specific functions
export const getPromotionById = (promotionId: string): Promise<PromotionData | null> => {
  return getDocumentById<PromotionData>(COLLECTIONS.PROMOTIONS, promotionId);
};

export const getPromotionsBySalonId = (salonId: string): Promise<PromotionData[]> => {
  const now = new Date().toISOString();
  return queryDocuments<PromotionData>(
    COLLECTIONS.PROMOTIONS,
    [
      { field: 'salon_id', operator: '==', value: salonId },
      { field: 'is_active', operator: '==', value: true },
      { field: 'valid_from', operator: '<=', value: now },
      { field: 'valid_until', operator: '>=', value: now }
    ],
    'valid_until',
    'asc'
  );
};

export const getActivePromotions = (count: number = 10): Promise<PromotionData[]> => {
  const now = new Date().toISOString();
  return queryDocuments<PromotionData>(
    COLLECTIONS.PROMOTIONS,
    [
      { field: 'is_active', operator: '==', value: true },
      { field: 'valid_from', operator: '<=', value: now },
      { field: 'valid_until', operator: '>=', value: now }
    ],
    'valid_until',
    'asc',
    count
  );
};
