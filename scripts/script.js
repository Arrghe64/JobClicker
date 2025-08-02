//***** LES VARIABLES GLOBALES *****//
// --- Coût en PM ou PR pour activer un bonus ---
const autoclickCost = 300; //! PM pour activer l'autoclic : 300
const socialCost = 100; //! PM pour activer le réseau : 100
const commentPostCost = 300; //! PM pour commenter un post : 300
const publishPostCost = 75; //! PR pour publier un post : 75
const bestCvCost = 20; //! PM pour améliorer le CV : 20
const bestMlCost = 50; //! PM pour améliorer la LM : 50

// --- Variables principales ---
let motivation = 0;
let pmPerClick = 1; // nb de pts/clic >>> donne le niveau de motivation
let social = 0;
let prPerClick = 0; //'
let autoClickerGain = 1; // ou pmPerClick (nombre de PM par clic, donne le niveau de motivation)
let passiveBonusPR = 0;
let malusActif = false; // Activation d'un malus
let prPerSec = 0; // Nombre de PR par secondes
const defaultMessage =
  "post, postER, posTALE, 😕 poSTICHE, 😠 pOSTURE, POSTULE";

// --- Varibles correspondant aux différents bugs ---
let isClickingEnable = true; // Pour le malus "Bug sur le site"
let clicksRemainingForMalus = 0; // Pour le malus "offre sans réponse"
let malusIntervalId = null;
const requiredPMForMalus = 150; //! 150
let originalPmPerClick = 0; // Pour stocker les PM avant malus
let originalPassiveBonusPR = 0; // Pour stocker les PR avant malus
let originalAutoClickerGain = 0; // Pour stocker l'autolick

// --- Variables pour suivre les activations, affichages et créations ---
let shopDisplayed = false;
let autoclickBtnConfigured = false; // Cette variable doit passer à true après la conf et l'ajout
let jobadminRegistration = false; // activation de l'inscription à TTJ
let motivationBtnCreated = false; // activation des boutons réseau

// --- Eléments du DOM ---
const PMdisplay = document.getElementById("scorePM"); // score PM
const PRdisplay = document.getElementById("scorePR"); // score PR
const PMlevelDisplay = document.getElementById("levelPM"); // niveau (x le nbr de PM par clic)
const AdminActiveBtn = document.getElementById("btnJobAgencyRegistration"); // bouton Trouve Ton Job
const shoppingListSection = document.querySelector(".shopping-list"); // affichage de la boutique
const clicScriptP = document.getElementById("clicScript"); // affichage de la disponibilité de l'autoclic
const betterMotivSection = document.getElementById("betterMotivationSection"); // section motivation
const betterSocialSection = document.getElementById("betterSocialSection"); // section affichage réseau
const mainClickButton = document.getElementById("btnAddPM"); // bouton "Je postule !"

//* Clic principal >>> +1 PM à chaque clic au début
function jobClicker() {
  if (malusActif) {
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

//* Fonction pour désactiver/activer les clics sur le bouton principal
function disableAllInteractions(disable) {
  malusActif = disable; // Met à jour l'état global du malus

  // Sélectionne tous les éléments interactifs du jeu
  const interactiveElements = document.querySelectorAll(
    "button, a.action-button, a.shop-btn" // Ajoute ici toutes les balises/classes de tes éléments cliquables
  );

  interactiveElements.forEach((element) => {
    element.disabled = disable; // Désactive ou active le bouton
    if (disable) {
      element.style.pointerEvents = "none"; // Empêche les événements de souris
      element.style.opacity = "0.7"; // Indique visuellement que c'est désactivé
      element.style.cursor = "not-allowed"; // Change le curseur
    } else {
      element.style.pointerEvents = "auto"; // Réactive les événements de souris
      element.style.opacity = "1"; // Rétablit l'opacité normale
      element.style.cursor = "pointer"; // Rétablit le curseur normal
    }
  });

  // Gérer spécifiquement le clic automatique
  if (disable) {
    stopautoclick(); // Arrête le clic automatique
  } else {
    // Redémarre le clic automatique uniquement si le bonus est actif
    if (shoppingClickScript) {
      // shoppingClickScript est ta variable qui indique si l'autoclic a été acheté
      startautoclick();
    }
  }
}

//* Centraliser les messages
function updateInformations(message) {
  const infoDisplayElement = document.querySelector(".informations");
  if (infoDisplayElement) {
    infoDisplayElement.textContent = message;
  }
}

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

  // startMalusTimerIfReady();
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

//* Fonction de démarrage de l'auto-clic
let autoclickInterval = null;
function startautoclick() {
  // S'assure que l'intervalle n'est démarré qu'une fois
  if (!autoclickInterval) {
    autoclickInterval = setInterval(() => {
      if (!malusActif) {
        motivation += autoClickerGain;
        displayUpdate();
      }
    }, 1000); // Clique toutes les secondes (1000ms)
  }
}

function stopautoclick() {
  if (autoclickInterval) {
    clearInterval(autoclickInterval);
    autoclickInterval = null;
  }
}

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
  btnCV.innerHTML = `J'améliore mon CV <br> (${bestCvCost} PM)`;
  btnCV.classList.add("click-button");
  btnCV.style.backgroundColor = "#90ee90";

  const btnLM = document.createElement("button");
  btnLM.innerHTML = `J'améliore ma lettre de motivation (${bestMlCost} PM)`;
  btnLM.classList.add("click-button");
  btnLM.style.backgroundColor = "#90ee90";

  // Action des boutons
  btnCV.addEventListener("click", () => {
    if (motivation >= bestCvCost) {
      motivation -= bestCvCost;
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
    if (motivation >= bestMlCost) {
      motivation -= bestMlCost;
      startPassiveEfects({
        duration: 5000,
        interval: 500,
        effect: () => {
          const multiplier = malusActif ? 0.5 : 1;
          social += 2 * multiplier;
          displayUpdate();
        },
        onEnd: () => {
          updateInformations(
            "Ta lettre de motivation est plus percutante ✉️ (motivation +1) !"
          );
        },
      });
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
            const multiplier = malusActif ? 0.5 : 1;
            social += 5 * multiplier;
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
        }, 30000);
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

// Déclaration globale du bouton autoclic
const btnAutoclicScript = document.createElement("button");
let shoppingClickScript = false; // script automatique

//* Créer et configurer le bouton du script automatique (auto-clicker)
function setupAutoclicButton() {
  btnAutoclicScript.textContent = `J'achète un script auto-clic (${autoclickCost} PM)`;
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

//* Fonction pour appliquer un malus chargé depuis le JSON
function applyMalus(malusID) {
  const malus = loadedMalusData.find((m) => m.id === malusID);
  if (!malus) {
    console.error(`Malus avec l'ID ${malusID} non trouvé !`);
    return;
  }
  console.log(`Malus avec l'ID ${malusID} a été trouvé`);

  // Affiche la description du malus
  updateInformations(malus.description);

  switch (malus.id) {
    case "justificatif_demande":
      if (malus.target === "motivation") {
        motivation = Math.max(0, motivation * (1 - malus.value));
        updateInformations(malus.description);
        displayUpdate();
        setTimeout(() => {
          if (!jobadminRegistration) {
            updateInformations(
              "Inscris toi à TROUVE TON JOB pour débloquer les bonus"
            );
          } else {
            updateInformations(defaultMessage);
          }
        }, 5000);
      }
      break;

    case "bug_site":
      disableAllInteractions(true);
      setTimeout(() => {
        disableAllInteractions(false);
        updateInformations(malus.onEndMessage);
        displayUpdate();
      }, malus.durationMs);
      break;

    case "offre_sans_reponse":
      originalPmPerClick = pmPerClick;
      pmPerClick = malus.value;
      clicksRemainingForMalus = malus.clicksCount;

      if (shoppingClickScript && malus.durationMs) {
        stopautoclick();
        setTimeout(() => {
          startautoclick();
          updateInformations("L'auto-clic est de nouveau actif ! 👌");
        }, malus.durationMs);
      }
      break;

    case "annonce_fake":
      malus.effects.forEach((effect) => {
        if (effect.target === "motivation") motivation *= effect.value;
        if (effect.target === "social") social *= effect.value;
        if (effect.target === "autoClickerGain") stopautoclick();
      });

      setTimeout(() => {
        startautoclick();
        updateInformations(malus.onEndMessage);
        displayUpdate();
      }, malus.durationMs);
      break;

    case "refus_automatique":
      social = Math.max(0, social - malus.prLoss);
      pmPerClick *= malus.pmPerClickMalus;
      break;

    default:
      console.warn(`type de malus inconnu : ${malus.type}`);
      break;
  }
  malusActif = false;
  displayUpdate();
}

// Variable pour stocker les malus chargé sous forme d'un tableau (viennent de malus.json)
let loadedMalusData = [];

//* Fonction pour charger les malus
async function loadMalusData() {
  try {
    const response = await fetch("scripts/malus.json");
    // Vérifier si la requête a réussi (status 200 OK)
    if (!response.ok)
      throw new Error(
        `Erreur de chargement des malus: ${response.status} ${response.statusText}`
      );

    loadedMalusData = await response.json();
    console.log("Malus chargés avec succès :", loadedMalusData.length); // pour dire quel malus est chargé
  } catch (error) {
    console.log("Erreur lors du chargement des malus : ", error);
    updateInformations("Erreur de chargement des malus du jeu : 😱");
  }
  startMalusTimerIfReady();
}

//* Fonction pour tirer un malus au hasard
function triggerRandomMalus() {
  // Si un malus est déjà actif, on ne fait rien
  if (malusActif) return;
  // Si le tableau de malus est vide, on ne peut pas en piocher un malus
  if (loadedMalusData.length === 0) {
    console.warn("Le tableau de malus est vide...");
    return;
  }

  // Sélectionne un malus aléatoire dans le tableau loadedMalusData
  const randomIndex = Math.floor(Math.random() * loadedMalusData.length);
  const randomMalus = loadedMalusData[randomIndex];
  console.log("Malus : ", randomMalus);
  malusActif = true;
  // Appelle la fonction applyMalus avec l'ID du malus sélectionné
  applyMalus(randomMalus.id);
}

//* setInterval qui démarre les malus
setInterval(() => {
  if (motivation >= requiredPMForMalus) triggerRandomMalus();
}, 30000);

// Bouton Job Clicker
mainClickButton.addEventListener("click", () => jobClicker());

// Active l'inscription au truc du travail
AdminActiveBtn.addEventListener("click", () => {
  TTJactivated();
  updateInformations("Super t'es dans le système ! 📉");
});

// Active le réseau social
socialActivationBtn.addEventListener("click", () => createSocialNetwork());

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

  // S'assurer que les éléments de la boutique sont cachés par défaut
  if (document.getElementById("clicScript"))
    document.getElementById("clicScript").style.display = "none";
  if (document.getElementById("formation"))
    document.getElementById("formation").style.display = "none";
  if (document.getElementById("webinaire"))
    document.getElementById("webinaire").style.display = "none";
  if (document.getElementById("certification"))
    document.getElementById("certification").style.display = "none";

  // Ajouter un bouton temporaire pour tester les malus
  // const testMalusBtn = document.createElement("button");
  // testMalusBtn.textContent = "Déclencher Malus Test";
  testMalusBtn.addEventListener("click", () => {
    // Choisis un malus à déclencher pour tester
    // applyMalus("justificatif_demande");
    // applyMalus("bug_site");
    // applyMalus("offre_sans_reponse");
    // applyMalus("annonce_fake");
    // applyMalus("refus_automatique");
  });
  document.body.appendChild(testMalusBtn);
});
