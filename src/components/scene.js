import React, { useReducer, useEffect } from "react";

import { LEVELS } from "../game/levels";
import { gameStateFromLevel, getNewGameState } from "../game/gameState";
import { MOVEMENT } from "../game/gameConfig";

import Level from "./level";
import Lives from "./lives";
import Block from "./block";
import Paddle from "./paddle";
import Ball from "./ball";
import { registerListener } from "../utils";

const MOVEMENT_KEYS = {
    LEFT: [65, 37],
    RIGHT: [68, 39] 
}

const STOP_KEY = 32

const FPS = 1000 / 60  // 60 re-renders per second 

const ACTION = {
    CONTAINER_SIZE_CHANGE: 'CONTAINER_SIZE_CHANGE',
    KEY_DOWN: 'KEY_DOWN',
    KEY_UP: 'KEY_UP',
    TICK: 'TICK'
}

const HANDLER = {
    [ACTION.CONTAINER_SIZE_CHANGE]: (state, containerSize) => ({
        ...state,
        containerSize,
        ...getProjectors(containerSize, state.size)
    }),

    [ACTION.KEY_DOWN]: (state, key) => {
        if(MOVEMENT_KEYS.LEFT.includes(key)){
            return { ...state, movement: MOVEMENT.LEFT }
        }
        else if(MOVEMENT_KEYS.RIGHT.includes(key)){
            return { ...state, movement: MOVEMENT.RIGHT }
        }
        return state
    },

    [ACTION.KEY_UP]: (state, key) => {
        const newState = { ...state, movement: undefined }

        if(key !== STOP_KEY) return newState

        if (state.stopTime) return { ...newState, stopTime: undefined, time: state.time + Date.now() - state.stopTime }

        return { ...newState, stopTime: Date.now() }
    },

    [ACTION.TICK]: state => {
        if(state.stopTime) return state

        const time = Date.now()
        const newGame = getNewGameState(state.game, state.movement, time - state.time)
        const newState = { ...state, time }

        if(newGame.lives < 1) return { ...state, game: gameStateFromLevel(LEVELS[state.level])} // ! Check here after the game is done, to understand what changes

        else if(newGame.blocks.length < 1){
            const level = state.level === LEVELS.length ? state.level : state.level + 1
            localStorage.setItem('level', level)
            const game = gameStateFromLevel(LEVELS[level])   // ! Check what changes 

            return {
                ...newState,
                level,
                game,
                ...getProjectors(state.containerSize, game.size)
            }
        }
        return {...newState, game:newGame}
    }
}

const getInitialLevel = () => {
    const inState = localStorage.getItem('level')
    return inState ? parseInt(inState, 10) : 0
}

const getProjectors = (containerSize, gameSize) => {   
    const widthRatio = containerSize.width / gameSize.width    // This get projectors will always reajust the elements so they don't get distorced when the window change 
    const heightRatio = containerSize.height / gameSize.height // every length and distance parameter will be adjusted with this func
    const unitOnScreen = Math.min(widthRatio, heightRatio)

    return {
        projectDistance: distance => distance * unitOnScreen,
        projectVector: vector => vector.scaleBy(unitOnScreen)
    }
}

const getInitialState = containerSize => {
    const level = getInitialLevel()
    const game = gameStateFromLevel(LEVELS[level])
    const { projectDistance, projectVector } = getProjectors(containerSize, game.size)

    return {
        level,
        game,
        containerSize,
        projectDistance,
        projectVector,
        time: Date.now(),
        stopTime: undefined,
        movement: undefined
    }
}

const reducer = () => reducer  

export default (containerSize) => {
    const [state, dispatch] = useReducer(reducer, containerSize, getInitialState)
    // const act = (type, payload) => dispatch({ type, payload })
    const {
        projectDistance,
        projectVector,
        level,
        game: {
            blocks,
            paddle,
            ball,
            size:{
                width,
                height,
            },
            lives
        }
    } = state

    const viewWidth = projectDistance(width)
    const unit = projectDistance(ball.radius)  // Used to make the art of the life bars 

    return (
        <svg width={viewWidth} height={projectDistance(height)} className='scene'> 
            <Level unit={unit} level={level + 1}/>
            <Lives 
                lives={lives}
                containerWidth={viewWidth}
                unit={unit}
            />
            {blocks.map(({density, position, width, height}) => (
                <Block
                    density={density}
                    key={`${position.x}-${position.y}`} // We put this key here so React doesn't get lost, because there a lot of blocks
                    width={projectDistance(width)}
                    height={projectDistance(height)}
                    {...projectVector(position)} // This spread returns and x and y that are the original parameters for Block
                />
            ))}
            <Paddle
                width={projectDistance(paddle.width)}
                height={projectDistance(paddle.height)}
                {...projectVector(paddle.position)} 
            />
            <Ball {...projectVector(ball.center)} radius={unit}/>
        </svg>
    )
}