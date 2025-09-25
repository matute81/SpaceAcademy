# 🛠️ Space Academy - Technical Specification

## 📋 System Architecture

### High-Level Overview
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Serverless     │    │   External      │
│   (Static)      │◄──►│   Functions      │◄──►│   APIs          │
│                 │    │   (Vercel)       │    │   (xAI Grok)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Technology Stack
- **Frontend Framework**: Vanilla JavaScript (ES6+)
- **Rendering Engine**: HTML5 Canvas API
- **Styling**: CSS3 with Flexbox/Grid
- **AI Integration**: xAI Grok API
- **Deployment**: Vercel Edge Functions
- **Version Control**: Git

## 🎮 Game Engine Specification

### Core Game Loop
```javascript
gameLoop() {
    this.update();     // Update game state
    this.render();     // Render to canvas
    requestAnimationFrame(() => this.gameLoop());
}
```

### Game State Management
```javascript
gameState: 'menu' | 'playing' | 'paused' | 'boss' | 'gameOver'
```

### Canvas Configuration
- **Resolution**: 700x500 pixels
- **Rendering Context**: 2D
- **Frame Rate**: 60 FPS target
- **Coordinate System**: Top-left origin

### Physics System
```javascript
// Asteroid Movement
asteroid.y += asteroid.speed; // Gravity simulation
ship.x += shipSpeed;          // Horizontal movement

// Collision Detection
if (laser.intersects(asteroid)) {
    // Handle collision
}
```

## 🧮 Math Problem Generation

### Difficulty Levels
```javascript
difficulty = {
    easy: { 
        operations: ['+', '-'], 
        range: [1, 20], 
        points: 10, 
        speed: 0.8 
    },
    medium: { 
        operations: ['+', '-', '×'], 
        range: [1, 50], 
        points: 25, 
        speed: 1.0 
    },
    hard: { 
        operations: ['×', '÷'], 
        range: [1, 100], 
        points: 50, 
        speed: 1.2 
    }
}
```

### Answer Choice Generation
```javascript
generateAnswerChoices(correctAnswer, difficulty) {
    const choices = [correctAnswer];
    
    // Generate plausible wrong answers
    while (choices.length < difficulty.choices) {
        let wrongAnswer = generatePlausibleWrong(correctAnswer);
        if (!choices.includes(wrongAnswer)) {
            choices.push(wrongAnswer);
        }
    }
    
    return shuffle(choices);
}
```

## 🤖 AI Integration Architecture

### API Endpoint Structure
```
POST /api/chat
Content-Type: application/json

{
    "messages": [
        {
            "role": "system",
            "content": "System prompt for AI behavior"
        },
        {
            "role": "user", 
            "content": "User's question or request"
        }
    ]
}
```

### Boss Encounter AI Prompt
```javascript
const bossPrompt = `
Create a space-themed math boss encounter for wave ${this.wave}.
Player stats: Score ${this.score}, ${this.correctAnswers}/${this.totalAnswers} correct.

Return JSON with:
{
    "story": "Brief dramatic story (2-3 sentences, <50 words)",
    "problem": "Math word problem with numerical answer",
    "correctAnswer": numerical_answer_only,
    "choices": [choice1, choice2, choice3, choice4],
    "successMessage": "Victory message",
    "failMessage": "Encouraging failure message"
}

IMPORTANT: Include correct answer in choices array.
`;
```

### AI Response Validation
```javascript
validateBossResponse(bossData) {
    const correctAnswer = parseInt(bossData.correctAnswer);
    const choices = bossData.choices.map(choice => parseInt(choice));
    
    if (!choices.includes(correctAnswer)) {
        console.error('Correct answer not in choices!');
        choices[0] = correctAnswer; // Force inclusion
    }
    
    return { ...bossData, choices };
}
```

## 🎨 UI/UX Component Specification

### Game UI Elements
```css
.game-ui {
    display: flex;
    justify-content: space-between;
    padding: 20px;
    background: rgba(0, 0, 0, 0.3);
}

.ui-value {
    color: #4facfe;
    font-weight: bold;
    font-size: 1.2rem;
}
```

### Animation System
```javascript
// Message entrance animation
animateMessage(messageElement, isBot) {
    messageElement.style.opacity = '0';
    messageElement.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        messageElement.style.transition = 'all 0.3s ease';
        messageElement.style.opacity = '1';
        messageElement.style.transform = 'translateY(0)';
    }, isBot ? 200 : 0);
}
```

### Responsive Design Breakpoints
```css
/* Desktop (default) */
@media (min-width: 1200px) { /* 1920x1080 optimized */ }

/* Tablet */
@media (max-width: 1199px) and (min-width: 768px) { /* Future enhancement */ }

/* Mobile */
@media (max-width: 767px) { /* Future enhancement */ }
```

## 🔧 Performance Optimization

### Canvas Optimization
```javascript
// Object pooling for particles
const particlePool = [];

createParticle() {
    return particlePool.pop() || new Particle();
}

destroyParticle(particle) {
    particle.reset();
    particlePool.push(particle);
}
```

### Memory Management
```javascript
// Clean up event listeners
cleanup() {
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('keyup', this.handleKeyUp);
}
```

### Asset Loading
```javascript
// Preload audio assets
const audioAssets = {
    shoot: new Audio('/sounds/shoot.wav'),
    explosion: new Audio('/sounds/explosion.wav'),
    notification: new Audio('/sounds/notification.wav')
};
```

## 🔒 Security Implementation

### API Key Protection
```javascript
// Environment variable usage
const XAI_API_KEY = process.env.XAI_API_KEY;

// Never expose in client-side code
if (!XAI_API_KEY) {
    throw new Error('XAI_API_KEY environment variable required');
}
```

### Input Validation
```javascript
// Sanitize user input
function sanitizeInput(input) {
    return input
        .trim()
        .slice(0, 500) // Limit length
        .replace(/[<>]/g, ''); // Remove potential XSS
}
```

### Rate Limiting
```javascript
// Simple rate limiting for API calls
const rateLimiter = {
    calls: 0,
    resetTime: Date.now() + 60000, // 1 minute
    
    canMakeCall() {
        if (Date.now() > this.resetTime) {
            this.calls = 0;
            this.resetTime = Date.now() + 60000;
        }
        
        return this.calls < 10; // 10 calls per minute
    }
};
```

## 📊 Data Flow Diagrams

### Game State Flow
```
Menu → Playing → [Boss Encounter] → Playing → Game Over
  ↑                                              ↓
  └──────────────── Restart ←───────────────────┘
```

### AI Tutor Flow
```
User Input → Sanitization → API Call → Response → Display
     ↑                                              ↓
     └────────── Continue Conversation ←───────────┘
```

### Boss Encounter Flow
```
Wave Complete → AI Generation → Validation → Display Choices → Result → Continue
                      ↓
                 Fallback (if AI fails)
```

## 🧪 Testing Strategy

### Unit Tests
```javascript
// Example test structure
describe('Math Problem Generation', () => {
    test('generates correct answer choices', () => {
        const choices = generateAnswerChoices(42, difficulty.medium);
        expect(choices).toContain(42);
        expect(choices).toHaveLength(4);
    });
});
```

### Integration Tests
```javascript
// API endpoint testing
describe('AI Chat API', () => {
    test('returns valid response format', async () => {
        const response = await fetch('/api/chat', {
            method: 'POST',
            body: JSON.stringify({ messages: testMessages })
        });
        
        expect(response.ok).toBe(true);
        const data = await response.json();
        expect(data.choices).toBeDefined();
    });
});
```

### Performance Tests
```javascript
// Frame rate monitoring
const performanceMonitor = {
    frameCount: 0,
    lastTime: performance.now(),
    
    update() {
        this.frameCount++;
        const currentTime = performance.now();
        
        if (currentTime - this.lastTime >= 1000) {
            console.log(`FPS: ${this.frameCount}`);
            this.frameCount = 0;
            this.lastTime = currentTime;
        }
    }
};
```

## 🚀 Deployment Configuration

### Vercel Settings
```json
{
    "version": 2,
    "builds": [
        {
            "src": "api/**/*.js",
            "use": "@vercel/node"
        }
    ],
    "routes": [
        {
            "src": "/api/(.*)",
            "dest": "/api/$1"
        },
        {
            "src": "/(.*)",
            "dest": "/$1"
        }
    ],
    "env": {
        "XAI_API_KEY": "@xai-api-key"
    }
}
```

### Build Process
```bash
# Production build steps
1. Minify JavaScript files
2. Optimize CSS (remove unused styles)
3. Compress images and audio assets
4. Generate source maps for debugging
5. Deploy to Vercel edge network
```

## 📈 Monitoring & Analytics

### Error Tracking
```javascript
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    // Send to monitoring service
});

// Game-specific error handling
try {
    this.updateGame();
} catch (error) {
    console.error('Game update error:', error);
    this.handleGameError(error);
}
```

### Performance Metrics
```javascript
// Track key metrics
const metrics = {
    gameStartTime: Date.now(),
    questionsAnswered: 0,
    correctAnswers: 0,
    averageResponseTime: 0,
    
    recordAnswer(isCorrect, responseTime) {
        this.questionsAnswered++;
        if (isCorrect) this.correctAnswers++;
        this.averageResponseTime = 
            (this.averageResponseTime + responseTime) / 2;
    }
};
```

## 🔄 Future Scalability

### Database Integration (Future)
```javascript
// Planned user progress tracking
const userProgress = {
    userId: 'unique-identifier',
    totalScore: 0,
    wavesCompleted: 0,
    accuracy: 0.85,
    preferredDifficulty: 'medium',
    lastPlayed: Date.now()
};
```

### Microservices Architecture (Future)
```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│   Game      │  │   AI        │  │  Analytics  │
│  Service    │  │  Service    │  │   Service   │
└─────────────┘  └─────────────┘  └─────────────┘
       │                │                │
       └────────────────┼────────────────┘
                        │
              ┌─────────────┐
              │   API       │
              │  Gateway    │
              └─────────────┘
```

---

This technical specification serves as the blueprint for Space Academy's architecture, implementation details, and future development roadmap.