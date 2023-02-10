const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

// Set the width and height of the canvas
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Set the distance between the slits and the screen
const d = canvas.width / 2;

// Set the width of the slits
const a = 10;

// Set the distance between the slits
const b = 50;

// Set the wavelength of the light
const lambda = 10;

// Set the amplitude of the light
const A = 255;

// Set the angle between the light and the screen
const theta = Math.PI / 4;

// Set the distance between the fringes
const L = d / Math.sin(theta);
const delta = (lambda * d) / L;

// Draw the slits
ctx.fillStyle = "white";
ctx.fillRect(canvas.width / 4, 0, 5, canvas.height / 2 - b / 2 - a);
ctx.fillRect(canvas.width / 4, canvas.height / 2 - b / 2, 5, b);
ctx.fillRect(
  canvas.width / 4,
  canvas.height / 2 + b / 2 + a,
  5,
  canvas.height / 2 - b / 2 - a
);

// Draw the central axis
ctx.strokeStyle = "white";
ctx.beginPath();
ctx.moveTo(canvas.width / 4, canvas.height / 2);
ctx.lineTo(canvas.width / 4 + d, canvas.height / 2);
ctx.stroke();

// Set the starting position for the fringes
let x = canvas.width / 4 + d;

// Set the maximum intensity of the light
const I_max = A ** 2 / 2;

// Iterate over the y-axis
for (let y = 0; y < canvas.height; y++) {
  const dx = d;
  const dy1 = y - canvas.height / 2 - b / 2 - a / 2;
  const dy2 = y - canvas.height / 2 + b / 2 + a / 2;
  const path_diff =
    Math.sqrt(dx * dx + dy1 * dy1) - Math.sqrt(dx * dx + dy2 * dy2);
  const phase_diff = (2 * Math.PI * path_diff) / lambda;

  // Calculate the intensity of the light at this point
  const I = I_max * Math.cos(phase_diff) ** 2;
  console.log(I / I_max);

  // Set the color of the fringe based on the intensity
  ctx.fillStyle = "white";
  ctx.globalAlpha = I / I_max;

  // Draw the fringe
  ctx.fillRect(x, y, 2, 1);

  // // Increment the position along the x-axis
  // x += delta;
}

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});
