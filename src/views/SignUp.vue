<script setup>
import AuthContainer from "@/components/AuthContainer.vue"
import { ref } from "vue"

import eyeOpen from "@/assets/icons/Icon-eye-open.png"
import eyeClosed from "@/assets/icons/Icon-eye-closed.png"

const showPassword = ref(false)

const togglePassword = () => {
  showPassword.value = !showPassword.value
}
</script>

<template>
  <AuthContainer>
    <div class="signup-content">
      <h1>S'inscrire</h1>

      <form class="signup-form">
        <div class="name-row">
          <div class="input-group half">
            <label for="firstName">Prénom</label>
            <input
              id="firstName"
              type="text"
              placeholder="Veuillez entrer votre prénom"
            />
          </div>

          <div class="input-group half">
            <label for="lastName">Nom</label>
            <input
              id="lastName"
              type="text"
              placeholder="Veuillez entrer votre nom"
            />
          </div>
        </div>

        <div class="input-group">
          <label for="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="Veuillez entrer votre email"
          />
        </div>

        <div class="input-group">
          <label for="password">Mot de passe</label>
          <div class="password-field">
            <input
              id="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Veuillez entrer votre mot de passe"
            />
            <img
              :src="showPassword ? eyeOpen : eyeClosed"
              alt="Afficher ou masquer le mot de passe"
              class="eye-icon"
              @click="togglePassword"
            />
          </div>
        </div>

        <div class="input-group">
          <label for="confirmPassword">Confirmer le mot de passe</label>
          <input
            id="confirmPassword"
            type="password"
            placeholder="Veuillez confirmer votre mot de passe"
          />
        </div>

        <button type="submit" class="signup-btn">S'inscrire</button>
      </form>
    </div>
  </AuthContainer>
</template>

<style scoped>
.signup-content h1 {
  text-align: center;
  font-size: 34px;
  font-weight: 700;
  color: #000;
  margin-bottom: 34px;
}

.signup-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.name-row {
  display: flex;
  gap: 22px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.input-group.half {
  flex: 1;
}

.input-group label {
  font-size: 18px;
  color: #111;
  font-weight: 500;
}

.input-group input {
  width: 100%;
  height: 40px;
  border: 1px solid #d8d8d8;
  border-radius: 6px;
  padding: 0 14px;
  background: #fffdfb;
  font-size: 14px;
  color: #333;
  outline: none;
}

.input-group input::placeholder {
  color: #9b9b9b;
}

.password-field {
  position: relative;
  display: flex;
  align-items: center;
}

.password-field input {
  padding-right: 42px;
}

.eye-icon {
  position: absolute;
  right: 12px;
  width: 18px;
  height: 18px;
  object-fit: contain;
  cursor: pointer;
}

.signup-btn {
  margin-top: 12px;
  width: 100%;
  height: 42px;
  border: none;
  border-radius: 4px;
  background: #071635;
  color: white;
  font-size: 18px;
  font-weight: 500;
  cursor: pointer;
}

.signup-btn:hover {
  background: #0c2347;
}

/* Laptop */
@media (max-width: 1200px) {
  .signup-content h1 {
    font-size: 30px;
  }
}

/* Tablet */
@media (max-width: 900px) {
  .signup-content h1 {
    font-size: 28px;
    margin-bottom: 28px;
  }

  .input-group label {
    font-size: 16px;
  }

  .name-row {
    gap: 16px;
  }
}

/* Mobile */
@media (max-width: 600px) {
  .signup-content h1 {
    font-size: 26px;
  }

  .name-row {
    flex-direction: column;
    gap: 18px;
  }

  .signup-btn {
    font-size: 16px;
  }
}
</style>