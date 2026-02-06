/**
 * Stef's Geburtstags-Lesung - Celtic Cross Tarot Reading
 * Interactive card effects and modal display
 */

// DOM Elements
const cards = document.querySelectorAll('.card');
const cardModal = document.getElementById('card-modal');
const cardModalOverlay = cardModal.querySelector('.modal__overlay');
const cardModalClose = cardModal.querySelector('.modal__close');
const modalCardImage = document.getElementById('modal-card-image');
const modalCard = document.getElementById('modal-card');

/**
 * Clamp a value between min and max
 */
function clamp(value, min = 0, max = 100) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Round to specified decimal places
 */
function round(value, decimals = 2) {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

/**
 * Calculate distance from center as percentage (0 at center, 1 at edge)
 */
function getHypotenuse(x, y) {
  const cx = 50;
  const cy = 50;
  const dx = x - cx;
  const dy = y - cy;
  return Math.sqrt(dx * dx + dy * dy) / 50;
}

/**
 * Update card CSS variables for holo effect
 */
function updateCardEffect(card, e) {
  const rect = card.getBoundingClientRect();
  const isTouch = e.type.includes('touch');
  
  // Get mouse/touch position relative to card
  const clientX = isTouch ? e.touches[0].clientX : e.clientX;
  const clientY = isTouch ? e.touches[0].clientY : e.clientY;
  
  const x = clientX - rect.left;
  const y = clientY - rect.top;
  
  // Calculate percentages
  const px = clamp((x / rect.width) * 100);
  const py = clamp((y / rect.height) * 100);
  
  // Calculate rotation (very subtle tilt effect - reduced intensity)
  const rotateY = round((px - 50) / 8);
  const rotateX = round((50 - py) / 8);
  
  // Calculate hypotenuse for brightness (capped lower)
  const hyp = round(Math.min(getHypotenuse(px, py), 0.5), 3);
  
  // Update CSS custom properties
  card.style.setProperty('--mx', `${round(px)}%`);
  card.style.setProperty('--my', `${round(py)}%`);
  card.style.setProperty('--posx', `${round(px)}%`);
  card.style.setProperty('--posy', `${round(py)}%`);
  card.style.setProperty('--hyp', hyp);
  card.style.setProperty('--rx', `${rotateY}deg`);
  card.style.setProperty('--ry', `${rotateX}deg`);
  // Reduced opacity for more subtle effect
  card.style.setProperty('--o', '0.7');
}

/**
 * Reset card effect to default state
 */
function resetCardEffect(card) {
  card.style.setProperty('--mx', '50%');
  card.style.setProperty('--my', '50%');
  card.style.setProperty('--posx', '50%');
  card.style.setProperty('--posy', '50%');
  card.style.setProperty('--hyp', '0');
  card.style.setProperty('--rx', '0deg');
  card.style.setProperty('--ry', '0deg');
  card.style.setProperty('--o', '0');
  card.classList.remove('active');
}

/**
 * Open card modal with large card view
 */
function openCardModal(imageSrc) {
  modalCardImage.src = imageSrc;
  modalCardImage.alt = 'Tarot Card';
  
  // Reset modal card effect
  resetCardEffect(modalCard);
  
  cardModal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

/**
 * Close card modal
 */
function closeCardModal() {
  cardModal.classList.remove('active');
  document.body.style.overflow = '';
  resetCardEffect(modalCard);
}

/**
 * Initialize card event listeners
 */
function initCards() {
  cards.forEach(card => {
    // Mouse events for holo effect
    card.addEventListener('mouseenter', (e) => {
      card.classList.add('active');
      updateCardEffect(card, e);
    });
    
    card.addEventListener('mousemove', (e) => {
      updateCardEffect(card, e);
    });
    
    card.addEventListener('mouseleave', () => {
      resetCardEffect(card);
    });
    
    // Touch events for mobile
    card.addEventListener('touchstart', (e) => {
      card.classList.add('active');
      updateCardEffect(card, e);
    }, { passive: true });
    
    card.addEventListener('touchmove', (e) => {
      updateCardEffect(card, e);
    }, { passive: true });
    
    card.addEventListener('touchend', () => {
      resetCardEffect(card);
    });
    
    // Click to open card modal (for reading section cards)
    if (card.classList.contains('card-reading')) {
      card.addEventListener('click', (e) => {
        e.stopPropagation();
        const imageSrc = card.dataset.image || card.querySelector('.card__front').src;
        openCardModal(imageSrc);
      });
    }
    
    // Click on spread cards also opens modal
    if (!card.classList.contains('card-reading') && !card.classList.contains('card-modal')) {
      card.addEventListener('click', (e) => {
        e.stopPropagation();
        const imageSrc = card.querySelector('.card__front').src;
        openCardModal(imageSrc);
      });
    }
  });
}

/**
 * Initialize modal event listeners
 */
function initModal() {
  // Close on overlay click
  cardModalOverlay.addEventListener('click', closeCardModal);
  
  // Close on close button click
  cardModalClose.addEventListener('click', closeCardModal);
  
  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && cardModal.classList.contains('active')) {
      closeCardModal();
    }
  });
  
  // Modal card holo effect
  modalCard.addEventListener('mouseenter', (e) => {
    modalCard.classList.add('active');
    updateCardEffect(modalCard, e);
  });
  
  modalCard.addEventListener('mousemove', (e) => {
    updateCardEffect(modalCard, e);
  });
  
  modalCard.addEventListener('mouseleave', () => {
    resetCardEffect(modalCard);
  });
  
  // Touch events for modal card
  modalCard.addEventListener('touchstart', (e) => {
    modalCard.classList.add('active');
    updateCardEffect(modalCard, e);
  }, { passive: true });
  
  modalCard.addEventListener('touchmove', (e) => {
    updateCardEffect(modalCard, e);
  }, { passive: true });
  
  modalCard.addEventListener('touchend', () => {
    resetCardEffect(modalCard);
  });
}

/**
 * Add entrance animation to cards (only spread cards, not reading cards)
 */
function animateCardsEntrance() {
  const spreadCards = document.querySelectorAll('.celtic-cross .card');
  spreadCards.forEach((card, index) => {
    card.style.opacity = '0';
    
    // Don't override the rotation transforms for center cards
    if (!card.classList.contains('card-base') && !card.classList.contains('card-crossing')) {
      card.style.transform = 'translateY(30px) scale(0.9)';
    }
    
    setTimeout(() => {
      card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      card.style.opacity = '1';
      
      if (!card.classList.contains('card-base') && !card.classList.contains('card-crossing')) {
        card.style.transform = 'translateY(0) scale(1)';
      }
    }, 100 + (index * 100));
  });
}

/**
 * Initialize everything when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
  initCards();
  initModal();
  animateCardsEntrance();
});

// Add subtle floating animation to cards on idle
let idleTimer;
let isIdle = false;

function startIdleAnimation() {
  if (isIdle) return;
  isIdle = true;
  
  // Only animate spread cards, not reading section cards
  const spreadCards = document.querySelectorAll('.celtic-cross .card:not(.card-base):not(.card-crossing)');
  spreadCards.forEach((card, index) => {
    const delay = index * 0.2;
    card.style.animation = `float 4s ease-in-out ${delay}s infinite`;
  });
}

function stopIdleAnimation() {
  isIdle = false;
  const spreadCards = document.querySelectorAll('.celtic-cross .card');
  spreadCards.forEach(card => {
    card.style.animation = '';
  });
}

// Add float animation keyframes dynamically
const style = document.createElement('style');
style.textContent = `
  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-5px); }
  }
  /* Don't animate center cross cards to preserve rotation */
  .card-base, .card-crossing {
    animation: none !important;
  }
`;
document.head.appendChild(style);

// Start idle animation after 5 seconds of no interaction
document.addEventListener('mousemove', () => {
  stopIdleAnimation();
  clearTimeout(idleTimer);
  idleTimer = setTimeout(startIdleAnimation, 5000);
});

document.addEventListener('touchstart', () => {
  stopIdleAnimation();
  clearTimeout(idleTimer);
  idleTimer = setTimeout(startIdleAnimation, 5000);
}, { passive: true });

// Start idle animation initially after page load
setTimeout(startIdleAnimation, 3000);
