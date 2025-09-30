// Space Academy Navigation System

// User session management
let currentUser = {
    name: '',
    isLoggedIn: false
};

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    loadUserSession();
    updateAstronautName();
    
    // Auto-focus name input on welcome page
    const nameInput = document.getElementById('studentName');
    if (nameInput) {
        nameInput.focus();
        
        // Allow Enter key to launch
        nameInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                launchAcademy();
            }
        });
    }
});

// Save user session to localStorage
function saveUserSession() {
    localStorage.setItem('spaceAcademyUser', JSON.stringify(currentUser));
}

// Load user session from localStorage
function loadUserSession() {
    const saved = localStorage.getItem('spaceAcademyUser');
    if (saved) {
        currentUser = JSON.parse(saved);
    }
}

// Update astronaut name display
function updateAstronautName() {
    const nameElements = document.querySelectorAll('#astronautName');
    nameElements.forEach(element => {
        element.textContent = currentUser.name || 'Cadet';
    });
}

// Launch Academy (from welcome page)
function launchAcademy() {
    const nameInput = document.getElementById('studentName');
    const name = nameInput.value.trim();
    
    if (name === '') {
        alert('Please enter your name, future astronaut!');
        nameInput.focus();
        return;
    }
    
    if (name.length > 20) {
        alert('Name is too long! Please use 20 characters or less.');
        nameInput.focus();
        return;
    }
    
    // Save user data
    currentUser.name = name;
    currentUser.isLoggedIn = true;
    saveUserSession();
    
    // Navigate to menu
    window.location.href = '/menu.html';
}

// Navigation functions
function navigateToLessons() {
    window.location.href = '/lessons';
}

function navigateToChallenges() {
    window.location.href = '/challenges.html';
}

function goToMenu() {
    window.location.href = '/menu.html';
}

function goToChallenges() {
    window.location.href = '/challenges.html';
}

function goBack() {
    window.location.href = '/';
}

// Game launch functions (with coming soon alerts)
function launchMathGame() {
    window.location.href = '/math-game.html';
}

function launchChineseGame() {
    showComingSoonAlert('Chinese Quest', 'Explore the galaxy of Chinese characters and unlock ancient wisdom!');
    // Future: window.location.href = 'chinese-game.html';
}

// Coming soon alert
function showComingSoonAlert(gameName, description) {
    alert(`🚀 ${gameName} - Coming Soon!\n\n${description}\n\nOur space engineers are working hard to launch this mission. Stay tuned, astronaut ${currentUser.name}!`);
}

// Update AI Tutor system message with user name
function updateAISystemMessage() {
    if (window.aiChatbot && currentUser.name) {
        // Update the system message to include the user's name
        const personalizedMessage = `You are a math tutor AI for ${currentUser.name}. Help them learn mathematics by explaining concepts clearly, providing step-by-step solutions, and asking follow-up questions to test understanding. Be encouraging and patient. Address them by their name occasionally to make it personal.`;
        
        // Update the conversation history
        if (window.aiChatbot.conversationHistory && window.aiChatbot.conversationHistory.length > 0) {
            window.aiChatbot.conversationHistory[0].content = personalizedMessage;
        }
    }
}

// Check if user is logged in (for protected pages)
function checkUserSession() {
    if (!currentUser.isLoggedIn && !currentUser.name) {
        // Redirect to welcome page if not logged in
        window.location.href = 'welcome.html';
        return false;
    }
    return true;
}

// No auto-redirect - let users navigate freely

// Update system message when AI chatbot loads
window.addEventListener('load', function() {
    setTimeout(updateAISystemMessage, 1000);
});

// Achievements navigation
function goToAchievements() {
    window.location.href = '/achievements.html';
}