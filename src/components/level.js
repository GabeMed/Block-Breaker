import React from "react";

const Level = ({level, unit}) => (
    <text className="level" x={unit} y={2 * unit} fontSize={unit}>LEVEL: {level}</text>
)

export default Level;