import { useState, useEffect } from 'react';
import { 
  signInWithPopup, 
  signInWithRedirect,
  GoogleAuthProvider, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { auth } from '../firebase';
import { UserProfile } from '../types/index';
import { useServices } from '../services/ServiceContext';

interface UseAuthResolverProps {
  onProfileSynced: (profile: UserProfile | null) => void;
}

export function useAuthResolver({ onProfileSynced }: UseAuthResolverProps) {
  const { userService } = useServices();
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await syncUserProfile(user);
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const syncUserProfile = async (firebaseUser: FirebaseUser) => {
    setLoading(true);
    setError(null);
    try {
      const profile = await userService.getUser(firebaseUser.uid);
      
      if (profile) {
        onProfileSynced(profile);
        setLoading(false);
      } else {
        // User profile doesn't exist, trigger onboarding phase
        setShowOnboarding(true);
        setLoading(false);
      }
    } catch (err) {
      console.error("Error fetching user profile from database: ", err);
      // Fallback: register via onboarding
      setShowOnboarding(true);
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    const provider = new GoogleAuthProvider();
    
    // Check if the user is on a mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    try {
      if (isMobile) {
        await signInWithRedirect(auth, provider);
      } else {
        await signInWithPopup(auth, provider);
      }
    } catch (err: any) {
      console.error("Google Sign-In failed or was blocked: ", err);
      setError("Gagal masuk dengan Google atau pendaftaran dibatalkan. Pastikan pop-up diperbolehkan di peramban Anda.");
      setLoading(false);
    }
  };

  return {
    currentUser,
    loading,
    error,
    setError,
    showOnboarding,
    handleGoogleSignIn,
  };
}
