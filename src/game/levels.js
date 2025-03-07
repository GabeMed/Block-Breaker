import { getBlocks } from "../utils"

// Here you can change game configurations and make it harder !!

export const BLOCK_MAX_DENSITY = 3

export const LEVELS = [
    {
        lives: 3,
        paddleWidth: 2,
        speed: 1,
        blocks: getBlocks(4,6)
    },
    {
        lives: 3,
        paddleWidth: 1.75,
        speed: 1.4,
        blocks: getBlocks(4,7)
    },
    {
        lives: 2,
        paddleWidth: 1.5,
        speed: 1.8,
        blocks: getBlocks(6,8)
    },
    {
        lives: 1,
        paddleWidth: 1.25,
        speed: 2,
        blocks: getBlocks(7,9)
    },
]