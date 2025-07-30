//***** LES VARIABLES GLOBALES *****//
// --- Coût en PM ou PR pour activer un bonus ---
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
let prPerSec = 0; // Nombre de PR par secondes

// --- Varibles correspondant aux différents bugs ---
let isClickingEnable = true; // Pour le malus "Bug sur le site"
let clicksRemainingForMalus = 0; // Pour le malus "offre sans réponse"
let originalPmPerClick = 0; // Pour stocker les PM avant malus
let originalPassiveBonusPR = 0; // Pour stocker les PR avant malus

const mainClickButton = document.getElementById("btnAddPM"); // bouton "Je postule !"
//* Fonction pour désactiver/activer les clics sur le bouton principal
function disableClics(disable) {
  if (mainClickButton) {
    mainClickButton.disable = disable;
  }
}

//* Clic principal >>> +1 PM à chaque clic au début
function jobClicker() {
  if (!isClickingEnable) {
    updateInformations("Tu ne peux pas cliquer pour l'instant ! ⛔");
    return;
  }

  // Logique spécifique au malus "Offre sans réponse"
  if (clicksRemainingForMalus > 0) {
    clicksRemainingForMalus--;
    updateInformations(
      `PM bloqués... ${clicksRemainingForMalus} clics restants.`
    );
    if (clicksRemainingForMalus <= 0) {
      pmPerClick = originalPmPerClick;
      updateInformations("Tu reprends confiance, les gains de PM reviennent !");
    }
    // ne gagne pas de motivation si bliqué par ce malus
    return;
  }

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

let socialnetButtonsCreated = false;
let isSocialNetworkActive = false;
const socialActivationBtn = document.getElementById("btnSocialActivation"); // bouton "J'active mon réseau"

//* Activation du réseau social
function activateSocial() {
  isSocialNetworkActive = true;
  console.log("Réseau social activé : ", isSocialNetworkActive);
}

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

//* Créer et configurer le bouton du script automatique (auto-clicker)
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

//* Fonction pour appliquer un malus chargé depuis le JSON
function applyMalus(malusID) {
  const malus = loadedMalusData.find((malus) => malus.id === malusID);
  if (!malus) {
    console.error(`Malus avec l'ID ${malusID} non trouvé !`);
    return;
  }

  // Affiche la description du malus
  updateInformations(malus.description);

  switch (malus.type) {
    case "multiply":
      originalPmPerClick = pmPerClick;
      pmPerClick *= malus.value;
      setTimeout(() => {
        pmPerClick = originalPmPerClick;
        updateInformations(malus.onEndMessage);
        displayUpdate();
      }, malus.durationMs);
      break;

    case "disable_clicks":
      disableClics(true);
      setTimeout(() => {
        disableClics(false);
        updateInformations(malus.onEndMessage);
        displayUpdate();
      }, malus.durationMs);
      break;

    case "clicks_blocked_count":
      originalPmPerClick = pmPerClick;
      pmPerClick = malus.valus;
      clicksRemainingForMalus = malus.clicksCount;
      break;

    case "multipliers_combined":
      originalPmPerClick = pmPerClick;
      originalPassiveBonusPR = prPerSec;
      malus.effects.forEach((effect) => {
        if (effect.target === "pmPerClick") pmPerClick *= effect.value;
        if (effect.target === "prPerSec") prPerSec *= effect.value;
      });
      setTimeout(() => {
        pmPerClick = originalPmPerClick;
        prPerSec = originalPassiveBonusPR;
        updateInformations(malus.onEndMessage);
        displayUpdate();
      }, malus.durationMs);
      break;

    case "fixed_loss_and_block":
      if (malus.prLoss) {
        social = Math.max(0, social - malus.prLoss); // pour que social ne soit pas < 0
      }
      originalPmPerClick = pmPerClick;
      originalPassiveBonusPR = prPerSec;
      malus.blockTarget.forEach((target) => {
        if (target === "pmPerClick") pmPerClick = 0;
        if (target === "prPerSec") prPerSec = 0;
      });
      setTimeout(() => {
        pmPerClick = originalPmPerClick;
        prPerSec = originalPassiveBonusPR;
        updateInformations(malus.onEndMessage);
        displayUpdate();
      }, malus.durationMs);
      break;

    default:
      console.warn(`type de malus inconnu : ${malus.type}`);
      break;
  }
  displayUpdate();
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
mainClickButton.addEventListener("click", () => jobClicker());

// Active l'inscription au truc du travail
AdminActiveBtn.addEventListener("click", () => TTJactivated());

// Active le réseau social
socialActivationBtn.addEventListener("click", () => createSocialNetwork());

// Variable pour stocker les malus chargé sous forme d'un tableau (viennent de malus.json)
let loadedMalusData = [];

//* Fonction pour charger les malus
async function loadMalusData() {
  try {
    const response = await fetch("malus.json");
    // Vérifier si la requête a réussi (status 200 OK)
    if (!response.ok)
      throw new Error(
        `Erreur de chargement des malus: ${response.status} ${response.statusText}`
      );

    loadedMalusData = await response.json();
    console.log("Malus chargés avec succès :", loadedMalusData); // pour dire quel malus est chargé
  } catch (error) {
    console.log("Erreur lors du chargement des malus : ", error);
    updateInformations("Erreur de chargement des malus du jeu : 😱");
  }
}

//* --- Initialisation au chargement du DOM ---
document.addEventListener("DOMContentLoaded", () => {
  displayUpdate(); // Appel initial pour s'assurer que les scores sont à jour
  socialActivationBtn.innerHTML = `J'active mon réseau </br> (${socialCost} PM)`;
  // Cache la boutique au démarrage
  if (shoppingListSection) {
    shoppingListSection.style.display = "none";
  }

  // Charger les malus
  loadMalusData();

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
