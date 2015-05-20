/*jshint esnext:true*/

// int
var step = 0;
var turn = 0;

var directions = ['forward', 'backward', 'left', 'right'];

var max_health = 20;
var critical_health = 12;
var healing = false;

class Player {
	playTurn(warrior) {
		turn++;

		// see how many active enemies are around you
		var enemies = [];
		for(var i in directions) {
			var space = warrior.feel(directions[i]);

			if(space.isEnemy() && !space.isCaptive()) {
				enemies.push(space);
			}
		}

		if(enemies.length == 1 && warrior.health() <= critical_health) {
			for(var i in enemies) {
				warrior.bind(warrior.directionOf(enemies[i]));
				return;
			}
		} else if(enemies.length > 1) {
			// surrounded.
			for(var i in directions) {
				var space = warrior.feel(directions[i]);

				if(!space.isCaptive() && ["s", "S"].indexOf(space.getCharacter()) >= 0) {
					warrior.bind(warrior.directionOf(space));
					return;
				}
			}
		}

		if(warrior.health() <= critical_health && !healing) {
			healing = true;
		}

		if(healing) {
			if(warrior.health() == 20) {
				healing = false;
			} else {
				warrior.rest();
				return;
			}
		}

		// listen to the whole map
		var listen = warrior.listen();

		for(var i in directions) {
			var space = warrior.feel(directions[i]);

			// handle captives first
			if(space.isCaptive() && ["s", "S"].indexOf(space.getCharacter()) < 0) {
				warrior.rescue(warrior.directionOf(space));
				return;
			}

			// handle enemy next
			if(space.isEnemy() || ["s", "S"].indexOf(space.getCharacter()) >= 0) {
				warrior.attack(warrior.directionOf(space));
				return;
			}
		}

		if(listen.length < 1) {
			// map clear!
			warrior.walk(warrior.directionOfStairs());
			return;
		} else {
			for(var i in listen) {
				if(listen[i].isCaptive() && ["s", "S"].indexOf(listen[i].getCharacter()) < 0) {
					warrior.walk(warrior.directionOf(listen[i]));
					return;
				}
				if(listen[i].isEnemy() || ["s", "S"].indexOf(listen[i].getCharacter()) >= 0) {
					warrior.walk(warrior.directionOf(listen[i]));
					return;
				}
			}
		}
	}
}

global.Player = Player;
