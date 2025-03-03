import Vector from './vector'
import { flatten, getRandomFrom, removeElement, updateElement } from '../utils'
import { getDistortedDirection, getAdjustedVector, isGoingToHit } from './physics'
import { GAME_CONFIG, MOVEMENT } from './gameConfig'

// Here is where we define the main logic of the game

const { PADDLE_HEIGHT, BALL_INITIAL_OFFSET, BALL_RADIUS, LEFT_UP, RIGHT_UP, UP } = GAME_CONFIG

const getInitialPaddleAndBall = (width, height, paddleWidth) => {
    const paddleY = height - PADDLE_HEIGHT
    const paddle = {
        position: new Vector((width - paddleWidth)/2, paddleY),
        width: paddleWidth,
        height: PADDLE_HEIGHT
    }
    const ball = {
        center: new Vector(width/2, height/2 + BALL_INITIAL_OFFSET * BALL_RADIUS), 
        radius: BALL_RADIUS,
        direction: getRandomFrom(LEFT_UP, RIGHT_UP, UP) // ! CHECK THE BEST INITIAL DIRECTIONS AFTER PLAYING
    }

    return {
        paddle,
        ball
    }
}

const { BLOCK_HEIGHT, PADDLE_AREA } = GAME_CONFIG

export const gameStateFromLevel = ({ lives, paddleWidth, speed, blocks }) => {
    const width = blocks[0].length
    const height = width

    const blockStartY = ((height - height * PADDLE_AREA) - (blocks.length * BLOCK_HEIGHT))/2

    const rowsOfBlocks = blocks.map((row, i) => 
        row.map((density, j) => ({
            density,
            position: new Vector(j, blockStartY + (i * BLOCK_HEIGHT)),
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

const { LEFT, RIGHT } = GAME_CONFIG

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
        return updateTheValueFromX(size.width - paddle.width)
    }

    return updateTheValueFromX(x)
}

const { DISTANCE_COVERED_IN_1_MILI_SECOND_WITH_SPEED_1, DOWN } = GAME_CONFIG

export const getNewGameState = (state, movement, timespan) => {  //TODO IMPROVE THIS FUNCTION, IT'S VERY DIFICULT TO READ AND MAKE IMPROVEMENTS
    const { size, speed, lives } = state
    const distanceCovered = timespan * DISTANCE_COVERED_IN_1_MILI_SECOND_WITH_SPEED_1 * speed
    const paddle = getNewPaddle(state.paddle, size, distanceCovered, movement)

    const { radius } = state.ball
    const currentBallDirection = state.ball.direction
    const newBallCenter = state.ball.center.add(currentBallDirection.scaleBy(distanceCovered))
    const ballBottom = newBallCenter.y + radius

    if(ballBottom >= size.height){
        return {
            ...state,
            ...getInitialPaddleAndBall(size.width, size.height, paddle.width),
            lives: lives - 1
          }
    }

    const getUpdatedGameStateWithBall = props => ({  
        ...state,
        paddle,
        ball: {
            ...state.ball,
            ...props
        }
    })

    const withNewBallDirection = surfaceNormalDirection => {
        const distortion = getDistortedDirection(currentBallDirection.reflect(surfaceNormalDirection))
        const direction = getAdjustedVector(surfaceNormalDirection, distortion)
        return getUpdatedGameStateWithBall({direction})
    }

    const ballLeft = newBallCenter.x - radius
    const ballRight = newBallCenter.x + radius
    const ballTop = newBallCenter.y - radius
    const paddleLeft = paddle.position.x
    const paddleRight = paddleLeft  + paddle.width
    const paddleTop = paddle.position.y

    const ballGoingDown = Math.abs(UP.angleBetween(currentBallDirection)) > 90
    const hitPaddle = ballGoingDown && (ballBottom >= paddleTop) && (ballRight >= paddleLeft) && (ballLeft <= paddleRight)
    if (hitPaddle) return withNewBallDirection(UP)
    if (ballTop <= 0) return withNewBallDirection(DOWN)
    if (ballLeft <= 0) return withNewBallDirection(RIGHT)
    if (ballRight >= size.width) return withNewBallDirection(LEFT)

    const hittedBlock = state.blocks.find(({ position, width, height }) => (
        isGoingToHit(ballTop, ballBottom, position.y, position.y + height) &&   
        isGoingToHit(ballLeft, ballRight, position.x, position.x + width)   
        ))

    if (hittedBlock) {
    const newDensity = hittedBlock.density - 1
    const newBlock = { ...hittedBlock, newDensity }
    const newBlocks = newDensity < 0 ? removeElement(state.blocks, hittedBlock) : updateElement(state.blocks, hittedBlock, newBlock)
    
    const calculateBallReflectionNormal = () => {
        const hittedBlockTop = hittedBlock.position.y
        const hittedBlockBottom = hittedBlockTop + hittedBlock.height
        const hittedBlockLeft = hittedBlock.position.x
        
        if (ballTop >= hittedBlockTop - radius && ballBottom <= hittedBlockBottom + radius) {
            if (ballLeft < hittedBlockLeft) 
                return LEFT
            if (ballRight > hittedBlockLeft + hittedBlock.width) 
                return RIGHT
        }
        if (ballTop > hittedBlockTop) return DOWN
        if (ballTop <= hittedBlockTop) return UP
    }
        return {
            ...withNewBallDirection(calculateBallReflectionNormal()),
            newBlocks
        }
        }
        return getUpdatedGameStateWithBall({ center: newBallCenter })
}
