
/* DEALHUNTER - Assistant */

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
      <div style="
        background:#2563eb;
        padding:16px;
        display:flex;
        justify-content:space-between;
        align-items:center;
      ">
        <strong>🤖 DealHunter Assistant</strong>
        <button id="dh-close"
          style="background:none;border:0;color:white;font-size:22px;cursor:pointer">
          ×
        </button>
      </div>

      <div id="dh-messages" style="
        height:calc(100% - 130px);
        overflow-y:auto;
        padding:14px;
      ">
        <div style="
          background:#263449;
          padding:12px;
          border-radius:12px;
          margin-bottom:12px;
        ">
          Salut ! 👋 Je suis l'assistant DealHunter.
          <br><br>
          Je peux t'aider à réfléchir à tes achats et à tes bénéfices !
        </div>
      </div>

      <form id="dh-form" style="
        position:absolute;
        bottom:0;
        left:0;
        right:0;
        display:flex;
        gap:6px;
        padding:10px;
        background:#1f2937;
      ">
        <input id="dh-input"
          placeholder="Écris ton message..."
          autocomplete="off"
          style="
            min-width:0;
            flex:1;
            padding:12px;
            border:0;
            border-radius:10px;
            background:#374151;
            color:white;
            outline:none;
          "
        >
        <button type="submit" style="
          background:#2563eb;
          color:white;
          border:0;
          border-radius:10px;
          padding:10px 14px;
          cursor:pointer;
        ">➤</button>
      </form>
    `;

    document.body.appendChild(button);
    document.body.appendChild(chat);

    button.addEventListener("click", () => {
      chat.style.display =
        chat.style.display === "none" ? "block" : "none";
    });

    chat.querySelector("#dh-close").addEventListener("click", () => {
      chat.style.display = "none";
    });

    chat.querySelector("#dh-form").addEventListener("submit", (e) => {
      e.preventDefault();

      const input = chat.querySelector("#dh-input");
      const message = input.value.trim();

      if (!message) return;

      this.addMessage(message, "user");
      input.value = "";

      this.addMessage(
        "Je suis encore en version de démonstration. Mon intelligence artificielle sera connectée dans la prochaine étape ! 🚀",
        "bot"
      );
    });
  },

  addMessage(message, sender) {
    const messages = document.getElementById("dh-messages");
    const bubble = document.createElement("div");

    bubble.textContent = message;

    bubble.style.cssText = `
      background:${sender === "user" ? "#2563eb" : "#263449"};
      padding:12px;
      border-radius:12px;
      margin-bottom:10px;
      margin-left:${sender === "user" ? "35px" : "0"};
      margin-right:${sender === "user" ? "0" : "35px"};
      overflow-wrap:anywhere;
    `;

    messages.appendChild(bubble);
    messages.scrollTop = messages.scrollHeight;
  }
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    DealHunterBot.init();
  });
} else {
  DealHunterBot.init();
}
