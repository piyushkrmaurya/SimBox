import React from "react";

const Feature = ({ title, image, children }) => {
  return (
    <div className="w-full md:w-1/3 px-4 py-6">
      <div className="text-center">
        <img
          src={image}
          alt=""
          className="w-12 h-12 mx-auto mb-4 rounded-full bg-white shadow-md"
        />
        <h3 className="text-2xl font-bold mb-2">{title}</h3>
        <p className="text-base text-gray-500 mb-6">{children}</p>
      </div>
    </div>
  );
};

export default Feature;
