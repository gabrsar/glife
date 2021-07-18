export default class Cell {
  x // column as in pixels
  y // line as in pixels
  alive

  constructor(x, y, alive = false, liveN, updated) {
    this.x = x;
    this.y = y;
    this.alive = alive;
  }

  flip() {
    this.alive = !this.alive;
  }
}
