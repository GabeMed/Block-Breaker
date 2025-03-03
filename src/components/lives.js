import React from "react";

import { getRange } from "../utils";

const Lives = ({lives, containerWidth, unit}) => {
    const width = unit * 2
    return getRange(lives).map(i => (
        <rect
            className="live"
            rx={unit/4}
            height={unit}
            width={width}
            x={containerWidth - unit - width * (i + 1) - (unit / 2) * i} // Defining where each life point will be placed in the screen
            y={unit}
            key={i}
        />
    ))
}

export default Lives;