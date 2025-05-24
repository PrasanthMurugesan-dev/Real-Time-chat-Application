// Main application logic
document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const splashScreen = document.getElementById('splash-screen');
  const mainApp = document.getElementById('main-app');
  const nameForm = document.getElementById('name-form');
  const usernameInput = document.getElementById('username');
  const loginSection = document.getElementById('login');
  const chatSection = document.getElementById('chat');
  const userDisplay = document.getElementById('user-display');
  const logoutBtn = document.getElementById('logout-btn');
  const partnerStatus = document.getElementById('partner-status');

  // App initialization
  initApp();

  function initApp() {
    // Show splash screen for 2 seconds
    setTimeout(() => {
      splashScreen.classList.add('fade-out');
      setTimeout(() => {
        splashScreen.classList.add('hidden');
        mainApp.classList.remove('hidden');
        mainApp.classList.add('fade-in');
      }, 500);
    }, 2000);

    // Set up event listeners
    nameForm.addEventListener('submit', handleLogin);
    logoutBtn.addEventListener('click', handleLogout);
    
    // Check for stored username (if you want to implement session persistence)
    const storedUsername = localStorage.getItem('memeChatUsername');
    if (storedUsername) {
      autoLogin(storedUsername);
    }
  }

  function handleLogin(e) {
    e.preventDefault();
    const username = usernameInput.value.trim();
    
    if (!username) {
      showInputError(usernameInput);
      return;
    }

    // Store username in local storage for session persistence
    localStorage.setItem('memeChatUsername', username);
    
    // Handle the login process
    loginUser(username);
  }

  function autoLogin(username) {
    usernameInput.value = username;
    loginUser(username);
  }

  function loginUser(username) {
    // Update UI
    loginSection.classList.add('page-transition', 'hide');
    
    setTimeout(() => {
      loginSection.classList.add('hidden');
      chatSection.classList.remove('hidden');
      chatSection.classList.add('page-transition', 'show');
      
      // Update user display
      userDisplay.textContent = username;
      logoutBtn.classList.remove('hidden');
      
      // Initialize chat with the username
      initChat(username);
    }, 500);
  }

  function handleLogout() {
    // Clear local storage
    localStorage.removeItem('memeChatUsername');
    
    // Disconnect socket
    disconnectChat();
    
    // Reset UI
    chatSection.classList.add('page-transition', 'hide');
    
    setTimeout(() => {
      chatSection.classList.add('hidden');
      loginSection.classList.remove('hidden', 'page-transition', 'hide');
      loginSection.classList.add('page-transition', 'show');
      logoutBtn.classList.add('hidden');
      userDisplay.textContent = '';
      usernameInput.value = '';
      clearMessages();
    }, 500);
  }

  function showInputError(inputElement) {
    inputElement.classList.add('shake');
    inputElement.focus();
    
    setTimeout(() => {
      inputElement.classList.remove('shake');
    }, 500);
  }

  function updatePartnerStatus(status) {
    // Update partner status display
    switch(status) {
      case 'searching':
        partnerStatus.innerHTML = '<i class="fas fa-search"></i> Looking for a chat partner...';
        break;
      case 'connected':
        partnerStatus.innerHTML = '<i class="fas fa-user-check"></i> Connected with a chat partner';
        partnerStatus.classList.add('pop-in');
        break;
      case 'disconnected':
        partnerStatus.innerHTML = '<i class="fas fa-user-slash"></i> Partner disconnected';
        break;
      default:
        partnerStatus.innerHTML = status;
    }
  }

  // Expose functions that need to be accessible from other modules
  window.app = {
    updatePartnerStatus
  };
});