
/* DEALHUNTER AI - VERSION 1 */

const DealHunterBot = {
  init() {
    this.createInterface();
  },

  createInterface() {
    if (document.getElementById("dh-chat-button")) return;

    const button = document.createElement("button");
    button.id = "dh-chat-button";
    button.textContent = "🤖 Assistant DealHunter";

    button.style.cssText = `
      position:fixed;
      bottom:22px;
      right:22px;
      z-index:99998;
      background:#2563eb;
      color:white;
      border:0;
      border-radius:30px;
      padding:15px 20px;
      font-weight:bold;
      cursor:pointer;
      box-shadow:0 5px 20px #0004;
    `;

    const chat = document.createElement("div");
    chat.id = "dh-chat-window";

    chat.style.cssText = `
      display:none;
      position:fixed;
      bottom:85px;
      right:20px;
      width:340px;
      max-width:calc(100vw - 40px);
      height:440px;
      max-height:65vh;
      background:#111827;
      border:1px solid #374151;
      border-radius:18px;
      z-index:99999;
      overflow:hidden;
      box-shadow:0 10px 35px #0006;
      color:white;
      font-family:Arial,sans-serif;
    `;

    chat.innerHTML = `
      <div style="background:#2563eb;padding:16px;
        display:flex;justify-content:space-between;align-items:center">
        <strong>🤖 DealHunter AI</strong>
        <button id="dh-close"
          style="background:none;border:0;color:white;font-size:22px">
          ×
        </button>
      </div>

      <div id="dh-messages" style="
        height:calc(100% - 130px);
        overflow-y:auto;padding:14px">
      </div>

      <form id="dh-form" style="
        position:absolute;bottom:0;left:0;right:0;
        display:flex;gap:6px;padding:10px;background:#1f2937">
        <input id="dh-input" placeholder="Pose ta question..."
          autocomplete="off" style="
          min-width:0;flex:1;padding:12px;border:0;
          border-radius:10px;background:#374151;color:white">
        <button type="submit" style="
          background:#2563eb;color:white;border:0;
          border-radius:10px;padding:10px 14px">➤</button>
      </form>
    `;

    document.body.append(button, chat);

    button.onclick = () => {
      chat.style.display =
        chat.style.display === "none" ? "block" : "none";
    };

    chat.querySelector("#dh-close").onclick = () => {
      chat.style.display = "none";
    };

    chat.querySelector("#dh-form").onsubmit = (e) => {
      e.preventDefault();

      const input = chat.querySelector("#dh-input");
      const message = input.value.trim();

      if (!message) return;

      this.addMessage(message, "user");
      input.value = "";

      this.reply(message);
    };

    this.addMessage(
      "Salut ! 👋 Je suis DealHunter AI. Je peux analyser tes affaires, calculer tes bénéfices et surveiller ton budget. Envoie-moi un lien Vinted ou pose-moi une question !",
      "bot"
    );
  },

  addMessage(message, sender) {
    const messages = document.getElementById("dh-messages");
    const bubble = document.createElement("div");

    bubble.textContent = message;

    bubble.style.cssText = `
      background:${sender === "user" ? "#2563eb" : "#263449"};
      padding:12px;border-radius:12px;margin-bottom:10px;
      margin-left:${sender === "user" ? "35px" : "0"};
      margin-right:${sender === "user" ? "0" : "35px"};
      overflow-wrap:anywhere;white-space:pre-wrap;
    `;

    messages.appendChild(bubble);
    messages.scrollTop = messages.scrollHeight;
  },

  getData() {
    return window.DealHunterData || null;
  },

  reply(message) {
    const text = message.toLowerCase();
    const data = this.getData();

    if (!data) {
      this.addMessage(
        "Je ne trouve pas les données du site. Vérifie l'étape 1 dans index.html.",
        "bot"
      );
      return;
    }

    const budget = data.getBudget();
    const deals = data.getDeals();

    const spent = deals.reduce(
      (sum, d) => sum + Number(d.buy) + Number(d.fees), 0
    );

    const profit = deals.reduce(
      (sum, d) => sum + Number(d.sell) -
        Number(d.buy) - Number(d.fees), 0
    );

    // Analyse d'un lien Vinted
    if (text.includes("vinted.fr") || text.includes("vinted.com")) {
      this.addMessage(
        "🔎 J'ai bien reçu ton lien !\n\n" +
        "Je ne peux pas encore récupérer automatiquement " +
        "les informations de Vinted.\n\n" +
        "Pour analyser cette annonce, renseigne le prix d'achat, " +
        "les frais et le prix de revente estimé dans " +
        "« Ajouter une affaire » sur ton site.\n\n" +
        "La récupération automatique sera ajoutée avec notre serveur sécurisé.",
        "bot"
      );
      return;
    }

    // Budget
    if (text.includes("budget") || text.includes("argent")) {
      this.addMessage(
        "💰 TON BUDGET\n\n" +
        "Budget initial : " + budget.toFixed(2) + " €\n" +
        "Dépenses : " + spent.toFixed(2) + " €\n" +
        "Disponible : " + (budget - spent).toFixed(2) + " €",
        "bot"
      );
      return;
    }

    // Nombre d'affaires
    if (text.includes("combien") || text.includes("affaires")) {
      this.addMessage(
        "📦 Tu as actuellement " + deals.length +
        " affaire(s) enregistrée(s) dans DealHunter.",
        "bot"
      );
      return;
    }

    // Meilleure affaire
    if (text.includes("meilleure") || text.includes("meilleur")) {
      if (!deals.length) {
        this.addMessage("Tu n'as pas encore ajouté d'affaire !", "bot");
        return;
      }

      const best = [...deals].sort(
        (a, b) =>
          (b.sell - b.buy - b.fees) -
          (a.sell - a.buy - a.fees)
      )[0];

      this.addMessage(
        "🏆 TA MEILLEURE AFFAIRE\n\n" +
        best.name + "\n" +
        "Bénéfice estimé : " +
        (best.sell - best.buy - best.fees).toFixed(2) + " €",
        "bot"
      );
      return;
    }

    // Bilan
    if (
      text.includes("bilan") ||
      text.includes("analyse mes") ||
      text.includes("analyse tout")
    ) {
      this.addMessage(
        "📊 BILAN DEALHUNTER\n\n" +
        "Affaires : " + deals.length + "\n" +
        "Dépenses : " + spent.toFixed(2) + " €\n" +
        "Bénéfice potentiel : " + profit.toFixed(2) + " €\n" +
        "Budget restant : " + (budget - spent).toFixed(2) + " €\n\n" +
        (profit > 0
          ? "🟢 Ton bilan potentiel est positif !"
          : profit < 0
            ? "🔴 Attention, ton bilan potentiel est négatif."
            : "🟡 Ton bénéfice potentiel est nul."),
        "bot"
      );
      return;
    }

    // Calcul rapide : analyse 5 20 2
    if (text.startsWith("analyse ")) {
      const numbers = message.match(/-?\d+(?:[.,]\d+)?/g);

      if (numbers && numbers.length >= 2) {
        const buy = Number(numbers[0].replace(",", "."));
        const sell = Number(numbers[1].replace(",", "."));
        const fees = numbers[2]
          ? Number(numbers[2].replace(",", "."))
          : 0;

        if (buy < 0 || sell < 0 || fees < 0) {
          this.addMessage("Les montants doivent être positifs.", "bot");
          return;
        }

        const result = sell - buy - fees;
        const margin = buy > 0 ? result / buy * 100 : 0;

        this.addMessage(
          "🔍 ANALYSE DE TON ARTICLE\n\n" +
          "Achat : " + buy.toFixed(2) + " €\n" +
          "Revente : " + sell.toFixed(2) + " €\n" +
          "Frais : " + fees.toFixed(2) + " €\n\n" +
          "Bénéfice estimé : " + result.toFixed(2) + " €\n" +
          "Rentabilité : " + margin.toFixed(1) + " %\n\n" +
          (result > 0
            ? "🟢 Cette affaire pourrait être intéressante !"
            : result < 0
              ? "🔴 Tu risques de perdre de l'argent."
              : "🟡 Tu ne gagnerais rien sur cette affaire."),
          "bot"
        );
        return;
      }

      this.addMessage(
        "Écris par exemple : analyse 5 20 2\n\n" +
        "Cela signifie : 5 € d'achat, 20 € de revente et 2 € de frais.",
        "bot"
      );
      return;
    }

    this.addMessage(
      "Je peux t'aider avec :\n\n" +
      "💰 « Mon budget »\n" +
      "🏆 « Ma meilleure affaire »\n" +
      "📊 « Fais mon bilan »\n" +
      "🔎 « Analyse 5 20 2 »\n" +
      "🔗 Ou envoie un lien Vinted !",
      "bot"
    );
  }
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    DealHunterBot.init();
  });
} else {
  DealHunterBot.init();
}
