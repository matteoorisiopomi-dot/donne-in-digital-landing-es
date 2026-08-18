/**
 * Estrae il bounding box reale dei path da public/assets/logo.svg.
 * Approssimato: ricostruisce la posizione del pen lungo i comandi
 * SVG path. Sufficiente per trim viewBox.
 *
 * Uso: node scripts/compute-svg-bbox.mjs
 */

import { readFileSync } from "node:fs";

const svg = readFileSync(
  "public/assets/logo.svg",
  "utf8",
);

const pathDataRegex = /<path[^>]*\sd="([^"]+)"/g;

let minX = Infinity,
  minY = Infinity,
  maxX = -Infinity,
  maxY = -Infinity;

for (const match of svg.matchAll(pathDataRegex)) {
  const d = match[1];
  // Pen state.
  let x = 0;
  let y = 0;
  let startX = 0;
  let startY = 0;

  // Tokenize: extract command letters and number sequences.
  const tokens = d.match(/[A-Za-z]|-?\d*\.?\d+/g) ?? [];
  let i = 0;
  let lastCmd = "";

  while (i < tokens.length) {
    let cmd = tokens[i];
    if (/[A-Za-z]/.test(cmd)) {
      lastCmd = cmd;
      i++;
    } else {
      // Implicit repetition of last command.
      cmd = lastCmd;
    }

    const isAbs = cmd === cmd.toUpperCase();
    const c = cmd.toLowerCase();

    const num = () => {
      const v = parseFloat(tokens[i]);
      i++;
      return v;
    };

    const update = (px, py) => {
      if (px < minX) minX = px;
      if (py < minY) minY = py;
      if (px > maxX) maxX = px;
      if (py > maxY) maxY = py;
    };

    switch (c) {
      case "m": {
        const dx = num();
        const dy = num();
        x = isAbs ? dx : x + dx;
        y = isAbs ? dy : y + dy;
        startX = x;
        startY = y;
        update(x, y);
        // After M/m, subsequent pairs are L/l.
        lastCmd = isAbs ? "L" : "l";
        break;
      }
      case "l":
      case "t": {
        const dx = num();
        const dy = num();
        x = isAbs ? dx : x + dx;
        y = isAbs ? dy : y + dy;
        update(x, y);
        break;
      }
      case "h": {
        const dx = num();
        x = isAbs ? dx : x + dx;
        update(x, y);
        break;
      }
      case "v": {
        const dy = num();
        y = isAbs ? dy : y + dy;
        update(x, y);
        break;
      }
      case "c": {
        // c x1 y1 x2 y2 x y
        const x1 = num();
        const y1 = num();
        const x2 = num();
        const y2 = num();
        const dx = num();
        const dy = num();
        const ax1 = isAbs ? x1 : x + x1;
        const ay1 = isAbs ? y1 : y + y1;
        const ax2 = isAbs ? x2 : x + x2;
        const ay2 = isAbs ? y2 : y + y2;
        update(ax1, ay1);
        update(ax2, ay2);
        x = isAbs ? dx : x + dx;
        y = isAbs ? dy : y + dy;
        update(x, y);
        break;
      }
      case "s":
      case "q": {
        const x1 = num();
        const y1 = num();
        const dx = num();
        const dy = num();
        const ax1 = isAbs ? x1 : x + x1;
        const ay1 = isAbs ? y1 : y + y1;
        update(ax1, ay1);
        x = isAbs ? dx : x + dx;
        y = isAbs ? dy : y + dy;
        update(x, y);
        break;
      }
      case "a": {
        // a rx ry x-axis-rotation large-arc-flag sweep-flag x y
        num(); // rx
        num(); // ry
        num(); // rotation
        num(); // large-arc
        num(); // sweep
        const dx = num();
        const dy = num();
        x = isAbs ? dx : x + dx;
        y = isAbs ? dy : y + dy;
        update(x, y);
        break;
      }
      case "z":
        x = startX;
        y = startY;
        break;
      default:
        // Unknown command, skip one number.
        i++;
        break;
    }
  }
}

console.log("Bounding box dei path:");
console.log("  minX:", minX.toFixed(1));
console.log("  minY:", minY.toFixed(1));
console.log("  maxX:", maxX.toFixed(1));
console.log("  maxY:", maxY.toFixed(1));
console.log("  width:", (maxX - minX).toFixed(1));
console.log("  height:", (maxY - minY).toFixed(1));

const padX = 4; // margine cosmetico
const padY = 4;
const tx = Math.max(0, Math.floor(minX - padX));
const ty = Math.max(0, Math.floor(minY - padY));
const tw = Math.ceil(maxX - tx + padX);
const th = Math.ceil(maxY - ty + padY);

console.log("\nViewBox suggerito (con padding 4 su ogni lato):");
console.log(`  viewBox="${tx} ${ty} ${tw} ${th}"`);
console.log(`  aspect ratio: ${(tw / th).toFixed(3)}:1`);
console.log(`  vs originale 947×593: ${(947 / 593).toFixed(3)}:1`);
