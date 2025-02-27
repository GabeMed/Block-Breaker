import React from "react";

export default ({x, y, width, height}) => (
    <rect className="paddle" cx={x} cy={y} width={width} height={height}/>
)