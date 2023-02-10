import { useState, useEffect, Suspense, lazy } from "react";
import { useParams } from "react-router-dom";
import FullScreenButton from "components/tools/FullScreenButton";

const GravitationControls = lazy(() =>
  import("../components/simulation/controls/GravitationControls")
);
const LensControls = lazy(() =>
  import("../components/simulation/controls/LensControls")
);

const GravitationDescription = lazy(() =>
  import("../components/simulation/descriptions/GravitationDescription")
);

const LensDescription = lazy(() =>
  import("../components/simulation/descriptions/LensDescription")
);

const data = {
  gravitation: {
    title: "Gravitation",
    description: GravitationDescription,
    controls: GravitationControls,
    script: "gravitation.js",
  },
  lens: {
    title: "Lens",
    controls: LensControls,
    description: LensDescription,
    script: "lens.js",
  },
  oscillations: {
    title: "Oscillations",
    controls: () => <div></div>,
    script: "pendulum.js",
  },
  youngs: {
    title: "Young's Double Slit Experiment",
    controls: () => <div></div>,
    script: "youngs.js",
  },
};

const SimulationControls = () => {
  const { simulationId } = useParams();

  let Controls;

  if (data[simulationId] && data[simulationId].controls) {
    Controls = data[simulationId].controls;
  } else {
    Controls = () => <div></div>;
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Controls />
    </Suspense>
  );
};

const SimulationDescription = () => {
  const { simulationId } = useParams();

  let Description;

  if (data[simulationId] && data[simulationId].description) {
    Description = data[simulationId].description;
  } else {
    Description = () => <div></div>;
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Description />
    </Suspense>
  );
};

function Simulation() {
  const { simulationId } = useParams();
  let [title, setTitle] = useState("Simulations");
  let [description, setDescription] = useState("Select a Simulation");
  let [controls, setControls] = useState(<div></div>);

  const runEffect = async (simulationId) => {
    if (data[simulationId]) {
      setTitle(data[simulationId].title);
      setDescription(data[simulationId].description);
    }
  };

  useEffect(() => {
    const getSimulationCode = async () => {
      let code;
      if (data[simulationId]) {
        console.log(data[simulationId].script);
        code = await import(`../simulations/${data[simulationId].script}`);
      } else {
        code = await import("../simulations/gravitation.js");
      }
      code.default();
    };

    runEffect(simulationId).then(() => getSimulationCode());
  }, [simulationId]);

  return (
    <main className="px-8 py-8">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold mb-6">{title}</h2>
        <div className="flex flex-wrap -mx-4">
          <div className="flex flex-wrap w-full px-4 mb-8">
            <div className="md:w-3/4 relative">
              <canvas
                id="simulation-canvas"
                className="canvas-sm w-full h-full bg-gray-800 rounded-lg"
              ></canvas>
              <div className="absolute right-0 bottom-0 p-4">
                <FullScreenButton />
              </div>
            </div>
            <div className="md:w-1/4 mb-4 px-4">
              <SimulationControls />
            </div>
            <div className="flex items-center mb-8">
              {/* sharing button goes here */}
            </div>
          </div>
          <SimulationDescription />
        </div>
      </div>
    </main>
  );
}

export default Simulation;
