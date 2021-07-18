export default class World {
  cellMap;
  oldCellMap;
  generation;

  constructor(cells, generation = 0) {
    this.oldMap = {};
    this.cellMap = {}
    this.generation = generation;
    cells.map((c) => this.cellMap[this.hashCell(c)] = c)
  }

  getCell(x, y) {
    return this.cellMap[this.hashCoords(x, y)];
  }

  getCells() {
    return Object.values(this.cellMap);
  }

  static loadFromStr(worldStr) {
    return new World(
      worldStr
        .split(";")
        .map((c) => c.split(',').map((i) => parseInt(i)))
        .map(([x, y]) => new Cell(x, y, true))
    )
  }

  printWorld() {
    return Object.values(this.cellMap)
      .filter((c) => c.alive)
      .map((c) => this.hashCell(c))
      .join(";");
  }

  hashCell(c) {
    return this.hashCoords(c.x, c.y);
  }

  hashCoords(x, y) {
    return `${x},${y}`;
  }

  makeCell(x, y) {
    const newCell = new Cell(x, y, true);
    this.cellMap[this.hashCell(newCell)] = newCell;
  }

  checkAndSet(x, y) {
    const hash = this.hashCoords(x, y);
    const cell = this.cellMap[hash];
    if (cell && cell.alive) {
      return 1;
    } else {
      this.cellMap[hash] = new Cell(x, y, false);
      return 0;
    }
  }

  tickForCellAndFillN(c) {
    const { x, y } = c;
    const liveNeighbours =
      this.checkAndSet(x - 1, y - 1) +
      this.checkAndSet(x - 0, y - 1) +
      this.checkAndSet(x + 1, y - 1) +
      this.checkAndSet(x - 1, y - 0) +
      this.checkAndSet(x + 1, y - 0) +
      this.checkAndSet(x - 1, y + 1) +
      this.checkAndSet(x - 0, y + 1) +
      this.checkAndSet(x + 1, y + 1);

    let alive;

    if (c.alive && liveNeighbours < 2) {
      alive = false;
    } else if (c.alive && (liveNeighbours === 2 || liveNeighbours === 3)) {
      alive = true;
    } else if (c.alive && liveNeighbours > 3) {
      alive = false;
    } else if (!c.alive && liveNeighbours === 3) {
      alive = true;
    } else {
      alive = false;
    }

    return new Cell(x, y, alive);
  }

  tick() {
    const start = new Date();
    const aliveCells = Object.values(this.cellMap).filter((c) => c.alive);
    const aliceCellsNextGen = aliveCells.map((cell) => this.tickForCellAndFillN(cell));
    const candidateCellsNextGen = Object.values(this.cellMap).filter((c) => !c.alive).map((cell) => this.tickForCellAndFillN(cell))

    const allCells = [...aliceCellsNextGen, ...candidateCellsNextGen.filter((c) => c.alive)]

    const newMap = {};
    allCells.forEach((c) => newMap[this.hashCell(c)] = c);
    this.oldCellMap = this.cellMap;
    this.cellMap = newMap;
    const end = new Date();
    this.generation++;
    return { elapsedTimeInMs: (end - start), aliveCellsCount: aliveCells.length, generation: this.generation };
  }
}
