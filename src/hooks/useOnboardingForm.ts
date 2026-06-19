import { useState, useEffect, FormEvent, useRef } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { UserProfile } from '../types/index';
import { useServices } from '../services/ServiceContext';

interface UseOnboardingFormProps {
  currentUser: FirebaseUser | null;
  onProfileSynced: (profile: UserProfile | null) => void;
  onError: (message: string | null) => void;
  initialName?: string;
}

export function useOnboardingForm({
  currentUser,
  onProfileSynced,
  onError,
  initialName = ''
}: UseOnboardingFormProps) {
  const { userService } = useServices();
  const [name, setName] = useState(initialName);
  const [submitting, setSubmitting] = useState(false);

  // Lacak UID terakhir yang telah di-auto-fill dengan useRef untuk mencegah re-render & duplicate effect triggers
  const lastFilledUidRef = useRef<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      if (currentUser.uid !== lastFilledUidRef.current) {
        if (currentUser.displayName) {
          setName(currentUser.displayName);
        }
        lastFilledUidRef.current = currentUser.uid;
      }
    } else {
      lastFilledUidRef.current = null;
    }
  }, [currentUser]);

  const handleOnboardingSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onError("Sesi pengguna tidak valid.");
      return;
    }
    if (!name.trim()) {
      onError("Nama lengkap tidak boleh kosong.");
      return;
    }

    setSubmitting(true);
    onError(null);

    try {
      const newProfile = await userService.registerPendingUser(
        currentUser.uid,
        name.trim(),
        currentUser.email || ''
      );
      onProfileSynced(newProfile);
    } catch (err: any) {
      console.error("Storage of profile failed: ", err);
      onError("Gagal menyimpan profil di database Svara. Info: " + err.message);
      setSubmitting(false);
    }
  };

  return {
    name,
    setName,
    submitting,
    handleOnboardingSubmit
  };
}
