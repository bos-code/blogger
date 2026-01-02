import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

const firebaseConfig: FirebaseConfig = {
  apiKey: "AIzaSyBBp5viTnja99kwqenvTA3UKoJbTmFqI3k",
  authDomain: "myblogsite-416da.firebaseapp.com",
  projectId: "myblogsite-416da",
  storageBucket: "myblogsite-416da.appspot.com",
  messagingSenderId: "651179510334",
  appId: "1:651179510334:web:942e9d0c437145a1951f6f",
};

const app: FirebaseApp = initializeApp(firebaseConfig);

export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);















