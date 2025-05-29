// src/firebase.ts
import { initializeApp } from "firebase/app";
import {
  getAuth,
  connectAuthEmulator
} from "firebase/auth";
import {
  getFirestore,
  connectFirestoreEmulator
} from "firebase/firestore";
import {
  getStorage,
  connectStorageEmulator
} from "firebase/storage";

const firebaseConfig = {
  apiKey:      "demo",
  authDomain:  "demo.firebaseapp.com",
  projectId:   "demo",
};

const app  = initializeApp(firebaseConfig);

/* Instancias normales (reales si no hay emulador) */
export const auth    = getAuth(app);
export const db      = getFirestore(app);
export const storage = getStorage(app);

/* Conexión a emuladores solo en desarrollo */
if (import.meta.env.DEV) {
  connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
  connectFirestoreEmulator(db, "localhost", 8080);
  connectStorageEmulator(storage, "localhost", 9199);
  console.log("🔥 Conectado a Firestore Emulator en localhost:8080");
}
