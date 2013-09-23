var Game = function(playerX, playerO, speed, callback) {
  this.players = [new playerX('X', this), new playerO('O', this)];
  this.board = [[null, null, null],[null, null, null],[null, null, null]];
  this.move = 0;
  this.speed = speed !== undefined ? speed : 1000;
  this.callback = callback;

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
    if (this.callback) {
      return this.callback(status);
    } 

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


    // If a callback was supplied, we are doing something else with the data, 
    // so don't mess with the DOM.
    if (!this.callback) {
      // Draw to the board.
      var tableRow = document.getElementById("_" + space.row);
      tableRow.children[space.col].appendChild(document.createTextNode(player.symbol));
      
      // Write to the log.
      this.writeLog(player.symbol, space);
    }

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

  Game.prototype.getSpot = function(x,y) {
    return board[x][y];
  };

  Game.prototype.horizontalScores = function() {
    var symbols = ["X", "O"];
    var scores = {
      "X": {},
      "O": {}
    };


    for (var symbol = 0; symbol < symbols.length; symbol++) {
      for (var row=0; row < this.board.length; row++) {
        var score = 0;
        for (var col=0; col < this.board.length; col++) {
          var spot = this.getSpot(row, col);
          if (spot == symbols[symbol]) {
            score++;
          } else if (spot == symbols[(symbol + 1) % symbols.length]) {
            score--;
          }
        }
        scores[symbols[symbol]][row] = score;
      }
    }
  };

  Game.prototype.verticalScores = function() {
    var symbols = ["X", "O"];
    var scores = {
      "X": {},
      "O": {}
    };


    for (var symbol = 0; symbol < symbols.length; symbol++) {
      for (var col=0; col < this.board.length; col++) {
        var score = 0;
        for (var row=0; row < this.board.length; row++) {
          var spot = this.getSpot(row, col);
          if (spot == symbols[symbol]) {
            score++;
          } else if (spot == symbols[(symbol + 1) % symbols.length]) {
            score--;
          }
        }
        scores[symbols[symbol]][col] = score;
      }
    }
  };

  Game.prototype.diagScores = function() {
    var symbols = ["X", "O"];
    var scores = {
      "X": {},
      "O": {}
    };

    for (var symbol = 0; symbol < symbols.length; symbol++) {

      score = 0;
      // Top left to bottom right;
      for (var i = 0; i < this.board.length; i++) {
        var spot = this.getSpot(i, i);
        if (spot == symbols[symbol]) {
          score++;
        } else if (spot !== null) {
          score--;
        }
      }
      scores[symbols[symbol]][0] = score;

      score = 0;
      // top right to bottom left;
      for (var i = 0; i < this.board.length; i++) {
        var spot = this.getSpot(i, this.board.length - 1 - i);
        if (spot == symbols[symbol]) {
          score++;
        } else if (spot !== null) {
          score--;
        }
      }
      scores[symbols[symbol]][1] = score;
  };

  Game.prototype.checkScore = function(symbol) {
    var symbols = ["X", "O"];
    var scores = {};
    scores.horizontal = this.horizontalScores();
    scores.vertical = this.verticalScores();
    scores.diagnol = this.diagScores();
    return scores;
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

var SmartPlayer = function(symbol, game) {
  this.symbol = symbol;
  this.game = game;
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
      var position = this.rules[i].apply(this, []);
      if (position) {
        position.rule = i;
        return position;
      }
    }
  };

  /* Helper method to return all "slots" with appropriate score */
  SmartPlayer.prototype.testScore = function(symbol, requiredScore) {
    var validSlots = [];
    for (var row in scores) {
      if (scores.hasOwnProperty(row)) {
        for (var slot in scores[row][symbol]) {
          if (scores[row][symbol].hasOwnProperty(slot)) {
            if (slot == requiredScore) {
              validSlots.push({typeOf: row, slot: slot});
            }
          }
        }
      }
    }
  };

  /* Helper method to look through 'spots' and give a random open space */
  SmartPlayer.prototype.getSpot = function(slots) {
    if (!slots.length) {
      return false;
    }

    var i = Math.round(Math.random() * slots.length);
    var slot = slots[i];

    // There are three types of slots, horizontal, diagnol, and vertical. How we explore
    // the selected slot depends on the type.
    switch (slot.typeOf) {
      case "horizontal":
        for (var j = 0; j < this.game.board.length; j++) {
          if (this.game.Game.prototype.getSpot(slot.slot, j) === null) {
            return {row: slot.slot, col: j};
          }
        }
        break;

      case "diagnol":
        // 0 is top left to bottom right 1 is vice versa
        if (slot.slot) {
          for (var j = 0; j < this.game.board.length; j++) {
            var spot = this.getSpot(j, this.game.board.length - 1 - j);
            if (spot === null) {
              return {row: j, col: this.game.board.length - 1 - j};
            }
          }
        } else {
          for (var j = 0; j < this.game.board.length; j++) {
            var spot = this.getSpot(j, this.game.board.length - 1 - j);
            if (spot === null) {
              return {row: j, col: this.game.board.length - 1 - j};
            }
          }
        }
        break;

      case "vertical":
        for (var j = 0; j < this.game.board.length; j++) {
          if (this.game.Game.prototype.getSpot(slot.slot, j) === null) {
            return {row: j, col: slot.slot};
          }
        }
        break;
    }
  }

  /* If there is 2 in a row with an open spot for your symbol,
     move to that spot and win. */
  SmartPlayer.prototype.checkSelfWin = function() {
    var scores = this.game.checkScore();

    /* Check all for your scores of 2*/
    var slots = this.testScore(this.symbol, 2);

    
    if (slots.length) {
      var i = Math.round(Math.random() * slots.length);

    }
  }

  /* If the opponent has 2 in a row with an open spot for your opponents symbol, move to block */
  SmartPlayer.prototype.checkOpponentWin = function() {
    var symbol = this.symbol === 'X' ? 'O' : 'X';
    
    /* Check all for opponent scores of 2*/
    var slots = this.testScore(symbol, 2);

    if (slots.length) {
      var i = Math.round(Math.random() * slots.length);

    }
  }

  /* If there is a row with a score of 1 for your symbol, take */
  SmartPlayer.prototype.checkAdjacent = function() {
    var scores = this.checkScore();
    
    /* check for own scores of 1 */
    var slots = this.testScore(this.symbol, 1);

    if (slots.length) {
      var i = Math.round(Math.random() * slots.length);

    }
  }

  SmartPlayer.prototype.checkCenter = function() {
    var center = this.game.getSpot(1,1);
    if (!center) {
      return {row: 1, col: 1};
    }
  }

  SmartPlayer.prototype.checkCorners = function() {
    var corners = [{row: 0, col: 0}, {row: 0, col: board.length - 1}, {row: board.length - 1, col: 0}, {row: board.length - 1, col: board.length - 1}];
    var openCorners = [];
    // Find open corners. Pick one at random.
    for (var i = 0; i < corners.length; i++) {
      if (!this.game.getSpot(corners[i].row, corners[i].col) ) {
        openCorners.push(corners[i]);
      }
    }

    if (openCorners.length) {
      return openCorners[Math.floor(Math.random() * openCorners.length)];
    }
  }

  // Place at random.
  SmartPlayer.prototype.checkRandom = function(board) {
    while (true) {
      var row = Math.round(Math.random() * (board.length-1));
      var col = Math.round(Math.random() * (board[row].length -1));

      if (!this.game.getSpot(row, col) ) {
        return {row: row, col: col};
      }
    }
  }

  this.rules = [this.checkSelfWin, this.checkOpponentWin, this.checkAdjacent, this.checkCenter,  this.checkCorners, this.checkRandom];


};

var game;

// Single play games
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


// Bulk game runners
function playNaiveVersusNaivex100() {
  var results = {"draw": 0, "X": 0, "O": 0};

  for (var i = 0; i < 100; i++) {
    game = new Game(NaivePlayer, NaivePlayer, 0, function(result) {
      results[result]++;
      document.getElementById("game-log").innerHTML = "<li>Draws: " + results.draw + "</li><li>X Wins: " + results.X + "</li><li>O Wins: " + results.O + "</li>";
    });
    game.play();
  }
}

function playNaiveVersusSmartx100() {
  var results = {"draw": 0, "X": 0, "O": 0};

  for (var i = 0; i < 100; i++) {
    game = new Game(NaivePlayer, SmartPlayer, 0, function(result) {
      results[result]++;
      document.getElementById("game-log").innerHTML = "<li>Draws: " + results.draw + "</li><li>X Wins: " + results.X + "</li><li>O Wins: " + results.O + "</li>";
    });
    game.play();
  }
}

function playSmartVersusSmartx100() {
  var results = {"draw": 0, "X": 0, "O": 0};

  for (var i = 0; i < 100; i++) {
    game = new Game(SmartPlayer, SmartPlayer, 0, function(result) {
      results[result]++;
      document.getElementById("game-log").innerHTML = "<li>Draws: " + results.draw + "</li><li>X Wins: " + results.X + "</li><li>O Wins: " + results.O + "</li>";
    });
    game.play();
  }
}

function playSmartVersusNaivex100() {
  var results = {"draw": 0, "X": 0, "O": 0};
  
  for (var i = 0; i < 100; i++) {
    game = new Game(SmartPlayer, NaivePlayer, 0, function(result) {
      results[result]++;
      document.getElementById("game-log").innerHTML = "<li>Draws: " + results.draw + "</li><li>X Wins: " + results.X + "</li><li>O Wins: " + results.O + "</li>";
    });
    game.play();
  }
}

window.onload = function() {
  // Single game buttons
  document.getElementById("nvn").addEventListener("click", playNaiveVersusNaive);
  document.getElementById("nvs").addEventListener("click", playNaiveVersusSmart);
  document.getElementById("svs").addEventListener("click", playSmartVersusSmart);
  document.getElementById("svn").addEventListener("click", playSmartVersusNaive);

  // Bulk game buttons
  document.getElementById("nvnx100").addEventListener("click", playNaiveVersusNaivex100);
  document.getElementById("nvsx100").addEventListener("click", playNaiveVersusSmartx100);
  document.getElementById("svsx100").addEventListener("click", playSmartVersusSmartx100);
  document.getElementById("svnx100").addEventListener("click", playSmartVersusNaivex100);
}

