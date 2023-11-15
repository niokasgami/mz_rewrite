/**
 * The game object class for the game timer.
 */
class Game_Timer {
  constructor() {
    this.initialize(...arguments);
  }

  initialize() {
    this._frames = 0;
    this._working = false;
  }

  update(sceneActive) {
    if (sceneActive && this._working && this._frames > 0) {
      this._frames--;
      if (this._frames === 0) {
        this.onExpire();
      }
    }
  }

  start(count) {
    this._frames = count;
    this._working = true;
  }

  stop() {
    this._working = false;
  }

  isWorking() {
    return this._working;
  }

  seconds() {
    return Math.floor(this._frames / 60);
  }

  frames() {
    return this._frames;
  }

  onExpire() {
    BattleManager.abort();
  }
}


