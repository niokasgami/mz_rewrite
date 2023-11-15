/**
 * The superclass for Game_Battler.
 * It mainly contains parameters calculations.
 */
class Game_BattlerBase {

  static TRAIT_ELEMENT_RATE = 11;
  static TRAIT_DEBUFF_RATE = 12;
  static TRAIT_STATE_RATE = 13;
  static TRAIT_STATE_RESIST = 14;
  static TRAIT_PARAM = 21;
  static TRAIT_XPARAM = 22;
  static TRAIT_SPARAM = 23;
  static TRAIT_ATTACK_ELEMENT = 31;
  static TRAIT_ATTACK_STATE = 32;
  static TRAIT_ATTACK_SPEED = 33;
  static TRAIT_ATTACK_TIMES = 34;
  static TRAIT_ATTACK_SKILL = 35;
  static TRAIT_STYPE_ADD = 41;
  static TRAIT_STYPE_SEAL = 42;
  static TRAIT_SKILL_ADD = 43;
  static TRAIT_SKILL_SEAL = 44;
  static TRAIT_EQUIP_WTYPE = 51;
  static TRAIT_EQUIP_ATYPE = 52;
  static TRAIT_EQUIP_LOCK = 53;
  static TRAIT_EQUIP_SEAL = 54;
  static TRAIT_SLOT_TYPE = 55;
  static TRAIT_ACTION_PLUS = 61;
  static TRAIT_SPECIAL_FLAG = 62;
  static TRAIT_COLLAPSE_TYPE = 63;
  static TRAIT_PARTY_ABILITY = 64;
  static FLAG_ID_AUTO_BATTLE = 0;
  static FLAG_ID_GUARD = 1;
  static FLAG_ID_SUBSTITUTE = 2;
  static FLAG_ID_PRESERVE_TP = 3;
  static ICON_BUFF_START = 32;
  static ICON_DEBUFF_START = 48;
  constructor() {
    this.initialize(...arguments);
  }

  initialize() {
    this.initMembers();
  }

  initMembers() {
    this._hp = 1;
    this._mp = 0;
    this._tp = 0;
    this._hidden = false;
    this.clearParamPlus();
    this.clearStates();
    this.clearBuffs();
  }

  clearParamPlus() {
    this._paramPlus = [0, 0, 0, 0, 0, 0, 0, 0];
  }

  clearStates() {
    this._states = [];
    this._stateTurns = {};
  }

  eraseState(stateId) {
    this._states.remove(stateId);
    delete this._stateTurns[stateId];
  }

  isStateAffected(stateId) {
    return this._states.includes(stateId);
  }

  isDeathStateAffected() {
    return this.isStateAffected(this.deathStateId());
  }

  deathStateId() {
    return 1;
  }

  resetStateCounts(stateId) {
    const state = $dataStates[stateId];
    const variance = 1 + Math.max(state.maxTurns - state.minTurns, 0);
    this._stateTurns[stateId] = state.minTurns + Math.randomInt(variance);
  }

  isStateExpired(stateId) {
    return this._stateTurns[stateId] === 0;
  }

  updateStateTurns() {
    for (const stateId of this._states) {
      if (this._stateTurns[stateId] > 0) {
        this._stateTurns[stateId]--;
      }
    }
  }

  clearBuffs() {
    this._buffs = [0, 0, 0, 0, 0, 0, 0, 0];
    this._buffTurns = [0, 0, 0, 0, 0, 0, 0, 0];
  }

  eraseBuff(paramId) {
    this._buffs[paramId] = 0;
    this._buffTurns[paramId] = 0;
  }

  buffLength() {
    return this._buffs.length;
  }

  buff(paramId) {
    return this._buffs[paramId];
  }

  isBuffAffected(paramId) {
    return this._buffs[paramId] > 0;
  }

  isDebuffAffected(paramId) {
    return this._buffs[paramId] < 0;
  }

  isBuffOrDebuffAffected(paramId) {
    return this._buffs[paramId] !== 0;
  }

  isMaxBuffAffected(paramId) {
    return this._buffs[paramId] === 2;
  }

  isMaxDebuffAffected(paramId) {
    return this._buffs[paramId] === -2;
  }

  increaseBuff(paramId) {
    if (!this.isMaxBuffAffected(paramId)) {
      this._buffs[paramId]++;
    }
  }

  decreaseBuff(paramId) {
    if (!this.isMaxDebuffAffected(paramId)) {
      this._buffs[paramId]--;
    }
  }

  overwriteBuffTurns(paramId, turns) {
    if (this._buffTurns[paramId] < turns) {
      this._buffTurns[paramId] = turns;
    }
  }

  isBuffExpired(paramId) {
    return this._buffTurns[paramId] === 0;
  }

  updateBuffTurns() {
    for (let i = 0; i < this._buffTurns.length; i++) {
      if (this._buffTurns[i] > 0) {
        this._buffTurns[i]--;
      }
    }
  }

  die() {
    this._hp = 0;
    this.clearStates();
    this.clearBuffs();
  }

  revive() {
    if (this._hp === 0) {
      this._hp = 1;
    }
  }

  states() {
    return this._states.map(id => $dataStates[id]);
  }

  stateIcons() {
    return this.states()
      .map(state => state.iconIndex)
      .filter(iconIndex => iconIndex > 0);
  }

  buffIcons() {
    const icons = [];
    for (let i = 0; i < this._buffs.length; i++) {
      if (this._buffs[i] !== 0) {
        icons.push(this.buffIconIndex(this._buffs[i], i));
      }
    }
    return icons;
  }

  buffIconIndex(buffLevel, paramId) {
    if (buffLevel > 0) {
      return Game_BattlerBase.ICON_BUFF_START + (buffLevel - 1) * 8 + paramId;
    } else if (buffLevel < 0) {
      return (
        Game_BattlerBase.ICON_DEBUFF_START + (-buffLevel - 1) * 8 + paramId
      );
    } else {
      return 0;
    }
  }

  allIcons() {
    return this.stateIcons().concat(this.buffIcons());
  }

  traitObjects() {
    // Returns an array of the all objects having traits. States only here.
    return this.states();
  }

  allTraits() {
    return this.traitObjects().reduce((r, obj) => r.concat(obj.traits), []);
  }

  traits(code) {
    return this.allTraits().filter(trait => trait.code === code);
  }

  traitsWithId(code, id) {
    return this.allTraits().filter(
      trait => trait.code === code && trait.dataId === id
    );
  }

  traitsPi(code, id) {
    return this.traitsWithId(code, id).reduce((r, trait) => r * trait.value, 1);
  }

  traitsSum(code, id) {
    return this.traitsWithId(code, id).reduce((r, trait) => r + trait.value, 0);
  }

  traitsSumAll(code) {
    return this.traits(code).reduce((r, trait) => r + trait.value, 0);
  }

  traitsSet(code) {
    return this.traits(code).reduce((r, trait) => r.concat(trait.dataId), []);
  }

  paramBase() {
    return 0;
  }

  paramPlus(paramId) {
    return this._paramPlus[paramId];
  }

  paramBasePlus(paramId) {
    return Math.max(0, this.paramBase(paramId) + this.paramPlus(paramId));
  }

  paramMin(paramId) {
    if (paramId === 0) {
      return 1; // MHP
    } else {
      return 0;
    }
  }

  paramMax() {
    return Infinity;
  }

  paramRate(paramId) {
    return this.traitsPi(Game_BattlerBase.TRAIT_PARAM, paramId);
  }

  paramBuffRate(paramId) {
    return this._buffs[paramId] * 0.25 + 1.0;
  }

  param(paramId) {
    const value =
      this.paramBasePlus(paramId) *
      this.paramRate(paramId) *
      this.paramBuffRate(paramId);
    const maxValue = this.paramMax(paramId);
    const minValue = this.paramMin(paramId);
    return Math.round(value.clamp(minValue, maxValue));
  }

  xparam(xparamId) {
    return this.traitsSum(Game_BattlerBase.TRAIT_XPARAM, xparamId);
  }

  sparam(sparamId) {
    return this.traitsPi(Game_BattlerBase.TRAIT_SPARAM, sparamId);
  }

  elementRate(elementId) {
    return this.traitsPi(Game_BattlerBase.TRAIT_ELEMENT_RATE, elementId);
  }

  debuffRate(paramId) {
    return this.traitsPi(Game_BattlerBase.TRAIT_DEBUFF_RATE, paramId);
  }

  stateRate(stateId) {
    return this.traitsPi(Game_BattlerBase.TRAIT_STATE_RATE, stateId);
  }

  stateResistSet() {
    return this.traitsSet(Game_BattlerBase.TRAIT_STATE_RESIST);
  }

  isStateResist(stateId) {
    return this.stateResistSet().includes(stateId);
  }

  attackElements() {
    return this.traitsSet(Game_BattlerBase.TRAIT_ATTACK_ELEMENT);
  }

  attackStates() {
    return this.traitsSet(Game_BattlerBase.TRAIT_ATTACK_STATE);
  }

  attackStatesRate(stateId) {
    return this.traitsSum(Game_BattlerBase.TRAIT_ATTACK_STATE, stateId);
  }

  attackSpeed() {
    return this.traitsSumAll(Game_BattlerBase.TRAIT_ATTACK_SPEED);
  }

  attackTimesAdd() {
    return Math.max(this.traitsSumAll(Game_BattlerBase.TRAIT_ATTACK_TIMES), 0);
  }

  attackSkillId() {
    const set = this.traitsSet(Game_BattlerBase.TRAIT_ATTACK_SKILL);
    return set.length > 0 ? Math.max(...set) : 1;
  }

  addedSkillTypes() {
    return this.traitsSet(Game_BattlerBase.TRAIT_STYPE_ADD);
  }

  isSkillTypeSealed(stypeId) {
    return this.traitsSet(Game_BattlerBase.TRAIT_STYPE_SEAL).includes(stypeId);
  }

  addedSkills() {
    return this.traitsSet(Game_BattlerBase.TRAIT_SKILL_ADD);
  }

  isSkillSealed(skillId) {
    return this.traitsSet(Game_BattlerBase.TRAIT_SKILL_SEAL).includes(skillId);
  }

  isEquipWtypeOk(wtypeId) {
    return this.traitsSet(Game_BattlerBase.TRAIT_EQUIP_WTYPE).includes(wtypeId);
  }

  isEquipAtypeOk(atypeId) {
    return this.traitsSet(Game_BattlerBase.TRAIT_EQUIP_ATYPE).includes(atypeId);
  }

  isEquipTypeLocked(etypeId) {
    return this.traitsSet(Game_BattlerBase.TRAIT_EQUIP_LOCK).includes(etypeId);
  }

  isEquipTypeSealed(etypeId) {
    return this.traitsSet(Game_BattlerBase.TRAIT_EQUIP_SEAL).includes(etypeId);
  }

  slotType() {
    const set = this.traitsSet(Game_BattlerBase.TRAIT_SLOT_TYPE);
    return set.length > 0 ? Math.max(...set) : 0;
  }

  isDualWield() {
    return this.slotType() === 1;
  }

  actionPlusSet() {
    return this.traits(Game_BattlerBase.TRAIT_ACTION_PLUS).map(
      trait => trait.value
    );
  }

  specialFlag(flagId) {
    return this.traits(Game_BattlerBase.TRAIT_SPECIAL_FLAG).some(
      trait => trait.dataId === flagId
    );
  }

  collapseType() {
    const set = this.traitsSet(Game_BattlerBase.TRAIT_COLLAPSE_TYPE);
    return set.length > 0 ? Math.max(...set) : 0;
  }

  partyAbility(abilityId) {
    return this.traits(Game_BattlerBase.TRAIT_PARTY_ABILITY).some(
      trait => trait.dataId === abilityId
    );
  }

  isAutoBattle() {
    return this.specialFlag(Game_BattlerBase.FLAG_ID_AUTO_BATTLE);
  }

  isGuard() {
    return this.specialFlag(Game_BattlerBase.FLAG_ID_GUARD) && this.canMove();
  }

  isSubstitute() {
    return (
      this.specialFlag(Game_BattlerBase.FLAG_ID_SUBSTITUTE) && this.canMove()
    );
  }

  isPreserveTp() {
    return this.specialFlag(Game_BattlerBase.FLAG_ID_PRESERVE_TP);
  }

  addParam(paramId, value) {
    this._paramPlus[paramId] += value;
    this.refresh();
  }

  setHp(hp) {
    this._hp = hp;
    this.refresh();
  }

  setMp(mp) {
    this._mp = mp;
    this.refresh();
  }

  setTp(tp) {
    this._tp = tp;
    this.refresh();
  }

  maxTp() {
    return 100;
  }

  refresh() {
    for (const stateId of this.stateResistSet()) {
      this.eraseState(stateId);
    }
    this._hp = this._hp.clamp(0, this.mhp);
    this._mp = this._mp.clamp(0, this.mmp);
    this._tp = this._tp.clamp(0, this.maxTp());
  }

  recoverAll() {
    this.clearStates();
    this._hp = this.mhp;
    this._mp = this.mmp;
  }

  hpRate() {
    return this.hp / this.mhp;
  }

  mpRate() {
    return this.mmp > 0 ? this.mp / this.mmp : 0;
  }

  tpRate() {
    return this.tp / this.maxTp();
  }

  hide() {
    this._hidden = true;
  }

  appear() {
    this._hidden = false;
  }

  isHidden() {
    return this._hidden;
  }

  isAppeared() {
    return !this.isHidden();
  }

  isDead() {
    return this.isAppeared() && this.isDeathStateAffected();
  }

  isAlive() {
    return this.isAppeared() && !this.isDeathStateAffected();
  }

  isDying() {
    return this.isAlive() && this._hp < this.mhp / 4;
  }

  isRestricted() {
    return this.isAppeared() && this.restriction() > 0;
  }

  canInput() {
    // prettier-ignore
    return this.isAppeared() && this.isActor() &&
      !this.isRestricted() && !this.isAutoBattle();
  }

  canMove() {
    return this.isAppeared() && this.restriction() < 4;
  }

  isConfused() {
    return (
      this.isAppeared() && this.restriction() >= 1 && this.restriction() <= 3
    );
  }

  confusionLevel() {
    return this.isConfused() ? this.restriction() : 0;
  }

  isActor() {
    return false;
  }

  isEnemy() {
    return false;
  }

  sortStates() {
    this._states.sort((a, b) => {
      const p1 = $dataStates[a].priority;
      const p2 = $dataStates[b].priority;
      if (p1 !== p2) {
        return p2 - p1;
      }
      return a - b;
    });
  }

  restriction() {
    const restrictions = this.states().map(state => state.restriction);
    return Math.max(0, ...restrictions);
  }

  addNewState(stateId) {
    if (stateId === this.deathStateId()) {
      this.die();
    }
    const restricted = this.isRestricted();
    this._states.push(stateId);
    this.sortStates();
    if (!restricted && this.isRestricted()) {
      this.onRestrict();
    }
  }

  onRestrict() {
    //
  }

  mostImportantStateText() {
    for (const state of this.states()) {
      if (state.message3) {
        return state.message3;
      }
    }
    return "";
  }

  stateMotionIndex() {
    const states = this.states();
    if (states.length > 0) {
      return states[0].motion;
    } else {
      return 0;
    }
  }

  stateOverlayIndex() {
    const states = this.states();
    if (states.length > 0) {
      return states[0].overlay;
    } else {
      return 0;
    }
  }

  isSkillWtypeOk() {
    return true;
  }

  skillMpCost(skill) {
    return Math.floor(skill.mpCost * this.mcr);
  }

  skillTpCost(skill) {
    return skill.tpCost;
  }

  canPaySkillCost(skill) {
    return (
      this._tp >= this.skillTpCost(skill) &&
      this._mp >= this.skillMpCost(skill)
    );
  }

  paySkillCost(skill) {
    this._mp -= this.skillMpCost(skill);
    this._tp -= this.skillTpCost(skill);
  }

  isOccasionOk(item) {
    if ($gameParty.inBattle()) {
      return item.occasion === 0 || item.occasion === 1;
    } else {
      return item.occasion === 0 || item.occasion === 2;
    }
  }

  meetsUsableItemConditions(item) {
    return this.canMove() && this.isOccasionOk(item);
  }

  meetsSkillConditions(skill) {
    return (
      this.meetsUsableItemConditions(skill) &&
      this.isSkillWtypeOk(skill) &&
      this.canPaySkillCost(skill) &&
      !this.isSkillSealed(skill.id) &&
      !this.isSkillTypeSealed(skill.stypeId)
    );
  }

  meetsItemConditions(item) {
    return this.meetsUsableItemConditions(item) && $gameParty.hasItem(item);
  }

  canUse(item) {
    if (!item) {
      return false;
    } else if (DataManager.isSkill(item)) {
      return this.meetsSkillConditions(item);
    } else if (DataManager.isItem(item)) {
      return this.meetsItemConditions(item);
    } else {
      return false;
    }
  }

  canEquip(item) {
    if (!item) {
      return false;
    } else if (DataManager.isWeapon(item)) {
      return this.canEquipWeapon(item);
    } else if (DataManager.isArmor(item)) {
      return this.canEquipArmor(item);
    } else {
      return false;
    }
  }

  canEquipWeapon(item) {
    return (
      this.isEquipWtypeOk(item.wtypeId) &&
      !this.isEquipTypeSealed(item.etypeId)
    );
  }

  canEquipArmor(item) {
    return (
      this.isEquipAtypeOk(item.atypeId) &&
      !this.isEquipTypeSealed(item.etypeId)
    );
  }

  guardSkillId() {
    return 2;
  }

  canAttack() {
    return this.canUse($dataSkills[this.attackSkillId()]);
  }

  canGuard() {
    return this.canUse($dataSkills[this.guardSkillId()]);
  }

  get hp() {
    return this._hp;
  }

  set hp(value) {
    this._hp = value;
  }

  get mp() {
    return this._mp;
  }

  set mp(value) {
    this._mp = value;
  }

  get tp() {
    return this._tp;
  }

  set tp(value) {
    this._tp = value;
  }

  get mhp() {
    return this._mhp;
  }

  set mhp(value) {
    this._mhp = value;
  }

  get mmp() {
    return this._mmp;
  }

  set mmp(value) {
    this._mmp = value;
  }

  get atk() {
    return this._atk;
  }

  set atk(value) {
    this._atk = value;
  }

  get def() {
    return this._def;
  }

  set def(value) {
    this._def = value;
  }

  get mat() {
    return this._mat;
  }

  set mat(value) {
    this._mat = value;
  }

  get mdf() {
    return this._mdf;
  }

  set mdf(value) {
    this._mdf = value;
  }

  get agi() {
    return this._agi;
  }

  set agi(value) {
    this._agi = value;
  }

  get luk() {
    return this._luk;
  }

  set luk(value) {
    this._luk = value;
  }

  get hit() {
    return this._hit;
  }

  set hit(value) {
    this._hit = value;
  }

  get eva() {
    return this._eva;
  }

  set eva(value) {
    this._eva = value;
  }

  get cri() {
    return this._cri;
  }

  set cri(value) {
    this._cri = value;
  }

  get cev() {
    return this._cev;
  }

  set cev(value) {
    this._cev = value;
  }

  get mev() {
    return this._mev;
  }

  set mev(value) {
    this._mev = value;
  }

  get mrf() {
    return this._mrf;
  }

  set mrf(value) {
    this._mrf = value;
  }

  get cnt() {
    return this._cnt;
  }

  set cnt(value) {
    this._cnt = value;
  }

  get hrg() {
    return this._hrg;
  }

  set hrg(value) {
    this._hrg = value;
  }

  get mrg() {
    return this._mrg;
  }

  set mrg(value) {
    this._mrg = value;
  }

  get trg() {
    return this._trg;
  }

  set trg(value) {
    this._trg = value;
  }

  get tgr() {
    return this._tgr;
  }

  set tgr(value) {
    this._tgr = value;
  }

  get grd() {
    return this._grd;
  }

  set grd(value) {
    this._grd = value;
  }

  get rec() {
    return this._rec;
  }

  set rec(value) {
    this._rec = value;
  }

  get pha() {
    return this._pha;
  }

  set pha(value) {
    this._pha = value;
  }

  get mcr() {
    return this._mcr;
  }

  set mcr(value) {
    this._mcr = value;
  }

  get tcr() {
    return this._tcr;
  }

  set tcr(value) {
    this._tcr = value;
  }

  get pdr() {
    return this._pdr;
  }

  set pdr(value) {
    this._pdr = value;
  }

  get mdr() {
    return this._mdr;
  }

  set mdr(value) {
    this._mdr = value;
  }

  get fdr() {
    return this._fdr;
  }

  set fdr(value) {
    this._fdr = value;
  }

  get exr() {
    return this._exr;
  }

  set exr(value) {
    this._exr = value;
  }
}



