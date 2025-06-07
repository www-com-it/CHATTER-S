const socket = io();
let roomId = null;

const input = document.getElementById("output");
const chatBox = document.getElementById("chatBox");
const endBtn = document.getElementById("endBtn");
const newBtn = document.getElementById("newBtn");

// Quando il server assegna la stanza (match)
socket.on("matched", (data) => {
  roomId = data.roomId;
  appendMessage("✅ Sei connesso a un altro utente.");
  endBtn.disabled = false;
  input.disabled = false;
});

// Quando ricevo messaggi dal server
socket.on("message", (data) => {
  appendMessage(`Altro: ${data.text}`);
});

// Funzione per aggiungere messaggi in chatBox
function appendMessage(message, fromMe = false) {
  const msgDiv = document.createElement("div");
  msgDiv.classList.add("message");
  if (fromMe) msgDiv.classList.add("me");
  msgDiv.textContent = message;
  chatBox.appendChild(msgDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Termina chat
endBtn.addEventListener("click", () => {
  if (roomId) {
    socket.emit("leaveRoom", { roomId, newChat: false });
    appendMessage("Hai terminato la chat.");
    endBtn.disabled = true;
    input.disabled = true;
    roomId = null;
  }
});

// Nuova chat
newBtn.addEventListener("click", () => {
  if (roomId) {
    socket.emit("leaveRoom", { roomId, newChat: true });
    chatBox.innerHTML = "<em>In attesa di un nuovo utente...</em>";
    endBtn.disabled = true;
    input.disabled = true;
    input.value = "";
    roomId = null;
  }
});

// Disconnessione automatica alla chiusura
window.addEventListener("beforeunload", () => {
  if (roomId) {
    socket.emit("leaveRoom", { roomId, newChat: false });
  }
});

// Invia messaggio premendo Enter
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && roomId) {
    const message = input.value.trim();
    if (message !== "") {
      appendMessage(`Tu: ${message}`, true);
      socket.emit("message", { roomId, text: message });
      input.value = "";
    }
  }
});