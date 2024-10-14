
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDClcTWA8IhBiNMtBxJLEazzrAhKHteoms",
  authDomain: "workout-fd0b7.firebaseapp.com",
  projectId: "workout-fd0b7",
  storageBucket: "workout-fd0b7.appspot.com",
  messagingSenderId: "45817112182",
  appId: "1:45817112182:web:3f23d2039fcb6507c6e157",
  measurementId: "G-XDY0YKB2Z9"
};

// Inicializamos la app de Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);  // Asegúrate de inicializar Firebase Auth
const db = getFirestore(app);

export { auth, db };