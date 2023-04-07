import React from "react";

const Simulation = ({ title, id, image, children }) => {
  return (
    <div className="w-full px-4 py-6">
      <a
        href={`/simulations/${id}`}
        className="bg-white rounded-lg shadow-md hover:shadow-lg block p-6"
      >
        <img
          src={image}
          alt=""
          className="w-12 h-12 mx-auto mb-4 rounded-full"
        />
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-gray-500 text-base mb-4">{children}</p>
      </a>
    </div>
  );
};

export default Simulation;
