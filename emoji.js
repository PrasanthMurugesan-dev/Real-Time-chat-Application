// Emoji functionality

// Common emoji categories
const popularEmojis = [
  '😀', '😁', '😂', '🤣', '😃', '😄', '😅', '😆', '😉', '😊', 
  '😋', '😎', '😍', '🥰', '😘', '😗', '😙', '😚', '🙂', '🤗',
  '🤔', '🤨', '😐', '😑', '😶', '🙄', '😏', '😣', '😥', '😮',
  '🤐', '😯', '😪', '😫', '😴', '😌', '😛', '😜', '😝', '🤤',
  '😒', '😓', '😔', '😕', '🙃', '🤑', '😲', '☹️', '🙁', '😖',
  '😞', '😟', '😤', '😢', '😭', '😦', '😧', '😨', '😩', '🤯',
  '😬', '😰', '😱', '🥵', '🥶', '😳', '🤪', '😵', '😡', '😠',
  '🤬', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '😇', '🥳', '🥴',
  '🥺', '🤠', '🤡', '🤥', '🤫', '🤭', '🧐', '🤓', '😈', '👿',
  '👹', '👺', '💀', '👻', '👽', '🤖', '💩', '😺', '😸', '😹',
  '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '💔', '❣️', '💕',
  '💞', '💓', '💗', '💖', '💘', '💝', '💟', '🌹', '🔥', '✨',
  '🎉', '🎊', '👍', '👎', '👌', '✌️', '🤞', '🤘', '🤙', '👋',
  '🙏', '👏', '👍', '👎', '👊', '✊', '🤛', '🤜', '👇', '👈',
  '👉', '👆', '👋', '🤚', '🖐️', '👌', '👍', '👎', '👏', '🙌'
];

// Called when the emoji picker is opened
function populateEmojiPicker() {
  const emojiContainer = document.querySelector('.emoji-container');
  
  // Check if emojis are already populated
  if (emojiContainer.children.length > 0) {
    return;
  }
  
  // Add emojis to the container
  popularEmojis.forEach(emoji => {
    const emojiSpan = document.createElement('div');
    emojiSpan.className = 'emoji-item';
    emojiSpan.textContent = emoji;
    emojiSpan.addEventListener('click', () => insertEmoji(emoji));
    emojiContainer.appendChild(emojiSpan);
  });
}

// Insert the selected emoji into the message input
function insertEmoji(emoji) {
  const msgInput = document.getElementById('msg');
  const cursorPos = msgInput.selectionStart;
  const textBefore = msgInput.value.substring(0, cursorPos);
  const textAfter = msgInput.value.substring(cursorPos);
  
  // Insert the emoji at cursor position
  msgInput.value = textBefore + emoji + textAfter;
  
  // Move cursor position after the inserted emoji
  msgInput.selectionStart = cursorPos + emoji.length;
  msgInput.selectionEnd = cursorPos + emoji.length;
  
  // Focus back on the input
  msgInput.focus();
  
  // Hide the emoji picker
  document.getElementById('emoji-picker').classList.add('hidden');
}

// Document click event to close emoji picker when clicking outside
document.addEventListener('click', (e) => {
  const emojiPicker = document.getElementById('emoji-picker');
  const emojiBtn = document.getElementById('emoji-btn');
  
  if (!emojiPicker.contains(e.target) && e.target !== emojiBtn) {
    emojiPicker.classList.add('hidden');
  }
});

// Export functions for use in other modules
window.emojiModule = {
  populateEmojiPicker,
  insertEmoji
};