/**
 * Fisher-Yates shuffle algorithm
 * Randomly shuffles array elements
 */
function shuffleArray(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// Application State
class QuizApp {
    constructor() {
        this.chapters = [
            { number: 1, title: "Εισαγωγή στην Τεχνητή Νοημοσύνη", questions: 41, file: "test_kefalaio_1.json" },
            { number: 2, title: "Διασύνδεση AI με Άλλες Τεχνολογίες", questions: 51, file: "test_kefalaio_2.json" },
            { number: 3, title: "Η Αξία των Δεδομένων για την AI", questions: 41, file: "test_kefalaio_3.json" },
            { number: 4, title: "Αλγόριθμοι και Μοντέλα Μηχανικής Μάθησης", questions: 30, file: "test_kefalaio_4.json" },
            { number: 5, title: "Νευρωνικά Δίκτυα και Βαθιά Μάθηση", questions: 40, file: "test_kefalaio_5.json" },
            { number: 6, title: "Ανάπτυξη και Εκπαίδευση Μοντέλων AI", questions: 40, file: "test_kefalaio_6.json" },
            { number: 7, title: "Natural Language Processing (NLP)", questions: 25, file: "test_kefalaio_7.json" },
            { number: 8, title: "Computer Vision", questions: 25, file: "test_kefalaio_8.json" },
            { number: 9, title: "Ρομποτική και Αυτονομία", questions: 25, file: "test_kefalaio_9.json" },
            { number: 10, title: "Ηθικά και Νομικά Ζητήματα AI", questions: 25, file: "test_kefalaio_10.json" },
            { number: 11, title: "AI στο Marketing", questions: 25, file: "test_kefalaio_11.json" },
            { number: 12, title: "AI στην Υγεία", questions: 25, file: "test_kefalaio_12.json" },
            { number: 13, title: "Conversational AI και Personal Assistants", questions: 25, file: "test_kefalaio_13.json" },
            { number: 14, title: "AI στις Επιχειρήσεις", questions: 24, file: "test_kefalaio_14.json" },
            { number: 15, title: "Υλοποίηση και Ενσωμάτωση AI", questions: 25, file: "test_kefalaio_15.json" }
        ];
        
        this.currentChapter = null;
        this.questions = [];
        this.userAnswers = [];
        this.currentQuestionIndex = 0;
        this.isTestComplete = false;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.handleRouting();
        this.populateChaptersTable();
        this.setupDebugConsole();
    }
    
    setupDebugConsole() {
        // Add debug information to console
        console.log('Τεστ Πολλαπλών Επιλογών - Τεχνητή Νοημοσύνη');
        console.log('Debug Information:');
        console.log('- Available chapters:', this.chapters.length);
        console.log('- Expected JSON files:');
        this.chapters.forEach(chapter => {
            console.log(`  ${chapter.file} (${chapter.questions} questions)`);
        });
        console.log('- Current URL:', window.location.href);
        console.log('- Application initialized successfully');
        console.log('---');
    }

    setupEventListeners() {
        // Navigation
        document.getElementById('back-to-home').addEventListener('click', () => {
            this.showMainView();
        });

        // Quiz navigation
        document.getElementById('prev-question').addEventListener('click', () => {
            this.previousQuestion();
        });

        document.getElementById('next-question').addEventListener('click', () => {
            this.nextQuestion();
        });

        document.getElementById('submit-answers').addEventListener('click', () => {
            this.submitAnswers();
        });

        // Answer choices
        document.getElementById('choices-container').addEventListener('click', (e) => {
            if (e.target.closest('.choice-btn')) {
                this.selectAnswer(e.target.closest('.choice-btn'));
            }
        });

        // Modal controls
        document.getElementById('close-modal').addEventListener('click', () => {
            this.hideModal();
        });

        document.getElementById('retry-test').addEventListener('click', () => {
            this.retryTest();
        });

        document.getElementById('return-home').addEventListener('click', () => {
            this.showMainView();
        });

        document.getElementById('retry-load').addEventListener('click', () => {
            if (this.currentChapter) {
                console.log('Retrying quiz load...');
                this.loadQuiz(this.currentChapter);
            }
        });
        
        // Add event listener for back to home from error state
        document.addEventListener('click', (e) => {
            if (e.target && e.target.id === 'back-to-home-error') {
                console.log('Returning to home from error state');
                this.showMainView();
            }
        });

        // Handle browser back/forward
        window.addEventListener('popstate', () => {
            this.handleRouting();
        });
    }

    handleRouting() {
        const urlParams = new URLSearchParams(window.location.search);
        const chapter = urlParams.get('chapter');
        console.log('Routing - Chapter parameter:', chapter);
        
        if (chapter) {
            const chapterNumber = parseInt(chapter);
            const chapterData = this.chapters.find(c => c.number === chapterNumber);
            
            if (chapterData) {
                console.log('Valid chapter found:', chapterData);
                this.loadQuiz(chapterData);
            } else {
                console.error('Invalid chapter number:', chapterNumber);
                this.showMainView();
            }
        } else {
            console.log('No chapter parameter - showing main view');
            this.showMainView();
        }
    }
    
    validateQuizData(data) {
        console.log('Validating quiz data...');
        
        // Check if it's an array
        if (!Array.isArray(data)) {
            console.error('Data is not an array');
            return false;
        }
        
        // Check if array is not empty
        if (data.length === 0) {
            console.error('Data array is empty');
            return false;
        }
        
        // Validate each question
        for (let i = 0; i < data.length; i++) {
            const question = data[i];
            
            if (!question || typeof question !== 'object') {
                console.error(`Question ${i + 1} is not an object`);
                return false;
            }
            
            // Check required fields
            if (!question.question || typeof question.question !== 'string') {
                console.error(`Question ${i + 1} missing or invalid question text`);
                return false;
            }
            
            if (!question.choices || typeof question.choices !== 'object') {
                console.error(`Question ${i + 1} missing or invalid choices`);
                return false;
            }
            
            // Check choices structure
            const requiredChoices = ['A', 'B', 'C', 'D'];
            for (const choice of requiredChoices) {
                if (!question.choices[choice] || typeof question.choices[choice] !== 'string') {
                    console.error(`Question ${i + 1} missing choice ${choice}`);
                    return false;
                }
            }
            
            // Check answer field
            if (!question.answer || !requiredChoices.includes(question.answer)) {
                console.error(`Question ${i + 1} missing or invalid answer`);
                return false;
            }
        }
        
        console.log(`Validation passed for ${data.length} questions`);
        return true;
    }
    
    getJSONTemplate() {
        return `[
  {
    "question": "Τί είναι η τεχνητή νοημοσύνη;",
    "choices": {
      "A": "Πρώτη επιλογή",
      "B": "Δεύτερη επιλογή",
      "C": "Τρίτη επιλογή",
      "D": "Τέταρτη επιλογή"
    },
    "answer": "A"
  }
]`;
    }

    /**
     * Shuffles the choices of a question while maintaining correct answer
     */
    shuffleQuestion(question) {
        // Store original correct answer
        const correctAnswer = question.answer; // e.g., "B"
        const correctText = question.choices[correctAnswer];
        
        // Create array of all choices with their keys
        const choicesArray = [
            { key: 'A', text: question.choices.A },
            { key: 'B', text: question.choices.B },
            { key: 'C', text: question.choices.C },
            { key: 'D', text: question.choices.D }
        ];
        
        // Shuffle the choices
        const shuffledChoices = shuffleArray(choicesArray);
        
        // Create new choices object with shuffled order
        const newChoices = {
            A: shuffledChoices[0].text,
            B: shuffledChoices[1].text,
            C: shuffledChoices[2].text,
            D: shuffledChoices[3].text
        };
        
        // Find new position of correct answer
        let newCorrectAnswer = 'A';
        for (let i = 0; i < shuffledChoices.length; i++) {
            if (shuffledChoices[i].text === correctText) {
                newCorrectAnswer = ['A', 'B', 'C', 'D'][i];
                break;
            }
        }
        
        console.log(`Question shuffled: Original answer=${correctAnswer}, New answer=${newCorrectAnswer}`);
        
        return {
            question: question.question,
            choices: newChoices,
            answer: newCorrectAnswer
        };
    }

    populateChaptersTable() {
        const tbody = document.getElementById('tests-tbody');
        tbody.innerHTML = '';
        
        this.chapters.forEach(chapter => {
            const row = document.createElement('tr');
            const isHighCount = chapter.questions >= 80;
            
            if (isHighCount) {
                row.classList.add('chapter-row', 'high-count');
            } else {
                row.classList.add('chapter-row');
            }
            
            const badgeClass = isHighCount ? 'question-badge high-count' : 'question-badge';
            
            row.innerHTML = `
                <td><span class="chapter-number">${chapter.number}</span></td>
                <td><span class="chapter-title">${chapter.title}</span></td>
                <td>
                    <div class="questions-count">
                        <span class="${badgeClass}">${chapter.questions}</span>
                        <span>ερωτήσεις</span>
                    </div>
                </td>
                <td>
                    <button class="btn btn--primary" onclick="app.startTest(${chapter.number})">
                        Έναρξη Τεστ
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    startTest(chapterNumber) {
        console.log('Starting test for chapter:', chapterNumber);
        const chapter = this.chapters.find(c => c.number === chapterNumber);
        if (chapter) {
            console.log('Chapter data:', chapter);
            // Update URL without page reload
            const url = new URL(window.location);
            url.searchParams.set('chapter', chapterNumber);
            window.history.pushState({}, '', url);
            console.log('Updated URL to:', url.toString());
            
            this.loadQuiz(chapter);
        } else {
            console.error('Chapter not found:', chapterNumber);
        }
    }

    async loadQuiz(chapter) {
        console.log(`Loading chapter: ${chapter.number}`);
        console.log(`Loading quiz for chapter ${chapter.number}`);
        this.currentChapter = chapter;
        this.showQuizView();
        this.showLoading();
        
        // Construct the JSON file path
        const jsonFile = `test_kefalaio_${chapter.number}.json`;
        console.log(`Fetching: ${jsonFile}`);
        
        try {
            // Show loading message
            this.updateLoadingMessage('Φόρτωση τεστ...');
            
            // Attempt to fetch the JSON file
            const response = await fetch(jsonFile, {
                cache: 'no-cache'
            });
            console.log(`Fetch response status: ${response.status}`);
            
            if (!response.ok) {
                throw new Error(`File not found: ${jsonFile}`);
            }
            
            const jsonData = await response.json();
            console.log(`Response received, data type:`, typeof jsonData);
            console.log(`Data length:`, Array.isArray(jsonData) ? jsonData.length : 'Not an array');
            
            // Comprehensive data validation
            if (!this.validateQuizData(jsonData)) {
                throw new Error('Invalid JSON format or structure');
            }
            
            console.log(`Loaded: ${jsonData.length} questions`);
            console.log(`Successfully validated ${jsonData.length} questions`);
            console.log('Sample question structure:', jsonData[0]);
            
            // Apply shuffling to each question
            console.log('Applying shuffling to questions...');
            this.questions = jsonData.map((q, index) => {
                const shuffled = this.shuffleQuestion(q);
                if (index === 0) {
                    console.log(`Sample shuffle - Question 1: Original answer=${q.answer}, New answer=${shuffled.answer}`);
                }
                return shuffled;
            });
            console.log(`Shuffling complete for ${this.questions.length} questions`);
            
            this.userAnswers = new Array(this.questions.length).fill(null);
            this.currentQuestionIndex = 0;
            this.isTestComplete = false;
            
            // Initialize UI
            this.hideLoading();
            this.displayQuestion();
            this.updateProgress();
            
        } catch (error) {
            console.error(`Error: ${error.message}`);
            console.error('Error loading quiz:', error);
            this.hideLoading();
            
            // Determine error type and show appropriate message
            let errorMessage = 'Σφάλμα φόρτωσης τεστ';
            let errorDetails = '';
            
            if (error.message.includes('File not found') || error.message.includes('404')) {
                errorMessage = 'Το αρχείο δεν βρέθηκε';
                errorDetails = `Βεβαιωθείτε ότι το αρχείο ${jsonFile} υπάρχει στον ίδιο φάκελο.`;
            } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                errorMessage = 'Σφάλμα δικτύου';
                errorDetails = 'Ελέγξτε τη σύνδεσή σας στο διαδίκτυο.';
            } else if (error.message.includes('JSON') || error.message.includes('Invalid JSON format')) {
                errorMessage = 'Σφάλμα ανάγνωσης δεδομένων';
                errorDetails = 'Το αρχείο JSON είναι κατεστραμμένο ή έχει λάθος μορφή.';
            } else {
                errorDetails = error.message;
            }
            
            this.showError(errorMessage, errorDetails, jsonFile);
            
            // Add debugging information about the error
            console.log('DEBUG: Error details:', {
                message: error.message,
                stack: error.stack,
                chapter: chapter.number,
                expectedFile: jsonFile,
                timestamp: new Date().toISOString()
            });
        }
    }



    showMainView() {
        // Update URL
        const url = new URL(window.location);
        url.searchParams.delete('chapter');
        window.history.pushState({}, '', url.pathname);
        
        document.getElementById('main-view').classList.add('active');
        document.getElementById('quiz-view').classList.remove('active');
        this.hideModal();
    }

    showQuizView() {
        document.getElementById('main-view').classList.remove('active');
        document.getElementById('quiz-view').classList.add('active');
        
        // Update header
        document.getElementById('chapter-title').textContent = 
            `Κεφάλαιο ${this.currentChapter.number}: ${this.currentChapter.title}`;
    }

    showLoading() {
        document.getElementById('loading-spinner').classList.remove('hidden');
        document.getElementById('quiz-content').classList.add('hidden');
        document.getElementById('error-message').classList.add('hidden');
    }

    hideLoading() {
        document.getElementById('loading-spinner').classList.add('hidden');
        document.getElementById('quiz-content').classList.remove('hidden');
    }

    showError(title = 'Σφάλμα φόρτωσης', details = 'Κάτι πήγε στραβά', fileName = '') {
        document.getElementById('loading-spinner').classList.add('hidden');
        document.getElementById('quiz-content').classList.add('hidden');
        
        const errorDiv = document.getElementById('error-message');
        const errorTitle = errorDiv.querySelector('h3');
        const errorText = errorDiv.querySelector('p');
        
        errorTitle.textContent = title;
        if (fileName) {
            errorText.innerHTML = `
                Αδυναμία φόρτωσης: <strong>${fileName}</strong><br><br>
                ${details}<br><br>
                <small>Παρακαλώ ελέγξτε ότι το αρχείο υπάρχει στον ίδιο φάκελο με την εφαρμογή.</small>
            `;
        } else {
            errorText.textContent = details;
        }
        
        errorDiv.classList.remove('hidden');
    }
    
    hideError() {
        document.getElementById('error-message').classList.add('hidden');
    }
    
    updateLoadingMessage(message) {
        const loadingElement = document.querySelector('#loading-spinner p');
        if (loadingElement) {
            loadingElement.textContent = message;
        }
    }
    


    displayQuestion() {
        if (this.questions.length === 0) {
            console.warn('No questions available to display');
            return;
        }
        
        const question = this.questions[this.currentQuestionIndex];
        console.log(`Displaying question ${this.currentQuestionIndex + 1}:`, question.question.substring(0, 50) + '...');
        
        document.getElementById('question-number').textContent = 
            `Ερώτηση ${this.currentQuestionIndex + 1}`;
        document.getElementById('question-text').textContent = question.question;
        
        // Update choices
        const choices = ['A', 'B', 'C', 'D'];
        choices.forEach(choice => {
            const choiceElement = document.getElementById(`choice-${choice}`);
            choiceElement.textContent = question.choices[choice];
            
            // Update button selection state
            const choiceBtn = document.querySelector(`[data-choice="${choice}"]`);
            if (this.userAnswers[this.currentQuestionIndex] === choice) {
                choiceBtn.classList.add('selected');
            } else {
                choiceBtn.classList.remove('selected');
            }
        });
        
        this.updateNavigationButtons();
    }

    selectAnswer(choiceBtn) {
        // Clear previous selection
        document.querySelectorAll('.choice-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        // Select new choice
        choiceBtn.classList.add('selected');
        const choice = choiceBtn.getAttribute('data-choice');
        this.userAnswers[this.currentQuestionIndex] = choice;
        
        this.updateNavigationButtons();
    }

    updateNavigationButtons() {
        const prevBtn = document.getElementById('prev-question');
        const nextBtn = document.getElementById('next-question');
        const submitBtn = document.getElementById('submit-answers');
        
        // Previous button
        prevBtn.disabled = this.currentQuestionIndex === 0;
        
        // Next/Submit buttons
        const hasAnswer = this.userAnswers[this.currentQuestionIndex] !== null;
        
        if (this.currentQuestionIndex === this.questions.length - 1) {
            // Last question
            nextBtn.classList.add('hidden');
            submitBtn.classList.remove('hidden');
            submitBtn.disabled = !this.allQuestionsAnswered();
        } else {
            // Not last question
            nextBtn.classList.remove('hidden');
            submitBtn.classList.add('hidden');
            nextBtn.disabled = !hasAnswer;
        }
    }

    allQuestionsAnswered() {
        return this.userAnswers.every(answer => answer !== null);
    }

    previousQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            this.displayQuestion();
            this.updateProgress();
        }
    }

    nextQuestion() {
        if (this.currentQuestionIndex < this.questions.length - 1) {
            this.currentQuestionIndex++;
            this.displayQuestion();
            this.updateProgress();
        }
    }

    updateProgress() {
        document.getElementById('progress-text').textContent = 
            `Ερώτηση ${this.currentQuestionIndex + 1} από ${this.questions.length}`;
    }

    submitAnswers() {
        if (!this.allQuestionsAnswered()) {
            alert('Παρακαλώ απαντήστε σε όλες τις ερωτήσεις πριν την υποβολή.');
            return;
        }
        
        this.calculateResults();
        this.showResults();
    }

    calculateResults() {
        let correctAnswers = 0;
        console.log('Calculating results for', this.questions.length, 'questions');
        
        this.results = this.questions.map((question, index) => {
            const userAnswer = this.userAnswers[index];
            const isCorrect = userAnswer === question.answer;
            
            if (isCorrect) {
                correctAnswers++;
            }
            
            return {
                questionNumber: index + 1,
                question: question.question,
                userAnswer,
                correctAnswer: question.answer,
                isCorrect,
                userAnswerText: question.choices[userAnswer],
                correctAnswerText: question.choices[question.answer]
            };
        });
        
        this.score = {
            correct: correctAnswers,
            total: this.questions.length,
            percentage: Math.round((correctAnswers / this.questions.length) * 100)
        };
        
        console.log('Final score:', this.score);
        console.log('Results breakdown:', {
            correct: this.results.filter(r => r.isCorrect).length,
            incorrect: this.results.filter(r => !r.isCorrect).length
        });
    }

    showResults() {
        console.log('Showing results modal');
        const modal = document.getElementById('results-modal');
        const scorePercentage = document.getElementById('score-percentage');
        const scoreFraction = document.getElementById('score-fraction');
        const resultsList = document.getElementById('results-list');
        const scoreCircle = document.querySelector('.score-circle');
        
        // Update score display
        scorePercentage.textContent = `${this.score.percentage}%`;
        scoreFraction.textContent = `${this.score.correct}/${this.score.total}`;
        
        // Update score circle color based on performance
        if (this.score.percentage < 60) {
            scoreCircle.classList.add('low-score');
        } else {
            scoreCircle.classList.remove('low-score');
        }
        
        // Display detailed results
        resultsList.innerHTML = '';
        this.results.forEach(result => {
            const resultItem = document.createElement('div');
            resultItem.className = `result-item ${result.isCorrect ? 'correct' : 'incorrect'}`;
            
            let resultHTML = `
                <div class="result-header">
                    <span class="result-number">Ερώτηση ${result.questionNumber}</span>
                    <span class="result-status ${result.isCorrect ? 'status-correct' : 'status-incorrect'}">
                        ${result.isCorrect ? '✓ Σωστό' : '✗ Λάθος'}
                    </span>
                </div>
                
                <div class="result-question">
                    ${result.question}
                </div>
                
                <div class="result-answers">
                    <div class="user-answer ${result.isCorrect ? 'answer-correct' : 'answer-incorrect'}">
                        <strong>Η απάντησή σας:</strong> 
                        <span class="answer-choice">${result.userAnswer}</span>
                        <span class="answer-text">${result.userAnswerText}</span>
                    </div>
            `;
            
            if (!result.isCorrect) {
                resultHTML += `
                    <div class="result-correct">
                        <strong><u>Σωστή απάντηση:</u></strong> ${result.correctAnswerText}
                    </div>
                `;
            }
            
            resultHTML += '</div>';
            resultItem.innerHTML = resultHTML;
            resultsList.appendChild(resultItem);
        });
        
        modal.classList.remove('hidden');
        console.log('Results modal displayed');
    }

    hideModal() {
        document.getElementById('results-modal').classList.add('hidden');
    }

    retryTest() {
        this.hideModal();
        this.userAnswers = new Array(this.questions.length).fill(null);
        this.currentQuestionIndex = 0;
        this.displayQuestion();
        this.updateProgress();
    }
}

// Initialize the application
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new QuizApp();
});