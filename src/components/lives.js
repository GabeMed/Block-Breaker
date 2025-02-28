import React from "react";

import { getRange } from "../utils";

export default ({lives, containerWidth, unit}) => {
    const width = unit * 2
    return getRange(lives).map(i => (
        <rect
            className="live"
            rx={unit/4}
            height={unit}
            width={width}
            x={containerWidth - unit - width * (i + 1) - (unit / 2) * i} // Just some math to look beautiful !nothing important!
            y={unit}
            key={i}
        />
    ))
}