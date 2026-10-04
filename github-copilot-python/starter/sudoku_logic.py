"""Sudoku board generation and validation helpers."""

from __future__ import annotations

import copy
import random

SIZE = 9
EMPTY = 0


def deep_copy(board: list[list[int]]) -> list[list[int]]:
    return copy.deepcopy(board)


def create_empty_board() -> list[list[int]]:
    return [[EMPTY for _ in range(SIZE)] for _ in range(SIZE)]


def is_safe(board: list[list[int]], row: int, col: int, num: int) -> bool:
    if any(board[row][x] == num or board[x][col] == num for x in range(SIZE)):
        return False
    start_row, start_col = row - row % 3, col - col % 3
    return all(board[r][c] != num for r in range(start_row, start_row + 3) for c in range(start_col, start_col + 3))


def _candidates(board: list[list[int]], row: int, col: int) -> list[int]:
    used = set(board[row]) | {board[r][col] for r in range(SIZE)}
    used.update(board[r][c] for r in range(row - row % 3, row - row % 3 + 3)
                for c in range(col - col % 3, col - col % 3 + 3))
    return [n for n in range(1, 10) if n not in used]


def fill_board(board: list[list[int]]) -> bool:
    """Fill an empty board with a randomized valid solution."""
    best_cell = None
    best_options = None
    for row in range(SIZE):
        for col in range(SIZE):
            if board[row][col] == EMPTY:
                options = _candidates(board, row, col)
                if not options:
                    return False
                if best_options is None or len(options) < len(best_options):
                    best_cell, best_options = (row, col), options
    if best_cell is None:
        return True
    random.shuffle(best_options)
    row, col = best_cell
    for value in best_options:
        board[row][col] = value
        if fill_board(board):
            return True
    board[row][col] = EMPTY
    return False


def count_solutions(board: list[list[int]], limit: int = 2) -> int:
    """Count solutions, stopping as soon as the total reaches ``limit``."""
    if limit <= 0:
        return 0

    best_cell = None
    best_options = None
    for row in range(SIZE):
        for col in range(SIZE):
            if board[row][col] == EMPTY:
                options = _candidates(board, row, col)
                if not options:
                    return 0
                if best_options is None or len(options) < len(best_options):
                    best_cell, best_options = (row, col), options
    if best_cell is None:
        return 1

    row, col = best_cell
    total = 0
    for value in best_options:
        board[row][col] = value
        total += count_solutions(board, limit - total)
        board[row][col] = EMPTY
        if total >= limit:
            return total
    return total


def remove_cells(board: list[list[int]], clues: int) -> None:
    """Remove clues while preserving exactly one solution."""
    cells = [(r, c) for r in range(SIZE) for c in range(SIZE)]
    random.shuffle(cells)
    remaining = SIZE * SIZE
    for row, col in cells:
        if remaining <= clues:
            break
        value = board[row][col]
        board[row][col] = EMPTY
        if count_solutions(deep_copy(board)) == 1:
            remaining -= 1
        else:
            board[row][col] = value


def generate_puzzle(clues: int = 35) -> tuple[list[list[int]], list[list[int]]]:
    if not 17 <= clues <= 81:
        raise ValueError("A Sudoku puzzle must contain between 17 and 81 clues.")
    solution = create_empty_board()
    fill_board(solution)
    puzzle = deep_copy(solution)
    remove_cells(puzzle, clues)
    return puzzle, solution
