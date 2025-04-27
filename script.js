const boxes = document.querySelectorAll(".box");
const xplayerDisplayTurn = document.getElementById("xplayerdisplay");
const oplayerDisplayTurn = document.getElementById("oplayerdisplay");
const turnContainer = document.querySelector(".turn-container");
const gameBoard = document.querySelector(".main-grid");
const resultsDisplay = document.getElementById("results");
const playAgainButton = document.getElementById("play-again");
const winnerModal = document.getElementById("winner-modal");
const closeModalButton = document.getElementById("close-modal");
const winnerMessage = document.getElementById("winner-message");
const confettiCanvas = document.getElementById("fullscreen-confetti");
const eatSound = document.getElementById("eatSound");

let humanPlayer = "";
let computerPlayer = "";
let turn = "";
let isGameOver = false;
let winConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]
];

function initializeGameBoard() {
    boxes.forEach(e => {
        e.textContent = "";
        e.style.removeProperty("background-Color");
        e.style.color = "#fffff";
        e.removeEventListener("click", handleBoxClick);
    });
    if (gameBoard) {
        gameBoard.style.display = "grid";
    }
    resultsDisplay.textContent = "";
    playAgainButton.style.display = "none";
}

function activateGameBoard() {
    boxes.forEach(e => {
        e.addEventListener("click", handleBoxClick);
    });
}

function handleBoxClick() {
    if (!isGameOver && this.textContent === "" && turn === humanPlayer) {
        this.textContent = humanPlayer;
        cheakWin();
        cheakDraw();
        if (!isGameOver) {
            turn = computerPlayer;
            console.log("handleBoxClick: Turn set to", turn);
            updateActivePlayerDisplay();
            setTimeout(computerMoveIntermediateAI, 800);
        }
    }
}

function computerMoveIntermediateAI() {
    if (!isGameOver && turn === computerPlayer) {
        isGameOver = true;

        setTimeout(() => {
            let bestMove = -1;
            let moveMade = false;

            function makeTheMove(index) {
                const selectedBox = boxes[index];
                selectedBox.textContent = computerPlayer;
                cheakWin();
                cheakDraw();
                turn = humanPlayer;
                updateActivePlayerDisplay();
                isGameOver = false;
                moveMade = true;
            }

            function getWinningMove(player) {
                for (let i = 0; i < boxes.length; i++) {
                    if (boxes[i].textContent === "") {
                        boxes[i].textContent = player;
                        if (cheakWinCondition(player)) {
                            boxes[i].textContent = "";
                            return i;
                        }
                        boxes[i].textContent = "";
                    }
                }
                return -1;
            }

            function getForkingMove(player) {
                for (let i = 0; i < boxes.length; i++) {
                    if (boxes[i].textContent === "") {
                        boxes[i].textContent = player;
                        let winningLines = 0;
                        for (const win of winConditions) {
                            const line = win.map(index => boxes[index].textContent);
                            const playerInLine = line.filter(cell => cell === player).length;
                            const emptyInLine = line.filter(cell => cell === "").length;
                            if (playerInLine === 2 && emptyInLine === 1) {
                                winningLines++;
                            }
                        }
                        boxes[i].textContent = "";
                        if (winningLines >= 2) {
                            return i;
                        }
                    }
                }
                return -1;
            }

            function getForkBlockingMove(player) {
                const humanForks = [];
                for (let i = 0; i < boxes.length; i++) {
                    if (boxes[i].textContent === "") {
                        boxes[i].textContent = player;
                        let winningLines = 0;
                        for (const win of winConditions) {
                            const line = win.map(index => boxes[index].textContent);
                            const playerInLine = line.filter(cell => cell === player).length;
                            const emptyInLine = line.filter(cell => cell === "").length;
                            if (playerInLine === 2 && emptyInLine === 1) {
                                winningLines++;
                            }
                        }
                        boxes[i].textContent = "";
                        if (winningLines >= 2) {
                            humanForks.push(i);
                        }
                    }
                }

                if (humanForks.length === 1) {
                    return humanForks[0];
                } else if (humanForks.length > 1) {
                    const nonCornerMoves = [1, 3, 5, 7].filter(index => boxes[index].textContent === "");
                    if (nonCornerMoves.length > 0) {
                        return nonCornerMoves[0];
                    } else {
                        return humanForks[0];
                    }
                }
                return -1;
            }

            // 1. Check if computer can win
            bestMove = getWinningMove(computerPlayer);
            if (bestMove !== -1) {
                makeTheMove(bestMove);
                return;
            }

            // 2. Check if human can win and block
            bestMove = getWinningMove(humanPlayer);
            if (bestMove !== -1) {
                makeTheMove(bestMove);
                return;
            }

            // 3. Try to create a fork for the computer
            bestMove = getForkingMove(computerPlayer);
            if (bestMove !== -1) {
                makeTheMove(bestMove);
                return;
            }

            // 4. Try to block a fork for the human
            bestMove = getForkBlockingMove(humanPlayer);
            if (bestMove !== -1) {
                makeTheMove(bestMove);
                return;
            }

            // 5. Play the center if it's open
            if (boxes[4].textContent === "") {
                makeTheMove(4);
                return;
            }

            // 6. Play a corner if it's open
            const openCorners = [0, 2, 6, 8].filter(index => boxes[index].textContent === "");
            if (openCorners.length > 0) {
                bestMove = openCorners[Math.floor(Math.random() * openCorners.length)];
                makeTheMove(bestMove);
                return;
            }

            // 7. Play any open side
            const openSides = [1, 3, 5, 7].filter(index => boxes[index].textContent === "");
            if (openSides.length > 0) {
                bestMove = openSides[Math.floor(Math.random() * openSides.length)];
                makeTheMove(bestMove);
                return;
            }

            if (!moveMade) {
                cheakDraw();
                turn = humanPlayer;
                updateActivePlayerDisplay();
                isGameOver = false;
            }

        }, 100);
    }
}

function cheakWinCondition(player) {
    for (let i = 0; i < winConditions.length; i++) {
        if (
            boxes[winConditions[i][0]].textContent === player &&
            boxes[winConditions[i][1]].textContent === player &&
            boxes[winConditions[i][2]].textContent === player
        ) {
            return true;
        }
    }
    return false;
}

function chooseTurn(selectedTurn) {
    if (!isGameOver && humanPlayer === "") {
        humanPlayer = selectedTurn.toUpperCase();
        computerPlayer = (humanPlayer === 'X') ? 'O' : 'X';
        turn = humanPlayer;
        turnContainer.style.display = "grid";
        activateGameBoard();
        updateActivePlayerDisplay();
    }
}

function updateActivePlayerDisplay() {
    if (xplayerDisplayTurn && oplayerDisplayTurn) {
        xplayerDisplayTurn.classList.remove('player-active');
        oplayerDisplayTurn.classList.remove('player-active');
        if (turn === "X") {
            xplayerDisplayTurn.classList.add('player-active');
        } else if (turn === "O") {
            oplayerDisplayTurn.classList.add('player-active');
        }
    }
}

function changeTurn() {
    turn = (turn === "X") ? "O" : "X";
}

function cheakWin() {
    for (let i = 0; i < winConditions.length; i++) {
        let v0 = boxes[winConditions[i][0]].textContent;
        let v1 = boxes[winConditions[i][1]].textContent;
        let v2 = boxes[winConditions[i][2]].textContent;

        if (v0 !== "" && v0 === v1 && v0 === v2) {
            isGameOver = true;
            const winner = v0 === humanPlayer ? `${v0} wins! 🎉` : "Computer wins! 🎉";
            showWinnerModal(winner);
            celebrate();
            removeBoxEventListeners();
            for (let j = 0; j < 3; j++) {
                boxes[winConditions[i][j]].style.backgroundColor = "#08D9D6";
                boxes[winConditions[i][j]].style.color = "#fff";
            }
            break;
        }
    }
}

function cheakDraw() {
    if (!isGameOver) {
        let isDraw = true;
        boxes.forEach(e => {
            if (e.textContent === "") isDraw = false;
        });
        if (isDraw) {
            isGameOver = true;
            resultsDisplay.textContent = "Draw!";
            playAgainButton.addEventListener("click", resetGame);
            removeBoxEventListeners();
        }
    }
}

playAgainButton.addEventListener("click", resetGame);

function resetGame() {

    isGameOver = false;
    humanPlayer = "";
    computerPlayer = "";
    turn = "";
    resultsDisplay.textContent = "";
    playAgainButton.style.display = "none";
    initializeGameBoard();
    if (turnContainer) {
        turnContainer.style.display = "grid";
    }
    updateActivePlayerDisplay();
}

function removeBoxEventListeners() {
    boxes.forEach(e => {
        e.removeEventListener("click", handleBoxClick);
    });
}

function showWinnerModal(message) {
    winnerModal.style.display = "block";
    winnerMessage.textContent = message;
}

closeModalButton.addEventListener("click", () => {
    winnerModal.style.display = "none";
    resetGame();
});

window.addEventListener("click", function (e) {
    if (e.target === winnerModal) {
        winnerModal.style.display = "none";
        resetGame();
    }
});

function celebrate() {
    console.log("celebrate() called");
    const myConfetti = confetti.create(confettiCanvas, {
        resize: true,
        useWorker: true
    });
    const audio = new Audio('sound.wav');
    audio.play().catch(err => console.warn("Sound blocked by browser:", err));
    const duration = 1800;
    const end = Date.now() + duration;
    (function frame() {
        myConfetti({ particleCount: 8, angle: 60, spread: 85, origin: { x: 0, y: 0.5 } });
        myConfetti({ particleCount: 8, angle: 120, spread: 85, origin: { x: 0.99, y: 0.5 } });
        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    })();
}

initializeGameBoard();
updateActivePlayerDisplay();