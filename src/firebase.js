import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBI6Np5yagwQztJ6DJkRqQuH48SM1qTi8I",
  authDomain: "maresaka-88afd.firebaseapp.com",
  projectId: "maresaka-88afd",
  storageBucket: "maresaka-88afd.firebasestorage.app",
  messagingSenderId: "286219798509",
  appId: "1:286219798509:web:3063ba8699b5dbb44649e4"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
