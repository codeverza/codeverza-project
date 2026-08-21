import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDnaj4zvgHlRab0yeUhuBRRyR271JQeuBM",
  authDomain: "codeverza-proj.firebaseapp.com",
  projectId: "codeverza-proj",
  storageBucket: "codeverza-proj.firebasestorage.app",
  messagingSenderId: "910383748862",
  appId: "1:910383748862:web:436a8cb0b04340171df7af",
  measurementId: "G-66V7W6B5YB"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);