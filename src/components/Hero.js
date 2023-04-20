import React from "react";

const Hero = () => {
  return (
    <section className="py-24">
      <div className="container mx-auto text-center">
        <h2 className="text-5xl font-bold mb-6">
          Physics simulations with SimBox
        </h2>
        <p className="text-xl mb-8">
          Our interactive simulations allow you to explore the laws of physics
          in a fun and engaging way. From Newton's laws to quantum mechanics,
          we've got you covered.
        </p>
        <a
          href="simulations/gravitation"
          className="bg-blue-500 hover:bg-blue-400 text-white font-bold py-3 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded"
        >
          Try it out
        </a>
      </div>
    </section>
  );
};

export default Hero;
