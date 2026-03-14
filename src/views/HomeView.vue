<script setup>
import { useRouter } from "vue-router"
import iconGenere from "@/assets/icons/Icon-Genere.png"
import iconChance from "@/assets/icons/Icon-plus-de-chance.png"
import iconOrganiser from "@/assets/icons/Icon-organiser.png"

const router = useRouter()

const goToGenerer = () => {
  router.push("/generer")
}
</script>

<template>
  <div class="home-page">
    <section class="hero">
      <div class="hero-content">
        <h1>Créez votre CV professionnel avec SmartCV</h1>
        <p>Créez votre propre CV professionnel.</p>

        <button class="hero-btn" @click="goToGenerer">
          Créez votre CV
        </button>
      </div>
    </section>

    <section class="cards-section">
      <div class="info-card">
        <div class="card-icon">
          <img :src="iconGenere" alt="générer cv" />
        </div>
        <div class="card-text">
          <h2>Générateur de CV rapide et facile</h2>
          <p>
            Avec notre créateur de CV en ligne, il est simple pour quiconque de
            créer rapidement un CV professionnel. Entrez vos informations
            personnelles et commencez à remplir le contenu de votre CV. Enfin,
            choisissez l'un de nos mises en page de CV disponibles et
            téléchargez votre CV.
          </p>
        </div>
      </div>

      <div class="info-card">
        <div class="card-icon">
          <img :src="iconChance" alt="plus de chance" />
        </div>
        <div class="card-text">
          <h2>Plus de chances de décrocher un emploi</h2>
          <p>
            Avec un CV représentatif et professionnel, vous vous démarquerez de
            tous les autres candidats. Vous êtes probablement plus susceptible
            d'être invité à un entretien avec un CV professionnel.
          </p>
        </div>
      </div>

      <div class="info-card">
        <div class="card-icon">
          <img :src="iconOrganiser" alt="organiser cv" />
        </div>
        <div class="card-text">
          <h2>Organisez vos candidatures</h2>
          <p>
            Souvent, il est important de pouvoir adapter votre CV en fonction de
            l'emploi pour lequel vous souhaitez postuler. Avec CV Maker, vous
            pouvez créer et gérer plusieurs CV différents de manière organisée
            via votre propre hub de compte personnel.
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home-page {
  min-height: calc(100vh - 80px);
  background: #f3f3f3;
}

.hero {
  background: #2f89e5;
  min-height: 420px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  text-align: center;
  padding: 60px 120px 140px;
  position: relative;
  overflow: hidden;
}

.hero::after {
  content: "";
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 140px;
  background: #f3f3f3;
  clip-path: polygon(0 100%, 100% 0, 100% 100%);
}

.hero-content {
  position: relative;
  z-index: 2;
}

.hero h1 {
  color: white;
  font-size: 38px;
  font-weight: 700;
  margin-bottom: 16px;
}

.hero p {
  color: white;
  font-size: 16px;
  margin-bottom: 34px;
}

.hero-btn {
  background: #0b1c2d;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 18px 42px;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  transition: 0.2s ease;
}

.hero-btn:hover {
  background: #122a44;
}

.cards-section {
  width: 100%;
  max-width: 920px;
  margin: -30px auto 60px;
  position: relative;
  z-index: 3;
  display: flex;
  flex-direction: column;
  gap: 26px;
}

.info-card {
  background: #f2f6ff;
  border-radius: 28px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.18);
  padding: 34px 36px;
  display: flex;
  align-items: center;
  gap: 32px;
}

.card-icon {
  width: 120px;
  min-width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-icon img {
  width: 80px;
  height: auto;
  object-fit: contain;
  display: block;
}

.card-text h2 {
  color: #1a2230;
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 18px;
}

.card-text p {
  color: #6a6f78;
  font-size: 16px;
  line-height: 1.8;
}

/* Laptop */
@media (max-width: 1200px) {
  .hero {
    padding: 60px 80px 140px;
  }

  .cards-section {
    max-width: calc(100% - 160px);
  }
}

/* Tablet */
@media (max-width: 900px) {
  .hero {
    padding: 50px 40px 120px;
    min-height: 380px;
  }

  .hero h1 {
    font-size: 30px;
  }

  .hero p {
    font-size: 15px;
  }

  .cards-section {
    max-width: calc(100% - 80px);
  }

  .info-card {
    padding: 28px;
    gap: 22px;
  }

  .card-icon {
    width: 96px;
    min-width: 96px;
    height: 96px;
  }

  .card-icon img {
    width: 64px;
  }

  .card-text h2 {
    font-size: 18px;
  }

  .card-text p {
    font-size: 15px;
  }
}

/* Mobile */
@media (max-width: 600px) {
  .hero {
    padding: 40px 24px 110px;
    min-height: 340px;
  }

  .hero h1 {
    font-size: 26px;
  }

  .hero p {
    font-size: 14px;
    margin-bottom: 28px;
  }

  .hero-btn {
    width: 100%;
    max-width: 280px;
    padding: 16px 24px;
    font-size: 16px;
  }

  .cards-section {
    max-width: calc(100% - 48px);
    margin: -20px auto 40px;
  }

  .info-card {
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 24px 20px;
    border-radius: 22px;
    gap: 18px;
  }

  .card-icon {
    width: auto;
    min-width: auto;
    height: auto;
  }

  .card-icon img {
    width: 56px;
  }

  .card-text h2 {
    font-size: 17px;
    margin-bottom: 12px;
  }

  .card-text p {
    font-size: 14px;
    line-height: 1.7;
  }
}
</style>