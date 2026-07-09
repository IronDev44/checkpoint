import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBwoejy_sOGbJdCzmGkhy4cN_layGgEEbE",
  authDomain: "game-tracker-a1e22.firebaseapp.com",
  projectId: "game-tracker-a1e22",
  storageBucket: "game-tracker-a1e22.firebasestorage.app",
  messagingSenderId: "505476517552",
  appId: "1:505476517552:web:62fc3252896299e0ac3575",
  measurementId: "G-9JLDVDZGL8"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);