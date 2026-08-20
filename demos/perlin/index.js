import random from "canvas-sketch-util/random";
import math from "canvas-sketch-util/math";
import { Pane } from "tweakpane";

const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");

canvas.width = 2048;
canvas.height = 2048;
const wthRatio = canvas.width / canvas.height;

canvas.style.margin = "auto";
canvas.style.boxShadow = "0px 0px 5px rgba(0,0,0,0.2)";
canvas.style.borderRadius = "10px";

// const width = window.innerWidth * 0.9;
// const height = window.innerHeight * 0.9;

const width = screen.width * 0.9;
const height = screen.height * 0.9;

if (height < width) {
  canvas.style.width = height * wthRatio + "px";
  canvas.style.height = height + "px";
} else {
  canvas.style.width = width + "px";
  canvas.style.height = width / wthRatio + "px";
}

const defaultParams = {
  lineCap: "butt",
  cols: 10,
  rows: 10,
  scaleMin: 1,
  scaleMax: 30,
  freq: 0.001,
  amp: 0.2,
  frame: 0,
  animate: true,
};

const params = {
  ...defaultParams,
};

const createPane = () => {
  const pane = new Pane({
    container: document.getElementById("panel-container"),
  });
  let folder;

  folder = pane.addFolder({ title: "Grid" });
  folder.addInput(params, "lineCap", {
    label: "Line Cap",
    options: { butt: "butt", round: "round", square: "square" },
  });
  folder.addInput(params, "cols", { label: "Cols", min: 1, max: 100, step: 1 });
  folder.addInput(params, "rows", { label: "Rows", min: 1, max: 100, step: 1 });
  folder.addInput(params, "scaleMin", { label: "Scale Min", min: 1, max: 100 });
  folder.addInput(params, "scaleMax", { label: "Scale Max", min: 1, max: 100 });

  folder = pane.addFolder({ title: "Noise" });
  folder.addInput(params, "freq", {
    label: "Frequency",
    min: -0.01,
    max: 0.01,
  });
  folder.addInput(params, "amp", {
    label: "Amplitude",
    min: 0,
    max: 1,
  });

  folder = pane.addFolder({ title: "Misc" });
  folder.addInput(params, "animate", {
    label: "Animate",
  });
  folder.addInput(params, "frame", {
    label: "Frame",
  });
  folder.addButton({ title: "Restore Default Config" }).on("click", () => {
    Object.keys(params).forEach((key) => {
      params[key] = defaultParams[key];
    });
    pane.refresh();
  });

  pane.con;

  return pane;
};

const pane = createPane();

const sketch = () => {
  return (context, width, height) => {
    context.fillStyle = "white";
    context.fillRect(0, 0, width, height);

    const cols = params.cols;
    const rows = params.rows;
    const numCells = rows * cols;

    const gridW = width * 0.8;
    const gridH = height * 0.8;
    const cellW = gridW / cols;
    const cellH = gridH / rows;
    const margX = (width - gridW) / 2;
    const margY = (height - gridH) / 2;

    if (params.animate) {
      params.frame += 1;
      pane.refresh();
    }

    for (let i = 0; i < numCells; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);

      const x = col * cellW;
      const y = row * cellH;
      const w = cellW * 0.8;
      const h = cellH * 0.8;

      const n = random.noise3D(x, y, params.frame * 10, params.freq);
      const angle = Math.PI * n * params.amp;
      const scale = math.mapRange(n, -1, 1, params.scaleMin, params.scaleMax);

      context.save();
      context.translate(margX, margY);
      context.translate(x, y);
      context.translate(cellW / 2, cellH / 2);
      context.rotate(angle);

      context.lineWidth = scale;
      context.lineCap = params.lineCap;

      context.beginPath();
      context.moveTo(-w * 0.5, 0);
      context.lineTo(w * 0.5, 0);
      context.stroke();
      context.restore();
    }
  };
};

const animate = () => {
  requestAnimationFrame(animate);
  sketch()(context, canvas.width, canvas.height);
};
requestAnimationFrame(animate);

// Make the DIV element draggable:
dragElement(document.getElementById("panel-container"));

function dragElement(elmnt) {
  let pos1 = 0,
    pos2 = 0,
    pos3 = 0,
    pos4 = 0;
  if (document.getElementById("panel-header")) {
    // if present, the header is where you move the DIV from:
    document.getElementById("panel-header").onmousedown = dragMouseDown;

    document
      .getElementById("panel-header")
      .addEventListener("touchstart", dragMouseDown);
    document
      .getElementById("panel-header")
      .addEventListener("touchmove", elementDrag);
    document
      .getElementById("panel-header")
      .addEventListener("touchend", closeDragElement);
  } else {
    // otherwise, move the DIV from anywhere inside the DIV:
    elmnt.onmousedown = dragMouseDown;
  }

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = e.type === "touchstart" ? e.touches[0].clientX : e.clientX;
    pos4 = e.type === "touchstart" ? e.touches[0].clientY : e.clientY;

    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    const cx = e.type === "touchmove" ? e.touches[0].clientX : e.clientX;
    const cy = e.type === "touchmove" ? e.touches[0].clientY : e.clientY;

    pos1 = pos3 - cx;
    pos2 = pos4 - cy;
    pos3 = cx;
    pos4 = cy;
    // set the element's new position:
    elmnt.style.top = elmnt.offsetTop - pos2 + "px";
    elmnt.style.left = elmnt.offsetLeft - pos1 + "px";
  }

  function closeDragElement() {
    // this.style.backgroundColor = "#2f3137";
    // stop moving when mouse button is released:
    document.onmouseup = null;
    document.onmousemove = null;
  }
}
