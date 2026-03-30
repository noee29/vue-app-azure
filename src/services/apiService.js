import axios from "axios"

// Envoie les données du CV à une API externe pour analyse
export const analyserCV = async (cv) => {
  try {
    const response = await axios.post(
      "http://localhost:3000/api/analyser-cv",
      cv
    )

    // Retourne les données analysées par l'API
    return response.data

  } catch (error) {
    // Gestion des erreurs API
    console.error("Erreur API :", error)
    return null
  }
}