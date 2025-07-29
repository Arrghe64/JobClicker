//***** LES VARIABLES GLOBALES *****//

let social = 0;
// Nombre de points gagnés par clic
let prPerClick = 0;
let passiveBonusPR = 0;

let malusActif = false; // Activation d'un malus

//* Clic principal >>> +1 PM à chaque clic au début
let motivation = 0;
let pmPerClick = 1;
function jobClicker() {
  motivation += pmPerClick;
  displayUpdate();
}

//* Inscription à Touve-Ton-Job
let jobadminRegistration = false;
let motivationBtnCreated = false; // activation des boutons réseau
const betterMotivSection = document.getElementById("betterMotivationSection"); // section motivation
const betterSocialSection = document.getElementById("betterSocialSection"); // section réseau
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
      updateInfo("Ton CV est plus solide 💼 (niveau de motivation +1) !");
    } else {
      updateInfo("Tu manques de motivation ! 😵");
    }
  });

  btnLM.addEventListener("click", () => {
    if (motivation >= 50) {
      motivation -= 50;
      pmPerClick += 1;
      displayUpdate();
      updateInfo(
        "Ta lettre de motivation est plus percutante ✉️ (motivation +1) !"
      );
    } else {
      updateInfo("Tu manques de motivation ! 😵");
    }
  });

  // Ajouter les boutons au DOM
  betterMotivSection.appendChild(btnCV);
  betterMotivSection.appendChild(btnLM);
}

//* Activation du réseau social
let socialActiveted = false;
function activateSocial() {
  socialActiveted = true;
}

//* Céer les boutons du réseau social
let socialnetButtonsCreated = false;
function createSocialNetwork() {
  socialnetButtonsCreated = true;
}

//* Centraliser les messages
function updateInformations(message) {
  document.querySelector(".information").textContent = message;
  message.classList.add("informations");
}

//* Mise à jour de l'affichage
const PMdisplay = document.getElementById("scorePM"); // score PM
const PRdisplay = document.getElementById("scorePR"); // score PR
const PMlevelDisplay = document.getElementById("levelPM"); // niveau (x le nbr de PM par clic)
const AdminActiveBtn = document.getElementById("btnJobAgencyRegistration");
const socialActivationBtn = document.getElementById("btnSocialActivation");
// Les achats
let shoppingClickScript = false; // script automatique
let onlineCourse = false; // cours en ligne
let webinarCourse = false; // webbinaire
let certificationCourse = false; // formation certifiante
function displayUpdate() {
  PMdisplay.textContent = motivation.toFixed(); // Maj des PM
  PRdisplay.textContent = social.toFixed(); // Maj des PR
  PMlevelDisplay.textContent = Math.floor(pmPerClick); // Maj du niveau de PM

}

// Bouton Job Clicker
const addPmPerClick = document.getElementById("btnAddPM"); // bouton "Je postule !"
addPmPerClick.addEventListener("click", () => jobClicker());

// Active l'inscription au truc du travail
AdminActiveBtn.addEventListener("click", () => TTJactivated());

// Active le réseau social
socialActivationBtn.addEventListener("click", () => createSocialNetwork());
