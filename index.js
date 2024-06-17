const cells = document.querySelectorAll(".cell");
const statusText = document.querySelector("#statusText");
const restartBtn = document.querySelector("#restartButton");
const modeSelect = document.querySelector("#mode");
const difficultySelect = document.querySelector("#difficulty");

const winConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];
let options = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "";
let running = false;
let mode = "single";  
let difficulty = "easy";

initializeGame();

function initializeGame() {
    cells.forEach(cell => cell.addEventListener("click", cellClicked));
    restartBtn.addEventListener("click", restartGame);
    modeSelect.addEventListener("change", () => {
        mode = modeSelect.value;
        if (mode === "multi") {
            difficultySelect.style.display = "none";
        } else {
            difficultySelect.style.display = "inline";
        }
    });
    difficultySelect.addEventListener("change", () => {
        difficulty = difficultySelect.value;
    });
    restartGame(); // Initialize game state
}

function assignRandomStartingPlayer() {
    currentPlayer = Math.random() < 0.5 ? "X" : "O";
    statusText.textContent = `${currentPlayer}'s turn`;
    if (mode === "single" && currentPlayer === "O") {
        setTimeout(computerMove, 500); // Delay to simulate thinking
    }
}

function cellClicked() {
    const cellIndex = this.getAttribute("data-index");

    if (options[cellIndex] != "" || !running) {
        return;
    }

    updateCell(this, cellIndex);
    checkWinner();

    if (running && mode === "single" && currentPlayer === "O") {
        setTimeout(computerMove, 500); // Delay to simulate thinking
    }
}

function updateCell(cell, index) {
    options[index] = currentPlayer;
    cell.textContent = currentPlayer;
}

function changePlayer() {
    currentPlayer = (currentPlayer == "X") ? "O" : "X";
    statusText.textContent = `${currentPlayer}'s turn`;
}

function checkWinner() {
    let roundWon = false;

    for (let i = 0; i < winConditions.length; i++) {
        const condition = winConditions[i];
        const cellA = options[condition[0]];
        const cellB = options[condition[1]];
        const cellC = options[condition[2]];

        if (cellA == "" || cellB == "" || cellC == "") {
            continue;
        }
        if (cellA == cellB && cellB == cellC) {
            roundWon = true;
            break;
        }
    }

    if (roundWon) {
        statusText.textContent = `${currentPlayer} wins! Congratulations!`;
        running = false;
    } else if (!options.includes("")) {
        statusText.textContent = `It's a tie!`;
        running = false;
    } else {
        changePlayer();
    }
}

function restartGame() {
    options = ["", "", "", "", "", "", "", "", ""];
    cells.forEach(cell => cell.textContent = "");
    assignRandomStartingPlayer();
    running = true;
}

function computerMove() {
    if (!running) return;

    switch (difficulty) {
        case "easy":
            makeRandomMove();
            break;
        case "medium":
            if (!blockPlayerWin()) {
                makeRandomMove();
            }
            break;
        case "hard":
            makeBestMove();
            break;
    }

    checkWinner();
}

function makeRandomMove() {
    let emptyCells = [];
    for (let i = 0; i < options.length; i++) {
        if (options[i] === "") {
            emptyCells.push(i);
        }
    }

    if (emptyCells.length === 0) return;

    const randomIndex = Math.floor(Math.random() * emptyCells.length);
    const cellIndex = emptyCells[randomIndex];
    const cell = cells[cellIndex];

    updateCell(cell, cellIndex);
}

function blockPlayerWin() {
    for (let i = 0; i < winConditions.length; i++) {
        const [a, b, c] = winConditions[i];
        if (options[a] === "X" && options[b] === "X" && options[c] === "") {
            updateCell(cells[c], c);
            return true;
        }
        if (options[a] === "X" && options[c] === "X" && options[b] === "") {
            updateCell(cells[b], b);
            return true;
        }
        if (options[b] === "X" && options[c] === "X" && options[a] === "") {
            updateCell(cells[a], a);
            return true;
        }
    }
    return false;
}

function makeBestMove() {
    let bestScore = -Infinity;
    let move;

    for (let i = 0; i < options.length; i++) {
        if (options[i] === "") {
            options[i] = "O";
            let score = minimax(options, 0, false);
            options[i] = "";
            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }

    if (move !== undefined) {
        updateCell(cells[move], move);
    }
}

function minimax(board, depth, isMaximizing) {
    let scores = {
        X: -1,
        O: 1,
        tie: 0
    };

    let result = checkWinnerMinimax(board);
    if (result !== null) {
        return scores[result];
    }

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < board.length; i++) {
            if (board[i] === "") {
                board[i] = "O";
                let score = minimax(board, depth + 1, false);
                board[i] = "";
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < board.length; i++) {
            if (board[i] === "") {
                board[i] = "X";
                let score = minimax(board, depth + 1, true);
                board[i] = "";
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

function checkWinnerMinimax(board) {
    for (let i = 0; i < winConditions.length; i++) {
        const [a, b, c] = winConditions[i];
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }

    if (!board.includes("")) {
        return "tie";
    }

    return null;
}