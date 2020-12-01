// set to false to disable outright
var D_RNG_EQUALIZE = true;
/* Makes it so that the balance can be unlucky
	 1 - Benevolent	Only benefits player Hit/Avo
	 0 - Fair		Affects both players and enemies
	-1 - Unfair		Only benefits enemy Hit/Avo
*/
var D_RNG_MODE = 0;
var anna = 0;

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
		if (percent == 0 || percent == 100) {
            return alias1.call(this, virtualActive, virtualPassive, attackEntry);
		}
		var mod = percent;
		// mod hit rate
		if (anna != 0) {
			if (virtualActive.unitSelf.getUnitType()==UnitType.PLAYER) {
				// mod = Math.min(percent * 2, (percent + 200) / 3);
				mod = percent + ((anna > 0 ? Math.min(percent, (100 - percent) / 1.5) : Math.min(percent / 2, (100 - percent) * 2)) * (anna / 100));
			}
			if (virtualPassive.unitSelf.getUnitType()==UnitType.PLAYER) {
				// mod = Math.max(percent / 2, percent * 3 - 200);
				mod = percent - ((anna < 0 ? Math.min(percent, (100 - percent) / 1.5) : Math.min(percent / 2, (100 - percent) * 2)) * (anna / 100));
			}
			// mod = Math.floor(((mod * anna) + (percent * (100 - anna))) / 100);
			mod = Math.round(mod)
		}
		var hit = Probability.getProbability(mod);
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