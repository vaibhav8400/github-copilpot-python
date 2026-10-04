"""Flask routes for the Sudoku game."""

from __future__ import annotations

import os

from flask import Flask, jsonify, render_template, request, session

import sudoku_logic

app = Flask(__name__)
app.secret_key = os.environ.get("SUDOKU_SECRET_KEY", "local-development-key-change-me")

DIFFICULTIES = {"easy": 40, "medium": 32, "hard": 26}


def _valid_board(board: object) -> bool:
    return (isinstance(board, list) and len(board) == sudoku_logic.SIZE
            and all(isinstance(row, list) and len(row) == sudoku_logic.SIZE
                    and all(type(value) is int and 0 <= value <= 9 for value in row)
                    for row in board))


@app.get("/")
def index():
    return render_template("index.html")


@app.get("/new")
def new_game():
    difficulty = request.args.get("difficulty", "medium").lower()
    if difficulty not in DIFFICULTIES:
        return jsonify({"error": "Choose easy, medium, or hard difficulty."}), 400
    puzzle, solution = sudoku_logic.generate_puzzle(DIFFICULTIES[difficulty])
    session["puzzle"] = puzzle
    session["solution"] = solution
    session["difficulty"] = difficulty
    return jsonify({"puzzle": puzzle, "difficulty": difficulty})


@app.post("/check")
def check_solution():
    data = request.get_json(silent=True) or {}
    board = data.get("board")
    solution = session.get("solution")
    if solution is None:
        return jsonify({"error": "Start a new game first."}), 400
    if not _valid_board(board):
        return jsonify({"error": "Board must contain 9 rows of numbers from 0 to 9."}), 400
    incorrect = [[r, c] for r in range(9) for c in range(9)
                 if board[r][c] != 0 and board[r][c] != solution[r][c]]
    return jsonify({"incorrect": incorrect, "complete": board == solution})


@app.post("/hint")
def hint():
    solution = session.get("solution")
    data = request.get_json(silent=True) or {}
    board = data.get("board")
    if solution is None:
        return jsonify({"error": "Start a new game first."}), 400
    if not _valid_board(board):
        return jsonify({"error": "Board must contain 9 rows of numbers from 0 to 9."}), 400
    puzzle = session.get("puzzle", [])
    empty = [(r, c) for r in range(9) for c in range(9) if puzzle[r][c] == 0 and board[r][c] != solution[r][c]]
    if not empty:
        return jsonify({"error": "There are no cells left to hint."}), 400
    row, col = empty[0]
    return jsonify({"row": row, "col": col, "value": solution[row][col]})


if __name__ == "__main__":
    app.run(debug=False)
