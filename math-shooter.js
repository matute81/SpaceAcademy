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
        this.ship = { x: 400, y: 550, width: 40, height: 30 };
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

            // Remove asteroids that hit the bottom
            if (asteroid.y > this.canvas.height + 50) {
                this.asteroids.splice(index, 1);
                this.loseLife();
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

        // Display question
        document.getElementById('currentQuestion').textContent = `Solve: ${this.currentQuestion}`;

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

            // Success feedback
            document.getElementById('gameStatus').textContent = `Correct! +${targetAsteroid.points} points`;

            // Clear all asteroids (question complete)
            this.asteroids = [];

        } else {
            // Wrong answer - lose a life!
            this.createExplosion(targetAsteroid.x, targetAsteroid.y);
            this.destroyAsteroid(targetAsteroid);
            this.shakeScreen();
            this.loseLife();
            document.getElementById('gameStatus').textContent = `Wrong! -1 Life. Look for ${this.correctAnswer}`;
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
        // Check if any asteroid reached the ship area
        this.asteroids.forEach((asteroid, index) => {
            if (asteroid.y > this.ship.y - 20) {
                this.asteroids.splice(index, 1);
                this.loseLife();
            }
        });
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
    }

    checkWaveComplete() {
        if (this.waveProgress >= this.questionsPerWave && this.asteroids.length === 0) {
            this.completeWave();
        }
    }

    completeWave() {
        this.wave++;
        this.waveProgress = 0;

        // Check for boss wave (every 3 waves: 3, 6, 9, 12, etc.)
        if (this.wave % 3 === 0 && this.wave >= 3) {
            this.startBossEncounter();
        } else {
            this.updateUI();
            document.getElementById('gameStatus').textContent = `Wave ${this.wave} - Get ready!`;
        }
    }

    async startBossEncounter() {
        this.gameState = 'boss';
        this.bossActive = true;

        // Show boss overlay
        document.getElementById('bossOverlay').style.display = 'flex';
        document.getElementById('bossStory').textContent = 'Generating boss encounter...';

        // Clear current question display
        document.getElementById('currentQuestion').textContent = 'BOSS ENCOUNTER!';

        try {
            // Generate boss encounter with AI
            await this.generateBossEncounter();
        } catch (error) {
            console.error('Boss generation failed:', error);
            this.fallbackBossEncounter();
        }
    }

    async generateBossEncounter() {
        const prompt = `Create a space-themed math boss encounter for wave ${this.wave}. 
        The player is playing games to learn Math. 
        Here is the Player's stats where you can assess the player's ability and create the difficulty of the math problem accordingly.
        Player stats: Score ${this.score}, ${this.correctAnswers}/${this.totalAnswers} correct answers.
        
        Return JSON with:
        {
            "story": "Brief dramatic story (2-3 sentences and less than 50 words)",
            "problem": "Math word problem that results in a numerical answer",
            "answer": numerical_answer_only,
            "successMessage": "Victory message",
            "failMessage": "Failure message but encouraging"
        }
        
        The answer should be a single number that the player will choose from multiple choice options.
        Make the math problem challenging but fair for wave ${this.wave}.
        
        Difficulty guidelines:
        - Wave 1-3: Basic addition/subtraction (numbers 1-50)
        - Wave 4-6: Multiplication/division (single digit × single digit)
        - Wave 7-9: Mixed operations (numbers up to 100)
        - Wave 10+: Multi-step problems or larger numbers
        
        If player accuracy is low (< 60%), make the problem easier.
        If player accuracy is high (> 80%), make it more challenging.`;

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
            console.log('Answer from AI:', this.bossData.answer, 'Type:', typeof this.bossData.answer);

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
        const aiAnswer = parseInt(this.bossData.answer);

        console.log('🔍 VALIDATION CHECK:');
        console.log('Problem:', problem);
        console.log('AI Answer:', aiAnswer);

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

        // Check for addition
        const addMatch = problem.match(/(\d+)\s*[+]\s*(\d+)/);
        if (addMatch) {
            const num1 = parseInt(addMatch[1]);
            const num2 = parseInt(addMatch[2]);
            const calculatedAnswer = num1 + num2;

            console.log(`Found addition: ${num1} + ${num2} = ${calculatedAnswer}`);

            if (calculatedAnswer !== aiAnswer) {
                console.error('🚨 ADDITION MISMATCH!');
                this.bossData.answer = calculatedAnswer;
            }
        }

        // Check for subtraction
        const subMatch = problem.match(/(\d+)\s*[-]\s*(\d+)/);
        if (subMatch) {
            const num1 = parseInt(subMatch[1]);
            const num2 = parseInt(subMatch[2]);
            const calculatedAnswer = num1 - num2;

            console.log(`Found subtraction: ${num1} - ${num2} = ${calculatedAnswer}`);

            if (calculatedAnswer !== aiAnswer) {
                console.error('🚨 SUBTRACTION MISMATCH!');
                this.bossData.answer = calculatedAnswer;
            }
        }

        // Check for division
        const divMatch = problem.match(/(\d+)\s*[÷/]\s*(\d+)/);
        if (divMatch) {
            const num1 = parseInt(divMatch[1]);
            const num2 = parseInt(divMatch[2]);
            const calculatedAnswer = num1 / num2;

            console.log(`Found division: ${num1} ÷ ${num2} = ${calculatedAnswer}`);

            if (calculatedAnswer !== aiAnswer) {
                console.error('🚨 DIVISION MISMATCH!');
                this.bossData.answer = calculatedAnswer;
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
            problem: "Fallback mode activated - this means the AI API is not working",
            answer: 42,
            successMessage: "Fallback test passed!",
            failMessage: "This is the fallback system"
        };

        this.displayBossEncounter();
    }

    displayBossEncounter() {
        document.getElementById('bossStory').textContent = this.bossData.story;
        document.getElementById('bossProblem').textContent = this.bossData.problem;

        // Create boss answer choices as asteroids in the overlay
        this.createBossAnswerChoices();
    }

    createBossAnswerChoices() {
        // Ensure correct answer is a number
        const correctAnswer = parseInt(this.bossData.answer);
        console.log('Boss correct answer:', correctAnswer, 'Type:', typeof correctAnswer);

        const choices = this.generateAnswerChoices(correctAnswer, { choices: 4 });
        console.log('Boss answer choices:', choices);

        const bossAnswersDiv = document.getElementById('bossAnswers');
        bossAnswersDiv.innerHTML = '';

        choices.forEach((choice, index) => {
            const answerBtn = document.createElement('button');
            answerBtn.className = 'boss-answer-btn';
            answerBtn.textContent = choice;
            // Convert to number for comparison
            answerBtn.onclick = () => this.selectBossAnswer(parseInt(choice));
            bossAnswersDiv.appendChild(answerBtn);
        });
    }

    selectBossAnswer(selectedAnswer) {
        const correctAnswer = parseInt(this.bossData.answer);

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
            document.getElementById('currentQuestion').textContent = 'Get ready for the next wave!';
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

        // Show game over screen
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('finalWave').textContent = this.wave - 1;
        document.getElementById('finalAccuracy').textContent = accuracy + '%';

        const title = this.score > 1000 ? 'Excellent Mission!' : this.score > 500 ? 'Good Mission!' : 'Mission Complete!';
        document.getElementById('gameOverTitle').textContent = title;

        document.getElementById('gameOver').style.display = 'flex';

        // Disable controls
        document.getElementById('answerInput').disabled = true;
        document.getElementById('shootBtn').disabled = true;
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

    document.getElementById('gameStatus').textContent = 'Move your ship and shoot the correct answers!';
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