// 🌗 Theme toggle
const body = document.body;
const themeToggle = document.getElementById('theme-toggle');
const savedTheme = localStorage.getItem('theme') || 'light';
body.classList.add(savedTheme);
themeToggle.textContent = savedTheme === 'light' ? '🌙' : '☀️';

themeToggle.addEventListener('click', () => {
  body.classList.toggle('light');
  body.classList.toggle('dark');
  const newTheme = body.classList.contains('dark') ? 'dark' : 'light';
  localStorage.setItem('theme', newTheme);
  themeToggle.textContent = newTheme === 'light' ? '🌙' : '☀️';
});

// 🔄 Page switching
const pages = ['home-page', 'about-creator-page', 'about-sudoku-page', 'grid-page'];
function showPage(pageId) {
  pages.forEach(id => document.getElementById(id).classList.add('hidden'));
  document.getElementById(pageId).classList.remove('hidden');
  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
  const activeBtn = document.getElementById(`${pageId.replace('-page', '')}-btn`);
  if (activeBtn) activeBtn.classList.add('active');
}

// Navigation
document.getElementById('home-btn').addEventListener('click', () => showPage('home-page'));
document.getElementById('about-creator-btn').addEventListener('click', () => showPage('about-creator-page'));
document.getElementById('about-sudoku-btn').addEventListener('click', () => showPage('about-sudoku-page'));

// Start new puzzle
document.getElementById('create-btn').addEventListener('click', () => {
  showPage('grid-page');
  generateGrid();
});

// Back to home
document.getElementById('back-btn').addEventListener('click', () => {
  showPage('home-page');
  document.getElementById('solution-grid-container').classList.add('hidden');
});

// Generate 9x9 grid
function generateGrid() {
  const inputGridBody = document.getElementById('input-grid');
  const solutionGridBody = document.getElementById('solution-grid');
  inputGridBody.innerHTML = '';
  solutionGridBody.innerHTML = '';

  for (let i = 0; i < 9; i++) {
    const inputRow = document.createElement('tr');
    const solutionRow = document.createElement('tr');

    for (let j = 0; j < 9; j++) {
      // Input cell
      const inputCell = document.createElement('td');
      const input = document.createElement('input');
      input.type = 'text';
      input.maxLength = 1;
      input.addEventListener('input', (e) => {
        const value = e.target.value;
        if (value && !/^[1-9]$/.test(value)) {
          e.target.value = '';
        }
      });
      inputCell.appendChild(input);
      inputRow.appendChild(inputCell);

      // Solution cell placeholder
      const solutionCell = document.createElement('td');
      const solutionInput = document.createElement('input');
      solutionInput.type = 'text';
      solutionInput.readOnly = true;
      solutionCell.appendChild(solutionInput);
      solutionRow.appendChild(solutionCell);
    }

    inputGridBody.appendChild(inputRow);
    solutionGridBody.appendChild(solutionRow);
  }
}

// Clear input & solution
document.getElementById('clear-btn').addEventListener('click', () => {
  document.querySelectorAll('#input-grid input').forEach(input => input.value = '');
  document.querySelectorAll('#solution-grid input').forEach(input => input.value = '');
  document.getElementById('solution-grid-container').classList.add('hidden');
});

// Save puzzle to local + download
document.getElementById('save-btn').addEventListener('click', () => {
  const inputGrid = getGrid('input-grid');
  const solutionGrid = getGrid('solution-grid');
  const puzzleData = { input: inputGrid, solution: solutionGrid };
  localStorage.setItem('savedPuzzle', JSON.stringify(puzzleData));
  const blob = new Blob([JSON.stringify(puzzleData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'sudoku_puzzle.json';
  a.click();
  URL.revokeObjectURL(url);
  alert('Saved and downloaded the puzzle! 💾');
});

// Solve Sudoku
document.getElementById('solve-btn').addEventListener('click', () => {
  const inputGrid = getGrid('input-grid');
  const originalGrid = JSON.parse(JSON.stringify(inputGrid));

  if (isValidGrid(inputGrid)) {
    if (solveSudoku(inputGrid)) {
      showSolution(originalGrid, inputGrid);
      document.getElementById('solution-grid-container').classList.remove('hidden');
    } else {
      alert('No solution exists for this puzzle.');
    }
  } else {
    alert('Invalid puzzle input.');
  }
});

// Get values from grid
function getGrid(gridId) {
  const grid = [];
  const rows = document.querySelectorAll(`#${gridId} tr`);
  rows.forEach((row, i) => {
    grid[i] = [];
    const inputs = row.querySelectorAll('input');
    inputs.forEach((input, j) => {
      grid[i][j] = input.value ? parseInt(input.value) : 0;
    });
  });
  return grid;
}

// Display solved Sudoku
function showSolution(original, solved) {
  const solutionGridBody = document.getElementById('solution-grid');
  solutionGridBody.innerHTML = '';
  for (let i = 0; i < 9; i++) {
    const row = document.createElement('tr');
    for (let j = 0; j < 9; j++) {
      const cell = document.createElement('td');
      const input = document.createElement('input');
      input.readOnly = true;
      input.value = solved[i][j] || '';
      input.className = original[i][j] === 0 ? 'solution' : 'original';
      cell.appendChild(input);
      row.appendChild(cell);
    }
    solutionGridBody.appendChild(row);
  }
}

// Validation: is number valid
function isValid(grid, row, col, num) {
  for (let x = 0; x < 9; x++) {
    if (grid[row][x] === num || grid[x][col] === num) return false;
  }
  const startRow = row - row % 3;
  const startCol = col - col % 3;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (grid[startRow + i][startCol + j] === num) return false;
    }
  }
  return true;
}

// Check full grid validity
function isValidGrid(grid) {
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (grid[i][j] !== 0) {
        const num = grid[i][j];
        grid[i][j] = 0;
        if (!isValid(grid, i, j, num)) {
          grid[i][j] = num;
          return false;
        }
        grid[i][j] = num;
      }
    }
  }
  return true;
}

// Backtracking Solver
function solveSudoku(grid) {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] === 0) {
        for (let num = 1; num <= 9; num++) {
          if (isValid(grid, row, col, num)) {
            grid[row][col] = num;
            if (solveSudoku(grid)) return true;
            grid[row][col] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

// Initialize grid on first load
generateGrid();

