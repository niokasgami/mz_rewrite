/**
 * The game object class for a common event.
 * it contains functionality for running parallel process events.
 */
class Game_CommonEvent {
  constructor() {
    this.initialize(...arguments);
  }

  initialize(commonEventId) {
    this._commonEventId = commonEventId;
    this.refresh();
  }

  event() {
    return $dataCommonEvents[this._commonEventId];
  }

  list() {
    return this.event().list;
  }

  refresh() {
    if (this.isActive()) {
      if (!this._interpreter) {
        this._interpreter = new Game_Interpreter();
      }
    } else {
      this._interpreter = null;
    }
  }

  isActive() {
    const event = this.event();
    return event.trigger === 2 && $gameSwitches.value(event.switchId);
  }

  update() {
    if (this._interpreter) {
      if (!this._interpreter.isRunning()) {
        this._interpreter.setup(this.list());
      }
      this._interpreter.update();
    }
  }
}

