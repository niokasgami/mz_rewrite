/**
 * The wrapper class for an actor array.
 */
class Game_Actors {
  constructor() {
    this.initialize(...arguments);
  }

  initialize() {
    this._data = [];
  }

  actor(actorId) {
    if ($dataActors[actorId]) {
      if (!this._data[actorId]) {
        this._data[actorId] = new Game_Actor(actorId);
      }
      return this._data[actorId];
    }
    return null;
  }
}

