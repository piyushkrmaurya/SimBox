export default () => {
  var W = window.innerWidth;
  var H = window.innerHeight;

  const canvas = document.querySelector("canvas");

  let lensInput = document.querySelector("#lens-type-select");
  let fInput = document.querySelector("#focal-length-input");
  let xInput = document.querySelector("#object-x-input");
  let yInput = document.querySelector("#object-y-input");

  // Define the refractive index of the lens material
  const n = 1.5;

  // Define the position and radius of the lens
  const lensX = 0;
  const lensY = 0;

  const drawImage = () => {
    canvas.width = W;
    canvas.height = H;

    const lensType = lensInput.value;

    // Define the focal length of the lens
    const f = (lensType == "convex" ? 1 : -1) * parseInt(fInput.value);
    const lensRadius = Math.abs(2 * f);

    // Define the position of the object
    const objectX = parseInt(xInput.value);
    const objectY = parseInt(yInput.value);

    // Get the 2D rendering context
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, W, H);
    ctx.save();
    ctx.translate(W / 2, H / 2);
    // ... do stuff with the transformed origin

    // Draw the axes
    ctx.strokeStyle = "white";
    ctx.beginPath();
    ctx.moveTo(-W / 2, 0);
    ctx.lineTo(W / 2, 0);
    ctx.stroke();

    ctx.strokeStyle = "white";
    ctx.beginPath();
    ctx.moveTo(0, -H / 2);
    ctx.lineTo(0, H / 2);
    ctx.stroke();

    // Define the position of the image
    const imageX = (f * objectX) / (f + objectX);

    const imageY = (imageX * objectY) / objectX;

    // Define the radius of the aperture stop
    const apertureRadius = 25;

    // Draw the object
    ctx.beginPath();
    ctx.arc(objectX, objectY, 5, 0, 2 * Math.PI);
    ctx.fillStyle = "yellow";
    ctx.fill();

    // Draw the lens
    ctx.beginPath();
    ctx.arc(lensX + 10, lensY, lensRadius, 1.8, -1.8);
    ctx.strokeStyle = "white";
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(lensX - 10, lensY, lensRadius, 1.8 - Math.PI, Math.PI - 1.8);
    ctx.strokeStyle = "white";
    ctx.stroke();

    // Draw the image
    ctx.beginPath();
    ctx.arc(imageX, imageY, 5, 0, 2 * Math.PI);
    ctx.fillStyle = "yellow";
    ctx.fill();

    // Draw the principal rays
    ctx.beginPath();
    ctx.moveTo(objectX, objectY);
    ctx.lineTo(lensX, lensY);
    ctx.strokeStyle = "red";
    ctx.stroke();

    ctx.moveTo(lensX, lensY);
    ctx.lineTo(imageX, imageY);
    ctx.strokeStyle = "red";
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(objectX, objectY);
    ctx.lineTo(lensX, objectY);
    ctx.strokeStyle = "white";
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(lensX, objectY);
    ctx.lineTo(imageX, imageY);
    ctx.strokeStyle = "white";
    ctx.stroke();

    // Add labels
    ctx.fillText("F", -f, 20);

    // Draw the aperture stop
    // ctx.beginPath();
    // ctx.arc(lensX, lensY, apertureRadius, 0, 2 * Math.PI);
    // ctx.strokeStyle = 'white';
    // ctx.stroke();

    // Calculate the intersection points of the principal rays with the lens
    // const objectDistance = objectX - lensX;
    // const imageDistance = imageX - lensX;
    // const lensThickness = Math.sqrt(lensRadius ** 2 - apertureRadius ** 2);
    // const objectHeight = (lensThickness * objectDistance) / f;
    // const imageHeight = (lensThickness * imageDistance) / f;

    // Draw the refracted rays
    // ctx.beginPath();
    // ctx.moveTo(lensX - lensRadius, lensY + objectHeight);
    // ctx.lineTo(lensX - lensRadius, lensY - objectHeight);
    // ctx.moveTo(lensX + lensRadius, lensY + imageHeight);
    // ctx.lineTo(lensX + lensRadius, lensY - imageHeight);
    // ctx.strokeStyle = 'blue';
    // ctx.stroke();
    ctx.restore();
  };

  drawImage();

  let controls = document.querySelector(".controls input");
  controls = Array.from(controls);
  console.log(controls);
  controls.forEach((control) => {
    control.addEventListener("input", drawImage);
    control.addEventListener("change", drawImage);
  });

  window.addEventListener("resize", () => {
    W = window.innerWidth;
    H = window.innerHeight;
    drawImage();
  });

  function getCursorPosition(canvas, event) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width; // relationship bitmap vs. element for x
    const scaleY = canvas.height / rect.height; // relationship bitmap vs. element for y

    const x = (event.clientX - rect.left) * scaleX - canvas.width / 2;
    const y = (event.clientY - rect.top) * scaleY - canvas.height / 2;

    xInput.value = x;
    yInput.value = y;
  }

  canvas.addEventListener("mousedown", mouseDownListener, true);
  canvas.addEventListener("mouseup", mouseUpListener, true);

  function mouseMoveListener(e) {
    getCursorPosition(canvas, e);
    drawImage();
  }

  function mouseDownListener(e) {
    console.log("mouse down");
    canvas.addEventListener("mousemove", mouseMoveListener, true);
  }

  function mouseUpListener(e) {
    console.log("mouse up");
    canvas.removeEventListener("mousemove", mouseMoveListener, true);
  }
};
