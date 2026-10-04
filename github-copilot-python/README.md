# Sudoku Studio

Sudoku Studio is a Flask-based Sudoku game built from the Udacity GitHub Copilot Python starter. It gives players a polished browser experience with puzzle generation, validation, hints, a timer, and a persistent local leaderboard.

## Features

- Three difficulty levels with uniquely solvable boards
- Real-time conflict detection while filling the grid
- Check and Hint actions to guide play
- In-game timer and move tracking
- Top 10 leaderboard stored in the browser's local storage
- Light and dark theme modes saved per player

## Run locally

From the repository root, open a terminal and run:

```powershell
cd starter
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py
```

If you are using macOS or Linux instead of PowerShell, activate the environment with:

```bash
source .venv/bin/activate
```

Then open <http://127.0.0.1:5000> in your browser.

## Tests

Run the test suite from the `starter` directory:

```powershell
cd starter
python -m pytest -q
```

## Project map

- `starter/app.py`: Flask routes, request handling, and game flow
- `starter/sudoku_logic.py`: puzzle generation, validity checks, and solution logic
- `starter/static/`: frontend assets, styles, and browser interactions
- `starter/tests/`: pytest-based automated checks
- `starter/instruction.md`: repo-specific guidance for Copilot workflows
- `Screenshots/`: evidence folder for milestone conversations and validation screenshots

## Notes

- Leaderboard entries, player names, and theme preferences are stored in local browser storage.
- Screenshots of real Copilot milestone conversations should be captured from the user session and stored in `Screenshots/`.
