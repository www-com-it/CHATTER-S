const socket = io();
let roomId = null;

const button = document.getElementById("btn");
const input = document.getElementById("output");
const chatBox = document.getElementById("chatBox");

// Quando il server assegna la stanza (match)
socket.on("matched", (data) => {
  roomId = data.roomId;
  appendMessage("✅ Sei connesso a un altro utente.");
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

const endBtn = document.getElementById("endBtn");

endBtn.addEventListener("click", () => {
  socket.emit("leaveRoom", roomId);
  appendMessage("Hai terminato la chat.");
  endBtn.disabled = true;
  button.disabled = true;
  input.disabled = true;
});

// Invia messaggio al server e lo mostra localmente
button.addEventListener("click", () => {
  const message = input.value.trim();
  if (message !== "" && roomId) {
    appendMessage(`Tu: ${message}`, true);
    socket.emit("message", { roomId, text: message });
    input.value = "";
  }
});
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    button.click();
  }
});