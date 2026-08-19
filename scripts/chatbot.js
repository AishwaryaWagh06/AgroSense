// Google Gemini API Chatbot - Direct API Implementation
const API_KEY = 'AIzaSyB-6dmOzUxNF5yWXwCeyfHgF9aYV8I8uVA';
const MODEL = 'gemini-2.5-flash';

// DOM Elements
const chatDiv = document.getElementById('chat');
const promptInput = document.getElementById('prompt');
const sendBtn = document.getElementById('send');
const micBtn = document.getElementById('mic');
const imageInput = document.getElementById('image');
const langSelect = document.getElementById('lang');

const aiKeyInput = document.getElementById('aiKey');
const saveAIBtn = document.getElementById('saveAI');
// Hide API key settings as it's configured in code
if(aiKeyInput) aiKeyInput.style.display = 'none';
if(saveAIBtn) saveAIBtn.style.display = 'none';

// Display message in chat with enhanced styling
function appendMsg(role, html){
  const wrap = document.createElement('div');
  wrap.className = `chat-message ${role}-message`;
  
  // Create message bubble with appropriate styling
  if (role === 'user') {
    wrap.innerHTML = `
      <div class="message-content user">
        <div class="message-header">
          <div class="message-name">You</div>
          <div class="message-time">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
        </div>
        <div class="message-bubble">${html}</div>
      </div>
    `;
  } else {
    wrap.innerHTML = `
      <div class="message-content assistant">
        <div class="message-header">
          <div class="message-name">Assistant</div>
          <div class="message-time">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
        </div>
        <div class="message-bubble">${html}</div>
      </div>
    `;
  }
  
  chatDiv.appendChild(wrap);
  chatDiv.scrollTop = chatDiv.scrollHeight;
  
  // Add message styling if not already present
  if (!document.querySelector('.message-styles')) {
    const styleEl = document.createElement('style');
    styleEl.className = 'message-styles';
    styleEl.textContent = `
      .chat-message {
        margin-bottom: 16px;
        animation: fadeIn 0.3s ease;
      }
      
      .message-content {
        display: flex;
        flex-direction: column;
        max-width: 85%;
      }
      
      .user-message .message-content {
        align-self: flex-end;
        margin-left: auto;
      }
      
      .assistant-message .message-content {
        align-self: flex-start;
      }
      
      .message-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 4px;
        padding: 0 8px;
      }
      
      .message-name {
        font-weight: 600;
        font-size: 0.85rem;
      }
      
      .user-message .message-name {
        color: var(--accent-2);
      }
      
      .assistant-message .message-name {
        color: var(--accent);
      }
      
      .message-time {
        color: var(--muted);
        font-size: 0.75rem;
      }
      
      .message-bubble {
        padding: 12px 16px;
        border-radius: 16px;
        position: relative;
        line-height: 1.5;
      }
      
      .user-message .message-bubble {
        background: rgba(0, 212, 255, 0.1);
        border: 1px solid rgba(0, 212, 255, 0.2);
        border-top-right-radius: 4px;
      }
      
      .assistant-message .message-bubble {
        background: rgba(60, 247, 144, 0.1);
        border: 1px solid rgba(60, 247, 144, 0.2);
        border-top-left-radius: 4px;
      }
      
      .message-bubble p {
        margin: 0 0 12px 0;
      }
      
      .message-bubble p:last-child {
        margin-bottom: 0;
      }
      
      .message-bubble ul, .message-bubble ol {
        margin: 8px 0;
        padding-left: 24px;
      }
      
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `;
    document.head.appendChild(styleEl);
  }
}

// Sanitize HTML
function sanitize(text){
  return text.replace(/[&<>]/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;' }[c]));
}

// Call Google Gemini API directly
async function callAI(prompt, base64Image, lang){
  const language = lang === 'hi' ? 'Hindi' : 'English';
  const systemPrompt = `You are an expert Agronomy Assistant. Answer directly and helpfully in ${language}. Use any provided crop/soil/weather/telemetry context. Return clean HTML (paragraphs, lists, headings only if natural). Keep it concise and practical with clear recommendations.`;

  // Prepare content parts
  const parts = [
    { text: systemPrompt + '\n\nQuestion: ' + prompt }
  ];

  // Add image if provided
  if(base64Image){
    const base64 = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;
    parts.push({
      inline_data: {
        mime_type: 'image/png',
        data: base64
      }
    });
  }

  const requestBody = {
    contents: [{
      role: 'user',
      parts: parts
    }],
    generationConfig: {
      temperature: 0.7,
      topP: 0.8,
      topK: 40,
      maxOutputTokens: 2048
    }
  };

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${encodeURIComponent(API_KEY)}`;
    
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if(!res.ok){
      const errorData = await res.json().catch(() => ({ error: { message: 'Unknown error' } }));
      throw new Error(errorData.error?.message || `HTTP ${res.status}: Failed to get response`);
    }

    const data = await res.json();
    
    // Check for safety blocks
    if(data.promptFeedback && data.promptFeedback.blockReason){
      throw new Error(`Content blocked: ${data.promptFeedback.blockReason}`);
    }

    // Extract response
    if(!data.candidates || !data.candidates.length){
      throw new Error('No response from model');
    }

    const candidate = data.candidates[0];
    if(!candidate.content || !candidate.content.parts){
      throw new Error('Invalid response format');
    }

    // Get text from parts
    const textParts = candidate.content.parts
      .filter(part => part.text)
      .map(part => part.text);
    
    if(!textParts.length){
      throw new Error('No text in response');
    }

    return textParts.join('\n').trim();

  } catch(error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Handle send button click
async function onSend(){
  const q = promptInput.value.trim();
  if(!q) return;

  appendMsg('user', sanitize(q));
  promptInput.value = '';
  promptInput.disabled = true;
  sendBtn.disabled = true;

  let base64 = '';
  if(imageInput.files && imageInput.files[0]){
    base64 = await new Promise((resolve)=>{
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = () => resolve('');
      r.readAsDataURL(imageInput.files[0]);
    });
  }

  // Show thinking indicator
  appendMsg('assistant', 'Thinking...');
  const thinkingMsg = chatDiv.lastChild;

  try {
    const ans = await callAI(q, base64, langSelect.value);
    chatDiv.removeChild(thinkingMsg);
    typeAssistant(ans);
    window.__lastAnswer = ans;
    window.__lastQuestion = q;
  } catch(e) {
    chatDiv.removeChild(thinkingMsg);
    appendMsg('assistant', '<span style="color:#ef4444">Error: ' + sanitize(String(e.message || e)) + '</span>');
  } finally {
    promptInput.disabled = false;
    sendBtn.disabled = false;
    imageInput.value = ''; // Clear image input
  }
}

// Event listeners
sendBtn?.addEventListener('click', onSend);
promptInput?.addEventListener('keydown', (e) => {
  if(e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    onSend();
  }
});

// Voice input
micBtn?.addEventListener('click', () => {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if(!SR) {
    alert('Speech recognition not supported in this browser.');
    return;
  }
  const rec = new SR();
  rec.lang = (langSelect?.value === 'hi') ? 'hi-IN' : 'en-US';
  rec.interimResults = true;
  rec.continuous = false;
  micBtn.classList.add('listening');
  
  rec.onresult = (e) => {
    let transcript = '';
    for(let i = 0; i < e.results.length; i++) {
      transcript += e.results[i][0].transcript + ' ';
    }
    promptInput.value = transcript.trim();
  };
  
  rec.onerror = () => {
    micBtn.classList.remove('listening');
    alert('Speech recognition error. Please try again.');
  };
  
  rec.onend = () => {
    micBtn.classList.remove('listening');
  };
  
  rec.start();
});

// PDF Download
document.getElementById('download')?.addEventListener('click', () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const q = window.__lastQuestion || (promptInput?.value || '');
  const html = window.__lastAnswer || 'No answer yet.';
  const text = html.replace(/<[^>]+>/g, '\n').replace(/\n\n+/g, '\n').trim();

  doc.setFont('times', 'normal');
  doc.setFontSize(18);
  doc.text('Solution Receipt', 40, 60);

  doc.setFontSize(11);
  doc.text(`Date: ${new Date().toLocaleString()}`, 40, 84);
  if(q) {
    doc.text(`Question: ${q}`, 40, 104, { maxWidth: 520 });
  }

  doc.setFontSize(12);
  const lines = doc.splitTextToSize(text || 'No answer yet.', 520);
  doc.text(lines, 40, q ? 132 : 116);

  doc.save('AgroSense-solution-receipt.pdf');
});

// Typing animation effect
function typeAssistant(html){
  const container = document.createElement('div');
  container.style.margin = '10px 0';
  container.innerHTML = `<div style="font-weight:600;color:#4ade80">Assistant</div><div class="msg"></div>`;
  chatDiv.appendChild(container);
  const target = container.querySelector('.msg');
  const text = formatModelOutput(html);
  let i = 0;
  
  const step = () => {
    i += 1; // reveal exactly one character per tick
    target.innerHTML = text.slice(0, i);
    chatDiv.scrollTop = chatDiv.scrollHeight;
    if(i < text.length) {
      setTimeout(step, 15);
    }
  };
  
  setTimeout(step, 15);
}

// Normalize model output to avoid showing markdown symbols like ### and render simple HTML
function formatModelOutput(text){
  if(!text) return '';
  let out = String(text);
  // Remove leading markdown headings like ###, ##, #
  out = out.replace(/(^|\n)\s*#{1,6}\s*/g, '$1');
  // Convert basic bold/italic markdown to HTML
  out = out.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/\*(.+?)\*/g, '<em>$1</em>');
  // Clean code fences/backticks (show inline code without backticks)
  out = out.replace(/```[\s\S]*?```/g, match=> match.replace(/```/g, ''));
  out = out.replace(/`([^`]+)`/g, '<code>$1</code>');
  // Convert simple lists
  // - bullets
  out = out.replace(/(?:^|\n)[-]\s+(.+)(?=\n|$)/g, (m, item)=> `\n• ${item}`);
  // * bullets
  out = out.replace(/(?:^|\n)\*\s+(.+)(?=\n|$)/g, (m, item)=> `\n• ${item}`);
  // Remove stray asterisks that are not part of HTML tags
  out = out.replace(/(^|\s)\*(?=\s|$)/g, '$1');
  // numbered items keep numbers
  // Normalize paragraph breaks
  out = out.replace(/\r/g, '');
  out = out.replace(/\n\n+/g, '<br><br>');
  out = out.replace(/\n/g, '<br>');
  return out.trim();
}

// Initialize: Add welcome message
if(chatDiv && chatDiv.children.length === 0) {
  appendMsg('assistant', 'Hello! I\'m your Agronomy Assistant. Ask me anything about crops, irrigation, fertilizers, or farming practices.');
}
