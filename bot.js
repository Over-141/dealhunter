
/* DEALHUNTER AI - VERSION 2 */

const DealHunterBot = {
  workerURL: "https://dealhunter-api.amorbrutailssoan.workers.dev/",
  pendingAnalysis: null,
  lastAnalysis: null,

  init() {
    this.createInterface();
  },

  createInterface() {
    if (document.getElementById("dh-chat-button")) return;

    const button = document.createElement("button");
    button.id = "dh-chat-button";
    button.textContent = "🤖 Assistant DealHunter";
    button.style.cssText = `
      position:fixed;bottom:22px;right:22px;z-index:99998;
      background:#2563eb;color:white;border:0;border-radius:30px;
      padding:15px 20px;font-weight:bold;cursor:pointer;
      width:auto;margin:0;box-shadow:0 5px 20px #0004;
    `;

    const chat = document.createElement("div");
    chat.id = "dh-chat-window";
    chat.style.cssText = `
      display:none;flex-direction:column;position:fixed;
      bottom:85px;right:20px;width:340px;
      max-width:calc(100vw - 40px);height:440px;max-height:65vh;
      background:#111827;border:1px solid #374151;
      border-radius:18px;z-index:99999;overflow:hidden;
      box-shadow:0 10px 35px #0006;color:white;
      font-family:Arial,sans-serif;
    `;

    chat.innerHTML = `
      <div style="background:#2563eb;padding:16px;
        display:flex;justify-content:space-between;align-items:center">
        <strong>🤖 DealHunter AI</strong>
        <button id="dh-close" style="
          background:none;border:0;color:white;font-size:22px;
          width:auto;margin:0;cursor:pointer">×</button>
      </div>

      <div id="dh-messages" style="
        flex:1;min-height:0;overflow-y:auto;padding:14px;
        box-sizing:border-box"></div>

      <form id="dh-form" style="
        position:static;flex-shrink:0;display:flex;gap:6px;
        padding:10px;background:#1f2937">
        <input id="dh-input" placeholder="Pose ta question..."
          autocomplete="off" style="
          min-width:0;width:auto;flex:1;padding:12px;border:0;
          border-radius:10px;background:#374151;color:white">
        <button type="submit" style="
          width:auto;margin:0;background:#2563eb;color:white;
          border:0;border-radius:10px;padding:10px 14px;
          cursor:pointer">➤</button>
      </form>
    `;

    document.body.append(button, chat);

    button.onclick = () => {
      chat.style.display =
        chat.style.display === "none" ? "flex" : "none";
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
      "Salut ! 👋 Je suis DealHunter AI.\n\n" +
      "Je peux analyser tes affaires, calculer tes bénéfices " +
      "et surveiller ton budget.\n\n" +
      "Envoie-moi un lien Vinted pour commencer une analyse !",
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

  isVintedLink(message) {
    try {
      const url = new URL(message.trim());
      return (
        url.protocol === "https:" &&
        (url.hostname === "vinted.fr" ||
         url.hostname.endsWith(".vinted.fr") ||
         url.hostname === "vinted.com" ||
         url.hostname.endsWith(".vinted.com"))
      );
    } catch {
      return false;
    }
  },

  startAnalysis(url) {
    this.pendingAnalysis = {
      url,
      step: "buy",
      buy: 0,
      sell: 0,
      fees: 0
    };

    this.addMessage(
      "🔎 LIEN REÇU !\n\n" +
      "Je ne peux pas encore récupérer automatiquement " +
      "les détails de cette annonce.\n\n" +
      "On va donc faire une analyse guidée.\n\n" +
      "1️⃣ Quel est le prix d'achat de l'article ?",
      "bot"
    );
  },

  handleAnalysisAnswer(message) {
    const amount = Number(
      message.replace(",", ".").replace(/[€\s]/g, "")
    );

    if (!Number.isFinite(amount) || amount < 0) {
      this.addMessage(
        "Entre simplement un montant positif, par exemple : 12,50",
        "bot"
      );
      return;
    }

    const analysis = this.pendingAnalysis;

    if (analysis.step === "buy") {
      analysis.buy = amount;
      analysis.step = "sell";

      this.addMessage(
        "Parfait ! 👍\n\n2️⃣ À combien penses-tu pouvoir revendre cet article ?",
        "bot"
      );
      return;
    }

    if (analysis.step === "sell") {
      analysis.sell = amount;
      analysis.step = "fees";

      this.addMessage(
        "Très bien !\n\n3️⃣ Combien prévois-tu de frais supplémentaires ?\n\n" +
        "Écris 0 si tu n'en as pas.",
        "bot"
      );
      return;
    }

    if (analysis.step === "fees") {
      analysis.fees = amount;

      const profit = analysis.sell - analysis.buy - analysis.fees;
      const margin = analysis.buy > 0
        ? profit / analysis.buy * 100
        : 0;

      this.lastAnalysis = {
        name: "Article Vinted",
        buy: analysis.buy,
        sell: analysis.sell,
        fees: analysis.fees,
        url: analysis.url
      };

      this.pendingAnalysis = null;

      this.addMessage(
        "📊 RÉSULTAT DE TON ANALYSE\n\n" +
        "Prix d'achat : " + analysis.buy.toFixed(2) + " €\n" +
        "Revente prévue : " + analysis.sell.toFixed(2) + " €\n" +
        "Frais : " + analysis.fees.toFixed(2) + " €\n\n" +
        "💰 Bénéfice estimé : " + profit.toFixed(2) + " €\n" +
        "📈 Rentabilité : " + margin.toFixed(1) + " %\n\n" +
        (profit > 0
          ? "🟢 Cette affaire pourrait être intéressante !"
          : profit < 0
            ? "🔴 Attention, tu risques de perdre de l'argent."
            : "🟡 Tu ne ferais aucun bénéfice.") +
        "\n\nÉcris « enregistrer » pour ajouter cette affaire à DealHunter.",
        "bot"
      );
    }
  },

  saveAnalysis() {
    const data = this.getData();

    if (!this.lastAnalysis) {
      this.addMessage("Tu n'as aucune analyse à enregistrer.", "bot");
      return;
    }

    if (!data || typeof data.addDeal !== "function") {
      this.addMessage(
        "Il manque une petite connexion dans index.html. " +
        "On va l'ajouter à l'étape suivante.",
        "bot"
      );
      return;
    }
if (data.addDeal(this.lastAnalysis) === false) {
  this.addMessage("❌ Budget dépassé ! Affaire non enregistrée.", "bot");
  return;
}
    this.addMessage(
      "✅ Affaire enregistrée ! Tu peux maintenant la retrouver dans « Mes affaires ».",
      "bot"
    );

    this.lastAnalysis = null;
  },

  reply(message) {
    const text = message.toLowerCase().trim();
    const data = this.getData();

    // Continuer une analyse en cours
    if (this.pendingAnalysis) {
      this.handleAnalysisAnswer(message);
      return;
    }

    // Enregistrer la dernière analyse
    if (text === "enregistrer" || text === "enregistre") {
      this.saveAnalysis();
      return;
    }

    // Détecter un lien Vinted
    if (this.isVintedLink(message)) {
      this.startAnalysis(message);
      return;
    }

    if (!data) {
      this.addMessage(
        "Je ne trouve pas les données du site. Vérifie la connexion dans index.html.",
        "bot"
      );
      return;
    }

    const budget = Number(data.getBudget());
    const deals = data.getDeals();

    const spent = deals.reduce(
      (sum, d) => sum + Number(d.buy) + Number(d.fees), 0
    );

    const profit = deals.reduce(
      (sum, d) => sum + Number(d.sell) -
        Number(d.buy) - Number(d.fees), 0
    );

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

    if (text.includes("meilleure") || text.includes("meilleur")) {
      if (!deals.length) {
        this.addMessage("Tu n'as pas encore ajouté d'affaire !", "bot");
        return;
      }

      const best = [...deals].sort(
        (a, b) =>
          (Number(b.sell) - Number(b.buy) - Number(b.fees)) -
          (Number(a.sell) - Number(a.buy) - Number(a.fees))
      )[0];

      this.addMessage(
        "🏆 TA MEILLEURE AFFAIRE\n\n" +
        best.name + "\nBénéfice estimé : " +
        (Number(best.sell) - Number(best.buy) -
          Number(best.fees)).toFixed(2) + " €",
        "bot"
      );
      return;
    }

    if (text.includes("bilan") || text.includes("analyse mes")) {
      this.addMessage(
        "📊 BILAN DEALHUNTER\n\n" +
        "Affaires : " + deals.length + "\n" +
        "Dépenses : " + spent.toFixed(2) + " €\n" +
        "Bénéfice potentiel : " + profit.toFixed(2) + " €\n" +
        "Budget restant : " + (budget - spent).toFixed(2) + " €",
        "bot"
      );
      return;
    }

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
          "Bénéfice : " + result.toFixed(2) + " €\n" +
          "Rentabilité : " + margin.toFixed(1) + " %",
          "bot"
        );
        return;
      }
    }

    if (text.includes("combien") || text.includes("affaires")) {
      this.addMessage(
        "📦 Tu as " + deals.length +
        " affaire(s) enregistrée(s) dans DealHunter.",
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
      "🔗 Envoie un lien Vinted pour démarrer une analyse !",
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
