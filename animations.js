// Space Academy Animation System

class SpaceAnimations {
    constructor() {
        this.isTransitioning = false;
        this.init();
    }
    
    init() {
        this.addPageEnterAnimation();
        this.addStaggeredAnimations();
        this.addInteractionFeedback();
        this.addLoadingAnimation();
    }
    
    // Add entrance animation to current page
    addPageEnterAnimation() {
        document.body.classList.add('page-enter');
        
        // Remove the class after animation completes
        setTimeout(() => {
            document.body.classList.remove('page-enter');
        }, 600);
    }
    
    // Add staggered animations to grid items
    addStaggeredAnimations() {
        const gridItems = document.querySelectorAll('.mission-card, .game-card');
        gridItems.forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(30px)';
            
            setTimeout(() => {
                item.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
            }, 100 + (index * 150));
        });
    }
    
    // Add interaction feedback animations
    addInteractionFeedback() {
        // Success animation for form submissions
        this.addSuccessAnimation();
        
        // Error animation for validation failures
        this.addErrorAnimation();
        
        // Hover sound integration
        this.addHoverEffects();
    }
    
    addSuccessAnimation() {
        const forms = document.querySelectorAll('form, .name-input-container');
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                const submitBtn = form.querySelector('button[type="submit"], #launchBtn');
                if (submitBtn) {
                    submitBtn.classList.add('bounce');
                    setTimeout(() => submitBtn.classList.remove('bounce'), 600);
                }
            });
        });
    }
    
    addErrorAnimation() {
        // Add shake animation to inputs on validation error
        const inputs = document.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('invalid', () => {
                input.classList.add('shake');
                setTimeout(() => input.classList.remove('shake'), 500);
            });
        });
    }
    
    addHoverEffects() {
        const interactiveElements = document.querySelectorAll('button, .mission-card, .game-card');
        
        interactiveElements.forEach(element => {
            element.addEventListener('mouseenter', () => {
                if (!element.classList.contains('disabled')) {
                    element.style.transform = element.style.transform || '';
                }
            });
            
            element.addEventListener('mouseleave', () => {
                if (!element.classList.contains('disabled')) {
                    // Reset transform but keep other styles
                    const currentTransform = element.style.transform;
                    if (currentTransform.includes('scale') || currentTransform.includes('translateY')) {
                        element.style.transform = '';
                    }
                }
            });
        });
    }
    
    // Smooth page transitions
    async transitionToPage(url, direction = 'forward') {
        if (this.isTransitioning) return;
        this.isTransitioning = true;
        
        // Play transition sound
        if (window.spaceSounds) {
            window.spaceSounds.playTransition();
        }
        
        // Add exit animation
        document.body.classList.add('page-exit');
        
        // Show loading overlay
        this.showLoadingOverlay();
        
        // Wait for exit animation
        await this.delay(400);
        
        // Navigate to new page
        window.location.href = url;
    }
    
    showLoadingOverlay() {
        let overlay = document.querySelector('.loading-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'loading-overlay';
            overlay.innerHTML = `
                <div class="loading-content">
                    <div class="loading-spinner"></div>
                    <p style="margin-top: 20px; font-size: 1.1rem;">Navigating through space...</p>
                </div>
            `;
            document.body.appendChild(overlay);
        }
        
        overlay.classList.remove('hidden');
        
        // Hide after a short delay
        setTimeout(() => {
            overlay.classList.add('hidden');
        }, 800);
    }
    
    addLoadingAnimation() {
        // Add loading animation to buttons when clicked
        const buttons = document.querySelectorAll('button');
        buttons.forEach(button => {
            button.addEventListener('click', () => {
                if (button.onclick && button.onclick.toString().includes('navigate')) {
                    this.addButtonLoadingState(button);
                }
            });
        });
    }
    
    addButtonLoadingState(button) {
        const originalText = button.textContent;
        button.textContent = 'Loading...';
        button.disabled = true;
        button.style.opacity = '0.7';
        
        setTimeout(() => {
            button.textContent = originalText;
            button.disabled = false;
            button.style.opacity = '1';
        }, 1000);
    }
    
    // Utility function for delays
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    // Add special effects
    addSparkleEffect(element) {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle-effect';
        sparkle.style.cssText = `
            position: absolute;
            width: 4px;
            height: 4px;
            background: #fff;
            border-radius: 50%;
            pointer-events: none;
            animation: sparkle-fade 1s ease-out forwards;
        `;
        
        const rect = element.getBoundingClientRect();
        sparkle.style.left = (rect.left + Math.random() * rect.width) + 'px';
        sparkle.style.top = (rect.top + Math.random() * rect.height) + 'px';
        
        document.body.appendChild(sparkle);
        
        setTimeout(() => sparkle.remove(), 1000);
    }
    
    // Animate message appearance in chat
    animateMessage(messageElement, isBot = true) {
        messageElement.style.opacity = '0';
        messageElement.style.transform = isBot ? 'translateX(-30px)' : 'translateX(30px)';
        
        setTimeout(() => {
            messageElement.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
            messageElement.style.opacity = '1';
            messageElement.style.transform = 'translateX(0)';
        }, 50);
    }
    
    // Typing animation for AI responses
    simulateTyping(element, text, speed = 50) {
        element.textContent = '';
        let i = 0;
        
        const typeInterval = setInterval(() => {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                
                // Play typing sound occasionally
                if (window.spaceSounds && i % 3 === 0) {
                    window.spaceSounds.playTyping();
                }
            } else {
                clearInterval(typeInterval);
            }
        }, speed);
    }
}

// Add sparkle animation CSS
const sparkleCSS = `
@keyframes sparkle-fade {
    0% {
        opacity: 1;
        transform: scale(0) rotate(0deg);
    }
    50% {
        opacity: 1;
        transform: scale(1) rotate(180deg);
    }
    100% {
        opacity: 0;
        transform: scale(0) rotate(360deg);
    }
}
`;

const style = document.createElement('style');
style.textContent = sparkleCSS;
document.head.appendChild(style);

// Initialize animations when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.spaceAnimations = new SpaceAnimations();
});

// Export for use in other scripts
window.SpaceAnimations = SpaceAnimations;