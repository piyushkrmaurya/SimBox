import React from "react";
import Feature from "./Feature";

const features = [
  {
    title: "Interactive simulations",
    description:
      "Allow users to manipulate variables and see how it affects the outcome of the simulation.",
  },
  {
    title: "User-friendly interface",
    description:
      "Make the simulations easy to use and navigate, with clear instructions and intuitive controls.",
  },
  {
    title: "Real-time feedback",
    description:
      "Give users immediate feedback on their actions and allow them to learn from their mistakes.",
  },
];

const Features = () => {
  return (
    <section className="features py-12">
      <div className="container mx-auto">
        <div className="flex flex-wrap items-center justify-center">
          {features.map((feature) => (
            <Feature
              title={feature.title}
              image="https://via.placeholder.com/64x64"
            >
              {feature.description}
            </Feature>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
