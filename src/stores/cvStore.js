import { defineStore } from "pinia"
import {
  getCVsUtilisateur,
  getCV,
  sauvegarderCV,
  mettreAJourCV,
  supprimerCV,
} from "@/services/firestore"

export const useCvStore = defineStore("cv", {
  state: () => ({
    cvs: [],
    currentCv: null,
    loading: false,
    error: "",
    successMessage: "",
  }),

  getters: {
    // Retourne le nombre total de CV enregistrés
    totalCV: (state) => state.cvs.length,

    // Liste des CV marqués comme complets
    cvsComplets: (state) => {
      return state.cvs.filter((cv) => cv.complet)
    },

    // Liste des CV incomplets
    cvsIncomplets: (state) => {
      return state.cvs.filter((cv) => !cv.complet)
    },

    // Permet de retrouver un CV à partir de son identifiant
    cvParId: (state) => {
      return (id) => state.cvs.find((cv) => cv.id === id) || null
    },

    // Texte affiché dans l'historique pour indiquer le nombre de CV
    texteCompteur: (state) => {
      const total = state.cvs.length
      return total <= 1 ? `Vous avez ${total} CV` : `Vous avez ${total} CV`
    },
  },

  actions: {
    // Réinitialise les messages d'erreur et de succès
    clearMessages() {
      this.error = ""
      this.successMessage = ""
    },

    // Récupère tous les CV de l'utilisateur
    async fetchCVs(uid) {
      this.loading = true
      this.error = ""
      this.successMessage = ""

      try {
        const data = await getCVsUtilisateur(uid)
        this.cvs = data
        return data
      } catch (error) {
        this.error = error.code || error.message || "Erreur lors du chargement des CV."
        throw error
      } finally {
        this.loading = false
      }
    },

    // Charge un CV précis depuis Firestore
    async fetchCV(uid, cvId) {
      this.loading = true
      this.error = ""
      this.successMessage = ""

      try {
        const snapshot = await getCV(uid, cvId)

        if (!snapshot.exists()) {
          throw new Error("CV introuvable.")
        }

        this.currentCv = {
          id: snapshot.id,
          ...snapshot.data(),
        }

        return this.currentCv
      } catch (error) {
        this.error = error.code || error.message || "Erreur lors du chargement du CV."
        throw error
      } finally {
        this.loading = false
      }
    },

    // Ajoute un nouveau CV puis met à jour la liste locale
    async addCV(uid, email, type, titre, donnees, apercuImage = "") {
      this.loading = true
      this.error = ""
      this.successMessage = ""

      try {
        const docRef = await sauvegarderCV(uid, email, type, titre, donnees, apercuImage)

        await this.fetchCVs(uid)

        this.successMessage = "CV sauvegardé avec succès."
        return docRef
      } catch (error) {
        this.error = error.code || error.message || "Erreur lors de la sauvegarde."
        throw error
      } finally {
        this.loading = false
      }
    },

    // Met à jour un CV existant puis synchronise le store
    async updateCV(uid, email, cvId, titre, donnees, apercuImage = "") {
      this.loading = true
      this.error = ""
      this.successMessage = ""

      try {
        await mettreAJourCV(uid, email, cvId, titre, donnees, apercuImage)

        await this.fetchCVs(uid)

        if (this.currentCv && this.currentCv.id === cvId) {
          this.currentCv = {
            ...this.currentCv,
            titre,
            email,
            donnees,
            apercuImage,
          }
        }

        this.successMessage = "CV mis à jour avec succès."
      } catch (error) {
        this.error = error.code || error.message || "Erreur lors de la mise à jour."
        throw error
      } finally {
        this.loading = false
      }
    },

    // Supprime un CV du store et de Firestore
    async deleteCV(uid, cvId) {
      this.loading = true
      this.error = ""
      this.successMessage = ""

      try {
        await supprimerCV(uid, cvId)

        this.cvs = this.cvs.filter((cv) => cv.id !== cvId)

        if (this.currentCv && this.currentCv.id === cvId) {
          this.currentCv = null
        }

        this.successMessage = "CV supprimé avec succès."
      } catch (error) {
        this.error = error.code || error.message || "Erreur lors de la suppression."
        throw error
      } finally {
        this.loading = false
      }
    },

    // Réinitialise le CV actuellement sélectionné
    resetCurrentCv() {
      this.currentCv = null
    },
  },
})