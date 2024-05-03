document.addEventListener('DOMContentLoaded', () => {
    const gameContainer = document.getElementById('gameContainer');
    const userDisplay = document.getElementById('userDisplay');
    const scoreDisplay = document.getElementById('scoreDisplay');
    const timerDisplay = document.getElementById('timerDisplay');  // Timer display
    const cardValues = ['KING', 'QUEEN', 'KNIGHT', 'QUEEN', 'JOKER', 'KNIGHT', 'JOKER', 'KING','BISHOP', 'PAWN', 'PAWN', 'BISHOP'];
    let flippedCards = [];
    let matchesFound = 0;
    let currentUser = null;
    let gameTimer;
    let secondsElapsed = 0;


    // Add a restart button
    const startButton = document.getElementById('startButton');
   startButton.addEventListener('click', createUser);

  

    function startTimer() {
        stopTimer();  // Ensure any existing timer is stopped before starting a new one
        gameTimer = setInterval(() => {
            secondsElapsed++;
            displayTime();
        }, 1000);
    }

    function stopTimer() {
        clearInterval(gameTimer);
    }

    function displayTime() {
        const minutes = Math.floor(secondsElapsed / 60);
        const seconds = secondsElapsed % 60;
        timerDisplay.textContent = `Time: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    function resetTimer() {
        stopTimer();
        secondsElapsed = 0;
        displayTime();
    }

//create new user before game kicks off
    function createUser() {
        const username = document.getElementById('usernameInput').value.toUpperCase();
        fetch('http://localhost:3000/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username: username, score: 0 })
        })
        .then(response => response.json())
        .then(data => {
            currentUser = data;
            userDisplay.textContent = `Player: ${currentUser.username}`;
            scoreDisplay.textContent = `Score: ${currentUser.score}`;
            initializeGame(); // Start the game after user creation

        })
        .catch(error => console.error('Error:', error));
    }

    //logic to update score
    function updateScore(newScore) {
        if (!currentUser) return;
        currentUser.score = newScore;
        fetch(`http://localhost:3000/users/${currentUser.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ score: newScore })
        })
        .then(response => response.json())
        .then(data => {
            scoreDisplay.textContent = `Score: ${data.score}`;
        })
        .catch(error => console.error('Error:', error));
    }

    function initializeGame() {
        gameContainer.innerHTML = '';
        shuffle(cardValues);
        cardValues.forEach(value => {
            const cardElement = document.createElement('div');
            cardElement.classList.add('card');
            cardElement.dataset.value = value;
            cardElement.addEventListener('click', () => {
                if (!cardElement.classList.contains('flipped')) {
                    startTimer();
                    flipCard(cardElement);
                   
                }
            });
            gameContainer.appendChild(cardElement);
        });
        matchesFound = 0;
        resetTimer(); // Reset timer at the start of the game
        if (currentUser) {
            updateScore(0); // Reset score at the start of the game
        }
    }

     // Define the flipCard function to handle flipping a card
    function flipCard(card) {
        if (flippedCards.length < 2) {
            card.classList.add('flipped');
            card.textContent = card.dataset.value;
            card.style.background = 'none';
            flippedCards.push(card);

            if (flippedCards.length === 2) {
                setTimeout(checkForMatch, 500);
            }
        }
    }

     // Define the checkForMatch function to compare two flipped cards
    function checkForMatch() {
        if (flippedCards[0].dataset.value === flippedCards[1].dataset.value) {
            matchesFound += 2;
            let newScore = currentUser.score + 10; // Increase score for a match
            updateScore(newScore);
            flippedCards = [];
            if (matchesFound === cardValues.length) {
                stopTimer();
                alert(`Congratulations! You found all matches. Your score: ${newScore}`);
            }
        } else {
            let newScore = currentUser.score - 5; // Decrease score for a wrong match
            updateScore(newScore);
            flippedCards.forEach(card => {
                card.classList.remove('flipped');
                card.style.backgroundImage = "url('./back.jpg')";
                card.textContent = '';
            });
            flippedCards = [];
        }
    }

    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

   // window.createUser = createUser; // Make the createUser function available globally to be called from HTML button
});
