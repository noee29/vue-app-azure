<template>
  <header class="header">
    <div class="logo">SmartCV</div>

    <nav>
      <a href="#">Accueil</a>
      <a href="#">Générer</a>
      <a href="#">Historique</a>
      <a href="#">Login</a>
      <a href="#">Register</a>
      <a href="#">Logout</a>
    </nav>
  </header>
</template>

<style scoped>
.header {
  height: 60px;
  background: #0f172a;
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 40px;
}

.logo {
  font-weight: bold;
  font-size: 18px;
}

nav {
  display: flex;
  gap: 24px;
}

a {
  color: white;
  text-decoration: none;
}

a:hover {
  opacity: 0.7;
}
</style>
