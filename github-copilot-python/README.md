# Sudoku Studio

A Flask Sudoku game refactored from the Udacity GitHub Copilot Python starter. It includes uniquely solvable puzzles at three difficulty levels, live conflict feedback, Check and Hint actions, a timer, a persistent Top 10 leaderboard, and a light/dark theme.

## Run locally

From the `starter` directory:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py
```

Then visit <http://127.0.0.1:5000>.

## Tests

Run from `starter/`:

```powershell
python -m pytest -q
```

## Project map

- `starter/app.py`: Flask routes and request validation.
- `starter/sudoku_logic.py`: randomized solution generation and uniqueness checks.
- `starter/static/`: responsive interface and game interactions.
- `starter/tests/`: pytest coverage.
- `starter/instruction.md`: repository guidance for Copilot.
- `Screenshots/`: evidence folder for the required Copilot milestone conversations and test run.

Leaderboard, name, and theme preferences are stored in the browser's local storage. Screenshots of real Copilot conversations should be captured from the user's Copilot session and saved in `Screenshots/`.
