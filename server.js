import express from "express"
import cors from "cors"

const app = express()

app.use(cors())
app.use(express.json())

app.post("/api/analyser-cv", (req, res) => {

  const cv = req.body || {}
  const experiences = Array.isArray(cv.experiences) ? cv.experiences : []
  const formations = Array.isArray(cv.formations) ? cv.formations : []
  const certifications = Array.isArray(cv.certifications) ? cv.certifications : []

  let score = 0
  const pointsForts = []
  const aAmeliorer = []

  // IDENTITE
  if (cv.prenom && cv.nom) {
    score = score + 10
    pointsForts.push("Identité complète")
  } else {
    aAmeliorer.push("Nom ou prénom manquant")
  }

  // TITRE
  if (cv.titre) {
    score = score + 10
    pointsForts.push("Titre professionnel présent")
  } else {
    aAmeliorer.push("Titre professionnel manquant")
  }

  // RESUME
  if (cv.resume) {
    score = score + 15
    pointsForts.push("Résumé professionnel rédigé")
  } else {
    aAmeliorer.push("Résumé manquant")
  }

  // EXPERIENCES
  let nbExp = 0

  for (let i = 0; i < experiences.length; i++) {
    const exp = experiences[i]

    if (exp.poste && exp.entreprise) {
      nbExp = nbExp + 1
    }
  }

  if (nbExp > 0) {
    score = score + 20
    pointsForts.push("Expérience professionnelle renseignée")
  } else {
    aAmeliorer.push("Aucune expérience professionnelle")
  }

  // FORMATIONS
  let nbForm = 0

  for (let i = 0; i < formations.length; i++) {
    const f = formations[i]

    if (f.diplome && f.ecole) {
      nbForm = nbForm + 1
    }
  }

  if (nbForm > 0) {
    score = score + 15
    pointsForts.push("Formation renseignée")
  } else {
    aAmeliorer.push("Aucune formation")
  }

  // SKILLS
  if (cv.hardSkills) {
    score = score + 10
    pointsForts.push("Hard skills présents")
  } else {
    aAmeliorer.push("Hard skills manquants")
  }

  if (cv.softSkills) {
    score = score + 5
    pointsForts.push("Soft skills présents")
  }

  if (cv.langues) {
    score = score + 5
    pointsForts.push("Langues renseignées")
  }

  // CERTIFICATIONS
  let hasCertif = false

  for (let i = 0; i < certifications.length; i++) {
    if (certifications[i].nom) {
      hasCertif = true
    }
  }

  if (hasCertif) {
    score = score + 5
    pointsForts.push("Certifications ajoutées")
  } else {
    aAmeliorer.push("Aucune certification")
  }

  res.json({
    score: score,
    pointsForts: pointsForts,
    aAmeliorer: aAmeliorer
  })
})

app.listen(3000, () => {
  console.log("Serveur lancé sur http://localhost:3000")
})