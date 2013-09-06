var Game = function(playerX, playerO, speed) {
  this.players = [new playerX('X'), new playerO('O')];
  this.board = [[null, null, null],[null, null, null],[null, null, null]];
  this.move = 0;
  this.speed = speed ? speed : 1000;

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
    this.playHelper();
  };

  Game.prototype.gameFinished = function(status) {
    switch (status) {
      case "draw":
        alert("ended in a draw!");
        break;
      case "X":
        alert("player X wins");
        break;
      case "O":
        alert("player O wins");
        break;
    }
  }

  // This will keep calling itself, moving the current player.
  // Updates the board at a rate of 1 move per second.
  Game.prototype.playHelper = function() {

    // X will always be last!
    if (this.move >= 9) {
      return this.gameFinished("draw");
    }

    var player = this.players[this.move % this.players.length];
    var space = player.move(this.board);

    // Add to the internal representation of the board. 
    this.board[space.row][space.col] = player.symbol;

    // Draw to the board.
    var tableRow = document.getElementById("_" + space.row);
    tableRow.children[space.col].appendChild(document.createTextNode(player.symbol));
    
    // Write to the log.
    this.writeLog(player.symbol, space);

    this.move++;

    // See if they won with that move.
    if(this.checkWin(space, player)) {
      return this.gameFinished(player.symbol);
    }

    var self = this;
    setTimeout(function() { self.playHelper.apply(self, []); }, this.speed);

  }

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
}

var NaivePlayer = function(symbol) {

  this.symbol = symbol;

  // Choose a move at random.
  NaivePlayer.prototype.move = function(board) {
    while (true) {
      var row = Math.round(Math.random() * (board.length-1));
      var col = Math.round(Math.random() * (board[row].length -1));

      if (!board[row][col]) {
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
  var speed = parseFloat(document.getElementById("speed").value) * 1000;
  game = new Game(NaivePlayer, NaivePlayer, speed);
  game.play();
}

function playNaiveVersusSmart() {
  var speed = parseFloat(document.getElementById("speed").value) * 1000;
  game = new Game(NaivePlayer, SmartPlayer, speed);
  game.play();
}

function playSmartVersusSmart() {
  var speed = parseFloat(document.getElementById("speed").value) * 1000;
  game = new Game(SmartPlayer, SmartPlayer, speed);
  game.play();
}

function playSmartVersusNaive() {
  var speed = parseFloat(document.getElementById("speed").value) * 1000;
  game = new Game(SmartPlayer, NaivePlayer, speed);
  game.play();
}

window.onload = function() {
  document.getElementById("nvn").addEventListener("click", playNaiveVersusNaive);
  document.getElementById("nvs").addEventListener("click", playNaiveVersusSmart);
  document.getElementById("svs").addEventListener("click", playSmartVersusSmart);
  document.getElementById("svn").addEventListener("click", playSmartVersusNaive);
}

