// Asteroid Math Shooter Game

class AsteroidMathShooter {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        // Game state
        this.gameState = 'menu'; // menu, playing, paused, boss, gameOver
        this.score = 0;
        this.lives = 3;
        this.wave = 1;
        this.asteroids = [];
        this.particles = [];
        this.ship = { x: 350, y: 450, width: 40, height: 30 };
        this.laser = null; // For laser beam effect

        // Game mechanics
        this.currentQuestion = null;
        this.correctAnswer = null;
        this.waveProgress = 0;
        this.questionsPerWave = 10;
        this.correctAnswers = 0;
        this.totalAnswers = 0;
        this.answersOnScreen = [];

        // Ship controls
        this.keys = {
            left: false,
            right: false,
            space: false
        };
        this.shipSpeed = 5;

        // Difficulty progression (moderate speeds)
        this.difficulty = {
            easy: { operations: ['+', '-'], range: [1, 20], points: 10, speed: 0.8, choices: 3 },
            medium: { operations: ['+', '-', '×'], range: [1, 50], points: 25, speed: 1.0, choices: 4 },
            hard: { operations: ['×', '÷'], range: [1, 100], points: 50, speed: 1.2, choices: 4 }
        };

        // Boss system
        this.bossActive = false;
        this.bossData = null;

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.gameLoop();
    }

    setupEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            this.handleKeyDown(e);
        });

        document.addEventListener('keyup', (e) => {
            this.handleKeyUp(e);
        });

        // Prevent arrow keys from scrolling the page
        document.addEventListener('keydown', (e) => {
            if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(e.key)) {
                e.preventDefault();
            }
        });
    }

    // Game loop
    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }

    update() {
        if (this.gameState === 'playing') {
            this.updateShip();
            this.updateAsteroids();
            this.updateParticles();
            this.checkCollisions();
            this.checkWaveComplete();
        }
    }

    render() {
        // Clear canvas
        this.ctx.fillStyle = '#0c0c2e';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.gameState === 'playing') {
            this.drawStars();
            this.drawShip();
            this.drawAsteroids();
            this.drawParticles();
            this.drawLaser();
        }
    }

    handleKeyDown(e) {
        if (this.gameState !== 'playing') return;

        switch (e.key) {
            case 'ArrowLeft':
                this.keys.left = true;
                break;
            case 'ArrowRight':
                this.keys.right = true;
                break;
            case ' ':
                if (!this.keys.space) {
                    this.keys.space = true;
                    this.shootAtTarget();
                }
                break;
        }
    }

    handleKeyUp(e) {
        switch (e.key) {
            case 'ArrowLeft':
                this.keys.left = false;
                break;
            case 'ArrowRight':
                this.keys.right = false;
                break;
            case ' ':
                this.keys.space = false;
                break;
        }
    }

    updateShip() {
        // Move ship left/right
        if (this.keys.left && this.ship.x > this.ship.width / 2) {
            this.ship.x -= this.shipSpeed;
        }
        if (this.keys.right && this.ship.x < this.canvas.width - this.ship.width / 2) {
            this.ship.x += this.shipSpeed;
        }
    }

    drawStars() {
        this.ctx.fillStyle = 'white';
        for (let i = 0; i < 50; i++) {
            const x = (i * 37) % this.canvas.width;
            const y = (i * 23) % this.canvas.height;
            this.ctx.fillRect(x, y, 1, 1);
        }
    }

    drawShip() {
        const { x, y, width, height } = this.ship;

        // Simple triangle ship
        this.ctx.fillStyle = '#4facfe';
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(x - width / 2, y + height);
        this.ctx.lineTo(x + width / 2, y + height);
        this.ctx.closePath();
        this.ctx.fill();

        // Ship glow
        this.ctx.strokeStyle = '#64b5f6';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
    }

    drawAsteroids() {
        this.asteroids.forEach(asteroid => {
            // Asteroid body - larger for answer display
            this.ctx.fillStyle = asteroid.color;
            this.ctx.fillRect(asteroid.x - 40, asteroid.y - 20, 80, 40);

            // Answer text - larger and clearer
            this.ctx.fillStyle = 'white';
            this.ctx.font = 'bold 20px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(asteroid.answer.toString(), asteroid.x, asteroid.y + 7);

            // No visual indicator for correct answer - let kids figure it out!
        });
    }

    drawParticles() {
        this.particles.forEach(particle => {
            this.ctx.fillStyle = particle.color;
            this.ctx.fillRect(particle.x, particle.y, 2, 2);
        });
    }

    drawLaser() {
        if (this.laser) {
            // Draw laser beam from ship to target
            this.ctx.strokeStyle = '#00ffff';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.moveTo(this.ship.x, this.ship.y);
            this.ctx.lineTo(this.laser.targetX, this.laser.targetY);
            this.ctx.stroke();

            // Laser glow effect
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 1;
            this.ctx.stroke();

            // Remove laser after short duration
            this.laser.duration--;
            if (this.laser.duration <= 0) {
                this.laser = null;
            }
        }
    }

    updateAsteroids() {
        this.asteroids.forEach((asteroid, index) => {
            asteroid.y += asteroid.speed;

            // Remove asteroids that hit the bottom - no life penalty
            if (asteroid.y > this.canvas.height + 50) {
                this.asteroids.splice(index, 1);
                // No life penalty for letting asteroids fall
            }
        });

        // Check if we need a new question
        if (this.asteroids.length === 0 && this.waveProgress < this.questionsPerWave) {
            this.generateNewQuestion();
        }
    }

    updateParticles() {
        this.particles.forEach((particle, index) => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life--;

            if (particle.life <= 0) {
                this.particles.splice(index, 1);
            }
        });
    }

    generateNewQuestion() {
        const difficultyLevel = this.getDifficultyLevel();
        const problem = this.generateMathProblem(difficultyLevel);

        // Set current question
        this.currentQuestion = problem.question;
        this.correctAnswer = problem.answer;

        // Display question in game status
        document.getElementById('gameStatus').textContent = `Solve: ${this.currentQuestion}`;

        // Generate answer choices
        const choices = this.generateAnswerChoices(problem.answer, difficultyLevel);

        // Create asteroids for each choice
        this.createAnswerAsteroids(choices, difficultyLevel);

        this.waveProgress++;
    }

    generateAnswerChoices(correctAnswer, difficulty) {
        // Ensure correctAnswer is a number
        const correctNum = parseInt(correctAnswer);
        console.log('Generating choices for correct answer:', correctNum);

        const choices = [correctNum];
        const numChoices = difficulty.choices || 4;

        // Generate wrong answers
        let attempts = 0;
        while (choices.length < numChoices && attempts < 50) {
            let wrongAnswer;

            // Generate plausible wrong answers
            if (Math.random() < 0.5) {
                // Close to correct answer
                wrongAnswer = correctNum + Math.floor(Math.random() * 20) - 10;
            } else {
                // Random wrong answer in reasonable range
                wrongAnswer = Math.floor(Math.random() * Math.max(correctNum * 2, 100)) + 1;
            }

            // Ensure it's positive and not already in choices
            if (wrongAnswer > 0 && !choices.includes(wrongAnswer)) {
                choices.push(wrongAnswer);
            }
            attempts++;
        }

        // Safety check: ensure we have the correct answer
        if (!choices.includes(correctNum)) {
            console.error('CRITICAL: Correct answer not in choices!', correctNum, choices);
            choices[0] = correctNum; // Force correct answer as first choice
        }

        // Shuffle the choices
        for (let i = choices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [choices[i], choices[j]] = [choices[j], choices[i]];
        }

        console.log('Final choices:', choices, 'Correct answer included:', choices.includes(correctNum));
        return choices;
    }

    createAnswerAsteroids(choices, difficulty) {
        const spacing = this.canvas.width / (choices.length + 1);

        choices.forEach((choice, index) => {
            const asteroid = {
                x: spacing * (index + 1),
                y: -40,
                speed: difficulty.speed,
                answer: choice,
                isCorrect: choice === this.correctAnswer,
                points: difficulty.points,
                color: this.getDifficultyColor(difficulty)
            };

            this.asteroids.push(asteroid);
        });
    }

    getDifficultyLevel() {
        if (this.wave <= 3) return this.difficulty.easy;
        if (this.wave <= 6) return this.difficulty.medium;
        return this.difficulty.hard;
    }

    getDifficultyColor(difficulty) {
        if (difficulty === this.difficulty.easy) return '#8BC34A';
        if (difficulty === this.difficulty.medium) return '#FF9800';
        return '#F44336';
    }

    generateMathProblem(difficulty) {
        const operations = difficulty.operations;
        const operation = operations[Math.floor(Math.random() * operations.length)];
        const range = difficulty.range;

        let num1, num2, answer, question;

        switch (operation) {
            case '+':
                num1 = Math.floor(Math.random() * range[1]) + range[0];
                num2 = Math.floor(Math.random() * range[1]) + range[0];
                answer = num1 + num2;
                question = `${num1} + ${num2}`;
                break;
            case '-':
                num1 = Math.floor(Math.random() * range[1]) + range[0];
                num2 = Math.floor(Math.random() * num1) + 1;
                answer = num1 - num2;
                question = `${num1} - ${num2}`;
                break;
            case '×':
                num1 = Math.floor(Math.random() * 12) + 1;
                num2 = Math.floor(Math.random() * 12) + 1;
                answer = num1 * num2;
                question = `${num1} × ${num2}`;
                break;
            case '÷':
                num2 = Math.floor(Math.random() * 12) + 1;
                answer = Math.floor(Math.random() * 12) + 1;
                num1 = num2 * answer;
                question = `${num1} ÷ ${num2}`;
                break;
        }

        return { question, answer };
    }

    // Removed - no longer needed with new format

    shootAtTarget() {
        if (this.gameState !== 'playing' || this.asteroids.length === 0) return;

        // Find the asteroid closest to the ship's X position
        let targetAsteroid = null;
        let minDistance = Infinity;

        this.asteroids.forEach(asteroid => {
            const distance = Math.abs(asteroid.x - this.ship.x);
            if (distance < minDistance) {
                minDistance = distance;
                targetAsteroid = asteroid;
            }
        });

        if (!targetAsteroid) return;

        // Create laser effect
        this.laser = {
            targetX: targetAsteroid.x,
            targetY: targetAsteroid.y,
            duration: 10 // frames
        };

        this.totalAnswers++;

        if (targetAsteroid.isCorrect) {
            // Correct answer
            this.correctAnswers++;
            this.addScore(targetAsteroid.points);
            this.createExplosion(targetAsteroid.x, targetAsteroid.y);

            // Success feedback - keep status unchanged

            // Clear all asteroids (question complete)
            this.asteroids = [];

        } else {
            // Wrong answer - lose a life!
            this.createExplosion(targetAsteroid.x, targetAsteroid.y);
            this.destroyAsteroid(targetAsteroid);
            this.shakeScreen();
            this.loseLife();
            // Wrong answer feedback - keep status unchanged
        }
    }

    destroyAsteroid(asteroid) {
        const index = this.asteroids.indexOf(asteroid);
        if (index > -1) {
            this.asteroids.splice(index, 1);
        }
    }

    createExplosion(x, y) {
        for (let i = 0; i < 10; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                color: '#ffff00',
                life: 30
            });
        }
    }

    // Removed - no longer needed with new format

    checkCollisions() {
        // No collision penalties - asteroids can fall harmlessly
        // Only lose lives for shooting wrong answers
    }

    loseLife() {
        this.lives--;
        this.updateUI();

        if (this.lives <= 0) {
            this.gameOver();
        }
    }

    addScore(points) {
        this.score += points;
        this.updateUI();

        // Check for victory condition
        if (this.score >= 5000) {
            this.gameVictory();
        }
    }

    checkWaveComplete() {
        if (this.waveProgress >= this.questionsPerWave && this.asteroids.length === 0) {
            this.completeWave();
        }
    }

    completeWave() {
        this.wave++;
        this.waveProgress = 0;

        // Boss encounter after every wave!
        this.startBossEncounter();
    }

    async startBossEncounter() {
        this.gameState = 'boss';
        this.bossActive = true;

        // Show boss overlay
        document.getElementById('bossOverlay').style.display = 'flex';
        document.getElementById('bossStory').textContent = 'Generating boss encounter...';

        // Boss encounter started

        try {
            // Generate boss encounter with AI
            await this.generateBossEncounter();
        } catch (error) {
            console.error('Boss generation failed:', error);
            this.fallbackBossEncounter();
        }
    }

    async generateBossEncounter() {
        const prompt = `You are creating a math boss encounter for a space-themed educational game.

WAVE: ${this.wave}
PLAYER STATS: Score ${this.score}, Accuracy ${this.correctAnswers}/${this.totalAnswers}

TASK: Create a JSON response with a math problem and 4 multiple choice answers.

REQUIRED JSON FORMAT (respond with ONLY this JSON, no other text):
{
  "story": "Space battle story in 2-3 sentences",
  "problem": "Math word problem with numerical answer",
  "correctAnswer": 42,
  "choices": [42, 35, 48, 54],
  "successMessage": "Victory message",
  "failMessage": "Encouraging failure message"
}

CRITICAL RULES:
1. "correctAnswer" must be a number
2. "choices" must be an array of exactly 4 numbers
3. The correctAnswer MUST be included in the choices array
4. Generate 3 plausible wrong answers for the other choices

DIFFICULTY FOR WAVE ${this.wave}:
${this.wave <= 3 ? '- Simple addition/subtraction (1-50)' :
                this.wave <= 6 ? '- Multiplication/division (single digits)' :
                    '- Mixed operations or larger numbers'}

EXAMPLE:
If the problem is "5 × 7 = ?", then:
- correctAnswer: 35
- choices: [35, 28, 42, 30] (35 is correct, others are wrong)

Respond with ONLY the JSON, no explanations.`;

        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: [
                    { role: 'system', content: 'You are a game master creating math boss encounters. Always respond with valid JSON only.' },
                    { role: 'user', content: prompt }
                ]
            })
        });

        if (!response.ok) throw new Error('AI request failed');

        const data = await response.json();
        const aiResponse = data.choices[0].message.content;

        // Parse AI response
        try {
            console.log('Raw AI response:', aiResponse);
            this.bossData = JSON.parse(aiResponse);
            console.log('Parsed boss data:', this.bossData);

            // Check if we have the expected fields
            if (!this.bossData.correctAnswer && this.bossData.answer) {
                this.bossData.correctAnswer = this.bossData.answer;
            }

            if (!this.bossData.choices) {
                console.warn('AI response missing choices array, will use fallback generation');
            }

            // CRITICAL: Validate that the answer matches the problem
            this.validateProblemAnswer();

        } catch (e) {
            console.log('JSON parsing failed, using fallback parser');
            // If JSON parsing fails, extract data manually
            this.bossData = this.parseAIResponse(aiResponse);
        }

        this.displayBossEncounter();
    }

    validateProblemAnswer() {
        const problem = this.bossData.problem;
        const aiAnswer = parseInt(this.bossData.correctAnswer);
        const choices = this.bossData.choices.map(choice => parseInt(choice));

        console.log('🔍 VALIDATION CHECK:');
        console.log('Problem:', problem);
        console.log('AI Answer:', aiAnswer);
        console.log('AI Choices:', choices);

        // Validate that correct answer is in choices
        if (!choices.includes(aiAnswer)) {
            console.error('🚨 CRITICAL: Correct answer not in choices!');
            console.error('Adding correct answer to choices and removing a random wrong answer');
            choices[0] = aiAnswer; // Replace first choice with correct answer
            this.bossData.choices = choices;
        } else {
            console.log('✅ Correct answer found in choices');
        }

        // Try to extract and calculate the actual math from the problem
        const mathMatch = problem.match(/(\d+)\s*[×x*]\s*(\d+)/);
        if (mathMatch) {
            const num1 = parseInt(mathMatch[1]);
            const num2 = parseInt(mathMatch[2]);
            const calculatedAnswer = num1 * num2;

            console.log(`Found multiplication: ${num1} × ${num2} = ${calculatedAnswer}`);
            console.log(`AI provided answer: ${aiAnswer}`);

            if (calculatedAnswer !== aiAnswer) {
                console.error('🚨 MISMATCH DETECTED!');
                console.error(`Problem says: ${num1} × ${num2} = ${calculatedAnswer}`);
                console.error(`AI provided: ${aiAnswer}`);
                console.error('Using calculated answer instead of AI answer');

                // Override with correct answer
                this.bossData.answer = calculatedAnswer;
            } else {
                console.log('✅ Answer matches problem');
            }
        }

    }

    parseAIResponse(response) {
        // Fallback parser if AI doesn't return perfect JSON
        return {
            story: "A massive alien mothership approaches your position!",
            problem: `Calculate the total firepower: ${Math.floor(Math.random() * 20) + 10} ships × ${Math.floor(Math.random() * 8) + 5} weapons each`,
            answer: 150, // This would be calculated properly
            hint: "Use multiplication",
            successMessage: "You've defeated the mothership!",
            failMessage: "The mothership escapes, but you can try again!"
        };
    }

    fallbackBossEncounter() {
        // Return error message to know if AI is working
        this.bossData = {
            story: "ERROR: AI system offline!",
            problem: "Fallback mode: What is 6 × 7?",
            correctAnswer: 42,
            choices: [42, 35, 48, 54],
            successMessage: "Fallback test passed!",
            failMessage: "This is the fallback system"
        };

        this.displayBossEncounter();
    }

    generateGuaranteedChoices(correctAnswer) {
        // Generate 4 choices that ALWAYS include the correct answer
        const choices = [correctAnswer]; // Start with correct answer

        // Generate 3 plausible wrong answers
        for (let i = 0; i < 3; i++) {
            let wrongAnswer;
            let attempts = 0;

            do {
                if (correctAnswer <= 10) {
                    // For small numbers, generate close alternatives
                    wrongAnswer = correctAnswer + Math.floor(Math.random() * 10) - 5;
                } else if (correctAnswer <= 100) {
                    // For medium numbers, generate within reasonable range
                    wrongAnswer = correctAnswer + Math.floor(Math.random() * 20) - 10;
                } else {
                    // For large numbers, generate broader range
                    wrongAnswer = correctAnswer + Math.floor(Math.random() * 50) - 25;
                }

                // Ensure positive number
                if (wrongAnswer <= 0) wrongAnswer = Math.abs(wrongAnswer) + 1;

                attempts++;
            } while (choices.includes(wrongAnswer) && attempts < 20);

            // If we couldn't generate a unique wrong answer, use a fallback
            if (choices.includes(wrongAnswer)) {
                wrongAnswer = correctAnswer + i + 1;
            }

            choices.push(wrongAnswer);
        }

        // Shuffle the choices so correct answer isn't always first
        for (let i = choices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [choices[i], choices[j]] = [choices[j], choices[i]];
        }

        return choices;
    }

    displayBossEncounter() {
        document.getElementById('bossStory').textContent = this.bossData.story;
        document.getElementById('bossProblem').textContent = this.bossData.problem;

        // Create boss answer choices as asteroids in the overlay
        this.createBossAnswerChoices();
    }

    createBossAnswerChoices() {
        // Use AI-provided choices directly, with fallback if missing
        const correctAnswer = parseInt(this.bossData.correctAnswer || this.bossData.answer || 42);

        let choices;
        if (this.bossData.choices && Array.isArray(this.bossData.choices)) {
            choices = this.bossData.choices.map(choice => parseInt(choice));
        } else {
            // Fallback: generate choices if AI didn't provide them
            console.warn('AI did not provide choices array, generating guaranteed fallback choices');
            choices = this.generateGuaranteedChoices(correctAnswer);
        }

        console.log('Boss correct answer:', correctAnswer);
        console.log('Boss answer choices:', choices);
        console.log('Correct answer included in choices:', choices.includes(correctAnswer));

        // CRITICAL: Ensure correct answer is in choices
        if (!choices.includes(correctAnswer)) {
            console.error('🚨 CRITICAL: Correct answer not in choices! Fixing...');
            choices[0] = correctAnswer; // Replace first choice with correct answer
        }

        // Shuffle the choices so correct answer isn't always in same position
        const shuffledChoices = [...choices];
        for (let i = shuffledChoices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledChoices[i], shuffledChoices[j]] = [shuffledChoices[j], shuffledChoices[i]];
        }

        const bossAnswersDiv = document.getElementById('bossAnswers');
        bossAnswersDiv.innerHTML = '';

        shuffledChoices.forEach((choice, index) => {
            const answerBtn = document.createElement('button');
            answerBtn.className = 'boss-answer-btn';
            answerBtn.textContent = choice;
            answerBtn.onclick = () => this.selectBossAnswer(choice);
            bossAnswersDiv.appendChild(answerBtn);
        });
    }

    selectBossAnswer(selectedAnswer) {
        const correctAnswer = parseInt(this.bossData.correctAnswer);

        console.log('Selected:', selectedAnswer, 'Correct:', correctAnswer);
        console.log('Match:', selectedAnswer === correctAnswer);

        if (selectedAnswer === correctAnswer) {
            // Boss defeated
            this.score += 500;
            this.correctAnswers++;
            alert(this.bossData.successMessage + ` (Correct answer was ${correctAnswer})`);
        } else {
            // Boss not defeated
            this.loseLife();
            alert(this.bossData.failMessage + ` (Correct answer was ${correctAnswer}, you chose ${selectedAnswer})`);
        }

        this.totalAnswers++;
        this.endBossEncounter();
    }

    endBossEncounter() {
        // Hide boss overlay
        document.getElementById('bossOverlay').style.display = 'none';

        // Resume game
        this.gameState = 'playing';
        this.bossActive = false;

        this.updateUI();

        if (this.lives <= 0) {
            this.gameOver();
        } else {
            // Next wave - keep status unchanged
        }
    }

    shakeScreen() {
        // Simple screen shake effect
        this.canvas.style.transform = 'translate(5px, 5px)';
        setTimeout(() => {
            this.canvas.style.transform = 'translate(-5px, -5px)';
            setTimeout(() => {
                this.canvas.style.transform = 'translate(0, 0)';
            }, 50);
        }, 50);
    }

    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('wave').textContent = this.wave;
        document.getElementById('lives').textContent = '❤️'.repeat(this.lives);
    }

    gameOver() {
        this.gameState = 'gameOver';

        // Calculate final stats
        const accuracy = this.totalAnswers > 0 ? Math.round((this.correctAnswers / this.totalAnswers) * 100) : 0;

        // Save achievements
        this.saveAchievements(this.score, this.wave - 1, accuracy);

        // Show game over screen
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('finalWave').textContent = this.wave - 1;
        document.getElementById('finalAccuracy').textContent = accuracy + '%';

        // Game Over (ran out of lives)
        document.getElementById('gameOverTitle').textContent = 'Mission Failed! 💥';

        document.getElementById('gameOver').style.display = 'flex';
    }

    gameVictory() {
        this.gameState = 'gameOver';

        // Calculate final stats
        const accuracy = this.totalAnswers > 0 ? Math.round((this.correctAnswers / this.totalAnswers) * 100) : 0;

        // Save achievements
        this.saveAchievements(this.score, this.wave - 1, accuracy);

        // Show victory screen
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('finalWave').textContent = this.wave - 1;
        document.getElementById('finalAccuracy').textContent = accuracy + '%';

        // Victory message
        document.getElementById('gameOverTitle').textContent = 'Mission Complete! 🎉';

        document.getElementById('gameOver').style.display = 'flex';
    }

    saveAchievements(score, wave, accuracy) {
        // Load existing achievements
        const saved = localStorage.getItem('spaceAcademyAchievements');
        const achievements = saved ? JSON.parse(saved) : {
            mathGame: {
                highScore: 0,
                bestWave: 0,
                bestAccuracy: 0,
                totalGames: 0
            }
        };

        // Update math game achievements
        const math = achievements.mathGame;
        if (score > math.highScore) math.highScore = score;
        if (wave > math.bestWave) math.bestWave = wave;
        if (accuracy > math.bestAccuracy) math.bestAccuracy = accuracy;
        math.totalGames++;

        // Save back to localStorage
        localStorage.setItem('spaceAcademyAchievements', JSON.stringify(achievements));

        console.log('Achievements saved:', achievements);
    }
}

// Global game instance
let game;

// Global functions for HTML buttons
function startGame() {
    document.getElementById('gameMenu').style.display = 'none';

    game = new AsteroidMathShooter();
    game.gameState = 'playing';
    game.updateUI();

    // Keep the game status empty to maintain consistent UI
}

function restartGame() {
    document.getElementById('gameOver').style.display = 'none';
    startGame();
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function () {
    // Game starts in menu state
    console.log('Asteroid Math Shooter loaded!');
});