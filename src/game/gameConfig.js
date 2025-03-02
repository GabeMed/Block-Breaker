import Vector from "./vector"

// Here we define some constants that will be used in other places

const BLOCK_HEIGHT = 1/3
const LEFT = new Vector(-1,0)
const RIGHT = new Vector(1,0)
const UP = new Vector(0,-1)
const DOWN = new Vector(0,1)

export const GAME_CONFIG = {
    PADDLE_AREA: 1/3,
    BLOCK_HEIGHT,
    PADDLE_HEIGHT: BLOCK_HEIGHT,
    BALL_RADIUS: 1/5,
    DISTANCE_COVERED_IN_1_MILI_SECOND_WITH_SPEED_1: 0.005,
    BALL_INITIAL_OFFSET: 5,
    
    LEFT,
    RIGHT,
    UP,
    DOWN,
    
    LEFT_UP: LEFT.add(UP).normalize(),
    RIGHT_UP: RIGHT.add(UP).normalize(),
}

export const MOVEMENT = {
    LEFT: 'LEFT',
    RIGHT: 'RIGHT'
}
