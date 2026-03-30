import { auth } from "../firebase"
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
} from "firebase/auth"

// Connecte un utilisateur avec email et mot de passe
export const loginUser = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password)
}

// Crée un nouveau compte utilisateur
export const signupUser = (email, password) => {
  return createUserWithEmailAndPassword(auth, email, password)
}

// Envoie un email de réinitialisation du mot de passe
export const resetPassword = (email) => {
  return sendPasswordResetEmail(auth, email)
}

// Déconnecte l'utilisateur courant
export const logoutUser = () => {
  return signOut(auth)
}