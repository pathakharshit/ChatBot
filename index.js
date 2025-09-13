const sendBtn = document.getElementById("send-button");
const userInput = document.getElementById("user-input");
const chatBox = document.getElementById("chat-box");
const composer = document.getElementById("composer");
const headerStatus = document.getElementById("header-status");

let chatHistory = [];
let isTyping = false;

function timeNow(){
  return new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
}

const doubleCheckSVG = `
  <svg viewBox="0 0 16 11">
    <path d="M11.07 0.22a.75.75 0 0 1 1.06 1.06l-5.25 5.25a.75.75 0 0 1-1.06 0L3.47 4.28a.75.75 0 0 1 1.06-1.06L6.5 5.19l4.57-4.57z" fill="#53bdeb"/>
    <path d="M13.78 0.22a.75.75 0 0 1 1.06 1.06l-5.25 5.25a.75.75 0 0 1-1.06 0l-1.5-1.5a.75.75 0 0 1 1.06-1.06l0.97 0.97L13.78 0.22z" fill="#53bdeb"/>
  </svg>
`;

function clearEmptyState() {
  const emptyState = chatBox.querySelector('.empty-state');
  if (emptyState) {
    emptyState.remove();
  }
}

function updateStatus(status) {
  const isTypingStatus = status === 'typing...';
  
  headerStatus.textContent = status;
  
  if (isTypingStatus) {
    headerStatus.classList.add('status-typing');
  } else {
    headerStatus.classList.remove('status-typing');
  }
}

function appendUserMessage(text){
  clearEmptyState();
  const row = document.createElement('div');
  row.className = 'msg user';
  
  row.innerHTML = `
    <div class="bubble">
      <div class="message-content">
        ${text.replace(/\n/g, '<br>')}
        <div class="meta"><span>${timeNow()}</span>${doubleCheckSVG}</div>
      </div>
    </div>`;
  chatBox.appendChild(row);
  scrollToBottom();
}

function appendModelMessage(text){
  const row = document.createElement('div');
  row.className = 'msg model';
  
  row.innerHTML = `
    <div class="bubble">
      <div class="message-content">
        ${text.replace(/\n/g, '<br>')}
        <div class="meta"><span>${timeNow()}</span></div>
      </div>
    </div>`;
  chatBox.appendChild(row);
  scrollToBottom();
}

function appendTyping(){
  const row = document.createElement('div');
  row.className = 'msg model typing';
  row.id = 'typing-indicator';
  row.innerHTML = `
    <div class="typing-bubble">
      <span class="typing-dot"></span>
      <span class="typing-dot"></span>
      <span class="typing-dot"></span>
    </div>`;
  chatBox.appendChild(row);
  scrollToBottom();
  return row;
}

function scrollToBottom() {
  setTimeout(() => {
    chatBox.scrollTop = chatBox.scrollHeight;
  }, 100);
}

async function sendMessage(text){
  if(!text.trim() || isTyping) return;
  
  isTyping = true;
  sendBtn.disabled = true;
  
  appendUserMessage(text);
  userInput.value = "";
  autoResize();
  
  // Update status to typing and show typing indicator
  updateStatus('typing...');
  const typingRow = appendTyping();
  
  try {
    const res = await generateResponse(text);
    
    // Remove typing indicator and update status
    typingRow.remove();
    updateStatus('online');
    
    appendModelMessage(res || "⚠️ Failed to respond. Please try again.");
  } catch (error) {
    typingRow.remove();
    updateStatus('online');
    appendModelMessage("⚠️ Connection failed. Please check your internet and try again.");
  }
  
  isTyping = false;
  sendBtn.disabled = false;
}

composer.addEventListener("submit",(e)=>{
  e.preventDefault();
  sendMessage(userInput.value);
});

// Auto-resize textarea
function autoResize() {
  userInput.style.height = "auto";
  const newHeight = Math.min(userInput.scrollHeight, 120);
  userInput.style.height = newHeight + "px";
}

userInput.addEventListener("input", ()=>{
  autoResize();
  
  // Enable/disable send button based on input
  const hasText = userInput.value.trim().length > 0;
  sendBtn.disabled = !hasText || isTyping;
});

// Handle Enter key
userInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage(userInput.value);
  }
});

async function generateResponse(userText){
  try{
    const resp = await fetch('/api/generate',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({chatHistory, userInput:userText})
    });
    
    if (!resp.ok) {
      throw new Error(`HTTP error! status: ${resp.status}`);
    }
    
    const data = await resp.json();
    const responseText = data.response;
    
    chatHistory.push({role:"user", parts:[{text:userText}]});
    chatHistory.push({role:"model", parts:[{text:responseText}]});
    
    return responseText;
  } catch(e) { 
    console.error('API Error:', e);
    throw e; // Re-throw to trigger error handling in sendMessage
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  userInput.focus();
});