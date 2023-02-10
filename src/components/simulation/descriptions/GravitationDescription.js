const GravitationDescription = () => {
  return (
    <div className="w-full px-4 mb-8">
      <h3 className="text-xl font-bold mb-2">About this simulation</h3>
      <p className="text-base text-gray-500 mb-4">
        In this simulation, you can explore the gravitational interactions
        between two celestial bodies. Adjust the mass, radii, and initial
        velocity of both bodies to see how they move and interact.
      </p>
      <h3 className="text-xl font-bold mb-2">Key equations</h3>
      <p className="text-base text-gray-500 mb-4">
        Newton's law of gravitation: F = G * (m1 * m2) / r^2
      </p>
      <p className="text-base text-gray-500 mb-4">
        Kepler's laws of planetary motion:
      </p>
      <ul className="list-disc pl-6">
        <li>
          The orbit of a planet is an ellipse with the sun at one of the two
          foci.
        </li>
        <li>
          A line segment joining a planet and the sun sweeps out equal areas
          during equal intervals of time.
        </li>
        <li>
          The square of the orbital period of a planet is directly proportional
          to the cube of the semi-major axis of its orbit.
        </li>
      </ul>
      <h3 className="text-xl font-bold my-2">Controls</h3>
      <p className="text-base text-gray-500 mb-4">
        Use the sliders to adjust the mass, radii, and initial velocity of the
        two bodies. The simulation will update in real-time as you make changes.
      </p>
    </div>
  );
};

export default GravitationDescription;
