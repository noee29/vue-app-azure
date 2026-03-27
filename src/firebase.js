import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getAnalytics, isSupported } from "firebase/analytics"

const firebaseConfig = {
  apiKey: "AIzaSyDOJM8ICK-Qg_6_zfhKLRuXe4TDEVBgtko",
  authDomain: "smartcv-eee2d.firebaseapp.com",
  projectId: "smartcv-eee2d",
  storageBucket: "smartcv-eee2d.firebasestorage.app",
  messagingSenderId: "696632675016",
  appId: "1:696632675016:web:75546194dfb68860b5f3fd",
  measurementId: "G-WR9XF13644"
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)

// Analytics n'est pas critique pour l'application, on évite de faire planter le rendu.
export let analytics = null
isSupported().then((ok) => {
  if (ok) {
    analytics = getAnalytics(app)
  }
})

export default app