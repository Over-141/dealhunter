
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

 
async startAnalysis(url) {
  this.pendingAnalysis = {
    url,
    step: "buy",
    buy: 0,
    sell: 0,
    fees: 0,
    name: "Article Vinted"
  };

  this.addMessage("🔎 Je tente de lire ton annonce Vinted...", "bot");

  try {
    const response = await fetch(
      this.workerURL + "?url=" + encodeURIComponent(url)
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error || "Lecture impossible");
    }

    const product = result.product;
    const analysis = this.pendingAnalysis;

    analysis.name = product.title || "Article Vinted";
const priceMatch = String(product.price || "").match(/\d+(?:[.,]\d+)?/);
const detectedPrice = priceMatch
  ? Number(priceMatch[0].replace(",", "."))
  : 0;

   if (detectedPrice > 0 && detectedPrice <= 10000) {
      analysis.buy = detectedPrice;
      analysis.step = "comparables";

      this.addMessage(
        "✅ ANNONCE LUE !\n\n" +
        "📦 Article : " + analysis.name + "\n" +
        "💰 Prix d'achat : " + analysis.buy.toFixed(2) + " €\n\n" +
        "Maintenant, ouvre cette recherche Vinted et relève au moins 3 prix d'articles similaires :\n" +
"https://www.vinted.fr/catalog?search_text=" + encodeURIComponent(analysis.name) +
"\n\nEnvoie-moi les 3 prix (exemple : 12, 15, 18).",
        "bot"
      );
    } else {
      this.addMessage(
        "✅ J'ai trouvé l'annonce : " + analysis.name +
        "\n\nQuel est son prix d'achat ?",
        "bot"
      );
    }

  } catch (error) {
    this.addMessage(
      "⚠️ Je n'arrive pas à lire automatiquement cette annonce.\n\n" +
      "On passe en mode manuel !\n\n" +
      "Quel est le prix d'achat de l'article ?",
      "bot"
    );
  }
},



handleAnalysisAnswer(message) {
  const analysis = this.pendingAnalysis;

  const numbers = message.match(/\d+(?:[.,]\d+)?/g);
  const amounts = numbers
    ? numbers.map(n => Number(n.replace(",", ".")))
    : [];

  if (!amounts.length || amounts.some(n => !Number.isFinite(n) || n < 0)) {
    this.addMessage(
      "Entre des prix valides, par exemple : 12 15 18",
      "bot"
    );
    return;
  }

  if (analysis.step === "buy") {
    analysis.buy = amounts[0];
    analysis.step = "comparables";

    const searchUrl =
      "https://www.vinted.fr/catalog?search_text=" +
      encodeURIComponent(analysis.name);

    this.addMessage(
      "🔎 PRÉPARATION DE LA COMPARAISON\n\n" +
      "Article : " + analysis.name + "\n" +
      "Prix d'achat : " + analysis.buy.toFixed(2) + " €\n\n" +
      "Recherche les articles similaires sur Vinted :\n" +
      searchUrl + "\n\n" +
      "Envoie-moi ensuite au moins 3 prix comparables.\n" +
      "Exemple : 12 15 18",
      "bot"
    );
    return;
  }

  if (analysis.step === "comparables") {
    if (amounts.length < 3) {
      this.addMessage(
        "Il me faut au moins 3 prix pour faire une comparaison fiable.",
        "bot"
      );
      return;
    }

    const sorted = [...amounts].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);

    const median = sorted.length % 2
      ? sorted[middle]
      : (sorted[middle - 1] + sorted[middle]) / 2;

    analysis.sell = Number(median.toFixed(2));
    analysis.comparablePrices = amounts;
    analysis.step = "fees";

    this.addMessage(
      "📊 COMPARAISON TERMINÉE\n\n" +
      "Prix observés : " + amounts.join(" € / ") + " €\n" +
      "Prix de revente conseillé : " + analysis.sell.toFixed(2) + " €\n\n" +
      "Combien prévois-tu de frais supplémentaires ?\n" +
      "Écris 0 si tu n'en as pas.",
      "bot"
    );
    return;
  }

  if (analysis.step === "fees") {
    analysis.fees = amounts[0];

    const profit = analysis.sell - analysis.buy - analysis.fees;
    const margin = analysis.buy > 0
      ? profit / analysis.buy * 100
      : 0;

    this.lastAnalysis = {
      name: analysis.name || "Article Vinted",
      buy: analysis.buy,
      sell: analysis.sell,
      fees: analysis.fees,
      url: analysis.url
    };

    this.pendingAnalysis = null;

    this.addMessage(
      "📊 RÉSULTAT DEALHUNTER\n\n" +
      "Prix d'achat : " + analysis.buy.toFixed(2) + " €\n" +
      "Revente conseillée : " + analysis.sell.toFixed(2) + " €\n" +
      "Frais : " + analysis.fees.toFixed(2) + " €\n\n" +
      "💰 Bénéfice estimé : " + profit.toFixed(2) + " €\n" +
      "📈 Rentabilité : " + margin.toFixed(1) + " %\n\n" +
      (profit > 0
        ? "🟢 Affaire potentiellement intéressante !"
        : "🔴 Attention, cette affaire pourrait être perdante.") +
      "\n\nÉcris « enregistrer » pour ajouter cette affaire.",
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
