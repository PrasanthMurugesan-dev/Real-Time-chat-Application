// Animations and visual effects

// Add ripple effect to buttons
document.addEventListener('DOMContentLoaded', () => {
  // Apply ripple effect to all buttons
  const buttons = document.querySelectorAll('button, .tool-btn');
  
  buttons.forEach(button => {
    button.addEventListener('click', createRippleEffect);
  });
});

// Create ripple effect on button click
function createRippleEffect(event) {
  const button = event.currentTarget;
  
  // Create ripple element
  const ripple = document.createElement('span');
  ripple.classList.add('ripple-effect');
  
  // Set ripple position
  const rect = button.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  
  const x = event.clientX - rect.left - size / 2;
  const y = event.clientY - rect.top - size / 2;
  
  // Set ripple CSS
  ripple.style.width = ripple.style.height = `${size}px`;
  ripple.style.left = `${x}px`;
  ripple.style.top = `${y}px`;
  
  // Add ripple to button
  button.appendChild(ripple);
  
  // Remove ripple after animation
  setTimeout(() => {
    ripple.remove();
  }, 600);
}

// Add observer for new messages to apply animations
const messagesContainer = document.getElementById('messages');
const messageObserver = new MutationObserver(mutations => {
  mutations.forEach(mutation => {
    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === 1 && node.classList.contains('message')) {
          // Add staggered animation delay for multiple messages
          const messageCount = messagesContainer.children.length;
          const delay = Math.min(messageCount * 0.05, 0.3);
          node.style.animationDelay = `${delay}s`;
        }
      });
    }
  });
});

// Start observing messages container once DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  messageObserver.observe(messagesContainer, { childList: true });
  
  // Add scroll animation to the messages container
  messagesContainer.addEventListener('scroll', handleScrollAnimation);
});

// Handle scroll animations in the chat
function handleScrollAnimation() {
  const messages = document.querySelectorAll('.message');
  
  messages.forEach(message => {
    const messagePosition = message.getBoundingClientRect().top;
    const screenPosition = window.innerHeight;
    
    // I
    if (messagePosition < screenPosition) {
      message.style.opacity = '1';
    }
  });
}

// Add image loading animation
function addImageLoadAnimation() {
  const images = document.querySelectorAll('.message img');
  
  images.forEach(img => {
    // Add loading placeholder
    img.style.filter = 'blur(5px)';
    img.style.transition = 'filter 0.5s ease';
    
    // Remove blur when image is loaded
    img.onload = () => {
      img.style.filter = 'blur(0)';
    };
  });
}

// Splash screen animations
document.addEventListener('DOMContentLoaded', () => {
  const loadingProgress = document.querySelector('.loading-progress');
  
  // Animate the loading bar
  setTimeout(() => {
    loadingProgress.style.width = '100%';
  }, 500);
});

// Export animation functions for use in other modules
window.animationEffects = {
  createRippleEffect,
  addImageLoadAnimation
};