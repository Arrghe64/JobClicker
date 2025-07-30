//***** LES VARIABLES GLOBALES *****//
// Coût en PM ou PR pour activer un bonus
const autoclickCost = 300; //! PM pour activer l'autoclic : 300
const socialCost = 100; //! PM pour activer le réseau : 100
const commentPostCost = 300; //! PM pour commenter un post : 300
const publishPostCost = 75; //! PR pour publier un post : 75

let motivation = 0;
let pmPerClick = 1;
let social = 0;
let prPerClick = 0;
let autoClickerGain = 1; //! ou pmPerClick (nombre de PM par clic, donne le niveau de motivation)
let passiveBonusPR = 0;
let malusActif = false; // Activation d'un malus

//* Clic principal >>> +1 PM à chaque clic au début
function jobClicker() {
  motivation += pmPerClick;
  displayUpdate();
}

let jobadminRegistration = false;
let motivationBtnCreated = false; // activation des boutons réseau
const betterMotivSection = document.getElementById("betterMotivationSection"); // section motivation
const betterSocialSection = document.getElementById("betterSocialSection"); // section affichage réseau

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

let isSocialNetworkActive = false;
//* Activation du réseau social
function activateSocial() {
  isSocialNetworkActive = true;
  console.log("Réseau social activé : ", isSocialNetworkActive);
}

const socialActivationBtn = document.getElementById("btnSocialActivation"); // bouton "J'active mon réseau"
let socialnetButtonsCreated = false;

//* Céer le réseau social, les boutons et la logique
function createSocialNetwork() {
  // VÉRIFICATION : Est-ce que "Trouve Ton Job" est activé ?
  if (!jobadminRegistration) {
    updateInformations("Tu dois d'abord t'inscrire à TROUVE TON JOB ! 📝");
    return; // arrêt si TTJ pas activé
  }

  // Empêche la recréation des boutons
  if (socialnetButtonsCreated) {
    updateInformations("Réseau social déjà activé ! 👥");
    return;
  }

  // Condition d'activatoin de la section sociale
  if (motivation >= socialCost) {
    motivation -= socialCost;
    socialActivationBtn.style.backgroundColor = "#ffa500";
    document.getElementById("socialActivated").textContent = "OUI";

    activateSocial();
    // isSocialNetworkActive = true; // marquer le réseau social comme actif
    socialnetButtonsCreated = true; // Marquer les boutons comme créés

    // --- Créer les boutons en lien avec le réseau social
    // Commenter un post >>> gain = +5PR/s pendant 20s
    const btnPostComment = document.createElement("button");
    btnPostComment.textContent = `Commenter un post (${commentPostCost} PM)`;
    btnPostComment.classList.add("click-button");
    btnPostComment.style.backgroundColor = "#c3ff00";
    btnPostComment.addEventListener("click", () => {
      if (motivation >= commentPostCost) {
        motivation -= commentPostCost;
        startPassiveEfects({
          duration: 20000, //20s
          interval: 1000, //1s
          effect: () => {
            social += 5;
            displayUpdate();
          },
          onEnd: () => {
            updateInformations("L'effet de ton commentaire s'estompe... 😶‍🌫️");
          },
        });
        updateInformations("Ton post fait réagir : +5 PR/s pendant 20s 🔥");
        displayUpdate();
      } else {
        updateInformations("Pas assez de motivation pour commenter ce post 😓");
      }
    });

    // Ajouter un post >>> gain +10PR/min (après on ajoute 1 aux gains PR >>> +11, +12 etc...)
    let postCooldown = false; // Temps entre chaque publication activé

    const btnPostPublish = document.createElement("button");
    btnPostPublish.innerHTML = `Publier un post <br> (${publishPostCost} PR)`;
    btnPostPublish.classList.add("click-button");
    btnPostPublish.style.backgroundColor = "#c3ff00";

    btnPostPublish.addEventListener("click", () => {
      if (postCooldown) {
        updateInformations("Tu viens de publier, attends un peu ⏳");
        return;
      }

      if (social >= publishPostCost) {
        social -= publishPostCost;
        passiveBonusPR += 1; //gain passif de PR
        postCooldown = true;
        updateInformations("Ton post fait le buzz ! PR/min +1 🔁");
        displayUpdate();

        // Cooldown de 3 secondes
        setTimeout(() => {
          postCooldown = false;
        }, 3000);
      } else {
        updateInformations("Pas assez de point réseau pour publier ce post 😓");
      }
    });

    // Ajouter les boutons au DOM
    betterSocialSection.appendChild(btnPostComment);
    betterSocialSection.appendChild(btnPostPublish);
    // changer le texte du bouton d'activation du réseau social une fois activé
    socialActivationBtn.innerHTML = `Réseau social activé <br><strong>OK</strong>`;
  } else {
    updateInformations(
      `Tu as besoin de ${socialCost} PM pour activer ton réseau ! 😔`
    );
  }
  displayUpdate();
}

//* Fonction pour gérer les effets passifs temporaires
function startPassiveEfects({ duration, interval, effect, onEnd }) {
  const effectInterval = setInterval(effect, interval);
  setTimeout(() => {
    clearInterval(effectInterval);
    if (onEnd) onEnd();
  }, duration);
}

//* Lancer la possibilité de publier un post régulièrement
setInterval(() => {
  if (passiveBonusPR > 0) {
    social += passiveBonusPR;
    displayUpdate();
  }
}, 30000);

// Déclaration globale du bouton autoclic
const btnAutoclicScript = document.createElement("button");
let shoppingClickScript = false; // script automatique

//* Créer et configurer le bouton du script automatique
function setupAutoclicButton() {
  btnAutoclicScript.textContent = `J'achète un script auto-clic (300 PM)`;
  btnAutoclicScript.classList.add("click-button");
  btnAutoclicScript.style.backgroundColor = "#ffa500";

  btnAutoclicScript.addEventListener("click", () => {
    if (motivation >= autoclickCost) {
      motivation -= autoclickCost;
      shoppingClickScript = true; // Active le flag de l'autoclic
      updateInformations("Clic automatique activé ! 🤖");
      startautoclick(); // Démarre le clic automatique
      btnAutoclicScript.disabled = true; // Désactive le bouton
      btnAutoclicScript.textContent = "Clic automatique (Activé)"; // Change le texte du bouton
      btnAutoclicScript.style.backgroundColor = "#ffb381";
      displayUpdate();
    } else {
      updateInformations(
        "Pas assez de motivation pour activer le script auto-clic ! 😔"
      );
    }
  });
}

//* Fonction de démarrage de l'auto-clic
let autoclickInterval;
function startautoclick() {
  // S'assure que l'intervalle n'est démarré qu'une fois
  if (!autoclickInterval) {
    autoclickInterval = setInterval(() => {
      motivation += autoClickerGain;
      displayUpdate();
    }, 1000); // Clique toutes les secondes (1000ms)
  }
}

// Variables pour suivre si la boutique et le bouton autoclic ont déjà été affichés/créés
let shopDisplayed = false;
let autoclickBtnConfigured = false; // Cette variable doit passer à true après la conf et l'ajout

// Eléments du DOM à afficher
const PMdisplay = document.getElementById("scorePM"); // score PM
const PRdisplay = document.getElementById("scorePR"); // score PR
const PMlevelDisplay = document.getElementById("levelPM"); // niveau (x le nbr de PM par clic)
const AdminActiveBtn = document.getElementById("btnJobAgencyRegistration"); // bouton Trouve Ton Job
const shoppingListSection = document.querySelector(".shopping-list"); // affichage de la boutique
const clicScriptP = document.getElementById("clicScript"); // affichage de la disponibilité de l'autoclic

//* Mise à jour de l'affichage
function displayUpdate() {
  // Mise à jour des différents points, niveaux
  PMdisplay.textContent = motivation.toFixed(); // Maj des PM
  PRdisplay.textContent = social.toFixed(); // Maj des PR
  PMlevelDisplay.textContent = Math.floor(pmPerClick); // Maj du niveau de PM

  // --- Gestion de l'affichage BOUTIQUE ---
  if (motivation >= 200 && !shopDisplayed) {
    if (shoppingListSection) {
      shoppingListSection.style.display = "block";
      shopDisplayed = true; // Pour marquer la boutique comme "Affichée"
    }
    if (clicScriptP) clicScriptP.style.display = "block";
    betterMotivSection.appendChild(btnAutoclicScript); // ajoute le bouton au DOM
  }

  // --- Affichage et ajout du bouton autoclic à 300 PM
  if (motivation >= 300 && !autoclickBtnConfigured) {
    if (clicScriptP) clicScriptP.style.display = "block";
    setupAutoclicButton(); // configure le bouton
    autoclickBtnConfigured = true; // marque le bouton comme configuré et ajouté
  }

  // Affichage des autres éléments
  if (motivation >= 500) {
    const formationP = document.getElementById("formation");
    formationP.style.display = "block";
  }
  if (motivation >= 750) {
    const webinaireP = document.getElementById("webinaire");
    webinaireP.style.display = "block";
  }
  if (motivation >= 1000) {
    const certificationP = document.getElementById("certification");
    certificationP.style.display = "block";
  }
}

//* Centraliser les messages
function updateInformations(message) {
  const infoDisplayElement = document.querySelector(".informations");
  if (infoDisplayElement) {
    infoDisplayElement.textContent = message;
    infoDisplayElement.classList.add("informations");
  }
}

// Bouton Job Clicker
const addPmPerClick = document.getElementById("btnAddPM"); // bouton "Je postule !"
addPmPerClick.addEventListener("click", () => jobClicker());

// Active l'inscription au truc du travail
AdminActiveBtn.addEventListener("click", () => TTJactivated());

// Active le réseau social
socialActivationBtn.addEventListener("click", () => createSocialNetwork());

// --- Initialisation au chargement du DOM ---
document.addEventListener("DOMContentLoaded", () => {
  displayUpdate(); // Appel initial pour s'assurer que les scores sont à jour
  socialActivationBtn.innerHTML = `J'active mon réseau </br> (${socialCost} PM)`;
  // Cache la boutique au démarrage
  if (shoppingListSection) {
    shoppingListSection.style.display = "none";
  }
  // Assure-toi que les éléments de la boutique sont aussi cachés par défaut si besoin
  if (document.getElementById("clicScript"))
    document.getElementById("clicScript").style.display = "none";
  if (document.getElementById("formation"))
    document.getElementById("formation").style.display = "none";
  if (document.getElementById("webinaire"))
    document.getElementById("webinaire").style.display = "none";
  if (document.getElementById("certification"))
    document.getElementById("certification").style.display = "none";
});
