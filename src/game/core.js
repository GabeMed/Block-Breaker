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

const getInitialPaddleAndBall = (width, heigth, paddleWidth) => {
    const paddleY = heigth - PADDLE_HEIGHT
    const paddle = {
        position: new Vector(width - paddleWidth/2, paddleY),
        width: paddleWidth,
        height: PADDLE_HEIGHT
    }
    const ball = {
        center: new Vector(width - BALL_RADIUS/2, heigth - BALL_RADIUS * 2), // ! CHECK HERE the ball initial position after the game is running
        radius: BALL_RADIUS,
        direction: getRandomFrom(LEFT_UP, RIGHT_UP, UP) // ! CHECK THE BEST INITIAL DIRECTIONS AFTER PLAYING
    }

    return {
        paddle,
        ball
    }
}
