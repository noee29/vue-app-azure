<script setup>
import { ref, reactive, computed, onMounted } from "vue"
import { useRoute } from "vue-router"
import html2pdf from "html2pdf.js"
import html2canvas from "html2canvas"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "@/firebase"
import { sauvegarderCV, mettreAJourCV, getCV } from "@/services/firestore"
import { analyserCV } from "@/services/apiService"

const resultatAnalyse = ref(null)
const loadingAnalyse = ref(false)
const activeTab = ref("infos")
const route = useRoute()
const cvId = ref(null)
const messageSauvegarde = ref("")

const moisNoms = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"]

const aujourdhui = new Date()
const moisActuel = aujourdhui.getMonth() + 1
const anneeActuelle = aujourdhui.getFullYear()

const form = reactive({
  prenom: "",
  nom: "",
  titre: "",
  email: "",
  telephone: "",
  adresse: "",
  resume: "",
  formations: [{ ecole: "", diplome: "", description: "", moisDebut: "", anneeDebut: "", moisFin: "", anneeFin: "" }],
  experiences: [{ entreprise: "", poste: "", description: "", moisDebut: "", anneeDebut: "", moisFin: "", anneeFin: "" }],
  benevoles: [{ organisation: "", role: "", description: "", moisDebut: "", anneeDebut: "", moisFin: "", anneeFin: "" }],
  hardSkills: "",
  softSkills: "",
  langues: "",
  certifications: [{ nom: "", organisme: "", moisDate: "", anneeDate: "" }],
})

// Formate une période mois/année en texte lisible
const formatPeriode = (moisDebut, anneeDebut, moisFin, anneeFin) => {
  let debut = ""
  if (moisDebut && anneeDebut) {
    debut = moisNoms[moisDebut - 1] + " " + anneeDebut
  }
  let fin = ""
  if (!moisFin && !anneeFin) {
    fin = "En cours"
  } else {
    const dateFin = new Date(anneeFin, moisFin - 1)
    if (dateFin > aujourdhui) {
      fin = "Attendu " + moisNoms[moisFin - 1] + " " + anneeFin
    } else {
      fin = moisNoms[moisFin - 1] + " " + anneeFin
    }
  }
  if (!debut && fin === "En cours") return ""
  if (!debut) return fin
  return debut + " – " + fin
}

// Trie du plus récent au plus ancien
const trierParDate = (liste) => {
  return [...liste].sort((a, b) => {
    const dateA = new Date(a.anneeFin || a.anneeDebut || 0, (a.moisFin || a.moisDebut || 1) - 1)
    const dateB = new Date(b.anneeFin || b.anneeDebut || 0, (b.moisFin || b.moisDebut || 1) - 1)
    return dateB - dateA
  })
}

const experiencesTries = computed(() => trierParDate(form.experiences))
const formationsTries = computed(() => trierParDate(form.formations))
const benevolesTries = computed(() => trierParDate(form.benevoles))

// Convertit un texte multiligne en tableau de lignes
const enLignes = (texte) => {
  if (!texte) return []
  return texte.split("\n").filter((l) => l.trim())
}

const dateFinInvalide = (element) => {
  if (!element) {
    return false
  }

  if (!element.moisDebut || !element.anneeDebut) {
    return false
  }

  if (!element.moisFin || !element.anneeFin) {
    return false
  }

  const debut = new Date(Number(element.anneeDebut), Number(element.moisDebut) - 1, 1)
  const fin = new Date(Number(element.anneeFin), Number(element.moisFin) - 1, 1)

  if (fin < debut) {
    return true
  }

  return false
}

const aDesDatesInvalides = () => {
  for (let i = 0; i < form.formations.length; i++) {
    if (dateFinInvalide(form.formations[i])) {
      return true
    }
  }

  for (let i = 0; i < form.experiences.length; i++) {
    if (dateFinInvalide(form.experiences[i])) {
      return true
    }
  }

  for (let i = 0; i < form.benevoles.length; i++) {
    if (dateFinInvalide(form.benevoles[i])) {
      return true
    }
  }

  return false
}

const utilisateurEstConnecte = () => {
  if (!auth.currentUser) {
    return false
  }

  return true
}

const ajouterFormation = () => {
  form.formations.push({ ecole: "", diplome: "", description: "", moisDebut: "", anneeDebut: "", moisFin: "", anneeFin: "" })
}
const supprimerFormation = (index) => { form.formations.splice(index, 1) }

const ajouterExperience = () => {
  form.experiences.push({ entreprise: "", poste: "", description: "", moisDebut: "", anneeDebut: "", moisFin: "", anneeFin: "" })
}
const supprimerExperience = (index) => { form.experiences.splice(index, 1) }

const ajouterBenevole = () => {
  form.benevoles.push({ organisation: "", role: "", description: "", moisDebut: "", anneeDebut: "", moisFin: "", anneeFin: "" })
}
const supprimerBenevole = (index) => { form.benevoles.splice(index, 1) }

const ajouterCertification = () => {
  form.certifications.push({ nom: "", organisme: "", moisDate: "", anneeDate: "" })
}
const supprimerCertification = (index) => { form.certifications.splice(index, 1) }

const attendreUtilisateurConnecte = () => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe()
      resolve(user)
    })
  })
}

// Crée un aperçu image du CV pour l'historique.
const creerApercuImage = async () => {
  const element = document.getElementById("cv-export")
  if (!element) {
    return ""
  }

  const largeur = element.scrollWidth
  const hauteur = element.scrollHeight

  const conteneur = document.createElement("div")
  conteneur.style.position = "fixed"
  conteneur.style.left = "-10000px"
  conteneur.style.top = "0"
  conteneur.style.padding = "0"
  conteneur.style.margin = "0"
  conteneur.style.background = "#ffffff"

  const clone = element.cloneNode(true)
  clone.style.boxShadow = "none"
  clone.style.margin = "0"
  clone.style.background = "#ffffff"
  clone.style.width = largeur + "px"
  clone.style.minHeight = hauteur + "px"

  conteneur.appendChild(clone)
  document.body.appendChild(conteneur)

  try {
    const canvas = await html2canvas(clone, {
      scale: 1,
      useCORS: true,
      backgroundColor: "#ffffff",
      width: largeur,
      height: hauteur,
      windowWidth: largeur,
      windowHeight: hauteur,
      scrollX: 0,
      scrollY: 0,
    })

    return canvas.toDataURL("image/jpeg", 0.72)
  } catch (error) {
    console.error("Erreur creation apercu:", error)
    return ""
  } finally {
    document.body.removeChild(conteneur)
  }
}

const sauvegarder = async () => {
  const user = auth.currentUser
  if (!user) {
    messageSauvegarde.value = "Connectez-vous pour sauvegarder."
    return
  }

  const emailUtilisateur = user.email
  if (!emailUtilisateur) {
    messageSauvegarde.value = "Impossible de lire votre email utilisateur."
    return
  }

  const titre = (form.prenom + " " + form.nom).trim() || "Mon CV"

  try {
    const apercuImage = await creerApercuImage()

    if (cvId.value) {
      await mettreAJourCV(user.uid, emailUtilisateur, cvId.value, titre, { ...form }, apercuImage)
    } else {
      const doc = await sauvegarderCV(user.uid, emailUtilisateur, "ats", titre, { ...form }, apercuImage)
      cvId.value = doc.id
    }
    messageSauvegarde.value = "CV sauvegarde !"
    setTimeout(() => {
      messageSauvegarde.value = ""
    }, 3000)
  } catch (error) {
    console.error("Erreur sauvegarde:", error)
    messageSauvegarde.value = "Erreur lors de la sauvegarde."
  }
}

const telechargerPDF = async () => {
  if (!utilisateurEstConnecte()) {
    alert("Vous devez etre connecté pour telecharger votre CV en PDF.")
    return
  }

  if (aDesDatesInvalides()) {
    alert("La date de fin ne peut pas etre avant la date de debut.")
    return
  }

  const element = document.getElementById("cv-export")
  if (!element) return

  const options = {
    margin: 0,
    filename: `CV_${form.prenom || "prenom"}_${form.nom || "nom"}.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    },
    jsPDF: {
      unit: "mm",
      format: "a4",
      orientation: "portrait",
    },
    pagebreak: { mode: ["css", "legacy"] },
  }

  await html2pdf().set(options).from(element).save()
}

const moisOptions = [
  { value: 1, label: "Janvier" }, { value: 2, label: "Février" },
  { value: 3, label: "Mars" }, { value: 4, label: "Avril" },
  { value: 5, label: "Mai" }, { value: 6, label: "Juin" },
  { value: 7, label: "Juillet" }, { value: 8, label: "Août" },
  { value: 9, label: "Septembre" }, { value: 10, label: "Octobre" },
  { value: 11, label: "Novembre" }, { value: 12, label: "Décembre" },
]

const annees = computed(() => {
  const liste = []
  for (let a = anneeActuelle + 2; a >= 1970; a--) {
    liste.push(a)
  }
  return liste
})

onMounted(async () => {
  const id = route.query.id
  if (typeof id !== "string") {
    return
  }

  const user = await attendreUtilisateurConnecte()
  if (!user) {
    return
  }

  try {
    const snap = await getCV(user.uid, id)
    if (snap.exists()) {
      cvId.value = id
      Object.assign(form, snap.data().donnees)
    }
  } catch (error) {
    console.error("Erreur chargement:", error)
  }
})


const analyserMonCV = async () => {

  loadingAnalyse.value = true

  const result = await analyserCV(form)

  if (result) {
    resultatAnalyse.value = result
  }

  loadingAnalyse.value = false
}
</script>

<template>
  <div class="editor-page">
    <div class="editor-layout">

      
      <aside class="form-side">

        <div class="tab-bar">
          <button class="tab-btn" :class="{ active: activeTab === 'infos' }" @click="activeTab = 'infos'">Infos</button>
          <button class="tab-btn" :class="{ active: activeTab === 'formation' }" @click="activeTab = 'formation'">Formation</button>
          <button class="tab-btn" :class="{ active: activeTab === 'experience' }" @click="activeTab = 'experience'">Expérience</button>
          <button class="tab-btn" :class="{ active: activeTab === 'competences' }" @click="activeTab = 'competences'">Compétences</button>
          <button class="tab-btn" :class="{ active: activeTab === 'benevole' }" @click="activeTab = 'benevole'">Bénévolat</button>
        </div>

        <div class="form-body">

          
          <div v-if="activeTab === 'infos'" class="form-section">
            <div class="field-row">
              <div class="field">
                <label>Prénom</label>
                <input v-model="form.prenom" placeholder="Alex" />
              </div>
              <div class="field">
                <label>Nom</label>
                <input v-model="form.nom" placeholder="Martin" />
              </div>
            </div>
            <div class="field">
              <label>Titre professionnel</label>
              <input v-model="form.titre" placeholder="Développeur Full-Stack" />
            </div>
            <div class="field-row">
              <div class="field">
                <label>Email</label>
                <input v-model="form.email" type="email" placeholder="alex@email.com" />
              </div>
              <div class="field">
                <label>Téléphone</label>
                <input v-model="form.telephone" placeholder="+33 6 00 00 00 00" />
              </div>
            </div>
            <div class="field">
              <label>Adresse</label>
              <input v-model="form.adresse" placeholder="Paris, France" />
            </div>
            <div class="field">
              <label>Résumé professionnel</label>
              <textarea v-model="form.resume" rows="4" placeholder="Décrivez votre profil en 2-3 phrases..."></textarea>
            </div>
          </div>

        
          <div v-if="activeTab === 'formation'" class="form-section">
            <div v-for="(edu, i) in form.formations" :key="i" class="repeater-block">
              <div class="repeater-header">
                <span>Formation {{ i + 1 }}</span>
                <button v-if="form.formations.length > 1" class="btn-supprimer" @click="supprimerFormation(i)">Supprimer</button>
              </div>
              <div class="field">
                <label>École / Université</label>
                <input v-model="edu.ecole" placeholder="Université de Paris" />
              </div>
              <div class="field">
                <label>Diplôme</label>
                <input v-model="edu.diplome" placeholder="Licence Informatique" />
              </div>
              <div class="field">
                <label>Description</label>
                <textarea v-model="edu.description" rows="2" placeholder="Cours suivis, mention..."></textarea>
              </div>
              <div class="periode-label">Début</div>
              <div class="field-row">
                <div class="field">
                  <label>Mois</label>
                  <select v-model="edu.moisDebut">
                    <option value="">--</option>
                    <option v-for="m in moisOptions" :key="m.value" :value="m.value">{{ m.label }}</option>
                  </select>
                </div>
                <div class="field">
                  <label>Année</label>
                  <select v-model="edu.anneeDebut">
                    <option value="">--</option>
                    <option v-for="a in annees" :key="a" :value="a">{{ a }}</option>
                  </select>
                </div>
              </div>
              <div class="periode-label">Fin <span class="periode-hint">(laisser vide = en cours)</span></div>
              <div class="field-row">
                <div class="field">
                  <label>Mois</label>
                  <select v-model="edu.moisFin">
                    <option value="">--</option>
                    <option v-for="m in moisOptions" :key="m.value" :value="m.value">{{ m.label }}</option>
                  </select>
                </div>
                <div class="field">
                  <label>Année</label>
                  <select v-model="edu.anneeFin">
                    <option value="">--</option>
                    <option v-for="a in annees" :key="a" :value="a">{{ a }}</option>
                  </select>
                </div>
              </div>
              <p v-if="dateFinInvalide(edu)" class="date-error">
                La date de fin ne peut pas etre avant la date de debut.
              </p>
            </div>
            <button class="btn-ajouter" @click="ajouterFormation">+ Ajouter une formation</button>
          </div>

          
          <div v-if="activeTab === 'experience'" class="form-section">
            <div v-for="(exp, i) in form.experiences" :key="i" class="repeater-block">
              <div class="repeater-header">
                <span>Expérience {{ i + 1 }}</span>
                <button v-if="form.experiences.length > 1" class="btn-supprimer" @click="supprimerExperience(i)">Supprimer</button>
              </div>
              <div class="field-row">
                <div class="field">
                  <label>Entreprise</label>
                  <input v-model="exp.entreprise" placeholder="Google" />
                </div>
                <div class="field">
                  <label>Poste</label>
                  <input v-model="exp.poste" placeholder="Développeur Stagiaire" />
                </div>
              </div>
              <div class="field">
                <label>Description (une ligne = un bullet)</label>
                <textarea v-model="exp.description" rows="4" placeholder="Développé une API REST...&#10;Réduit le temps de chargement de 40%"></textarea>
              </div>
              <div class="periode-label">Début</div>
              <div class="field-row">
                <div class="field">
                  <label>Mois</label>
                  <select v-model="exp.moisDebut">
                    <option value="">--</option>
                    <option v-for="m in moisOptions" :key="m.value" :value="m.value">{{ m.label }}</option>
                  </select>
                </div>
                <div class="field">
                  <label>Année</label>
                  <select v-model="exp.anneeDebut">
                    <option value="">--</option>
                    <option v-for="a in annees" :key="a" :value="a">{{ a }}</option>
                  </select>
                </div>
              </div>
              <div class="periode-label">Fin <span class="periode-hint">(laisser vide = en cours)</span></div>
              <div class="field-row">
                <div class="field">
                  <label>Mois</label>
                  <select v-model="exp.moisFin">
                    <option value="">--</option>
                    <option v-for="m in moisOptions" :key="m.value" :value="m.value">{{ m.label }}</option>
                  </select>
                </div>
                <div class="field">
                  <label>Année</label>
                  <select v-model="exp.anneeFin">
                    <option value="">--</option>
                    <option v-for="a in annees" :key="a" :value="a">{{ a }}</option>
                  </select>
                </div>
              </div>
              <p v-if="dateFinInvalide(exp)" class="date-error">
                La date de fin ne peut pas etre avant la date de debut.
              </p>
            </div>
            <button class="btn-ajouter" @click="ajouterExperience">+ Ajouter une expérience</button>
          </div>

          
          <div v-if="activeTab === 'competences'" class="form-section">
            <div class="field">
              <label>Hard Skills (une ligne = un bullet)</label>
              <textarea v-model="form.hardSkills" rows="4" placeholder="Vue.js&#10;Python&#10;Docker"></textarea>
            </div>
            <div class="field">
              <label>Soft Skills (une ligne = un bullet)</label>
              <textarea v-model="form.softSkills" rows="4" placeholder="Travail en équipe&#10;Gestion du temps"></textarea>
            </div>
            <div class="field">
              <label>Langues (une ligne = un bullet)</label>
              <textarea v-model="form.langues" rows="3" placeholder="Français (natif)&#10;Anglais (courant)"></textarea>
            </div>

            <div class="separateur">Certifications</div>
            <div v-for="(cert, i) in form.certifications" :key="i" class="repeater-block">
              <div class="repeater-header">
                <span>Certification {{ i + 1 }}</span>
                <button v-if="form.certifications.length > 1" class="btn-supprimer" @click="supprimerCertification(i)">Supprimer</button>
              </div>
              <div class="field">
                <label>Nom de la certification</label>
                <input v-model="cert.nom" placeholder="AWS Certified Developer" />
              </div>
              <div class="field">
                <label>Organisme</label>
                <input v-model="cert.organisme" placeholder="Amazon Web Services" />
              </div>
              <div class="field-row">
                <div class="field">
                  <label>Mois</label>
                  <select v-model="cert.moisDate">
                    <option value="">--</option>
                    <option v-for="m in moisOptions" :key="m.value" :value="m.value">{{ m.label }}</option>
                  </select>
                </div>
                <div class="field">
                  <label>Année</label>
                  <select v-model="cert.anneeDate">
                    <option value="">--</option>
                    <option v-for="a in annees" :key="a" :value="a">{{ a }}</option>
                  </select>
                </div>
              </div>
            </div>
            <button class="btn-ajouter" @click="ajouterCertification">+ Ajouter une certification</button>
          </div>

          
          <div v-if="activeTab === 'benevole'" class="form-section">
            <div v-for="(ben, i) in form.benevoles" :key="i" class="repeater-block">
              <div class="repeater-header">
                <span>Bénévolat {{ i + 1 }}</span>
                <button v-if="form.benevoles.length > 1" class="btn-supprimer" @click="supprimerBenevole(i)">Supprimer</button>
              </div>
              <div class="field-row">
                <div class="field">
                  <label>Organisation</label>
                  <input v-model="ben.organisation" placeholder="Croix-Rouge" />
                </div>
                <div class="field">
                  <label>Rôle</label>
                  <input v-model="ben.role" placeholder="Bénévole terrain" />
                </div>
              </div>
              <div class="field">
                <label>Description (une ligne = un bullet)</label>
                <textarea v-model="ben.description" rows="3" placeholder="Distribution de repas&#10;Accompagnement des familles"></textarea>
              </div>
              <div class="periode-label">Début</div>
              <div class="field-row">
                <div class="field">
                  <label>Mois</label>
                  <select v-model="ben.moisDebut">
                    <option value="">--</option>
                    <option v-for="m in moisOptions" :key="m.value" :value="m.value">{{ m.label }}</option>
                  </select>
                </div>
                <div class="field">
                  <label>Année</label>
                  <select v-model="ben.anneeDebut">
                    <option value="">--</option>
                    <option v-for="a in annees" :key="a" :value="a">{{ a }}</option>
                  </select>
                </div>
              </div>
              <div class="periode-label">Fin <span class="periode-hint">(laisser vide = en cours)</span></div>
              <div class="field-row">
                <div class="field">
                  <label>Mois</label>
                  <select v-model="ben.moisFin">
                    <option value="">--</option>
                    <option v-for="m in moisOptions" :key="m.value" :value="m.value">{{ m.label }}</option>
                  </select>
                </div>
                <div class="field">
                  <label>Année</label>
                  <select v-model="ben.anneeFin">
                    <option value="">--</option>
                    <option v-for="a in annees" :key="a" :value="a">{{ a }}</option>
                  </select>
                </div>
              </div>
              <p v-if="dateFinInvalide(ben)" class="date-error">
                La date de fin ne peut pas etre avant la date de debut.
              </p>
            </div>
            <button class="btn-ajouter" @click="ajouterBenevole">+ Ajouter un bénévolat</button>
          </div>

        </div>

        <div class="form-footer">
          <button class="btn-sauvegarder" @click="sauvegarder">Sauvegarder</button>
          <button class="btn-analyse" :disabled="loadingAnalyse" @click="analyserMonCV">
            <span v-if="loadingAnalyse">Analyse en cours...</span>
            <span v-else>Analyser mon CV</span>
          </button>
          <button class="btn-download" @click="telechargerPDF">Télécharger PDF</button>
          <p v-if="messageSauvegarde" class="msg-sauvegarde">{{ messageSauvegarde }}</p>

          <div v-if="resultatAnalyse" class="analyse-resultat">
            <h3>Score ATS : {{ resultatAnalyse.score }}/100</h3>

            <div class="analyse-bloc">
              <h4>Points forts :</h4>
              <ul>
                <li v-for="(p, i) in resultatAnalyse.pointsForts" :key="i">{{ p }}</li>
              </ul>
            </div>

            <div class="analyse-bloc">
              <h4>A ameliorer :</h4>
              <ul>
                <li v-for="(p, i) in resultatAnalyse.aAmeliorer" :key="i">{{ p }}</li>
              </ul>
            </div>
          </div>
        </div>

      </aside>

      
      <main class="preview-side">
        <div id="cv-export" class="cv-page">

          
          <div class="cv-header">
            <h1 class="cv-nom">{{ form.prenom }} {{ form.nom }}</h1>
            <p v-if="form.titre" class="cv-titre">{{ form.titre }}</p>
            <p class="cv-contacts">
              <span v-if="form.adresse">{{ form.adresse }}</span>
              <span v-if="form.adresse && form.email"> | </span>
              <span v-if="form.email">{{ form.email }}</span>
              <span v-if="form.telephone"> | {{ form.telephone }}</span>
            </p>
          </div>

          
          <div v-if="form.resume" class="cv-section">
            <h2 class="cv-section-titre">RÉSUMÉ PROFESSIONNEL</h2>
            <hr class="cv-ligne" />
            <p class="cv-texte">{{ form.resume }}</p>
          </div>

          
          <div v-if="experiencesTries[0] && (experiencesTries[0].entreprise || experiencesTries[0].poste)" class="cv-section">
            <h2 class="cv-section-titre">EXPÉRIENCE PROFESSIONNELLE</h2>
            <hr class="cv-ligne" />
            <div v-for="(exp, i) in experiencesTries" :key="i">
              <div v-if="exp.entreprise || exp.poste" class="cv-bloc">
                <div class="cv-exp-header">
                  <strong class="cv-exp-poste">{{ exp.poste }}</strong>
                  <span class="cv-exp-periode">{{ formatPeriode(exp.moisDebut, exp.anneeDebut, exp.moisFin, exp.anneeFin) }}</span>
                </div>
                <p class="cv-exp-entreprise">{{ exp.entreprise }}</p>
                <ul v-if="exp.description" class="cv-liste">
                  <li v-for="(ligne, j) in enLignes(exp.description)" :key="j">{{ ligne }}</li>
                </ul>
              </div>
            </div>
          </div>

          
          <div v-if="formationsTries[0] && (formationsTries[0].ecole || formationsTries[0].diplome)" class="cv-section">
            <h2 class="cv-section-titre">FORMATION</h2>
            <hr class="cv-ligne" />
            <div v-for="(edu, i) in formationsTries" :key="i">
              <div v-if="edu.ecole || edu.diplome" class="cv-bloc">
                <div class="cv-exp-header">
                  <strong class="cv-exp-poste">{{ edu.diplome }}</strong>
                  <span class="cv-exp-periode">{{ formatPeriode(edu.moisDebut, edu.anneeDebut, edu.moisFin, edu.anneeFin) }}</span>
                </div>
                <p class="cv-exp-entreprise">{{ edu.ecole }}</p>
                <p v-if="edu.description" class="cv-texte">{{ edu.description }}</p>
              </div>
            </div>
          </div>

          
          <div v-if="form.hardSkills || form.softSkills || form.langues" class="cv-section">
            <h2 class="cv-section-titre">COMPÉTENCES</h2>
            <hr class="cv-ligne" />
            <div class="cv-competences-grid">
              <div v-if="form.hardSkills" class="cv-competences-col">
                <strong class="cv-sous-titre">Hard Skills</strong>
                <ul class="cv-liste">
                  <li v-for="(ligne, i) in enLignes(form.hardSkills)" :key="i">{{ ligne }}</li>
                </ul>
              </div>
              <div v-if="form.softSkills" class="cv-competences-col">
                <strong class="cv-sous-titre">Soft Skills</strong>
                <ul class="cv-liste">
                  <li v-for="(ligne, i) in enLignes(form.softSkills)" :key="i">{{ ligne }}</li>
                </ul>
              </div>
              <div v-if="form.langues" class="cv-competences-col">
                <strong class="cv-sous-titre">Langues</strong>
                <ul class="cv-liste">
                  <li v-for="(ligne, i) in enLignes(form.langues)" :key="i">{{ ligne }}</li>
                </ul>
              </div>
            </div>
          </div>

          
          <div v-if="form.certifications[0] && form.certifications[0].nom" class="cv-section">
            <h2 class="cv-section-titre">CERTIFICATIONS</h2>
            <hr class="cv-ligne" />
            <ul class="cv-liste">
              <li v-for="(cert, i) in form.certifications" :key="i">
                <span v-if="cert.nom">
                  {{ cert.nom }}
                  <span v-if="cert.organisme"> – {{ cert.organisme }}</span>
                  <span v-if="cert.moisDate && cert.anneeDate"> ({{ moisNoms[cert.moisDate - 1] }} {{ cert.anneeDate }})</span>
                </span>
              </li>
            </ul>
          </div>

          
          <div v-if="benevolesTries[0] && (benevolesTries[0].organisation || benevolesTries[0].role)" class="cv-section">
            <h2 class="cv-section-titre">BÉNÉVOLAT</h2>
            <hr class="cv-ligne" />
            <div v-for="(ben, i) in benevolesTries" :key="i">
              <div v-if="ben.organisation || ben.role" class="cv-bloc">
                <div class="cv-exp-header">
                  <strong class="cv-exp-poste">{{ ben.role }}</strong>
                  <span class="cv-exp-periode">{{ formatPeriode(ben.moisDebut, ben.anneeDebut, ben.moisFin, ben.anneeFin) }}</span>
                </div>
                <p class="cv-exp-entreprise">{{ ben.organisation }}</p>
                <ul v-if="ben.description" class="cv-liste">
                  <li v-for="(ligne, j) in enLignes(ben.description)" :key="j">{{ ligne }}</li>
                </ul>
              </div>
            </div>
          </div>

        </div>
      </main>

    </div>
  </div>
</template>

<style scoped>
.editor-page {
  min-height: calc(100vh - 80px);
  background: #f3f3f3;
}

.editor-layout {
  display: flex;
  height: calc(100vh - 80px);
}



.form-side {
  width: 420px;
  min-width: 420px;
  background: white;
  border-right: 1px solid #d8d8d8;
  display: flex;
  flex-direction: column;
}

.tab-bar {
  display: flex;
  border-bottom: 1px solid #d8d8d8;
  flex-shrink: 0;
  overflow-x: auto;
}

.tab-btn {
  flex: 1;
  padding: 12px 4px;
  border: none;
  background: none;
  font-size: 11px;
  font-weight: 600;
  color: #9b9b9b;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  white-space: nowrap;
}

.tab-btn:hover { color: #0b1c2d; }
.tab-btn.active { color: #2f89e5; border-bottom-color: #2f89e5; }

.form-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px 18px;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.field label {
  font-size: 12px;
  font-weight: 600;
  color: #333;
}

.field input,
.field textarea,
.field select {
  width: 100%;
  border: 1px solid #d8d8d8;
  border-radius: 6px;
  padding: 8px 10px;
  font-size: 13px;
  color: #333;
  background: #fffdfb;
  outline: none;
  resize: vertical;
  font-family: inherit;
}

.field input:focus,
.field textarea:focus,
.field select:focus { border-color: #2f89e5; }

.field input::placeholder,
.field textarea::placeholder { color: #9b9b9b; }

.field-row { display: flex; gap: 10px; }
.field-row .field { flex: 1; }

.periode-label {
  font-size: 12px;
  font-weight: 600;
  color: #555;
  margin-bottom: -6px;
}

.periode-hint {
  font-size: 11px;
  font-weight: 400;
  color: #9b9b9b;
}

.date-error {
  margin-top: -2px;
  font-size: 12px;
  color: #d12b2b;
  font-weight: 600;
}

.repeater-block {
  border: 1px solid #d8d8d8;
  border-radius: 10px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.repeater-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  font-weight: 600;
  color: #333;
}

.btn-supprimer {
  background: none;
  border: none;
  font-size: 12px;
  color: #e05a5a;
  cursor: pointer;
  font-weight: 600;
}

.btn-ajouter {
  padding: 10px;
  border: 1px dashed #aaa;
  border-radius: 8px;
  background: none;
  color: #2f89e5;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
}

.separateur {
  font-size: 13px;
  font-weight: 700;
  color: #333;
  border-top: 1px solid #e8e8e8;
  padding-top: 12px;
}

.form-footer {
  padding: 14px 18px;
  border-top: 1px solid #d8d8d8;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.btn-sauvegarder {
  width: 100%;
  height: 42px;
  background: #2f89e5;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
}

.btn-sauvegarder:hover { background: #246fba; }

.btn-analyse {
  width: 100%;
  height: 42px;
  background: #1d4ed8;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
}

.btn-analyse:hover { background: #1e40af; }

.btn-analyse:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-download {
  width: 100%;
  height: 42px;
  background: #0b1c2d;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
}

.btn-download:hover { background: #122a44; }

.msg-sauvegarde {
  margin: 0;
  font-size: 12px;
  font-weight: 600;
  color: #1d5c9a;
}

.analyse-resultat {
  border: 1px solid #dbe4ff;
  border-radius: 8px;
  padding: 10px;
  background: #f8faff;
}

.analyse-resultat h3 {
  font-size: 14px;
  margin-bottom: 8px;
  color: #1e3a8a;
}

.analyse-bloc {
  margin-bottom: 8px;
}

.analyse-bloc h4 {
  font-size: 13px;
  margin-bottom: 4px;
  color: #1f2937;
}

.analyse-bloc ul {
  margin: 0;
  padding-left: 18px;
}

.analyse-bloc li {
  font-size: 12px;
  color: #111827;
  line-height: 1.4;
}



.preview-side {
  flex: 1;
  overflow-y: auto;
  padding: 30px;
  display: flex;
  justify-content: center;
  background: #f3f3f3;
}

.cv-page {
  background: white;
  box-sizing: border-box;
  width: 210mm;
  min-height: 297mm;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.12);
  padding: 14mm 16mm;
  font-family: Arial, sans-serif;
  color: #111;
  font-size: 12.5px;
}

.cv-header {
  text-align: center;
  margin-bottom: 14px;
}

.cv-nom {
  font-size: 26px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #000;
  margin-bottom: 4px;
}

.cv-titre {
  font-size: 13px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.cv-contacts {
  font-size: 12px;
  color: #444;
}

.cv-section { margin-bottom: 14px; }

.cv-section-titre {
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #000;
  margin-bottom: 3px;
}

.cv-ligne {
  border: none;
  border-top: 1.5px solid #000;
  margin-bottom: 8px;
}

.cv-texte {
  font-size: 12px;
  color: #222;
  line-height: 1.6;
}

.cv-bloc { margin-bottom: 10px; }

.cv-exp-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.cv-exp-poste { font-size: 13px; font-weight: 700; color: #000; }
.cv-exp-periode { font-size: 12px; color: #333; white-space: nowrap; }

.cv-exp-entreprise {
  font-size: 12px;
  font-style: italic;
  color: #333;
  margin-bottom: 3px;
}

.cv-liste {
  padding-left: 18px;
  margin-top: 4px;
}

.cv-liste li {
  font-size: 12px;
  color: #222;
  margin-bottom: 2px;
  line-height: 1.5;
}

.cv-competences-grid {
  display: flex;
  gap: 20px;
}

.cv-competences-col { flex: 1; }

.cv-sous-titre {
  font-size: 12px;
  font-weight: 700;
  color: #000;
  display: block;
  margin-bottom: 4px;
}

@media (max-width: 900px) {
  .editor-layout { flex-direction: column; height: auto; }
  .form-side { width: 100%; min-width: 0; border-right: none; border-bottom: 1px solid #d8d8d8; }
  .preview-side { padding: 20px; }
  .cv-page { width: 100%; padding: 20px; }
}

@media print {
  body * { visibility: hidden; }
  #cv-export, #cv-export * { visibility: visible; }
  #cv-export {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    padding: 14mm 16mm;
    font-family: Arial, sans-serif;
    font-size: 12px;
    color: #111;
  }
}
</style>