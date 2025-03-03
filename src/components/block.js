import React from "react";

import { BLOCK_COLORS } from "../game/gameConfig";

const Block = ({x, y, width, height, density}) => (
    <rect className="block" fill={BLOCK_COLORS[density]} x={x} y={y} width={width} height={height} />
)

export default Block;