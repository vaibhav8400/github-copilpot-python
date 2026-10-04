"""Unit and route tests for Sudoku generation and game actions."""

import sudoku_logic
from app import app


def test_generated_puzzle_has_unique_solution_and_requested_clues():
    puzzle, solution = sudoku_logic.generate_puzzle(40)
    assert sum(value != 0 for row in puzzle for value in row) == 40
    assert sudoku_logic.count_solutions([row[:] for row in puzzle]) == 1
    assert all(puzzle[r][c] in (0, solution[r][c]) for r in range(9) for c in range(9))


def test_difficulties_generate_unique_puzzles_with_expected_clues():
    for difficulty, clues in {"easy": 40, "medium": 32, "hard": 26}.items():
        response = app.test_client().get(f"/new?difficulty={difficulty}")
        assert response.status_code == 200
        puzzle = response.get_json()["puzzle"]
        assert sum(value != 0 for row in puzzle for value in row) == clues
        assert sudoku_logic.count_solutions([row[:] for row in puzzle]) == 1


def test_solution_is_valid_sudoku():
    _, solution = sudoku_logic.generate_puzzle(81)
    expected = list(range(1, 10))
    assert all(sorted(row) == expected for row in solution)
    assert all(sorted(solution[r][c] for r in range(9)) == expected for c in range(9))
    assert all(sorted(solution[r][c] for r in range(br, br + 3) for c in range(bc, bc + 3)) == expected
               for br in (0, 3, 6) for bc in (0, 3, 6))


def test_new_game_rejects_unknown_difficulty():
    response = app.test_client().get('/new?difficulty=impossible')
    assert response.status_code == 400


def test_game_check_and_hint_routes():
    client = app.test_client()
    assert client.post('/hint', json={'board': [[0] * 9 for _ in range(9)]}).status_code == 400
    new_game = client.get('/new?difficulty=easy')
    assert new_game.status_code == 200
    puzzle = new_game.json['puzzle']
    hint = client.post('/hint', json={'board': puzzle})
    assert hint.status_code == 200
    assert hint.json['value'] in range(1, 10)
    assert client.post('/check', json={'board': [[0] * 9 for _ in range(9)]}).status_code == 200


def test_check_rejects_malformed_board():
    client = app.test_client()
    client.get('/new')
    response = client.post('/check', json={'board': [[0]]})
    assert response.status_code == 400


def test_check_only_marks_incorrect_filled_cells():
    client = app.test_client()
    response = client.get('/new?difficulty=easy')
    assert response.status_code == 200
    puzzle = response.get_json()['puzzle']

    with client.session_transaction() as session:
        solution = session['solution']

    empty_row, empty_col = next(
        (r, c) for r in range(9) for c in range(9) if puzzle[r][c] == 0
    )
    incomplete = client.post('/check', json={'board': puzzle}).get_json()
    assert incomplete == {'incorrect': [], 'complete': False}

    incorrect_board = [row[:] for row in puzzle]
    incorrect_board[empty_row][empty_col] = solution[empty_row][empty_col] % 9 + 1
    incorrect = client.post('/check', json={'board': incorrect_board}).get_json()
    assert incorrect == {
        'incorrect': [[empty_row, empty_col]],
        'complete': False,
    }

    complete = client.post('/check', json={'board': solution}).get_json()
    assert complete == {'incorrect': [], 'complete': True}


def test_home_page_loads():
    response = app.test_client().get('/')
    assert response.status_code == 200
    assert b'Sudoku Studio' in response.data
    assert b'for="difficulty"' in response.data
    assert b'aria-describedby="board-instructions"' in response.data
    assert b'role="status" aria-live="polite" aria-atomic="true"' in response.data


def test_sudoku_cells_have_accessible_labels_and_keyboard_navigation():
    response = app.test_client().get('/static/main.js')
    assert response.status_code == 200
    assert b'editable Sudoku cell' in response.data
    assert b'handleCellKeydown' in response.data
    assert b'ArrowRight' in response.data
