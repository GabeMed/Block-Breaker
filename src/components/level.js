import React from "react";

export default ({level, unit}) => (
    <text className="level" x={unit} y={2 * unit} fontSize={unit}>LEVEL: {level}</text>
)