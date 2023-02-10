import React from "react";
import { MathComponent } from "mathjax-react";

const LensDescription = () => (
  <div className="flex-row px-4">
    <h3 className="text-xl font-bold mb-2">About this simulation</h3>
    <p>
      A lens is a transparent optical device that refracts light in order to
      produce a magnified or demagnified image of an object. In this simulation,
      you can control the position of the object and observe how the image
      changes.
    </p>
    <p>
      The lens can be either convex or concave, which refers to the shape of the
      lens surface. A convex lens is thicker at the center than at the edges,
      and a concave lens is thinner at the center than at the edges. You can
      switch between convex and concave lens in this simulation to observe the
      difference in the image formation.
    </p>
    <br />
    <h3 className="text-xl font-bold mb-2">Key Equations</h3>
    <p>
      <ul className="mx-0 prose prose-stone prose-ul:list-none px-2 lg:px-0">
        <li>
          <strong>Lens Equation:</strong>
          <br />
          <MathComponent
            tex={String.raw`\frac{1}{f} = \frac{1}{v} - \frac{1}{u}`}
          />
        </li>
        <li>
          <strong>Magnification Equation:</strong>
          <br />
          <MathComponent tex={String.raw`m = \frac{h_i}{h_o} = \frac{v}{u}`} />
        </li>
      </ul>
    </p>
  </div>
);

export default LensDescription;
