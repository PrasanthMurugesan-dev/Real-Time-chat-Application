// Chat functionality
let socket;
let currentUsername = '';

function initChat(username) {
  currentUsername = username;
  
  // Connect to socket
  socket = io();
  
  // Set up socket event listeners
  setupSocketListeners();
  
  // Join the queue to find a chat partner
  joinChatQueue();
  
  // Set up UI event listeners
  setupChatUIListeners();
}

function setupSocketListeners() {
  // Handle successful connection
  socket.on('connect', () => {
    console.log('Connected to server');
  });
  
  // Handle incoming messages
  socket.on('chatMessage', ({ user, message }) => {
    if (user === currentUsername) {
      addMessage('outgoing', user, message);
    } else {
      addMessage('incoming', user, message);
      playMessageSound('incoming');
    }
  });
  
  // Handle incoming images
  socket.on('image', ({ user, data }) => {
    if (user === currentUsername) {
      addImageMessage('outgoing', user, data);
    } else {
      addImageMessage('incoming', user, data);
      playMessageSound('incoming');
    }
  });
  
  // Handle typing status
  socket.on('typing', (name) => {
    showTypingIndicator(name);
  });
  
  // Handle when a partner is found and connected
  socket.on('partnerFound', (partnerName) => {
    window.app.updatePartnerStatus('connected');
    addSystemMessage(`You're now connected with ${partnerName || 'a fellow memer'}!`);
    document.getElementById('new-chat').classList.add('hidden');
    playMessageSound('notification');
  });
  
  // Handle partner leaving
  socket.on('partnerLeft', () => {
    window.app.updatePartnerStatus('disconnected');
    addSystemMessage('Your chat partner has left. Click below to find a new match.');
    document.getElementById('new-chat').classList.remove('hidden');
    playMessageSound('leave');
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Disconnected from server');
  });
}

function setupChatUIListeners() {
  // Form submission for sending messages
  const chatForm = document.getElementById('chat-form');
  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    sendMessage();
  });
  
  // Input for typing indicator
  const msgInput = document.getElementById('msg');
  msgInput.addEventListener('input', () => {
    socket.emit('typing', currentUsername);
  });
  
  // Image upload handling
  const imageInput = document.getElementById('imageInput');
  imageInput.addEventListener('change', handleImageUpload);
  
  // New chat button
  const newChatBtn = document.getElementById('new-chat');
  newChatBtn.addEventListener('click', () => {
    clearMessages();
    joinChatQueue();
  });
  
  // Emoji picker toggle
  const emojiBtn = document.getElementById('emoji-btn');
  emojiBtn.addEventListener('click', toggleEmojiPicker);
}

function sendMessage() {
  const msgInput = document.getElementById('msg');
  const msg = msgInput.value.trim();
  
  if (msg && socket.connected) {
    socket.emit('chatMessage', msg);
    msgInput.value = '';
    msgInput.focus();
  }
}

function handleImageUpload() {
  const file = this.files[0];
  if (file && file.type.startsWith('image/')) {
    // Show loading indicator
    addSystemMessage('Uploading image...');
    
    const reader = new FileReader();
    reader.onload = () => {
      socket.emit('image', reader.result);
      // Clear the input so the same file can be selected again
      this.value = '';
    };
    reader.readAsDataURL(file);
  }
}

function joinChatQueue() {
  window.app.updatePartnerStatus('searching');
  addSystemMessage('Looking for another memer...');
  socket.emit('joinQueue', currentUsername);
}

function addMessage(type, user, message) {
  const messagesContainer = document.getElementById('messages');
  const div = document.createElement('div');
  
  div.className = `message ${type}`;
  
  // Format the message content with potential emoji rendering
  const formattedMessage = formatMessageText(message);
  
  // Add sender name only for incoming messages
  let messageContent = '';
  if (type === 'incoming') {
    messageContent = `<div class="sender">${user}</div>`;
  }
  
  messageContent += formattedMessage;
  
  // Add timestamp
  const now = new Date();
  const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  messageContent += `<div class="time">${timeString}</div>`;
  
  div.innerHTML = messageContent;
  
  // Add to container with animation
  messagesContainer.appendChild(div);
  scrollToBottom();
}

function addImageMessage(type, user, imageData) {
  const messagesContainer = document.getElementById('messages');
  const div = document.createElement('div');
  
  div.className = `message ${type}`;
  
  // Add sender name only for incoming messages
  let messageContent = '';
  if (type === 'incoming') {
    messageContent = `<div class="sender">${user}</div>`;
  }
  
  // Add image
  messageContent += `<img src="${imageData}" alt="Shared image" />`;
  
  // Add timestamp
  const now = new Date();
  const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  messageContent += `<div class="time">${timeString}</div>`;
  
  div.innerHTML = messageContent;
  
  // Add to container with animation
  messagesContainer.appendChild(div);
  scrollToBottom();
}

function addSystemMessage(message) {
  const messagesContainer = document.getElementById('messages');
  const div = document.createElement('div');
  
  div.className = 'message system';
  div.textContent = message;
  
  messagesContainer.appendChild(div);
  scrollToBottom();
}

function showTypingIndicator(name) {
  const typingStatus = document.getElementById('typing-status');
  
  // Create typing animation with dots
  typingStatus.innerHTML = `
    <span>${name} is typing</span>
    <div class="typing-dots">
      <span></span>
      <span></span>
      <span></span>
    </div>
  `;
  
  // Clear the typing indicator after 3 seconds if it's not updated
  clearTimeout(window.typingTimeout);
  window.typingTimeout = setTimeout(() => {
    typingStatus.innerHTML = '';
  }, 3000);
}

function formatMessageText(message) {
  // Convert URLs to clickable links
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const withLinks = message.replace(urlRegex, url => `<a href="${url}" target="_blank">${url}</a>`);
  
  // Replace emoji shortcuts with actual emojis
  return withLinks;
}

function clearMessages() {
  const messagesContainer = document.getElementById('messages');
  messagesContainer.innerHTML = '';
  
  const typingStatus = document.getElementById('typing-status');
  typingStatus.innerHTML = '';
}

function scrollToBottom() {
  const messagesContainer = document.getElementById('messages');
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function playMessageSound(type) {
  let sound;
  
  switch(type) {
    case 'incoming':
      sound = new Audio('/sounds/message.mp3');
      break;
    case 'notification':
      sound = new Audio('/sounds/notification.mp3');
      break;
    case 'leave':
      sound = new Audio('/sounds/leave.mp3');
      break;
    default:
      return;
  }
  
  // Play sound at lower volume
  sound.volume = 0.5;
  sound.play().catch(error => {
    // Silently fail if browser blocks autoplay
    console.log('Sound play failed:', error);
  });
}

function toggleEmojiPicker() {
  const emojiPicker = document.getElementById('emoji-picker');
  emojiPicker.classList.toggle('hidden');
  
  // If opening the picker, populate it if not already done
  if (!emojiPicker.classList.contains('hidden')) {
    populateEmojiPicker();
  }
}

function disconnectChat() {
  if (socket) {
    socket.disconnect();
  }
}



// Export functions for use in other modules
window.chatFunctions = {
  initChat,
  disconnectChat,
  sendMessage,
  addSystemMessage
};
