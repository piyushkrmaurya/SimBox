import React from "react";
import Simulation from "./Simulation";

const simulations = [
  {
    id: "gravitation",
    title: "Gravitation",
    summary:
      "Explore the gravitational interactions between two celestial bodies.",
  },
  {
    id: "lens",
    title: "Convex/Concave Lens",
    summary:
      " See how the position of an object affects the image formed by a  lens.",
  },
  {
    id: "oscillations",
    title: "Oscillations",
    summary: "See how a simple pendulum oscillates in a real life scenario",
  },
  {
    id: "youngs",
    title: "Young's Double Slit Experiment",
    summary: "See how a Young's Double Slit Experiment generates fringes",
  },
];

const Simulations = () => {
  return (
    <section className="simulations py-6">
      <div className="container mx-auto text-center">
        <h2 className="text-3xl font-bold mb-6">Explore simulations</h2>
        <div className="flex flex-wrap justify-center">
          {simulations.map((feature) => (
            <Simulation
              id={feature.id}
              title={feature.title}
              image="https://via.placeholder.com/64x64"
            >
              {feature.summary}
            </Simulation>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Simulations;
