/*  D_RNG_EQUALIZE
set to false to disable outright
*/
var D_RNG_EQUALIZE = true;
/*  D_RNG_MODE
Makes it so that the balance can be unlucky
	 1 - Benevolent	Only benefits player Hit/Avo
	 0 - Fair		Affects both players and enemies
	-1 - Unfair		Only benefits enemy Hit/Avo
*/
var D_RNG_MODE = 0;
/*  D_RNG_FORMULA
	0 - use old formula
this either doubles the chance of hitting or missing, whichever has less magnitude. Subtle.
	1 - use updated formula
has a bit of a 2rn effect, being able to make high hits much more accurate and low hits much more inaccurate
a 90 hit can have either 81 or 99 effective hit
*/
var D_RNG_FORMULA = 1;
/*  anna
the "luck" owed to the player, updated whenever a hit is calculated
*/
var anna = 0;
/*  TWO_RN_ENABLED
whether or not to use the 2rn system famous for the GBA games, less powerful due to scaling
*/
var TWO_RN_ENABLED = TWO_RN_ENABLED || false;
// var TWO_RN_ENABLED = false;
// if (TWO_RN_ENABLED == undefined) {
	// TWO_RN_ENABLED = false;
// }

(function() {
    var alias1 = AttackEvaluator.HitCritical.calculateHit
    AttackEvaluator.HitCritical.calculateHit = function(virtualActive, virtualPassive, attackEntry) {
        if (!D_RNG_EQUALIZE) {
            return alias1.call(this, virtualActive, virtualPassive, attackEntry);
        }

		// if (anna == undefined) {
			// anna = 0;
			// root.log('ANNA UNDEFINED');
		// }
		var percent = HitCalculator.calculateHit(virtualActive.unitSelf, virtualPassive.unitSelf, virtualActive.weapon, virtualActive.totalStatus, virtualPassive.totalStatus);
		if (percent <= 0 || percent >= 100) {
            return alias1.call(this, virtualActive, virtualPassive, attackEntry);
		}
		var mod = percent;
		// mod hit rate
		if (anna != 0) {
			if (D_RNG_FORMULA > 0) {
				if (virtualActive.unitSelf.getUnitType()==UnitType.PLAYER) {
					mod = percent + ((percent * (100 - percent) / 100) * (anna / 100));
				}
				if (virtualPassive.unitSelf.getUnitType()==UnitType.PLAYER) {
					mod = percent - ((percent * (100 - percent) / 100) * (anna / 100));
				}
			} else {
				if (virtualActive.unitSelf.getUnitType()==UnitType.PLAYER) {
					mod = percent + ((anna > 0 ? Math.min(percent, (100 - percent) / 2) : Math.min(percent / 2, (100 - percent) * 2)) * (anna / 100));
				}
				if (virtualPassive.unitSelf.getUnitType()==UnitType.PLAYER) {
					mod = percent - ((anna < 0 ? Math.min(percent, (100 - percent) / 2) : Math.min(percent / 2, (100 - percent) * 2)) * (anna / 100));
				}
				// mod = Math.floor(((mod * anna) + (percent * (100 - anna))) / 100);
			}
			mod = Math.round(mod)
		}
		var hit = Probability.getProbability(mod);
        if (TWO_RN_ENABLED) {
			var n = Probability.getRandomNumber() % 100;
			var m = Probability.getRandomNumber() % 100;
			var trueHit = Math.floor((n+m)/2);
			
			hit = trueHit < mod
		}
		// mod anna var
		if (virtualActive.unitSelf.getUnitType()==UnitType.PLAYER) {
			anna += Math.round((hit ? (percent - 100) : percent) / 4);
		}
		if (virtualPassive.unitSelf.getUnitType()==UnitType.PLAYER) {
			anna += Math.round((hit ? (100 - percent) : -percent) / 4);
		}
		anna = Math.max(Math.min(anna, D_RNG_MODE < 0 ? 0 : 100), D_RNG_MODE > 0 ? 0 : -100);
		// root.log('HIT: ' + percent + ' / MOD: ' + mod + ' / ANNA: ' + anna);
		
		return hit;
    }

})()