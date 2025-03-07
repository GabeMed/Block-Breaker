import Vector from "./vector"
import { GAME_CONFIG } from "./gameConfig"

// This is where the colision logic is mostly defined 

export const getDistortedDirection = (vector, distortionLevel = 0.3) => {
    const getComponent = () => Math.random() * distortionLevel - distortionLevel / 2  
    const distortion = new Vector(getComponent(), getComponent())
    return vector.add(distortion).normalize()
}

export const isGoingToHit = (ballMin, ballMax, blockMin, blockMax) => ( 
    (ballMin >= blockMin && ballMin <= blockMax) ||
    (ballMax >= blockMin && ballMax <= blockMax)
);

export const getAdjustedVector = (surfaceNormalDirection, vector, minAngle = 15) => {  
    const angle = surfaceNormalDirection.angleBetween(vector)                   
    const maxAngle = 90 - minAngle
    const absoluteValueOfAngle = Math.abs(angle)

    if(absoluteValueOfAngle < minAngle){
        return surfaceNormalDirection.rotate((absoluteValueOfAngle/angle) * minAngle)
    }
    else if(absoluteValueOfAngle > maxAngle){
        return surfaceNormalDirection.rotate((absoluteValueOfAngle)/angle * maxAngle)
    }

    return vector
}

const { LEFT, RIGHT, DOWN, UP } = GAME_CONFIG

export const calculateBallReflectionNormal = (hittedBlock, ballBounds, ballRadius) => {
    const blockBounds = {
        top: hittedBlock.position.y,
        bottom: hittedBlock.position.y + hittedBlock.height,
        left: hittedBlock.position.x,
        right: hittedBlock.position.x + hittedBlock.width
    };

    if (ballBounds.top >= blockBounds.top - ballRadius && ballBounds.bottom <= blockBounds.bottom + ballRadius) {
        if (ballBounds.left < blockBounds.left) return LEFT;
        if (ballBounds.right > blockBounds.right) return RIGHT;
    }
    return (ballBounds.top > blockBounds.top) ? DOWN : UP;
};

export const withNewBallDirection = (currentBallDirection, surfaceNormalDirection, getUpdatedGameStateWithBall) => {
    const distortion = getDistortedDirection(currentBallDirection.reflect(surfaceNormalDirection));
    const newDirection = getAdjustedVector(surfaceNormalDirection, distortion);
    return getUpdatedGameStateWithBall({ direction: newDirection });
};