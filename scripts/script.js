//***** LES VARIABLES GLOBALES *****//

let social = 0;
// Nombre de points gagnés par clic
let prPerClick = 0;
let passiveBonusPR = 0;
let malusActif = false; // Activation d'un malus

let motivation = 0;
let pmPerClick = 1;
//* Clic principal >>> +1 PM à chaque clic au début
function jobClicker() {
  motivation += pmPerClick;
  displayUpdate();
}

let jobadminRegistration = false;
let motivationBtnCreated = false; // activation des boutons réseau
const betterMotivSection = document.getElementById("betterMotivationSection"); // section motivation
const betterSocialSection = document.getElementById("betterSocialSection"); // section réseau

//* Inscription à Touve-Ton-Job
function TTJactivated() {
  if (motivationBtnCreated) return;
  // inscription TTJ vrai + affichage
  jobadminRegistration = true;
  document.getElementById("agencyRegist").textContent = "OUI";

  // Modification du texte du bouton
  const btnJobAgencRegist = document.getElementById("btnJobAgencyRegistration");
  btnJobAgencRegist.innerHTML = `Inscription TROUVE TON JOB <strong>OK</strong> `;
  btnJobAgencRegist.classList.add("agency-regist");

  motivationBtnCreated = true;

  // Création des boutons de motivation (CV, LM)
  const btnCV = document.createElement("button");
  btnCV.textContent = `J'améliore mon CV (20PM)`;
  btnCV.classList.add("click-button");
  btnCV.style.backgroundColor = "#90ee90";

  const btnLM = document.createElement("button");
  btnLM.textContent = `J'améliore ma lettre de motivation (50PM)`;
  btnLM.classList.add("click-button");
  btnLM.style.backgroundColor = "#90ee90";

  // Action des boutons
  btnCV.addEventListener("click", () => {
    if (motivation >= 20) {
      motivation -= 20;
      pmPerClick += 1;
      displayUpdate();
      updateInformations(
        "Ton CV est plus solide 💼 (niveau de motivation +1) !"
      );
    } else {
      updateInformations("Tu manques de motivation ! 😵");
    }
  });

  btnLM.addEventListener("click", () => {
    if (motivation >= 50) {
      motivation -= 50;
      pmPerClick += 1;
      displayUpdate();
      updateInformations(
        "Ta lettre de motivation est plus percutante ✉️ (motivation +1) !"
      );
    } else {
      updateInformations("Tu manques de motivation ! 😵");
    }
  });

  // Ajouter les boutons au DOM
  betterMotivSection.appendChild(btnCV);
  betterMotivSection.appendChild(btnLM);
}

let socialActiveted = false;
//* Activation du réseau social
function activateSocial() {
  socialActiveted = true;
}

let socialnetButtonsCreated = false;
//* Céer les boutons du réseau social
function createSocialNetwork() {
  socialnetButtonsCreated = true;
}

const btnAutoclicScript = document.createElement("button");
let shoppingClickScript = false; // script automatique

//* Créer le bouton du script automatique
function setupAutoclicButton() {
  btnAutoclicScript.textContent = `J'achète un script auto-clic (500 PM)`;
  btnAutoclicScript.classList.add("click-button");
  btnAutoclicScript.style.backgroundColor = "#ff7b00";

  btnAutoclicScript.addEventListener("click", () => {
    if (motivation >= 300) {
      motivation -= 300;
      shoppingClickScript = true;
      updateInformations("Clic automatique activé ! 🤖");
      displayUpdate();
      startautoclick(); // Fonction pour démarrer le clic automatique
      btnAutoclicScript.disabled = true;
      btnAutoclicScript.textContent = "Clic automatique (Activé)";
    } else {
      updateInformations(
        "Pas assez de motivation pour activer le script auto-clic !"
      );
    }
  });
}

//* Fonction de démarrage de l'auto-clic
let autoclickInterval;
function startautoclick() {
  if (!autoclickInterval) {
    autoclickInterval = setInterval(() => {
      motivation += 1;
      displayUpdate();
    }, 1000);
  }
}

// Variables pour suivre si la boutique et le bouton autoclic ont déjà été affichés/créés
let shopDisplayed = false;
let autoclickBtnConfigured = false;

// Eléments du DOM à afficher
const PMdisplay = document.getElementById("scorePM"); // score PM
const PRdisplay = document.getElementById("scorePR"); // score PR
const PMlevel = document.getElementById("levelPM"); // niveau (x le nbr de PM par clic)
const AdminActiveBtn = document.getElementById("btnJobAgencyRegistration");
const socialActivationBtn = document.getElementById("btnSocialActivation");
const shoppingListSection = document.querySelector(".shopping-list");

//* Mise à jour de l'affichage
function displayUpdate() {
  // Mise à jour des différents points, niveaux
  PMdisplay.textContent = motivation.toFixed(); // Maj des PM
  PRdisplay.textContent = social.toFixed(); // Maj des PR
  PMlevel.textContent = Math.floor(pmPerClick); // Maj du niveau de PM

  // --- Gestion de l'affichage BOUTIQUE ---
  if (motivation >= 200 && pmPerClick >= 10 && !shopDisplayed) {
    if (shoppingListSection) {
      shoppingListSection.style.display = "block";
      document.getElementById("clicScript").style.display = "block";
      shopDisplayed = true; // Pour marquer la boutique comme "Affichée"

      // --- Configurer et ajouter le bouton autoclic si ce n'est pas fait ---
      if (!autoclickBtnConfigured) {
        setupAutoclicButton(); // Appel de la fonction d'autoclic
        betterMotivSection.appendChild(btnAutoclicScript); // Ajout du bouton d'auto-script
      }
    }
  }
}

//* Centraliser les messages
function updateInformations(message) {
  document.querySelector(".informations").textContent = message;
  message.classList.add("informations");
}

// Bouton Job Clicker
const addPmPerClick = document.getElementById("btnAddPM"); // bouton "Je postule !"
addPmPerClick.addEventListener("click", () => jobClicker());

// Active l'inscription au truc du travail
AdminActiveBtn.addEventListener("click", () => TTJactivated());

// Active le réseau social
socialActivationBtn.addEventListener("click", () => createSocialNetwork());
