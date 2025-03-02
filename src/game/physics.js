import Vector from "./vector"

// This is where the colision logic is mostly defined 

export const getDistortedDirection = (vector, distortionLevel = 0.1) => {
    const getComponent = () => Math.random() * distortionLevel - distortionLevel / 2  // ! CHECK AFTER PLAYING TO SEE IF ITS OK 
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