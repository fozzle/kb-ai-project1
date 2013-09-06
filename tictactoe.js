var Game = function(playerX, playerO) {
  this.playerX = new playerX('X');
  this.playerO = new playerO('O');

  this.board = [[null, null, null],[null, null, null],[null, null, null]];
  this.move = 0;


  // Clear the board array, log, and TDs in preparation for a new game.
  this.clear = function() {
    this.board = [[null, null, null],[null, null, null],[null, null, null]];

    var spots = document.getElementsByTagName("td");
    for (var i = 0; i < spots.length; i++) {
      spots[i].innerHTML = "";
    }

    this.move = 0;

    document.getElementById("game-log").innerHTML = "";
  }

  Game.prototype.writeLog = function(player, position) {
    // Add to log!
    var listElement = document.createElement("li");
    var logString = "Player " + player + " moved at position (" + position.row + ", " + position.col + ") using rule " + position.rule + " \n";
    listElement.appendChild(document.createTextNode(logString));
    document.getElementById("game-log").appendChild(listElement);
  }

  Game.prototype.play = function() {
    this.clear();
    while (true) {
      var space = this.playerX.move(this.board, 'X');
      this.writeLog('X', space);
      this.move++;
      if(this.checkWin(space, this.playerX)) {
        alert("player X wins");
        return;
      }

      // X will always be last!
      if (this.move >= 9) {
        break;
      }

      
      space = this.playerO.move(this.board, 'O');
      this.writeLog('O', space);
      this.move++;
      if(this.checkWin(space, this.playerO)) {
        alert("player O wins");
        return;
      }
    }

    return alert("The game was a draw!");
  };

  Game.prototype.checkWin = function(space, player) {
    var symbol = player.symbol;
    var row = space.row;
    var col = space.col;
    var count = 0;

    // Check horizontal
    for (var i = 0; i < this.board[row].length; i++) {
      if (this.board[row][i] == symbol) {
        count++;
      }
    }
    if (count == 3) {
      return true;
    }

    // Check vertical
    count = 0;
    for (var i = 0; i < this.board.length; i++) {
      if (this.board[i][col] == symbol) {
        count++;
      }
    }
    if (count == 3) {
      return true;
    }

    // Check diag
    count = 0;
    // Top left to bottom right;
    for (var i = 0; i < this.board.length; i++) {
      if (this.board[i][i] == symbol) {
        count++;
      }
    }
    if (count == 3) {
      return true;
    }

    count = 0;
    // Bottom left to top right;
    for (var i = 0; i < this.board.length; i++) {
      if (this.board[i][this.board.length - 1 -  i] == symbol) {
        count++;
      }
    }
    if (count == 3) {
      return true;
    }




    return false;

  }


  // See if there is a draw.
  Game.prototype.checkFull = function() {
    for (var i = 0; i < this.board.length; i++) {
      for (var j = 0; j < this.board[i].length; j++) {
        if (this.board[i][j] !== null) {
          return false;
        }
      }
    }
    return true;
  }
}

var NaivePlayer = function(symbol) {

  this.symbol = symbol;

  // Choose a move at random.
  NaivePlayer.prototype.move = function(board) {
    while (true) {
      var row = Math.round(Math.random() * (board.length-1));
      var col = Math.round(Math.random() * (board[row].length -1));

      if (!board[row][col]) {
        board[row][col] = this.symbol;
        var tableRow = document.getElementById("_" + row);
        tableRow.children[col].appendChild(document.createTextNode(this.symbol));

        return {row: row, col: col, rule:"random"};
      }
    }
  };

};

var SmartPlayer = function(symbol) {
  this.symbol = symbol;
  var self = this;
  
  SmartPlayer.prototype.move = function(board) {
    /*
    * Rule order:
    * 1.) If you can win, win.
    * 2.) If the opponent can win, block.
    * 3.) If there is a row that you have space on already and isn't blocked, add it.
    * 4.) Place something down at random.
    */
    for (var i = 0; i < this.rules.length; i++) {
      var position = this.rules[i].apply(this, [board]);
      if (position) {

        board[position.row][position.col] = this.symbol;
        var tableRow = document.getElementById("_" + position.row);
        tableRow.children[position.col].appendChild(document.createTextNode(this.symbol));

        position.rule = i;
        return position;
      }
    }
  };

  // Check to see if a symbol meets a certain score
  // returns false if no matching score, returns 
  // {row, col} object if there is, with row/col representing
  // where the piece should be placed if there is a move matching the score.
  SmartPlayer.prototype.checkScore = function(board, symbol, requiredScore) {

    for (var row=0; row < board.length; row++) {
      for (var col=0; col < board[row].length; col++) {
        if (board[row][col] == symbol) {

          // Ah, we've found the symbol we are looking for. We need to
          // determine the score for the verticals, diags, and horizontals.
          // Heuristic score formula: for every symbol matching, add 1. For every opposite symbol, subtract 1.

          var score = 0;
          var blank;

          // Check horizontal
          for (var i = 0; i < board[row].length; i++) {
            if (board[row][i] == symbol) {
              score++;
            } else if (board[row][i] !== null) {
              score--;
            } else {
              blank = {row: row, col: i}
            }
          }
          if (score == requiredScore) {
            return blank;
          }

          // Check vertical
          score = 0;
          for (var i = 0; i < board.length; i++) {
            if (board[i][col] == symbol) {
              score++;
            } else if (board[i][col] !== null) {
              score--;
            } else {
              blank = {row: i, col: col};
            }
          }
          if (score == requiredScore) {
            return blank;
          }

          // Check diag
          score = 0;
          // Top left to bottom right;
          for (var i = 0; i < board.length; i++) {
            if (board[i][i] == symbol) {
              score++;
            } else if (board[i][i] !== null) {
              score--;
            } else {
              blank = {row: i, col: i};
            }
          }
          if (score == requiredScore) {
            return blank;
          }

          score = 0;
          // top right to bottom left;
          for (var i = 0; i < board.length; i++) {
            if (board[i][board.length - 1 -  i] == symbol) {
              score++;
            } else if (board[i][board.length - 1 - i] !== null) {
              score--;
            } else {
              blank = {row: i, col: board.length - 1 - i};
            }
          }
          if (score == requiredScore) {
            return blank;
          }

        }
      }
    }

    return false;
  }

  SmartPlayer.prototype.checkSelfWin = function(board) {
    return this.checkScore(board, this.symbol, 2);
  }

  // Check to see if opponent has possible wins
  SmartPlayer.prototype.checkOpponentWin = function(board) {
    var symbol = this.symbol === 'X' ? 'O' : 'X';
    return this.checkScore(board, symbol, 2);
  }

  // Place next to occupied spot on board if row is open.
  SmartPlayer.prototype.checkAdjacent = function(board) {
    console.log("checking adjacent for player", this.symbol);
    return this.checkScore(board, this.symbol, 1);
  }

  // Place at random.
  SmartPlayer.prototype.checkRandom = function(board) {
    while (true) {
      var row = Math.round(Math.random() * (board.length-1));
      var col = Math.round(Math.random() * (board[row].length -1));

      if (!board[row][col]) {
        return {row: row, col: col};
      }
    }
  }

  this.rules = [this.checkSelfWin, this.checkOpponentWin, this.checkAdjacent, this.checkRandom];


};

var game;

function playNaiveVersusNaive() {
  game = new Game(NaivePlayer, NaivePlayer);
  game.play();
}

function playNaiveVersusSmart() {
  game = new Game(NaivePlayer, SmartPlayer);
  game.play();
}

function playSmartVersusSmart() {
  game = new Game(SmartPlayer, SmartPlayer);
  game.play();
}

function playSmartVersusNaive() {
  game = new Game(SmartPlayer, NaivePlayer);
  game.play();
}

window.onload = function() {
  document.getElementById("nvn").addEventListener("click", playNaiveVersusNaive);
  document.getElementById("nvs").addEventListener("click", playNaiveVersusSmart);
  document.getElementById("svs").addEventListener("click", playSmartVersusSmart);
  document.getElementById("svn").addEventListener("click", playSmartVersusNaive);
}

