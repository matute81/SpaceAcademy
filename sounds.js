// Space Academy Sound System

class SpaceSounds {
    constructor() {
        this.sounds = {};
        this.isEnabled = true;
        this.volume = 0.3;
        
        // Initialize sounds
        this.initializeSounds();
        this.loadSoundSettings();
    }
    
    initializeSounds() {
        // Create audio contexts for different sound types
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Generate space-themed sounds using Web Audio API
        this.createSpaceSounds();
    }
    
    createSpaceSounds() {
        // Button hover sound - soft beep
        this.sounds.hover = this.createTone(800, 0.1, 'sine');
        
        // Button click sound - space blip
        this.sounds.click = this.createTone(600, 0.2, 'square');
        
        // Page transition - whoosh
        this.sounds.transition = this.createWhoosh();
        
        // Success sound - ascending tones
        this.sounds.success = this.createSuccessChime();
        
        // Error sound - descending tone
        this.sounds.error = this.createTone(300, 0.3, 'sawtooth');
        
        // Typing sound - soft clicks
        this.sounds.typing = this.createTone(1200, 0.05, 'sine');
        
        // Launch sound - rocket boost
        this.sounds.launch = this.createLaunchSound();
        
        // Notification - gentle chime
        this.sounds.notification = this.createTone(1000, 0.4, 'triangle');
    }
    
    createTone(frequency, duration, waveType = 'sine') {
        return () => {
            if (!this.isEnabled) return;
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
            oscillator.type = waveType;
            
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(this.volume, this.audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
        };
    }
    
    createWhoosh() {
        return () => {
            if (!this.isEnabled) return;
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.5);
            oscillator.type = 'sawtooth';
            
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(this.volume * 0.5, this.audioContext.currentTime + 0.1);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.5);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.5);
        };
    }
    
    createSuccessChime() {
        return () => {
            if (!this.isEnabled) return;
            
            const frequencies = [523, 659, 784]; // C, E, G notes
            frequencies.forEach((freq, index) => {
                setTimeout(() => {
                    const oscillator = this.audioContext.createOscillator();
                    const gainNode = this.audioContext.createGain();
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(this.audioContext.destination);
                    
                    oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
                    oscillator.type = 'sine';
                    
                    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
                    gainNode.gain.linearRampToValueAtTime(this.volume * 0.3, this.audioContext.currentTime + 0.01);
                    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.3);
                    
                    oscillator.start(this.audioContext.currentTime);
                    oscillator.stop(this.audioContext.currentTime + 0.3);
                }, index * 100);
            });
        };
    }
    
    createLaunchSound() {
        return () => {
            if (!this.isEnabled) return;
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(100, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.8);
            oscillator.type = 'sawtooth';
            
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(this.volume * 0.6, this.audioContext.currentTime + 0.2);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.8);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.8);
        };
    }
    
    // Play sound methods
    playHover() { this.sounds.hover(); }
    playClick() { this.sounds.click(); }
    playTransition() { this.sounds.transition(); }
    playSuccess() { this.sounds.success(); }
    playError() { this.sounds.error(); }
    playTyping() { this.sounds.typing(); }
    playLaunch() { this.sounds.launch(); }
    playNotification() { this.sounds.notification(); }
    
    // Settings
    toggleSound() {
        this.isEnabled = !this.isEnabled;
        this.saveSoundSettings();
        return this.isEnabled;
    }
    
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        this.saveSoundSettings();
    }
    
    saveSoundSettings() {
        localStorage.setItem('spaceAcademySounds', JSON.stringify({
            enabled: this.isEnabled,
            volume: this.volume
        }));
    }
    
    loadSoundSettings() {
        const saved = localStorage.getItem('spaceAcademySounds');
        if (saved) {
            const settings = JSON.parse(saved);
            this.isEnabled = settings.enabled !== false; // Default to true
            this.volume = settings.volume || 0.3;
        }
    }
}

// Initialize sound system
const spaceSounds = new SpaceSounds();

// Add sound effects to existing elements
document.addEventListener('DOMContentLoaded', function() {
    addSoundEffects();
});

function addSoundEffects() {
    // Add hover sounds to buttons and cards
    const interactiveElements = document.querySelectorAll('button, .mission-card, .game-card, .back-btn');
    interactiveElements.forEach(element => {
        element.addEventListener('mouseenter', () => spaceSounds.playHover());
        element.addEventListener('click', () => spaceSounds.playClick());
    });
    
    // Add typing sounds to input fields
    const inputs = document.querySelectorAll('input[type="text"], input[type="number"], textarea');
    inputs.forEach(input => {
        input.addEventListener('keydown', () => spaceSounds.playTyping());
    });
    
    // Add launch sound to main launch button
    const launchBtn = document.getElementById('launchBtn');
    if (launchBtn) {
        launchBtn.addEventListener('click', () => {
            spaceSounds.playLaunch();
        });
    }
    
    // Add transition sounds to navigation
    const navLinks = document.querySelectorAll('a, [onclick*="navigate"], [onclick*="goTo"]');
    navLinks.forEach(link => {
        link.addEventListener('click', () => spaceSounds.playTransition());
    });
}

// Export for use in other scripts
window.spaceSounds = spaceSounds;