import axios from "axios"

export const analyserCV = async (cv) => {
  try {
    const response = await axios.post(
      "http://localhost:3000/api/analyser-cv",
      cv
    )

    return response.data

  } catch (error) {
    console.error("Erreur API :", error)
    return null
  }
}