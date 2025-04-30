import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
  getIdTokenResult,
  GoogleAuthProvider,
  signInWithPopup,
  updateEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { sendWelcomeEmail, setUserRole, updateUserProfile as updateProfileViaFunction } from '@/lib/firebase/netlifyFunctions';
import { useToast } from "@/hooks/use-toast";

interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: 'customer' | 'salon_owner';
  isEmailVerified: boolean;
  customClaims?: {
    role?: string;
    [key: string]: any;
  };
}

interface FirebaseAuthContextType {
  user: UserData | null;
  userLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  register: (userData: {
    email: string;
    password: string;
    fullName: string;
    role: 'customer' | 'salon_owner';
    phone?: string;
    preferredLanguage?: 'en' | 'ar';
  }) => Promise<boolean>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
  updateUserProfile: (profileData: {
    fullName?: string;
    email?: string;
    phone?: string;
    photoURL?: string;
  }) => Promise<boolean>;
  isAuthenticated: boolean;
}

const FirebaseAuthContext = createContext<FirebaseAuthContextType | undefined>(undefined);

export const useFirebaseAuth = (): FirebaseAuthContextType => {
  const context = useContext(FirebaseAuthContext);
  if (!context) {
    throw new Error('useFirebaseAuth must be used within a FirebaseAuthProvider');
  }
  return context;
};

interface FirebaseAuthProviderProps {
  children: ReactNode;
}

export const FirebaseAuthProvider: React.FC<FirebaseAuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const { toast } = useToast();

  // Fetch additional user data from Firestore
  const fetchUserData = async (firebaseUser: FirebaseUser): Promise<UserData> => {
    // Get custom claims from token
    const tokenResult = await getIdTokenResult(firebaseUser);
    
    // Get additional user data from Firestore
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const userDoc = await getDoc(userDocRef);
    const userData = userDoc.data();
    
    // Combine Firebase user with Firestore data
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
      isEmailVerified: firebaseUser.emailVerified,
      role: (userData?.role || tokenResult.claims.role || 'customer') as 'customer' | 'salon_owner',
      customClaims: tokenResult.claims
    };
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        setUserLoading(true);
        if (firebaseUser) {
          // User is signed in
          const userData = await fetchUserData(firebaseUser);
          setUser(userData);
        } else {
          // User is signed out
          setUser(null);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setUser(null);
      } finally {
        setUserLoading(false);
      }
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  // Register new user
  const register = async (userData: {
    email: string;
    password: string;
    fullName: string;
    role: 'customer' | 'salon_owner';
    phone?: string;
    preferredLanguage?: 'en' | 'ar';
  }): Promise<boolean> => {
    try {
      setUserLoading(true);
      
      // Create Firebase auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        userData.email, 
        userData.password
      );
      
      // Update profile with display name
      await updateProfile(userCredential.user, {
        displayName: userData.fullName
      });
      
      // Send email verification
      await sendEmailVerification(userCredential.user);
      
      // Store additional user data in Firestore
      const userDocRef = doc(db, 'users', userCredential.user.uid);
      await setDoc(userDocRef, {
        email: userData.email,
        fullName: userData.fullName,
        role: userData.role,
        phone: userData.phone || '',
        preferredLanguage: userData.preferredLanguage || 'en',
        createdAt: new Date().toISOString(),
        // Additional fields can be added here
      });
      
      // Create a default salon for salon owners
      if (userData.role === 'salon_owner') {
        const salonDocRef = doc(db, 'salons', `salon_${userCredential.user.uid}`);
        await setDoc(salonDocRef, {
          owner_id: userCredential.user.uid,
          name_en: `${userData.fullName}'s Salon`,
          name_ar: `صالون ${userData.fullName}`,
          description_en: 'My salon description',
          description_ar: 'وصف صالوني',
          address: '',
          phone: userData.phone || '',
          email: userData.email,
          image_url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&auto=format&fit=crop',
          rating: 4.5,
          is_featured: true,
          ladies_only: false,
          private_rooms: false,
          business_hours: {
            monday: { open: '09:00', close: '18:00' },
            tuesday: { open: '09:00', close: '18:00' },
            wednesday: { open: '09:00', close: '18:00' },
            thursday: { open: '09:00', close: '18:00' },
            friday: { open: '09:00', close: '18:00' },
            saturday: { open: '10:00', close: '16:00' },
            sunday: { open: '10:00', close: '16:00' },
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
      
      // Set user role in Firebase Auth using Netlify Function (instead of direct Cloud Function)
      try {
        await setUserRole(userCredential.user.uid, userData.role);
      } catch (roleError) {
        console.error('Error setting user role:', roleError);
        // Continue despite role setting error - this isn't critical
      }
      
      // Send welcome email using Netlify Function (instead of direct Cloud Function)
      try {
        await sendWelcomeEmail(userCredential.user.uid);
      } catch (emailError) {
        console.error('Error sending welcome email:', emailError);
        // Continue despite email error - this isn't critical
      }
      
      toast({
        title: "Registration successful",
        description: "Please check your email to verify your account",
      });
      
      return true;
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: "Registration failed",
        description: error.message || "An error occurred during registration",
        variant: "destructive"
      });
      return false;
    } finally {
      setUserLoading(false);
    }
  };

  // Login
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setUserLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
      return true;
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "Login failed",
        description: error.message || "Invalid email or password",
        variant: "destructive"
      });
      return false;
    } finally {
      setUserLoading(false);
    }
  };

  // Logout
  const logout = async (): Promise<void> => {
    try {
      setUserLoading(true);
      await signOut(auth);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
    } catch (error: any) {
      console.error('Logout error:', error);
      toast({
        title: "Logout failed",
        description: error.message || "An error occurred during logout",
        variant: "destructive"
      });
    } finally {
      setUserLoading(false);
    }
  };

  // Reset password
  const resetPassword = async (email: string): Promise<boolean> => {
    try {
      await sendPasswordResetEmail(auth, email);
      toast({
        title: "Reset email sent",
        description: "Check your email for password reset instructions",
      });
      return true;
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast({
        title: "Reset failed",
        description: error.message || "Failed to send password reset email",
        variant: "destructive"
      });
      return false;
    }
  };

  // Google Sign-In
  const loginWithGoogle = async (): Promise<boolean> => {
    try {
      setUserLoading(true);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;
      
      // Check if user already exists in Firestore
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        // New user - create user document
        await setDoc(userDocRef, {
          email: firebaseUser.email,
          fullName: firebaseUser.displayName || '',
          role: 'customer', // Default role for Google sign-in users
          photoURL: firebaseUser.photoURL,
          createdAt: new Date().toISOString(),
        });
        
        toast({
          title: "Account created",
          description: "Welcome to Jamaalaki!",
        });
      } else {
        toast({
          title: "Login successful",
          description: "Welcome back!",
        });
      }
      
      return true;
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      toast({
        title: "Login failed",
        description: error.message || "An error occurred during Google sign-in",
        variant: "destructive"
      });
      return false;
    } finally {
      setUserLoading(false);
    }
  };
  
  // Update user profile
  const updateUserProfile = async (profileData: {
    fullName?: string;
    email?: string;
    phone?: string;
    photoURL?: string;
  }): Promise<boolean> => {
    try {
      setUserLoading(true);
      const currentFirebaseUser = auth.currentUser;
      
      if (!currentFirebaseUser) {
        throw new Error('No authenticated user');
      }
      
      // Update Firebase Auth profile
      const authUpdates: { displayName?: string; photoURL?: string; } = {};
      
      if (profileData.fullName) {
        authUpdates.displayName = profileData.fullName;
      }
      
      if (profileData.photoURL) {
        authUpdates.photoURL = profileData.photoURL;
      }
      
      if (Object.keys(authUpdates).length > 0) {
        await updateProfile(currentFirebaseUser, authUpdates);
      }
      
      // Update email if provided
      if (profileData.email && profileData.email !== currentFirebaseUser.email) {
        await updateEmail(currentFirebaseUser, profileData.email);
      }
      
      // Update Firestore user document
      const userDocRef = doc(db, 'users', currentFirebaseUser.uid);
      const updates: { [key: string]: any } = {
        updatedAt: new Date().toISOString()
      };
      
      if (profileData.fullName) {
        updates.fullName = profileData.fullName;
      }
      
      if (profileData.email) {
        updates.email = profileData.email;
      }
      
      if (profileData.phone) {
        updates.phone = profileData.phone;
      }
      
      if (profileData.photoURL) {
        updates.photoURL = profileData.photoURL;
      }
      
      await setDoc(userDocRef, updates, { merge: true });
      
      // Use Netlify Function to update custom claims/roles if needed
      try {
        if (profileData.fullName || profileData.photoURL) {
          await updateProfileViaFunction({
            fullName: profileData.fullName,
            photoURL: profileData.photoURL
          });
        }
      } catch (functionError) {
        console.warn('Error updating profile via function, but profile was updated locally:', functionError);
        // Continue despite function error - the local update was successful
      }
      
      // Refresh user data
      const userData = await fetchUserData(currentFirebaseUser);
      setUser(userData);
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
      
      return true;
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast({
        title: "Update failed",
        description: error.message || "An error occurred while updating your profile",
        variant: "destructive"
      });
      return false;
    } finally {
      setUserLoading(false);
    }
  };
  
  return (
    <FirebaseAuthContext.Provider value={{
      user,
      userLoading,
      login,
      loginWithGoogle,
      register,
      logout,
      resetPassword,
      updateUserProfile,
      isAuthenticated: !!user
    }}>
      {children}
    </FirebaseAuthContext.Provider>
  );
};
