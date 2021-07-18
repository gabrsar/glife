let SCALE = 1;
let BASE_SIZE = 50;
let BORDER_SIZE = 10;
let RUN = false;
let RUN_ONCE = false;
let SCREEN_TRANSLATE;
let TICK_SPEED;
let LAST_RUN_ONCE = 0;
let TPS = 0;
const DESIRED_FPS = 60;

const KEYS_SPACE = 32;
const KEYS_ENTER = 13;
const KEYS_HOME = 36;
const KEYS_END = 35;
const KEYS_BACKSPACE = 8;

const keyActionMap = {
  [KEYS_ENTER]: setToggleRun,
  [KEYS_SPACE]: setRunOnce,
  [KEYS_HOME]: loadWord,
  [KEYS_END]: setEmptyWorld
}


let CURRENT_WORLD = null;

document.addEventListener('contextmenu', event => event.preventDefault());

class World {
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

class Cell {
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

function setup() {
  TICK_SPEED = 1;
  createCanvas(windowWidth, windowHeight);
  setupScreen();
  loadWord();
}


function setupScreen() {
  SCREEN_TRANSLATE = createVector(windowWidth / 2, windowHeight / 2)
  resizeCanvas(windowWidth, windowHeight);
}


function loadWorld() {
  this.WORLD = new World([]);
}

function drawCellDirty(c) {
  if (!c.alive) {
    return;
  }
  rect(c.x * BASE_SIZE, c.y * BASE_SIZE, BASE_SIZE, BASE_SIZE);
}

function drawWorld() {
  push();
  scale(SCALE);
  translate(SCREEN_TRANSLATE);
  fill(255);
  stroke(0);
  strokeWeight(BORDER_SIZE * Math.min(SCALE, 1));

  CURRENT_WORLD.getCells().forEach((c) => drawCellDirty(c));
  pop();
}


function setRunOnce() {
  RUN = false;
  RUN_ONCE = true;
}

function setToggleRun() {
  RUN = !RUN;
}


function keyPressed() {
  console.log(`keyPressed keyCode=${keyCode}`);


}


function windowResized() {
  setupScreen();
}

function draw() {

  if (keyIsDown(KEYS_SPACE) && frameCount % 10 === 0) {
    setRunOnce();
  }

  noCursor();


  if (RUN) {
    tick(true);
  }
  if (RUN_ONCE) {
    RUN_ONCE = false;
    tick(false);
  }
  background('rgba(0,0,0,1)');


  drawWorld();

  drawGrid();


  drawGameData();

  displayMouseCoords();

  push();
  fill(255, 255, 255);
  circle(mouseX + 5, mouseY + 5, 20);
  circle(mouseX, mouseY, 10);
  pop();

}

function getMouseGridCoord(x, y) {
  push();
  const gridSize = SCALE * BASE_SIZE;
  const rowTranslateOffset = (SCREEN_TRANSLATE.x % gridSize);
  const colTranslateOffset = (SCREEN_TRANSLATE.y % gridSize);
  const mg = screenCoordinatesToGrid(
    x + SCREEN_TRANSLATE.x - rowTranslateOffset,
    y + SCREEN_TRANSLATE.y - colTranslateOffset,
  );

  fill(255, 0, 0);

  circle(rowTranslateOffset + mg.x * gridSize, colTranslateOffset + mg.y * gridSize, 50);
  pop();
  return createVector(rowTranslateOffset + mg.x * gridSize, colTranslateOffset + mg.y * gridSize)
}

function drawGrid() {
  const color = 'rgba(0,255,200,0.1)'

  const gridSize = SCALE * BASE_SIZE;

  const drawGrid = SCALE * BASE_SIZE >= 5;

  push();

  stroke(color);

  const columns = Math.ceil(windowWidth / gridSize);
  const rows = Math.ceil(windowWidth / gridSize);

  const rowTranslateOffset = (SCREEN_TRANSLATE.x % gridSize);
  const colTranslateOffset = (SCREEN_TRANSLATE.y % gridSize);

  if (drawGrid) {
    for (let c = 0; c < columns; c++) {
      const a = rowTranslateOffset + c * gridSize;
      line(a, 0, a, windowHeight);
    }

    for (let r = 0; r < rows; r++) {
      const b = colTranslateOffset + r * gridSize
      line(0, b, windowWidth, b);
    }
  }

  const mg = screenCoordinatesToGrid(
    mouseX + SCREEN_TRANSLATE.x - rowTranslateOffset,
    mouseY + SCREEN_TRANSLATE.y - colTranslateOffset,
  );

  fill(color);
  rect(rowTranslateOffset + mg.x * gridSize, 0, gridSize, windowWidth);
  rect(0, colTranslateOffset + mg.y * gridSize, windowWidth, gridSize);

  noFill();
  stroke(color);
  strokeWeight(BORDER_SIZE * SCALE);
  rect(rowTranslateOffset + mg.x * gridSize, colTranslateOffset + mg.y * gridSize, gridSize, gridSize);

  const centerColor = 'rgba(255,255,200,0.1)'
  stroke(centerColor);

  const centerGrid = screenCoordinatesToGrid(
    ((windowWidth + BASE_SIZE) / 2) + SCREEN_TRANSLATE.x - rowTranslateOffset,
    ((windowHeight + BASE_SIZE) / 2) + SCREEN_TRANSLATE.y - colTranslateOffset,
  );

  rect(rowTranslateOffset + centerGrid.x * gridSize, colTranslateOffset + centerGrid.y * gridSize, gridSize, gridSize);


  pop();

}


function drawGameData() {
  push();

  fill(255, 0, 0);

  const { x, y } = screenCoordinatesToGrid(
    (windowWidth + BASE_SIZE) / 2,
    (windowHeight + BASE_SIZE) / 2
  );

  const px = x;
  const py = y
  textSize(25);


  text(
    ` zoom=${SCALE.toFixed(2)}` +
    ` pan=[${px},${py}]` +
    ` fps=${frameRate().toFixed(0)}` +
    ` g=${CURRENT_WORLD.generation}` +
    ` tps=${TPS}` +
    '', 10, 30
  );

  pop();

}


function displayMouseCoords() {
  const wg = screenCoordinatesToGrid(mouseX * SCALE, mouseY * SCALE);
  const mx = wg.x;
  const my = wg.y;
  push();
  textSize(20);

  stroke(0, 100, 100);
  strokeWeight(3);
  fill(255, 255, 255);
  text(`${mx},${my}`, mouseX, mouseY - 15);

  pop();
}

function screenCoordinatesToGrid(x, y) {
  const X = Math.floor((x - SCREEN_TRANSLATE.x) / BASE_SIZE / SCALE);
  const Y = Math.floor((y - SCREEN_TRANSLATE.y) / BASE_SIZE / SCALE);

  return createVector(X, Y);
}

function toggleAlive() {
  const { x, y } = getMouseGridCoord(mouseX, mouseY);
  console.log(x, y);
  const targetCell = CURRENT_WORLD.getCell(x, y);
  if (targetCell) {
    targetCell.flip()
  } else {
    CURRENT_WORLD.makeCell(x, y);
  }
}


function mouseDragged(event) {
  if (mouseButton === RIGHT) {
    const diff = createVector(mouseX - pmouseX, mouseY - pmouseY);
    SCREEN_TRANSLATE.add(diff.div(SCALE));
  }
  if (mouseButton === LEFT) {
    RUN = false;
    const pwg = screenCoordinatesToGrid(pmouseX, pmouseY);
    const wg = screenCoordinatesToGrid(mouseX, mouseY);
    if (!pwg.equals(wg)) {
      toggleAlive()
    }
  }
}

function mouseWheel(event) {
  SCALE *= (1 - (event.delta / Math.abs(event.delta) * 0.05));
  // SCREEN_TRANSLATE.add(mouseX, mouseY);
}

function mouseClicked() {
  toggleAlive()
}

function setEmptyWorld() {
  CURRENT_WORLD = World.loadFromStr('');
  printWorld()
}

function loadWord() {
  // const str = prompt('Enter world in format: ([X,Y];)', "5,5;10,10")
  const str = "0,0;12,5;12,6;12,7;13,5;11,6";
  CURRENT_WORLD = World.loadFromStr(str);
  printWorld()
}

function printWorld() {
  console.log(CURRENT_WORLD.printWorld());
}


function tick(fullThrottle = false) {
  const timePerFrameInMs = 1000 / DESIRED_FPS;
  let totalTime = 0;
  let ticks = 0;

  if (!fullThrottle) {
    TPS = 0;
    CURRENT_WORLD.tick();
    return;
  }

  while (totalTime < timePerFrameInMs) {
    const stats = CURRENT_WORLD.tick();
    totalTime += stats.elapsedTimeInMs;
    ticks++;
  }
  TPS = (ticks * frameRate()).toFixed(0);
}
