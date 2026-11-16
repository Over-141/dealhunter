
/*
 * DealHunter - Assistant
 * Première base du bot
 */

const DealHunterBot = {
  name: "DealHunter AI",

  init() {
    console.log("DealHunter AI est prêt !");

    this.createButton();
  },

  createButton() {
    if (document.getElementById("dealhunter-bot-button")) return;

    const button = document.createElement("button");
    button.id = "dealhunter-bot-button";
    button.textContent = "🤖 Assistant DealHunter";

    button.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 9999;
      padding: 15px 20px;
      border: none;
      border-radius: 30px;
      background: #2563eb;
      color: white;
      font-size: 15px;
      font-weight: bold;
      cursor: pointer;
      box-shadow: 0 4px 15px #0004;
    `;

    button.addEventListener("click", () => {
      alert("Bienvenue sur DealHunter AI ! 🚀");
    });

    document.body.appendChild(button);
  }
};

document.addEventListener("DOMContentLoaded", () => {
  DealHunterBot.init();
});
