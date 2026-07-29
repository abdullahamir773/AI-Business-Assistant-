(function () {
  // Find the <script> tag that loaded this file, to read its config.
  var scriptTag = document.currentScript;
  var widgetKey = scriptTag.getAttribute("data-key");
  var apiBase = scriptTag.getAttribute("data-api") || new URL(scriptTag.src).origin;
  var accentColor = scriptTag.getAttribute("data-color") || "#2f6f5e";
  var title = scriptTag.getAttribute("data-title") || "Ask us anything";

  if (!widgetKey) {
    console.error("[Marginal Widget] Missing data-key attribute on the script tag.");
    return;
  }

  var style = document.createElement("style");
  style.textContent = `
    .mgw-bubble {
      position: fixed; bottom: 20px; right: 20px; width: 56px; height: 56px;
      border-radius: 50%; background: ${accentColor}; color: #fff; border: none;
      cursor: pointer; box-shadow: 0 6px 20px rgba(0,0,0,0.2); z-index: 999999;
      display: flex; align-items: center; justify-content: center; transition: transform 0.15s ease;
    }
    .mgw-bubble:hover { transform: scale(1.06); }
    .mgw-panel {
      position: fixed; bottom: 88px; right: 20px; width: 340px; max-width: 92vw;
      height: 460px; max-height: 75vh; background: #fff; border-radius: 14px;
      box-shadow: 0 12px 40px rgba(0,0,0,0.18); z-index: 999999; display: none;
      flex-direction: column; overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, sans-serif;
    }
    .mgw-panel.mgw-open { display: flex; }
    .mgw-header {
      background: ${accentColor}; color: #fff; padding: 14px 16px; font-weight: 600; font-size: 14px;
      display: flex; justify-content: space-between; align-items: center;
    }
    .mgw-close { background: none; border: none; color: #fff; cursor: pointer; font-size: 18px; opacity: 0.85; }
    .mgw-messages { flex: 1; overflow-y: auto; padding: 14px; display: flex; flex-direction: column; gap: 8px; background: #f7f8fa; }
    .mgw-msg { max-width: 85%; padding: 9px 12px; border-radius: 10px; font-size: 13px; line-height: 1.5; }
    .mgw-msg.user { align-self: flex-end; background: ${accentColor}; color: #fff; border-bottom-right-radius: 3px; }
    .mgw-msg.assistant { align-self: flex-start; background: #fff; border: 1px solid #e5e7eb; border-bottom-left-radius: 3px; }
    .mgw-empty { margin: auto; text-align: center; color: #8a94a3; font-size: 12.5px; padding: 20px; }
    .mgw-input-bar { display: flex; gap: 6px; padding: 10px; border-top: 1px solid #eee; background: #fff; }
    .mgw-input-bar input { flex: 1; padding: 9px 11px; border: 1px solid #ddd; border-radius: 8px; font-size: 13px; }
    .mgw-input-bar input:focus { outline: none; border-color: ${accentColor}; }
    .mgw-input-bar button { background: ${accentColor}; color: #fff; border: none; border-radius: 8px; padding: 0 14px; cursor: pointer; font-size: 13px; }
    .mgw-input-bar button:disabled { opacity: 0.5; cursor: default; }
    .mgw-typing { align-self: flex-start; font-size: 12px; color: #8a94a3; padding: 4px 12px; }
  `;
  document.head.appendChild(style);

  var bubble = document.createElement("button");
  bubble.className = "mgw-bubble";
  bubble.innerHTML =
    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  var panel = document.createElement("div");
  panel.className = "mgw-panel";
  panel.innerHTML =
    '<div class="mgw-header"><span>' + title + '</span><button class="mgw-close">\u00d7</button></div>' +
    '<div class="mgw-messages"><div class="mgw-empty">Ask a question and I\'ll answer from our documents.</div></div>' +
    '<div class="mgw-input-bar"><input type="text" placeholder="Type a message\u2026" /><button>Send</button></div>';

  document.body.appendChild(bubble);
  document.body.appendChild(panel);

  var messagesEl = panel.querySelector(".mgw-messages");
  var inputEl = panel.querySelector("input");
  var sendBtn = panel.querySelector(".mgw-input-bar button");
  var closeBtn = panel.querySelector(".mgw-close");

  bubble.addEventListener("click", function () {
    panel.classList.toggle("mgw-open");
    if (panel.classList.contains("mgw-open")) inputEl.focus();
  });
  closeBtn.addEventListener("click", function () {
    panel.classList.remove("mgw-open");
  });

  function addMessage(role, text) {
    var empty = messagesEl.querySelector(".mgw-empty");
    if (empty) empty.remove();
    var div = document.createElement("div");
    div.className = "mgw-msg " + role;
    div.textContent = text;
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return div;
  }

  function send() {
    var text = inputEl.value.trim();
    if (!text) return;
    inputEl.value = "";
    addMessage("user", text);
    sendBtn.disabled = true;

    var typing = document.createElement("div");
    typing.className = "mgw-typing";
    typing.textContent = "Typing\u2026";
    messagesEl.appendChild(typing);
    messagesEl.scrollTop = messagesEl.scrollHeight;

    fetch(apiBase + "/public/chat/" + widgetKey + "/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text }),
    })
      .then(function (res) {
        return res.json().then(function (data) {
          if (!res.ok) throw new Error(data.detail || "Something went wrong");
          return data;
        });
      })
      .then(function (data) {
        typing.remove();
        addMessage("assistant", data.answer);
      })
      .catch(function (err) {
        typing.remove();
        addMessage("assistant", "Sorry, I couldn't reach the assistant right now.");
      })
      .finally(function () {
        sendBtn.disabled = false;
      });
  }

  sendBtn.addEventListener("click", send);
  inputEl.addEventListener("keydown", function (e) {
    if (e.key === "Enter") send();
  });
})();