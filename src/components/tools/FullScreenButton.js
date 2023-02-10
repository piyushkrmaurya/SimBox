import React from "react";

const FullScreenButton = () => {
  const handleClick = () => {
    const canvas = document.getElementById("simulation-canvas");
    if (canvas.requestFullscreen) {
      canvas.requestFullscreen();
    } else if (canvas.mozRequestFullScreen) {
      canvas.mozRequestFullScreen();
    } else if (canvas.webkitRequestFullscreen) {
      canvas.webkitRequestFullscreen();
    }
  };

  return (
    <button
      onClick={handleClick}
      className="px-2 py-2 focus:outline-none focus:shadow-outline-blue"
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {" "}
        <path
          d="M2 7V2H7"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />{" "}
        <path
          d="M22 7V2H17"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />{" "}
        <path
          d="M7 22L2 22L2 17"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />{" "}
        <path
          d="M17 22L22 22L22 17"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />{" "}
      </svg>
    </button>
  );
};

export default FullScreenButton;
