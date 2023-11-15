/**
 * The class that handle self switches which are dependant to the specific map
 */
class Game_SelfSwitches {
  constructor() {
    this.initialize(...arguments);
  }

  initialize() {
    this.clear();
  }

  clear() {
    this._data = {};
  }

  value(key) {
    return !!this._data[key];
  }

  setValue(key, value) {
    if (value) {
      this._data[key] = true;
    } else {
      delete this._data[key];
    }
    this.onChange();
  }

  onChange() {
    $gameMap.requestRefresh();
  }
}

