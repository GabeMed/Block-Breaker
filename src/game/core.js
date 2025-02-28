import Vector from './vector'
import { flatten, getRandomFrom, removeElement, updateElement } from '../utils'

const PADDLE_AREA = 1/3 
const BLOCK_HEIGHT = 1/3
const PADDLE_HEIGHT = BLOCK_HEIGHT
const BALL_RADIUS = 1/5
const DISTANCE_COVERED_IN_1_MILI_SECOND_WITH_SPEED_1 = 0.005

export const MOVEMENT = {
    LEFT: 'LEFT',
    RIGHT: 'RIGHT'
}

const LEFT = new Vector(-1,0)
const RIGHT = new Vector(1,0)
const UP = new Vector(0,-1)
const DOWN = new Vector(0,1)

const LEFT_UP = LEFT.add(UP).normalize()
const RIGHT_UP = RIGHT.add(UP).normalize()

const getInitialPaddleAndBall = (width, height, paddleWidth) => {
    const paddleY = height - PADDLE_HEIGHT
    const paddle = {
        position: new Vector((width - paddleWidth)/2, paddleY),
        width: paddleWidth,
        height: PADDLE_HEIGHT
    }
    const ball = {
        center: new Vector(width/2, height/2 + 5 * BALL_RADIUS), // Just put any value here, run the code and adjust by your preference
        radius: BALL_RADIUS,
        direction: getRandomFrom(LEFT_UP, RIGHT_UP, UP) // ! CHECK THE BEST INITIAL DIRECTIONS AFTER PLAYING
    }

    return {
        paddle,
        ball
    }
}

export const gameStateFromLevel = ({ lives, paddleWidth, speed, blocks }) => {
    const width = blocks[0].length
    const height = width

    const blockStart = ((height - height * PADDLE_AREA) - (blocks.length * BLOCK_HEIGHT))/2

    const rowsOfBlocks = blocks.map((row, i) => 
        row.map((density, j) => ({
            density,
            position: new Vector(j, blockStart + (i * BLOCK_HEIGHT)),
            width: 1,
            height: BLOCK_HEIGHT
        }))
    )

    const size = {
        width,
        height
    }

    return {
        size,
        blocks: flatten(rowsOfBlocks),
        ...getInitialPaddleAndBall(width, height, paddleWidth),
        lives,
        speed
    }
}

const getDistortedDirection = (vector, distortionLevel = 0.1) => {
    const getComponent = () => Math.random() * distortionLevel - distortionLevel / 2  // ! CHECK AFTER PLAYING TO SEE IF ITS OK 
    const distortion = new Vector(getComponent(), getComponent())
    return vector.add(distortion).normalize()
}

const getNewPaddle = (paddle, size, distanceToBeCovered, movement) => {
    if(!movement) return paddle
    const direction = movement === MOVEMENT.LEFT ? LEFT : RIGHT  

    const { x } = paddle.position.add(direction.scaleBy(distanceToBeCovered))
    const updateTheValueFromX = x => ({
        ...paddle,
        position: new Vector(x, paddle.position.y)
    })

    if(x < 0){
        return updateTheValueFromX(0);
    }

    if(x + paddle.width > size.width){
        return updateTheValueFromX(size.width - paddleWidth)
    }

    return updateTheValueFromX(x)
}

const isInBoundaries = (oneSide, otherSide, oneBoundary, otherBoundary) => ( // !A PIECE OF SHIT IN FORM OF CODE NEED TO CHANGE LATER
    (oneSide >= oneBoundary && oneSide <= otherBoundary) ||
    (otherSide >= oneBoundary && otherSide <= otherBoundary)
)

const getAdjustedVector = (surfaceNormalDirection, vector, minAngle = 15) => {  // ! ANOTHER SHIT CODE TO CHANGE
    const angle = surfaceNormalDirection.angleBetween(vector)                   // TODO CREATE A ABSOLUTE VALUE FUNCTION IN UTILS
    const maxAngle = 90 - minAngle
    if (angle < 0) {
      if (angle > -minAngle) {
        return surfaceNormalDirection.rotate(-minAngle)
      }
      if (angle < -maxAngle) {
        return surfaceNormalDirection.rotate(-maxAngle)
      }
    } else {
      if (angle < minAngle) {
        return surfaceNormalDirection.rotate(minAngle)
      }
      if (angle > maxAngle) {
        return surfaceNormalDirection.rotate(maxAngle)
      }
    }
    
    return vector
}

export const getNewGameState = (state, movement, timespan) => {  // ! CHECK FOR IMPROVEMENTS LOOKSLIKE THERE IS PROBLEMS
    const { size, speed, lives } = state
    const distanceCovered = timespan * DISTANCE_COVERED_IN_1_MILI_SECOND_WITH_SPEED_1 * speed
    const paddle = getNewPaddle(state.paddle, size, distanceCovered, movement)

    const { radius } = state.ball
    const ballInstantDirection = state.ball.direction
    const newBallCenter = state.ball.center.add(ballInstantDirection.scaleBy(distanceCovered))
    const ballBottom = newBallCenter.y + radius

    if(ballBottom >= size.height){
        return {
            ...state,
            ...getInitialPaddleAndBall(size.width, size.height, paddle.width),
            lives: lives - 1
          }
    }

    const withNewBallProps = props => ({  // ! THINK OF A BETTER NAME
        ...state,
        paddle,
        ball: {
            ...state.ball,
            ...props
        }
    })

    const withNewBallDirection = surfaceNormalDirection => {
        const distortion = getDistortedDirection(ballInstantDirection.reflect(surfaceNormalDirection))
        const direction = getAdjustedVector(surfaceNormalDirection, distortion)
        return withNewBallProps({direction})
    }

    const ballLeft = newBallCenter.x - radius
    const ballRight = newBallCenter.x + radius
    const ballTop = newBallCenter.y - radius
    const paddleLeft = paddle.position.x
    const paddleRight = paddleLeft  + paddle.width
    const paddleTop = paddle.position.y

    const hitPaddle = ballGoingDown && (ballBottom >= paddleTop) && (ballRight >= paddleLeft) && (ballLeft <= paddleRight)
    if (hitPaddle) return withNewBallDirection(UP)
    if (ballTop <= 0) return withNewBallDirection(DOWN)
    if (ballLeft <= 0) return withNewBallDirection(RIGHT)
    if (ballRight >= size.width) return withNewBallDirection(LEFT)

    const block = state.blocks.find(({ position, width, height }) => (
        isInBoundaries(ballTop, ballBottom, position.y, position.y + height) &&    // ! CHANGE NAME AS FAST AS POSSIBLE
        isInBoundaries(ballLeft, ballRight, position.x, position.x + width)   
        ))
        if (block) {
        const density = block.density - 1
        const newBlock = { ...block, density }
        const blocks = density < 0 ? withoutElement(state.blocks, block) : updateElement(state.blocks, block, newBlock)
        
        const getNewBallNormal = () => {
            const blockTop = block.position.y
            const blockBottom = blockTop + block.height
            const blockLeft = block.position.x
            if (ballTop > blockTop - radius && ballBottom < blockBottom + radius) {
            if (ballLeft < blockLeft) return LEFT
            if (ballRight > blockLeft + block.width) return RIGHT
            }
            if (ballTop > blockTop) return DOWN
            if (ballTop <= blockTop) return UP
        }
        return {
            ...withNewBallDirection(getNewBallNormal()),
            blocks
        }
        }
        return withNewBallProps({ center: newBallCenter })
}
