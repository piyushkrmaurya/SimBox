import React, { useState } from "react";

const LensControls = () => {
  const [lensType, setLensType] = useState("convex");
  const [objectX, setObjectX] = useState(-300);
  const [objectY, setObjectY] = useState(-50);
  const [focusLength, setFocusLength] = useState(20);

  const handleLensTypeChange = (event) => {
    setLensType(event.target.value);
  };

  const handleObjectXChange = (event) => {
    setObjectX(event.target.value);
  };

  const handleObjectYChange = (event) => {
    setObjectY(event.target.value);
  };

  const handleFocusLengthChange = (event) => {
    setFocusLength(event.target.value);
  };

  return (
    <form className="controls accent-purple-500">
      <div className="form-group">
        <label htmlFor="lens-type-select">Lens Type</label>
        <select
          className="form-control"
          id="lens-type-select"
          value={lensType}
          onChange={handleLensTypeChange}
        >
          <option value="convex">Convex</option>
          <option value="concave">Concave</option>
        </select>
      </div>
      <div className="form-group">
        <label htmlFor="object-x-input">Object X Position</label>
        <input
          type="range"
          className="form-control"
          id="object-x-input"
          min="-500"
          max="-10"
          value={objectX}
          onChange={handleObjectXChange}
        />
      </div>
      <div className="form-group">
        <label htmlFor="object-y-input">Object Y Position</label>
        <input
          type="range"
          className="form-control"
          id="object-y-input"
          min="-200"
          max="200"
          value={objectY}
          onChange={handleObjectYChange}
        />
      </div>
      <div className="form-group">
        <label htmlFor="focal-length-input">Focal Length</label>
        <input
          type="number"
          className="form-control"
          id="focal-length-input"
          value={focusLength}
          onChange={handleFocusLengthChange}
        />
      </div>
    </form>
  );
};

export default LensControls;
