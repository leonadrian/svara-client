import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../firebase-applet-config.json';

const currentHostname = typeof window !== 'undefined' ? window.location.hostname : '';
const dynamicConfig = {
  ...firebaseConfig,
  authDomain: (currentHostname && currentHostname !== 'localhost' && !currentHostname.startsWith('127.0.0.') && !currentHostname.startsWith('192.168.'))
    ? currentHostname
    : firebaseConfig.authDomain
};

const app = initializeApp(dynamicConfig);
export const auth = getAuth(app);
export const storage = getStorage(app);
