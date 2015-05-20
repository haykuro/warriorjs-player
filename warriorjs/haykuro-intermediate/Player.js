/*jshint esnext:true*/

// int
var step = 0;
var turn = 0;

var directions = ['forward', 'backward', 'left', 'right'];

var max_health = 20;
var critical_health = 12;
var healing = false;

var myFuncs = {
	isEnemy: function(space) {
		return space.isEnemy() || ["s", "S"].indexOf(space.getCharacter()) >= 0;
	},
	isActiveEnemy: function(space) {
		return space.isEnemy() && ["s", "S"].indexOf(space.getCharacter()) >= 0 && !space.isCaptive();
	},
	isBindedEnemy: function(space) {
		return space.isCaptive() && ["s", "S"].indexOf(space.getCharacter()) >= 0;
	},
	isSafeCaptive: function(space) {
		return space.isCaptive() && ["s", "S"].indexOf(space.getCharacter()) < 0;
	}
};

class Player {
	playTurn(warrior) {
		turn++;

		// see how many active enemies are directly beside you
		var active_enemies = [];
		for(var i in directions) {
			var space = warrior.feel(directions[i]);

			if(myFuncs.isActiveEnemy(space)) {
				active_enemies.push(space);
			}
		}

		if(active_enemies.length == 1 && warrior.health() <= critical_health) {
			// there's only 1 enemy that can hurt us, and our health is low.
			for(var i in active_enemies) {
				// bind the enemy.
				warrior.bind(warrior.directionOf(active_enemies[i]));
				return;
			}
		} else if(active_enemies.length > 1) {
			// surrounded.
			for(var i in directions) {
				var space = warrior.feel(directions[i]);

				if(myFuncs.isEnemy(space) && !myFuncs.isBindedEnemy(space)) {
					warrior.bind(warrior.directionOf(space));
					return;
				}
			}
		}

		// after handling the dangers above, we can check if we need healing.
		if(warrior.health() <= critical_health && !healing) {
			healing = true;
		}

		if(healing) {
			// heal until we're good.
			if(warrior.health() >= max_health) {
				healing = false;
			} else {
				warrior.rest();
				return;
			}
		}

		// ready? GO!

		// feel in all directions
		for(var i in directions) {
			var space = warrior.feel(directions[i]);

			// free captives
			if(myFuncs.isSafeCaptive(space)) {
				warrior.rescue(warrior.directionOf(space));
				return;
			}

			// attack enemies
			if(myFuncs.isEnemy(space)) {
				warrior.attack(warrior.directionOf(space));
				return;
			}
		}

		// nothing touching us?

		// listen to the whole map
		var listen = warrior.listen();

		if(listen.length < 1) {
			// map clear, go to stairs!
			warrior.walk(warrior.directionOfStairs());
			return;
		} else {
			for(var i in listen) {
				var direction_of_i = warrior.directionOf(listen[i]);

				if(myFuncs.isSafeCaptive(listen[i]) || myFuncs.isEnemy(listen[i])) {
					if(warrior.feel(direction_of_i).isStairs()) {
						// move another direction to avoid the stairs.
						var directions_buff = [].slice.call(directions);
						directions_buff.splice(directions.indexOf(direction_of_i), 1);
						for(var i2 in directions_buff) {
							// feel to see which direction is clear
							if(warrior.feel(directions_buff[i2]).isEmpty() && !warrior.feel(directions_buff[i2]).isWall()) {
								warrior.walk(directions_buff[i2]);
								return;
							}
						}
					}

					warrior.walk(direction_of_i);
					return;
				}
			}
		}
	}
}

global.Player = Player;
