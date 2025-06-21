export const Mode = {
  walking: 'walking',
  sprinting: 'sprinting',
  flying: 'flying',
  sprintFlying: 'sprintFlying',
  sneaking: 'sneaking',
};

export const Speed = {
  walking: 5.612,
  sprinting: 5.612,
  flying: 21.78,
  sprintFlying: 21.78,
  sneaking: 2.55,
};

export default class Player {
  constructor() {
    this.mode = Mode.walking;
    this.speed = Speed[this.mode];
    this.falling = 38.4;
    this.jump = 1.2522;
    this.body = {
      height: 1.8,
      width: 0.5,
    };
  }

  setMode(mode) {
    this.mode = mode;
    this.speed = Speed[this.mode];
  }
}
