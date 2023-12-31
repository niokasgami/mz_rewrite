/**
 * the game object class that handle a picture data.
 */
class Game_Picture {
  constructor() {
    this.initialize(...arguments);
  }

  initialize() {
    this.initBasic();
    this.initTarget();
    this.initTone();
    this.initRotation();
  }

  name() {
    return this._name;
  }

  origin() {
    return this._origin;
  }

  x() {
    return this._x;
  }

  y() {
    return this._y;
  }

  scaleX() {
    return this._scaleX;
  }

  scaleY() {
    return this._scaleY;
  }

  opacity() {
    return this._opacity;
  }

  blendMode() {
    return this._blendMode;
  }

  tone() {
    return this._tone;
  }

  angle() {
    return this._angle;
  }

  initBasic() {
    this._name = "";
    this._origin = 0;
    this._x = 0;
    this._y = 0;
    this._scaleX = 100;
    this._scaleY = 100;
    this._opacity = 255;
    this._blendMode = 0;
  }

  initTarget() {
    this._targetX = this._x;
    this._targetY = this._y;
    this._targetScaleX = this._scaleX;
    this._targetScaleY = this._scaleY;
    this._targetOpacity = this._opacity;
    this._duration = 0;
    this._wholeDuration = 0;
    this._easingType = 0;
    this._easingExponent = 0;
  }

  initTone() {
    this._tone = null;
    this._toneTarget = null;
    this._toneDuration = 0;
  }

  initRotation() {
    this._angle = 0;
    this._rotationSpeed = 0;
  }

// prettier-ignore
  show(
    name, origin, x, y, scaleX, scaleY, opacity, blendMode
  ) {
    this._name = name;
    this._origin = origin;
    this._x = x;
    this._y = y;
    this._scaleX = scaleX;
    this._scaleY = scaleY;
    this._opacity = opacity;
    this._blendMode = blendMode;
    this.initTarget();
    this.initTone();
    this.initRotation();
  }

// prettier-ignore
  move(
    origin, x, y, scaleX, scaleY, opacity, blendMode, duration, easingType
  ) {
    this._origin = origin;
    this._targetX = x;
    this._targetY = y;
    this._targetScaleX = scaleX;
    this._targetScaleY = scaleY;
    this._targetOpacity = opacity;
    this._blendMode = blendMode;
    this._duration = duration;
    this._wholeDuration = duration;
    this._easingType = easingType;
    this._easingExponent = 2;
  }

  rotate(speed) {
    this._rotationSpeed = speed;
  }

  tint(tone, duration) {
    if (!this._tone) {
      this._tone = [0, 0, 0, 0];
    }
    this._toneTarget = tone.clone();
    this._toneDuration = duration;
    if (this._toneDuration === 0) {
      this._tone = this._toneTarget.clone();
    }
  }

  update() {
    this.updateMove();
    this.updateTone();
    this.updateRotation();
  }

  updateMove() {
    if (this._duration > 0) {
      this._x = this.applyEasing(this._x, this._targetX);
      this._y = this.applyEasing(this._y, this._targetY);
      this._scaleX = this.applyEasing(this._scaleX, this._targetScaleX);
      this._scaleY = this.applyEasing(this._scaleY, this._targetScaleY);
      this._opacity = this.applyEasing(this._opacity, this._targetOpacity);
      this._duration--;
    }
  }

  updateTone() {
    if (this._toneDuration > 0) {
      const d = this._toneDuration;
      for (let i = 0; i < 4; i++) {
        this._tone[i] = (this._tone[i] * (d - 1) + this._toneTarget[i]) / d;
      }
      this._toneDuration--;
    }
  }

  updateRotation() {
    if (this._rotationSpeed !== 0) {
      this._angle += this._rotationSpeed / 2;
    }
  }

  applyEasing(current, target) {
    const d = this._duration;
    const wd = this._wholeDuration;
    const lt = this.calcEasing((wd - d) / wd);
    const t = this.calcEasing((wd - d + 1) / wd);
    const start = (current - target * lt) / (1 - lt);
    return start + (target - start) * t;
  }

  calcEasing(t) {
    const exponent = this._easingExponent;
    switch (this._easingType) {
      case 1: // Slow start
        return this.easeIn(t, exponent);
      case 2: // Slow end
        return this.easeOut(t, exponent);
      case 3: // Slow start and end
        return this.easeInOut(t, exponent);
      default:
        return t;
    }
  }

  easeIn(t, exponent) {
    return Math.pow(t, exponent);
  }

  easeOut(t, exponent) {
    return 1 - Math.pow(1 - t, exponent);
  }

  easeInOut(t, exponent) {
    if (t < 0.5) {
      return this.easeIn(t * 2, exponent) / 2;
    } else {
      return this.easeOut(t * 2 - 1, exponent) / 2 + 0.5;
    }
  }
}

