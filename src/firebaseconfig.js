// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // Optional for saving extra user info

const firebaseConfig = {
  apiKey: "AIzaSyBBp5viTnja99kwqenvTA3UKoJbTmFqI3k",
  authDomain: "myblogsite-416da.firebaseapp.com",
  projectId: "myblogsite-416da",
  storageBucket: "myblogsite-416da.appspot.com",
  messagingSenderId: "651179510334",
  appId: "1:651179510334:web:942e9d0c437145a1951f6f",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app); // Optional
