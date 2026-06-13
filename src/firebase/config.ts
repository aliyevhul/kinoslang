import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDT-iEVcjlSs3oTpduwkJv9J0n5dDt3bk0",
  authDomain: "kinoslang-7de50.firebaseapp.com",
  projectId: "kinoslang-7de50",
  storageBucket: "kinoslang-7de50.firebasestorage.app",
  messagingSenderId: "430963442868",
  appId: "1:430963442868:web:a6a99ebf305ea35b9003e1"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
