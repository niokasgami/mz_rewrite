/**
 * The game object class for the party.
 * data such as gold and items are included.
 */
class Game_Party extends Game_Unit {

  static ABILITY_ENCOUNTER_HALF = 0;
  static ABILITY_ENCOUNTER_NONE = 1;
  static ABILITY_CANCEL_SURPRISE = 2;
  static ABILITY_RAISE_PREEMPTIVE = 3;
  static ABILITY_GOLD_DOUBLE = 4;
  static ABILITY_DROP_ITEM_DOUBLE = 5;
  constructor() {
    super();
    this.initialize(...arguments);
  }

  initialize() {
    super.initialize();
    this._gold = 0;
    this._steps = 0;
    this._lastItem = new Game_Item();
    this._menuActorId = 0;
    this._targetActorId = 0;
    this._actors = [];
    this.initAllItems();
  }

  initAllItems() {
    this._items = {};
    this._weapons = {};
    this._armors = {};
  }

  exists() {
    return this._actors.length > 0;
  }

  size() {
    return this.members().length;
  }

  isEmpty() {
    return this.size() === 0;
  }

  /**
   * @returns {Game_Actor[]}
   */
  members() {
    return this.inBattle() ? this.battleMembers() : this.allMembers();
  }

  allMembers() {
    return this._actors.map(id => $gameActors.actor(id));
  }

  battleMembers() {
    return this.allBattleMembers().filter(actor => actor.isAppeared());
  }

  hiddenBattleMembers() {
    return this.allBattleMembers().filter(actor => actor.isHidden());
  }

  allBattleMembers() {
    return this.allMembers().slice(0, this.maxBattleMembers());
  }

  maxBattleMembers() {
    return 4;
  }

  leader() {
    return this.battleMembers()[0];
  }

  removeInvalidMembers() {
    for (const actorId of this._actors) {
      if (!$dataActors[actorId]) {
        this._actors.remove(actorId);
      }
    }
  }

  reviveBattleMembers() {
    for (const actor of this.battleMembers()) {
      if (actor.isDead()) {
        actor.setHp(1);
      }
    }
  }

  items() {
    return Object.keys(this._items).map(id => $dataItems[id]);
  }

  weapons() {
    return Object.keys(this._weapons).map(id => $dataWeapons[id]);
  }

  armors() {
    return Object.keys(this._armors).map(id => $dataArmors[id]);
  }

  equipItems() {
    return this.weapons().concat(this.armors());
  }

  allItems() {
    return this.items().concat(this.equipItems());
  }

  itemContainer(item) {
    if (!item) {
      return null;
    } else if (DataManager.isItem(item)) {
      return this._items;
    } else if (DataManager.isWeapon(item)) {
      return this._weapons;
    } else if (DataManager.isArmor(item)) {
      return this._armors;
    } else {
      return null;
    }
  }

  setupStartingMembers() {
    this._actors = [];
    for (const actorId of $dataSystem.partyMembers) {
      if ($gameActors.actor(actorId)) {
        this._actors.push(actorId);
      }
    }
  }

  name() {
    const numBattleMembers = this.battleMembers().length;
    if (numBattleMembers === 0) {
      return "";
    } else if (numBattleMembers === 1) {
      return this.leader().name();
    } else {
      return TextManager.partyName.format(this.leader().name());
    }
  }

  setupBattleTest() {
    this.setupBattleTestMembers();
    this.setupBattleTestItems();
  }

  setupBattleTestMembers() {
    for (const battler of $dataSystem.testBattlers) {
      const actor = $gameActors.actor(battler.actorId);
      if (actor) {
        actor.changeLevel(battler.level, false);
        actor.initEquips(battler.equips);
        actor.recoverAll();
        this.addActor(battler.actorId);
      }
    }
  }

  setupBattleTestItems() {
    for (const item of $dataItems) {
      if (item && item.name.length > 0) {
        this.gainItem(item, this.maxItems(item));
      }
    }
  }

  highestLevel() {
    return Math.max(...this.members().map(actor => actor.level));
  }

  addActor(actorId) {
    if (!this._actors.includes(actorId)) {
      this._actors.push(actorId);
      $gamePlayer.refresh();
      $gameMap.requestRefresh();
      $gameTemp.requestBattleRefresh();
      if (this.inBattle()) {
        const actor = $gameActors.actor(actorId);
        if (this.battleMembers().includes(actor)) {
          actor.onBattleStart();
        }
      }
    }
  }

  removeActor(actorId) {
    if (this._actors.includes(actorId)) {
      const actor = $gameActors.actor(actorId);
      const wasBattleMember = this.battleMembers().includes(actor);
      this._actors.remove(actorId);
      $gamePlayer.refresh();
      $gameMap.requestRefresh();
      $gameTemp.requestBattleRefresh();
      if (this.inBattle() && wasBattleMember) {
        actor.onBattleEnd();
      }
    }
  }

  gold() {
    return this._gold;
  }

  gainGold(amount) {
    this._gold = (this._gold + amount).clamp(0, this.maxGold());
  }

  loseGold(amount) {
    this.gainGold(-amount);
  }

  maxGold() {
    return 99999999;
  }

  steps() {
    return this._steps;
  }

  increaseSteps() {
    this._steps++;
  }

  numItems(item) {
    const container = this.itemContainer(item);
    return container ? container[item.id] || 0 : 0;
  }

  maxItems() {
    return 99;
  }

  hasMaxItems(item) {
    return this.numItems(item) >= this.maxItems(item);
  }

  hasItem(item, includeEquip) {
    if (this.numItems(item) > 0) {
      return true;
    } else if (includeEquip && this.isAnyMemberEquipped(item)) {
      return true;
    } else {
      return false;
    }
  }

  isAnyMemberEquipped(item) {
    return this.members().some(actor => actor.equips().includes(item));
  }

  gainItem(item, amount, includeEquip) {
    const container = this.itemContainer(item);
    if (container) {
      const lastNumber = this.numItems(item);
      const newNumber = lastNumber + amount;
      container[item.id] = newNumber.clamp(0, this.maxItems(item));
      if (container[item.id] === 0) {
        delete container[item.id];
      }
      if (includeEquip && newNumber < 0) {
        this.discardMembersEquip(item, -newNumber);
      }
      $gameMap.requestRefresh();
    }
  }

  discardMembersEquip(item, amount) {
    let n = amount;
    for (const actor of this.members()) {
      while (n > 0 && actor.isEquipped(item)) {
        actor.discardEquip(item);
        n--;
      }
    }
  }

  loseItem(item, amount, includeEquip) {
    this.gainItem(item, -amount, includeEquip);
  }

  consumeItem(item) {
    if (DataManager.isItem(item) && item.consumable) {
      this.loseItem(item, 1);
    }
  }

  canUse(item) {
    return this.members().some(actor => actor.canUse(item));
  }

  canInput() {
    return this.members().some(actor => actor.canInput());
  }

  isAllDead() {
    if (Game_Unit.prototype.isAllDead.call(this)) {
      return this.inBattle() || !this.isEmpty();
    } else {
      return false;
    }
  }

  isEscaped() {
    return this.isAllDead() && this.hiddenBattleMembers().length > 0;
  }

  onPlayerWalk() {
    for (const actor of this.members()) {
      actor.onPlayerWalk();
    }
  }

  menuActor() {
    let actor = $gameActors.actor(this._menuActorId);
    if (!this.members().includes(actor)) {
      actor = this.members()[0];
    }
    return actor;
  }

  setMenuActor(actor) {
    this._menuActorId = actor.actorId();
  }

  makeMenuActorNext() {
    let index = this.members().indexOf(this.menuActor());
    if (index >= 0) {
      index = (index + 1) % this.members().length;
      this.setMenuActor(this.members()[index]);
    } else {
      this.setMenuActor(this.members()[0]);
    }
  }

  makeMenuActorPrevious() {
    let index = this.members().indexOf(this.menuActor());
    if (index >= 0) {
      index = (index + this.members().length - 1) % this.members().length;
      this.setMenuActor(this.members()[index]);
    } else {
      this.setMenuActor(this.members()[0]);
    }
  }

  targetActor() {
    let actor = $gameActors.actor(this._targetActorId);
    if (!this.members().includes(actor)) {
      actor = this.members()[0];
    }
    return actor;
  }

  setTargetActor(actor) {
    this._targetActorId = actor.actorId();
  }

  lastItem() {
    return this._lastItem.object();
  }

  setLastItem(item) {
    this._lastItem.setObject(item);
  }

  swapOrder(index1, index2) {
    const temp = this._actors[index1];
    this._actors[index1] = this._actors[index2];
    this._actors[index2] = temp;
    $gamePlayer.refresh();
  }

  charactersForSavefile() {
    return this.battleMembers().map(actor => [
      actor.characterName(),
      actor.characterIndex()
    ]);
  }

  facesForSavefile() {
    return this.battleMembers().map(actor => [
      actor.faceName(),
      actor.faceIndex()
    ]);
  }

  partyAbility(abilityId) {
    return this.battleMembers().some(actor => actor.partyAbility(abilityId));
  }

  hasEncounterHalf() {
    return this.partyAbility(Game_Party.ABILITY_ENCOUNTER_HALF);
  }

  hasEncounterNone() {
    return this.partyAbility(Game_Party.ABILITY_ENCOUNTER_NONE);
  }

  hasCancelSurprise() {
    return this.partyAbility(Game_Party.ABILITY_CANCEL_SURPRISE);
  }

  hasRaisePreemptive() {
    return this.partyAbility(Game_Party.ABILITY_RAISE_PREEMPTIVE);
  }

  hasGoldDouble() {
    return this.partyAbility(Game_Party.ABILITY_GOLD_DOUBLE);
  }

  hasDropItemDouble() {
    return this.partyAbility(Game_Party.ABILITY_DROP_ITEM_DOUBLE);
  }

  ratePreemptive(troopAgi) {
    let rate = this.agility() >= troopAgi ? 0.05 : 0.03;
    if (this.hasRaisePreemptive()) {
      rate *= 4;
    }
    return rate;
  }

  rateSurprise(troopAgi) {
    let rate = this.agility() >= troopAgi ? 0.03 : 0.05;
    if (this.hasCancelSurprise()) {
      rate = 0;
    }
    return rate;
  }

  performVictory() {
    for (const actor of this.members()) {
      actor.performVictory();
    }
  }

  performEscape() {
    for (const actor of this.members()) {
      actor.performEscape();
    }
  }

  removeBattleStates() {
    for (const actor of this.members()) {
      actor.removeBattleStates();
    }
  }

  requestMotionRefresh() {
    for (const actor of this.members()) {
      actor.requestMotionRefresh();
    }
  }

  onEscapeFailure() {
    for (const actor of this.members()) {
      actor.onEscapeFailure();
    }
  }
}




