/**
 * The game object class that handle the switches
 */
class Game_Switches {
  constructor() {
    this.initialize(...arguments);
  }

  initialize() {
    this.clear();
  }

  clear() {
    this._data = [];
  }

  value(switchId) {
    return !!this._data[switchId];
  }

  /**
   *
   * @param {number} switchId
   * @param {boolean} value
   */
  setValue(switchId, value) {
    if (switchId > 0 && switchId < $dataSystem.switches.length) {
      this._data[switchId] = value;
      this.onChange();
    }
  }

  onChange() {
    $gameMap.requestRefresh();
  }
}

