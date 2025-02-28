import Vector from './vector'
import { flatten, getRandomFrom } from '../utils'

const PADDLE_AREA = 1/3 
const BLOCK_HEIGHT = 1/3
const PADDLE_HEIGHT = BLOCK_HEIGHT
const BALL_RADIUS = 1/5

const LEFT = new Vector(-1,0)
const RIGHT = new Vector(1,0)
const UP = new Vector(0,-1)

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
