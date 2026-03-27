import { db } from "../firebase"
import {
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  getDocs,
  where,
  query,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore"


const texteRempli = (valeur) => {
  return typeof valeur === "string" && valeur.trim() !== ""
}

const valeurRemplie = (valeur) => {
  if (typeof valeur === "string") {
    return valeur.trim() !== ""
  }

  return valeur !== null && valeur !== undefined
}

const verifierCVComplet = (donnees) => {
  if (!donnees || typeof donnees !== "object") {
    return false
  }

  const infosBaseCompletes =
    texteRempli(donnees.prenom) &&
    texteRempli(donnees.nom) &&
    texteRempli(donnees.email) &&
    texteRempli(donnees.titre)

  if (!infosBaseCompletes) {
    return false
  }

  const auMoinsUneFormationValide = Array.isArray(donnees.formations)
    ? donnees.formations.some((formation) => {
      return (
        formation &&
        texteRempli(formation.ecole) &&
        texteRempli(formation.diplome) &&
        valeurRemplie(formation.anneeDebut)
      )
    })
    : false

  const auMoinsUneExperienceValide = Array.isArray(donnees.experiences)
    ? donnees.experiences.some((experience) => {
      return (
        experience &&
        texteRempli(experience.entreprise) &&
        texteRempli(experience.poste)
      )
    })
    : false

  return auMoinsUneFormationValide && auMoinsUneExperienceValide
}

const trierParDateDesc = (liste) => {
  return [...liste].sort((a, b) => {
    const dateA = a?.dateMiseAJour?.seconds || a?.dateCreation?.seconds || 0
    const dateB = b?.dateMiseAJour?.seconds || b?.dateCreation?.seconds || 0
    return dateB - dateA
  })
}


// Crée le profil utilisateur dans Firestore après inscription
export const creerUtilisateur = (uid, prenom, nom, email) => {
  return setDoc(doc(db, "users", uid), {
    prenom,
    nom,
    email,
    dateInscription: serverTimestamp(),
  })
}

// Récupère le profil d'un utilisateur
export const getUtilisateur = (uid) => {
  return getDoc(doc(db, "users", uid))
}

// Sauvegarde un nouveau CV (retourne l'id généré)
export const sauvegarderCV = (uid, email, type, titre, donnees, apercuImage = "") => {
  const complet = verifierCVComplet(donnees)

  return addDoc(collection(db, "cvs"), {
    uid,
    type,       // "ats" ou "colorful"
    titre,      // ex: "Mon CV développeur"
    email,
    complet,
    apercuImage,
    donnees,    // objet contenant tout le formulaire
    dateCreation: serverTimestamp(),
    dateMiseAJour: serverTimestamp(),
  })
}

// Récupère tous les CV d'un utilisateur
export const getCVsUtilisateur = async (uid) => {
  const q = query(collection(db, "cvs"), where("uid", "==", uid))
  const snapshot = await getDocs(q)

  const cvs = snapshot.docs.map((cvDoc) => {
    return {
      id: cvDoc.id,
      ...cvDoc.data(),
    }
  })

  return trierParDateDesc(cvs)
}

// Récupère un CV précis
export const getCV = (uid, cvId) => {
  return getDoc(doc(db, "cvs", cvId))
}

// Met à jour un CV existant
export const mettreAJourCV = (uid, email, cvId, titre, donnees, apercuImage = "") => {
  const complet = verifierCVComplet(donnees)

  return updateDoc(doc(db, "cvs", cvId), {
    uid,
    titre,
    email,
    complet,
    apercuImage,
    donnees,
    dateMiseAJour: serverTimestamp(),
  })
}

// Supprime un CV
export const supprimerCV = (uid, cvId) => {
  return deleteDoc(doc(db, "cvs", cvId))
}