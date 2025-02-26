import {getRange} from '../utils'

export const BLOCK_MAX_DENSITY = 3

const getRandomBlock = () => Math.floor(Math.random() * BLOCK_MAX_DENSITY)

const getBlocks = (rows, columns) => 
    getRange(rows).map(() => getRange(columns).map(getRandomBlock))

export const LEVELS = [
    {
        lives: 3,
        paddleWidth: 3.5,
        speed: 1,
        blocks: getBlocks(3,6)
    },
    {
        lives: 3,
        paddleWidth: 3,
        speed: 1.4,
        blocks: getBlocks(3,7)
    },
    {
        lives: 2,
        paddleWidth: 2.5,
        speed: 1.8,
        blocks: getBlocks(5,8)
    },
    {
        lives: 1,
        paddleWidth: 2,
        speed: 2,
        blocks: getBlocks(6,9)
    },
]