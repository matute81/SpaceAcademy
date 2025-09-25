class AIChatbot {
    constructor() {
        this.apiUrl = '/api/chat'; // Use our local server endpoint
        this.conversationHistory = [];

        this.chatContainer = document.getElementById('chatContainer');
        this.messageInput = document.getElementById('messageInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.statusText = document.getElementById('statusText');
        this.typingIndicator = document.getElementById('typingIndicator');

        this.setupEventListeners();
        this.initializeConversation();
    }

    setupEventListeners() {
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !this.sendBtn.disabled) {
                this.sendMessage();
            }
        });
    }

    initializeConversation() {
        this.conversationHistory = [
            {
                role: "system",
                content: "You are a friendly math tutor for kids. Keep your answers short and simple - like you're talking to a 10-year-old. Use easy words, fun examples, and be encouraging. Keep responses to 2-3 sentences max unless they ask for more details."
            }
        ];
    }

    addMessage(content, isBot = true) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isBot ? 'bot-message' : 'user-message'}`;

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';

        if (isBot) {
            contentDiv.innerHTML = `<span class="bot-name">AI Assistant:</span> ${content}`;
        } else {
            contentDiv.innerHTML = `<span class="user-name">You:</span> ${content}`;
        }

        messageDiv.appendChild(contentDiv);
        this.chatContainer.appendChild(messageDiv);

        // Add entrance animation
        if (window.spaceAnimations) {
            window.spaceAnimations.animateMessage(messageDiv, isBot);
        }

        // Play notification sound for bot messages
        if (isBot && window.spaceSounds) {
            setTimeout(() => window.spaceSounds.playNotification(), 200);
        }

        this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
    }

    showTyping() {
        this.statusText.textContent = 'AI is typing...';
        this.typingIndicator.style.display = 'flex';
        this.messageInput.disabled = true;
        this.sendBtn.disabled = true;
    }

    hideTyping() {
        this.statusText.textContent = 'Ready to chat';
        this.typingIndicator.style.display = 'none';
        this.messageInput.disabled = false;
        this.sendBtn.disabled = false;
        this.messageInput.focus();
    }

    async callAI(userMessage) {
        try {
            // Add user message to conversation history
            this.conversationHistory.push({
                role: "user",
                content: userMessage
            });

            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messages: this.conversationHistory
                })
            });

            if (!response.ok) {
                throw new Error(`Server request failed: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            if (data.error) {
                throw new Error(data.message || 'Server error');
            }

            const aiResponse = data.choices[0].message.content;

            // Add AI response to conversation history
            this.conversationHistory.push({
                role: "assistant",
                content: aiResponse
            });

            return aiResponse;

        } catch (error) {
            console.error('Error calling AI API:', error);
            return `Sorry, I encountered an error: ${error.message}. Please try again.`;
        }
    }

    async sendMessage() {
        const message = this.messageInput.value.trim();
        if (message === '') return;

        // Add user message to chat
        this.addMessage(message, false);
        this.messageInput.value = '';

        // Show typing indicator
        this.showTyping();

        try {
            // Get AI response
            const aiResponse = await this.callAI(message);

            // Add AI response to chat
            this.addMessage(aiResponse, true);

        } catch (error) {
            this.addMessage('Sorry, something went wrong. Please try again.', true);
        } finally {
            // Hide typing indicator
            this.hideTyping();
        }
    }
}

// Initialize the chatbot
const aiChatbot = new AIChatbot();

// Global function for button click
function sendMessage() {
    aiChatbot.sendMessage();
}

// Global function for quick action buttons
function sendQuickMessage(message) {
    // Set the message in the input field
    aiChatbot.messageInput.value = message;
    
    // Send the message
    aiChatbot.sendMessage();
}