let ENV_WOLD_COLS = 100;
let ENV_WOLD_ROWS = 100;
let ENV_BLOCK_SIZE;
let RUN = false;
let RUN_ONCE = false;
let SCREEN_TRANSLATE;
let TICK_SPEED;
let DEBUG = false;
let GENERATION = 0;

let WORLD;


class Cell {
  x // column as in pixels
  y // line as in pixels
  alive

  constructor(x, y, alive = Math.random() > 0.9, liveN) {
    this.x = x;
    this.y = y;
    this.alive = alive;
    this.liveN = liveN;
  }

  draw() {
    push();
    fill(...(this.alive ? [255, 255, 255] : [0, 0, 0]));
    rect(ENV_BLOCK_SIZE * this.x, ENV_BLOCK_SIZE * this.y, ENV_BLOCK_SIZE, ENV_BLOCK_SIZE);
    if (DEBUG) {

      fill(255, 0, 0);
      textFont('Monospace');

      const ln = this.liveN;
      if (ln) {

        const n = [
          [ln[0], ln[1], ln[2]].join(" "),
          [ln[3], ' ', ln[5]].join(" "),
          [ln[6], ln[7], ln[8]].join(" ")
        ]
        text(`x=${this.x} y= ${this.y}`, ENV_BLOCK_SIZE * this.x + ENV_BLOCK_SIZE / 2, ENV_BLOCK_SIZE * this.y + ENV_BLOCK_SIZE / 2);

        if (this.liveN && this.liveN.length > 0) {
          text(n[0], ENV_BLOCK_SIZE * this.x + ENV_BLOCK_SIZE / 2, ENV_BLOCK_SIZE * this.y + 10 + ENV_BLOCK_SIZE / 2);
          text(n[1], ENV_BLOCK_SIZE * this.x + ENV_BLOCK_SIZE / 2, ENV_BLOCK_SIZE * this.y + 20 + ENV_BLOCK_SIZE / 2);
          text(n[2], ENV_BLOCK_SIZE * this.x + ENV_BLOCK_SIZE / 2, ENV_BLOCK_SIZE * this.y + 30 + ENV_BLOCK_SIZE / 2);
        }
      }
    }


    pop();
  }


  tick(cw) {

    const x = this.x;
    const y = this.y;
    let alive;
    const neighbours = [
      isAliveInt(cw, x - 1, y - 1),
      isAliveInt(cw, x - 0, y - 1),
      isAliveInt(cw, x + 1, y - 1),

      isAliveInt(cw, x - 1, y - 0),
      0,
      isAliveInt(cw, x + 1, y - 0),

      isAliveInt(cw, x - 1, y + 1),
      isAliveInt(cw, x - 0, y + 1),
      isAliveInt(cw, x + 1, y + 1),
    ];
    const liveNeighbours = neighbours.reduce((acc, cv) => acc + cv);

    if (this.alive && liveNeighbours < 2) {
      alive = false;
    } else if (this.alive && (liveNeighbours === 2 || liveNeighbours === 3)) {
      alive = true;
    } else if (this.alive && liveNeighbours > 3) {
      alive = false;
    } else if (!this.alive && liveNeighbours === 3) {
      alive = true;
    } else {
      alive = false;
    }


    return new Cell(x, y, alive, neighbours);
  }


}

function keyPressed() {
  console.log(keyCode);
  switch (keyCode) {
    case 13:
      RUN = !RUN;
      break;
    case 32:
      RUN_ONCE = true;
      RUN = true;
      break;
    case 39:
      TICK_SPEED--;
      break;
    case 37:
      TICK_SPEED++;
      break;
    case 35:
      printWorld();
      break;
    case 36:
      loadWord();
      break;
    case 8:
      startEmptyWorld();
  }

}

function startEmptyWorld() {
  GENERATION = 0;
  ENV_WOLD_ROWS = 100;
  ENV_WOLD_COLS = 100;
  WORLD = makeWorld(ENV_WOLD_ROWS, ENV_WOLD_ROWS);

  fillWorldEmpty(WORLD);
}


function startExampleWorld() {
  loadWorldFromStr(
    "10;10;" +
    "0000000000" +
    "0000000000" +
    "0000000000" +
    "0000000000" +
    "0000000000" +
    "0000000000" +
    "0000000000" +
    "0000000000" +
    "0000000000" +
    "0000000000"
  )
}

function isAliveInt(cw, x, y) {
  if (x < 0 || y < 0 || x >= ENV_WOLD_ROWS || y >= ENV_WOLD_COLS) {
    return 0;
  }

  const a = cw[y][x];

  return a.alive ? 1 : 0;
}

function makeWorld(rows, cols) {
  const newWorld = new Array(rows);
  for (let k = 0; k < rows; k++) {
    newWorld[k] = new Array(cols);
  }

  return newWorld;
}

function fillWorldEmpty(world) {
  for (let y = 0; y < world.length; y++) {
    for (let x = 0; x < world[y].length; x++) {
      world[y][x] = new Cell(x, y, 0);
    }
  }
}

function fillWorldRandom(world, fullness) {
  for (let y = 0; y < world.length; y++) {
    for (let x = 0; x < world[y].length; x++) {
      world[y][x] = new Cell(x, y, Math.random() < fullness);
    }
  }
}

function fillWorld(world, cells) {
  cells.forEach((c) => {
    world[c.y][c.x] = c;
  });
}

function startWorld() {
  ENV_WOLD_ROWS = 50;
  ENV_WOLD_COLS = 50;
  WORLD = makeWorld(ENV_WOLD_ROWS, ENV_WOLD_ROWS);
  fillWorldRandom(WORLD, 0.2);
}

function setupScreen() {
  resizeCanvas(windowWidth, windowHeight);

  ENV_BLOCK_SIZE = Math.min(innerWidth / ENV_WOLD_COLS, innerHeight / ENV_WOLD_ROWS);

  SCREEN_TRANSLATE = createVector(
    (windowWidth - ENV_BLOCK_SIZE * ENV_WOLD_COLS) / 2,
    (windowHeight - ENV_BLOCK_SIZE * ENV_WOLD_ROWS) / 2
  );

}

function setup() {
  TICK_SPEED = 1;
  frameRate(60);
  createCanvas(windowWidth, windowHeight);
  // startWorld();
  startEmptyWorld();
  setupScreen();
}

function windowResized() {
  setupScreen();
}

function draw() {
  push();

  translate(SCREEN_TRANSLATE);
  background(0);


  for (let y = 0; y < ENV_WOLD_ROWS; y++) {
    for (let x = 0; x < ENV_WOLD_COLS; x++) {
      WORLD[y][x].draw();
    }
  }
  if (DEBUG) {
    printWorld("\n");
  }

  if (frameCount % TICK_SPEED === 0) {
    RUN ? tick() : null;
    if (RUN_ONCE) {
      RUN_ONCE = false;
      RUN = false;
    }
  }

  pop();
  push();

  fill(255, 0, 0);
  text(`[${GENERATION}] (${frameRate().toFixed(0)} fps)`, 20, 20)

  const wg = coordsToWorldGrid(mouseX, mouseY);
  const mx = wg.x;
  const my = wg.y;
  if (insideGridBounds(mx, my)) {
    stroke(0, 0, 0);

    text(`x=${mx} y=${my}`, mouseX + 21, mouseY + 1);
    fill(0, 255, 255);

    text(`x=${mx} y=${my}`, mouseX + 20, mouseY);
    noFill();
    stroke(0, 255, 0);
    translate(SCREEN_TRANSLATE);
    rect(ENV_BLOCK_SIZE * mx, ENV_BLOCK_SIZE * my, ENV_BLOCK_SIZE, ENV_BLOCK_SIZE);
  }
  pop();

}

function coordsToWorldGrid(x, y) {
  const X = Math.floor((x - SCREEN_TRANSLATE.x) / ENV_BLOCK_SIZE);
  const Y = Math.floor((y - SCREEN_TRANSLATE.y) / ENV_BLOCK_SIZE);


  return createVector(X, Y);
}

function insideGridBounds(x, y) {
  return (
    (x >= 0 && x < ENV_WOLD_COLS) &&
    (y >= 0 && y < ENV_WOLD_ROWS)
  );
}

function toggleAlive() {
  const wg = coordsToWorldGrid(mouseX, mouseY);
  if (insideGridBounds(wg.x, wg.y)) {
    WORLD[wg.y][wg.x].alive = !WORLD[wg.y][wg.x].alive;
  }
}

function mouseDragged() {
  if (mouseIsPressed) {
    const pwg = coordsToWorldGrid(pmouseX, pmouseY);
    const wg = coordsToWorldGrid(mouseX, mouseY);
    if (!pwg.equals(wg)) {
      toggleAlive()
    }
  }
}


function mouseClicked() {
  toggleAlive()
}

function loadWorldFromStr(str) {
  if (!str) {
    throw new Error('no data');
  }
  const cleanStr = str.replaceAll(/[^0-9;]/g, "");
  const checker = /\d+;\d+;[01]+/;
  const isWorldValid = checker.test(cleanStr);
  if (!isWorldValid) {
    throw new Error('invalid format');
  }
  const parts = cleanStr.split(";");
  ENV_WOLD_ROWS = parseInt(parts[0]);
  ENV_WOLD_COLS = parseInt(parts[1]);

  console.log(ENV_WOLD_ROWS);
  console.log(ENV_WOLD_COLS);

  const aliveData = parts[2]
    .split("")
    .map(parseInt)
    .map((k) => !!k);

  const cells = aliveData.map((a, k) => {
    const row = Math.floor(k / ENV_WOLD_COLS);
    const col = k % ENV_WOLD_ROWS;
    return new Cell(row, col, a);
  });

  const loadedWorld = makeWorld(ENV_WOLD_ROWS, ENV_WOLD_COLS);
  fillWorld(loadedWorld, cells);
  WORLD = loadedWorld;
}

function loadWord() {

  const str = prompt('Enter world in format: ROWS;COLS;STATE')
  if (!str) {
    return;
  }
  try {
    loadWorldFromStr(str);
  } catch (e) {
    alert('Invalid!');
    loadWord();
  }
}

function printWorld(rowBreaker = "") {
  const r = ENV_WOLD_ROWS;
  const c = ENV_WOLD_COLS;
  const state = WORLD.map((rows) => rows.map((cell) => cell.alive ? 1 : 0).join("")).join(rowBreaker);

  console.log(`${r};${c};${rowBreaker}${state}`);
}

function tick() {
  WORLD = WORLD.map((rows) => rows.map((cell) => cell.tick(WORLD)));
  GENERATION++;

}
