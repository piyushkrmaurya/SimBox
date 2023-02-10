export default () => {
  const GRAVITATIONAL_CONSTANT = 20;

  const canvas = document.querySelector("canvas"); // get the canvas element
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const ctx = canvas.getContext("2d"); // get the canvas context

  // define the properties of the large sphere (central body)
  const centralBody = {
    mass: 100000, // mass of Earth in kilograms
    radius: 20, // radius of Earth in meters
    position: [canvas.width / 2, canvas.height / 2], // position of central body on canvas (at center)
    velocity: [0, 0], // initial velocity of satellite (at rest)
  };

  // define the properties of the small sphere (satellite)
  const satellite = {
    mass: 1000, // mass of satellite in kilograms
    radius: 10, // radius of satellite in meters (scaled up for visibility on canvas)
    position: [canvas.width / 2, canvas.height / 2 - 150], // initial position of satellite (on y-axis above central body)
    velocity: [100, 0], // initial velocity of satellite (at rest)
  };

  // define the timestep and number of iterations for the simulation
  const timestep = 1 / 60; // timestep in seconds (60 fps)
  const numIterations = 10000; // number of iterations

  let iteration = 0; // current iteration of the simulation

  // run the simulation
  function simulate() {
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
    if (iteration < numIterations) {
      requestAnimationFrame(simulate);
    }
    iteration++;
  }

  requestAnimationFrame(simulate);
};
