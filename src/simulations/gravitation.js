const simulationScript = () => {
  const GRAVITATIONAL_CONSTANT = 20;

  const canvas = document.querySelector("canvas"); // get the canvas element
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const radius1Input = document.querySelector("#radius-1-input");
  const radius2Input = document.querySelector("#radius-2-input");

  const mass1Input = document.querySelector("#mass-1-input");
  const mass2Input = document.querySelector("#mass-2-input");

  // define the timestep and number of iterations for the simulation
  const timestep = 1 / 60; // timestep in seconds (60 fps)

  // define the properties of the large sphere (central body)
  const centralBody = {
    mass: mass1Input.value, // mass of Earth in kilograms
    radius: radius1Input.value, // radius of Earth in meters
    position: [canvas.width / 2, canvas.height / 2], // position of central body on canvas (at center)
    velocity: [0, 0], // initial velocity of satellite (at rest)
  };

  // define the properties of the small sphere (satellite)
  const satellite = {
    mass: mass2Input.value, // mass of satellite in kilograms
    radius: radius2Input.value, // radius of satellite in meters (scaled up for visibility on canvas)
    position: [canvas.width / 2, canvas.height / 2 - 150], // initial position of satellite (on y-axis above central body)
    velocity: [100, 0], // initial velocity of satellite (at rest)
  };

  const drawImage = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const ctx = canvas.getContext("2d"); // get the canvas context

    // calculate the gravitational force acting on the satellite
    const r = satellite.position.map((x, i) => x - centralBody.position[i]); // vector from central body to satellite
    const rMag = Math.sqrt(r.reduce((sum, x) => sum + x ** 2, 0)); // magnitude of r
    const gravitationalForce =
      (-GRAVITATIONAL_CONSTANT * centralBody.mass * satellite.mass) / rMag ** 2; // gravitational force
    const gravitationalForceVector = r.map(
      (x) => (x * gravitationalForce) / rMag
    ); // gravitational force vector

    centralBody.velocity = centralBody.velocity.map(
      (v, i) => v - (gravitationalForceVector[i] / centralBody.mass) * timestep
    );
    centralBody.position = centralBody.position.map(
      (x, i) => x + centralBody.velocity[i] * timestep
    );

    // update the velocity and position of the satellite based on the gravitational force
    satellite.velocity = satellite.velocity.map(
      (v, i) => v + (gravitationalForceVector[i] / satellite.mass) * timestep
    );
    satellite.position = satellite.position.map(
      (x, i) => x + satellite.velocity[i] * timestep
    );

    // clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // draw the central body
    ctx.beginPath();
    ctx.arc(
      centralBody.position[0],
      centralBody.position[1],
      centralBody.radius,
      0,
      2 * Math.PI
    );
    ctx.fillStyle = "#FED8B1";
    ctx.fill();

    // draw the satellite
    ctx.beginPath();
    ctx.arc(
      satellite.position[0],
      satellite.position[1],
      satellite.radius,
      0,
      2 * Math.PI
    );
    ctx.fillStyle = "white";
    ctx.fill();

    // request the next animation frame
    requestAnimationFrame(drawImage);
  };

  requestAnimationFrame(drawImage);

  const updateParameters = () => {
    centralBody.radius = radius1Input.value;
    satellite.radius = radius2Input.value;
    centralBody.mass = mass1Input.value;
    satellite.mass = mass2Input.value;
  };

  let controls = document.querySelectorAll(".controls input");
  controls = Array.from(controls);
  controls.forEach((control) => {
    control.addEventListener("input", updateParameters);
    control.addEventListener("change", updateParameters);
  });
};

export default simulationScript;
