/**
 * The game object class for an event.
 * It contains functionality for event page switching
 * and running parallel process events.
 */
class Game_Event extends Game_Character {
  constructor() {
    super();
    this.initialize(...arguments);
  }

  initialize(mapId, eventId) {
    super.initialize();
    this._mapId = mapId;
    this._eventId = eventId;
    this.locate(this.event().x, this.event().y);
    this.refresh();
  }

  initMembers() {
    super.initMembers();
    this._moveType = 0;
    this._trigger = 0;
    this._starting = false;
    this._erased = false;
    this._pageIndex = -2;
    this._originalPattern = 1;
    this._originalDirection = 2;
    this._prelockDirection = 0;
    this._locked = false;
  }

  eventId() {
    return this._eventId;
  }

  event() {
    return $dataMap.events[this._eventId];
  }

  page() {
    return this.event().pages[this._pageIndex];
  }

  list() {
    return this.page().list;
  }

  isCollidedWithCharacters(x, y) {
    return (
      super.isCollidedWithCharacters(x, y) ||
      this.isCollidedWithPlayerCharacters(x, y)
    );
  }

  isCollidedWithEvents(x, y) {
    const events = $gameMap.eventsXyNt(x, y);
    return events.length > 0;
  }

  isCollidedWithPlayerCharacters(x, y) {
    return this.isNormalPriority() && $gamePlayer.isCollided(x, y);
  }

  lock() {
    if (!this._locked) {
      this._prelockDirection = this.direction();
      this.turnTowardPlayer();
      this._locked = true;
    }
  }

  unlock() {
    if (this._locked) {
      this._locked = false;
      this.setDirection(this._prelockDirection);
    }
  }

  updateStop() {
    if (this._locked) {
      this.resetStopCount();
    }
    super.updateStop();
    if (!this.isMoveRouteForcing()) {
      this.updateSelfMovement();
    }
  }

  updateSelfMovement() {
    if (
      !this._locked &&
      this.isNearTheScreen() &&
      this.checkStop(this.stopCountThreshold())
    ) {
      switch (this._moveType) {
        case 1:
          this.moveTypeRandom();
          break;
        case 2:
          this.moveTypeTowardPlayer();
          break;
        case 3:
          this.moveTypeCustom();
          break;
      }
    }
  }

  stopCountThreshold() {
    return 30 * (5 - this.moveFrequency());
  }

  moveTypeRandom() {
    switch (Math.randomInt(6)) {
      case 0:
      case 1:
        this.moveRandom();
        break;
      case 2:
      case 3:
      case 4:
        this.moveForward();
        break;
      case 5:
        this.resetStopCount();
        break;
    }
  }

  moveTypeTowardPlayer() {
    if (this.isNearThePlayer()) {
      switch (Math.randomInt(6)) {
        case 0:
        case 1:
        case 2:
        case 3:
          this.moveTowardPlayer();
          break;
        case 4:
          this.moveRandom();
          break;
        case 5:
          this.moveForward();
          break;
      }
    } else {
      this.moveRandom();
    }
  }

  isNearThePlayer() {
    const sx = Math.abs(this.deltaXFrom($gamePlayer.x));
    const sy = Math.abs(this.deltaYFrom($gamePlayer.y));
    return sx + sy < 20;
  }

  moveTypeCustom() {
    this.updateRoutineMove();
  }

  isStarting() {
    return this._starting;
  }

  clearStartingFlag() {
    this._starting = false;
  }

  isTriggerIn(triggers) {
    return triggers.includes(this._trigger);
  }

  start() {
    const list = this.list();
    if (list && list.length > 1) {
      this._starting = true;
      if (this.isTriggerIn([0, 1, 2])) {
        this.lock();
      }
    }
  }

  erase() {
    this._erased = true;
    this.refresh();
  }

  refresh() {
    const newPageIndex = this._erased ? -1 : this.findProperPageIndex();
    if (this._pageIndex !== newPageIndex) {
      this._pageIndex = newPageIndex;
      this.setupPage();
    }
  }

  findProperPageIndex() {
    const pages = this.event().pages;
    for (let i = pages.length - 1; i >= 0; i--) {
      const page = pages[i];
      if (this.meetsConditions(page)) {
        return i;
      }
    }
    return -1;
  }

  meetsConditions(page) {
    const c = page.conditions;
    if (c.switch1Valid) {
      if (!$gameSwitches.value(c.switch1Id)) {
        return false;
      }
    }
    if (c.switch2Valid) {
      if (!$gameSwitches.value(c.switch2Id)) {
        return false;
      }
    }
    if (c.variableValid) {
      if ($gameVariables.value(c.variableId) < c.variableValue) {
        return false;
      }
    }
    if (c.selfSwitchValid) {
      const key = [this._mapId, this._eventId, c.selfSwitchCh];
      if ($gameSelfSwitches.value(key) !== true) {
        return false;
      }
    }
    if (c.itemValid) {
      const item = $dataItems[c.itemId];
      if (!$gameParty.hasItem(item)) {
        return false;
      }
    }
    if (c.actorValid) {
      const actor = $gameActors.actor(c.actorId);
      if (!$gameParty.members().includes(actor)) {
        return false;
      }
    }
    return true;
  }

  setupPage() {
    if (this._pageIndex >= 0) {
      this.setupPageSettings();
    } else {
      this.clearPageSettings();
    }
    this.refreshBushDepth();
    this.clearStartingFlag();
    this.checkEventTriggerAuto();
  }

  clearPageSettings() {
    this.setImage("", 0);
    this._moveType = 0;
    this._trigger = null;
    this._interpreter = null;
    this.setThrough(true);
  }

  setupPageSettings() {
    const page = this.page();
    const image = page.image;
    if (image.tileId > 0) {
      this.setTileImage(image.tileId);
    } else {
      this.setImage(image.characterName, image.characterIndex);
    }
    if (this._originalDirection !== image.direction) {
      this._originalDirection = image.direction;
      this._prelockDirection = 0;
      this.setDirectionFix(false);
      this.setDirection(image.direction);
    }
    if (this._originalPattern !== image.pattern) {
      this._originalPattern = image.pattern;
      this.setPattern(image.pattern);
    }
    this.setMoveSpeed(page.moveSpeed);
    this.setMoveFrequency(page.moveFrequency);
    this.setPriorityType(page.priorityType);
    this.setWalkAnime(page.walkAnime);
    this.setStepAnime(page.stepAnime);
    this.setDirectionFix(page.directionFix);
    this.setThrough(page.through);
    this.setMoveRoute(page.moveRoute);
    this._moveType = page.moveType;
    this._trigger = page.trigger;
    if (this._trigger === 4) {
      this._interpreter = new Game_Interpreter();
    } else {
      this._interpreter = null;
    }
  }

  isOriginalPattern() {
    return this.pattern() === this._originalPattern;
  }

  resetPattern() {
    this.setPattern(this._originalPattern);
  }

  checkEventTriggerTouch(x, y) {
    if (!$gameMap.isEventRunning()) {
      if (this._trigger === 2 && $gamePlayer.pos(x, y)) {
        if (!this.isJumping() && this.isNormalPriority()) {
          this.start();
        }
      }
    }
  }

  checkEventTriggerAuto() {
    if (this._trigger === 3) {
      this.start();
    }
  }

  update() {
    super.update();
    this.checkEventTriggerAuto();
    this.updateParallel();
  }

  updateParallel() {
    if (this._interpreter) {
      if (!this._interpreter.isRunning()) {
        this._interpreter.setup(this.list(), this._eventId);
      }
      this._interpreter.update();
    }
  }

  locate(x, y) {
    super.locate(x, y);
    this._prelockDirection = 0;
  }
  forceMoveRoute(moveRoute) {
    super.forceMoveRoute(moveRoute);
    this._prelockDirection = 0;
  }
}


