export default () => {
  var W = window.innerWidth;
  var H = window.innerHeight;
  const g = 9.81;

  // Get the canvas element and its context
  const canvas = document.querySelector("canvas");
  const ctx = canvas.getContext("2d");

  // Set up initial values for the pendulum
  let angle = (3 * Math.PI) / 4; // initial angle of the pendulum (vertical)
  let length = 200; // length of the pendulum string
  let bobRadius = 10; // radius of the pendulum bob
  let velocity = -0.00218;
  let acceleration;
  const timestep = 1 / 60;

  // Set up the draw function
  function draw() {
    canvas.width = W;
    canvas.height = H;
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(W / 2, H / 2);

    // Calculate the position of the pendulum bob
    let x = length * Math.sin(angle);
    let y = length * Math.cos(angle);

    console.log(x, y);

    // Draw the plank
    ctx.fillStyle = "white";
    ctx.fillRect(-25, -15, 50, 15);

    // Draw the pendulum string
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(x, y);
    ctx.strokeStyle = "white";
    ctx.stroke();

    // Draw the pendulum bob
    ctx.beginPath();
    ctx.arc(x, y, bobRadius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();
  }

  // Set up the update function
  function update() {
    // Calculate the acceleration of the pendulum based on the angle and length
    acceleration = ((-g * timestep) / length) * Math.sin(angle);

    velocity += acceleration;

    // Update the angle based on the acceleration and time elapsed
    angle += velocity;
  }

  // Set up the animation loop
  function animate() {
    // Update the state of the pendulum
    update();

    // Draw the pendulum
    draw();

    // Request the next frame
    requestAnimationFrame(animate);
  }

  // Start the animation loop
  requestAnimationFrame(animate);
};
