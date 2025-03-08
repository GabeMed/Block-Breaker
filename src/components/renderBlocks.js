import React from "react";

import Block from "./block";

const RenderBlocks = ({ blocks, projectDistance, projectVector }) => (
  <>
    {blocks.map(({ density, position, width, height }) => (
      <Block
        key={`${position.x}-${position.y}`}
        density={density}
        width={projectDistance(width)}
        height={projectDistance(height)}
        {...projectVector(position)}
      />
    ))}
  </>
);

export default RenderBlocks;
