# Copilot instructions for the Sudoku Flask project

## Project purpose
Build and maintain a playable Sudoku web app with a Flask backend and browser UI. Preserve the current behavior while keeping the code readable, modular, and easy to extend.

## Core principles
- Prefer clean, maintainable code over clever shortcuts.
- Keep the backend and frontend responsibilities separate.
- Preserve the current user experience and API contracts unless a change explicitly requires an update.
- Favor correctness and accessibility over aesthetics alone.
- Add or update tests for any behavior change.

## Project structure
- `app.py`: Flask app, routes, request validation, and session-based game state.
- `sudoku_logic.py`: Sudoku rules, puzzle generation, uniqueness checks, and validation helpers.
- `templates/index.html`: page structure, controls, scoreboard, timer, and game layout.
- `static/main.js`: client-side board rendering, timer logic, difficulty handling, hint/check flow, leaderboard, and dark mode behavior.
- `static/styles.css`: responsive styling and dark theme support.
- `tests/`: pytest files covering server-side logic and API behavior.

## Coding standards
### Python
- Use small, focused functions with clear names.
- Add type hints for function parameters and return values when feasible.
- Keep constants such as board size and empty-cell markers near the top of the file.
- Validate all incoming request data at the server boundary before using it.
- Return helpful JSON error messages with appropriate HTTP status codes.
- Keep Sudoku rules and board-generation logic in `sudoku_logic.py`; avoid mixing them with Flask web logic.
- Avoid hidden side effects; if a function mutates a board, document that behavior in a clear docstring.
- Prefer deterministic, testable logic and avoid random behavior in tests unless the test explicitly sets randomness.

### JavaScript
- Use small functions for UI actions such as rendering, checking, and scoring.
- Keep DOM queries and event handlers centralized and readable.
- Avoid relying on browser-side logic to determine correctness; the server remains the source of truth.
- Preserve the current element IDs, form behavior, and route contracts used by the app.
- Keep dark mode and leaderboard logic separated from Sudoku board state logic when practical.

### General standards
- Write code that is easy to read by teammates and future Copilot sessions.
- Do not add unnecessary dependencies or frameworks.
- Prefer explicit logic over magic numbers; define constants for board dimensions, difficulty presets, and storage keys.
- Explain important tradeoffs in comments only when correctness, accessibility, privacy, or maintainability would otherwise be unclear.

## Sudoku gameplay requirements
The game must behave as a standard 9x9 Sudoku puzzle.

- Each row must contain digits 1-9 exactly once.
- Each column must contain digits 1-9 exactly once.
- Each 3x3 subgrid must contain digits 1-9 exactly once.
- The puzzle must be generated from a valid solved board, not a random partial board.
- Every generated puzzle must have exactly one valid solution.
- A puzzle must not be considered valid if it allows multiple completions.
- If a board is invalid or unsolved, the app must clearly report it without revealing the hidden answer.

## Difficulty and puzzle generation
- Difficulty setting should map to clue counts such as easy, medium, and hard.
- Keep the default and supported difficulty values consistent with the current app behavior.
- Puzzle generation must respect the valid clue range and maintain a unique solution.
- Difficulty must affect the number of clues, not the rule logic itself.
- Do not weaken uniqueness checks to make puzzles easier to generate; uniqueness is a correctness requirement.

## Hint and check behavior
- The `POST /check` endpoint must accept a board from the client and compare it with the current session solution.
- The check response should identify incorrect cells and report whether the board is complete.
- The `POST /hint` endpoint must return a valid next move based on the current solution and the puzzle state.
- Hints should not expose the full answer; they should provide the next correct value for a still-empty cell.
- Hint usage should be tracked and reflected in the leaderboard or scoring summary if score data is recorded.

## Timer and game state
- The timer should start when a new game begins.
- The elapsed time should be tracked in seconds and displayed in `MM:SS` format.
- Reset the timer and any per-game counters when a new puzzle is generated.
- Do not allow the timer to continue after the puzzle is solved unless the app explicitly intends to freeze the time.
- Preserve the session-based puzzle and solution state for each game.

## Dark mode, accessibility, and responsive UI
- Preserve a dark mode toggle that is user-friendly and consistent with the current theme system.
- Persist the theme choice in browser local storage.
- Preserve keyboard access, visible focus states, and associated labels for controls.
- The UI must remain usable on smaller screens without breaking the board layout.
- Keep color contrast readable in both light and dark mode.
- Use semantic HTML elements and accessible status messaging where possible.

## Leaderboard requirements
- Keep the Top 10 scoreboard in browser local storage.
- Store at least: player name, elapsed seconds, difficulty, and hint count.
- Sort scores by fastest time first, with tie-handling done consistently.
- Limit stored entries to the top ten results.
- Preserve the current leaderboard behavior and display expected labels and ordering.
- Do not require a backend database for the leaderboard unless the project explicitly adds one later.

## Testing expectations
- Add or update pytest tests for Sudoku rules and project behavior.
- Cover happy paths and failure cases.
- Test the uniqueness requirement, invalid board handling, difficulty validation, and request handling.
- Keep tests targeted and readable.
- Run `python -m pytest -q` from the project root before considering a change complete.

## Required behavior to preserve
- Existing Flask routes and game flow must continue to work.
- The board should still render correctly and accept input from the browser.
- A previously working puzzle generation path must not be broken by new logic.
- The user must be able to start a new puzzle, receive hints, check progress, and complete the game without losing the current session state.
- Any new feature or refactor must not remove existing functionality.

## Implementation guidance for Copilot
When writing code or tests for this project:
- Prefer incremental, minimal, and correct changes.
- Reuse existing patterns instead of inventing new frameworks or architectures.
- Keep the game logic and UI logic clearly separated.
- Avoid broad rewrites that risk breaking the game.
- Maintain compatibility with the current app structure and user-facing features.
- Ensure new code supports the exact requirements above, especially unique-solution generation, difficulty handling, hint/check workflow, timer behavior, accessibility, dark mode, and the Top 10 scoreboard.

## Final quality gate
Before finalizing work, verify all of the following:
generation is intact.
- Hint and check logic still work.
- Timer, dark mode, and leaderboard behavior remain functional.
- Tests pass via `python -m pytest -q`.
- The project remains clean, modular, and maintainable.
