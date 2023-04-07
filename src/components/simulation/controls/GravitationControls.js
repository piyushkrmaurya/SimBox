import React, { useState } from "react";

const GravitationControls = () => {
  const [mass1, setMass1] = useState(1);
  const [mass2, setMass2] = useState(1);
  const [radius1, setRadius1] = useState(1);
  const [radius2, setRadius2] = useState(1);
  const [velocity1, setVelocity1] = useState(0);
  const [velocity2, setVelocity2] = useState(0);

  const handleMass1Change = (event) => {
    setMass1(event.target.value);
  };

  const handleMass2Change = (event) => {
    setMass2(event.target.value);
  };

  const handleRadius1Change = (event) => {
    setRadius1(event.target.value);
  };

  const handleRadius2Change = (event) => {
    setRadius2(event.target.value);
  };

  const handleVelocity1Change = (event) => {
    setVelocity1(event.target.value);
  };

  const handleVelocity2Change = (event) => {
    setVelocity2(event.target.value);
  };

  return (
    <form className="accent-purple-500">
      <div className="form-group">
        <label htmlFor="mass-1-input">Mass 1</label>
        <input
          type="range"
          className="form-control-range block w-full"
          id="mass-1-input"
          value={mass1}
          onChange={handleMass1Change}
        />
      </div>
      <div className="form-group">
        <label htmlFor="mass-2-input">Mass 2</label>
        <input
          type="range"
          className="form-control-range block w-full"
          id="mass-2-input"
          value={mass2}
          onChange={handleMass2Change}
        />
      </div>
      <div className="form-group">
        <label htmlFor="radius-1-input">Radius 1</label>
        <input
          type="range"
          className="form-control-range block w-full"
          id="radius-1-input"
          value={radius1}
          onChange={handleRadius1Change}
        />
      </div>

      <div className="form-group">
        <label htmlFor="radius-2-input">Radius 2</label>
        <input
          type="range"
          className="form-control-range block w-full"
          id="radius-2-input"
          value={radius2}
          onChange={handleRadius2Change}
        />
      </div>
      <div className="form-group">
        <label htmlFor="velocity-1-input">Velocity 1</label>
        <input
          type="range"
          className="form-control-range block w-full"
          id="velocity-1-input"
          value={velocity1}
          onChange={handleVelocity1Change}
        />
      </div>
      <div className="form-group">
        <label htmlFor="velocity-2-input">Velocity 2</label>
        <input
          type="range"
          className="form-control-range block w-full"
          id="velocity-2-input"
          value={velocity2}
          onChange={handleVelocity2Change}
        />
      </div>
    </form>
  );
};

export default GravitationControls;
