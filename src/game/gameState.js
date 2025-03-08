import Vector from "./vector";
import { flatten, getRandomFrom, removeElement, updateElement } from "../utils";
import {
  isGoingToHit,
  withNewBallDirection,
  calculateBallReflectionNormal,
} from "./physics";
import { GAME_CONFIG, MOVEMENT } from "./gameConfig";

// Here is where we define the main logic of the game

const {
  PADDLE_HEIGHT,
  BALL_INITIAL_OFFSET,
  BALL_RADIUS,
  LEFT_UP,
  RIGHT_UP,
  UP,
} = GAME_CONFIG;

const getInitialPaddleAndBall = (width, height, paddleWidth) => {
  const paddleY = height - PADDLE_HEIGHT;
  const paddle = {
    position: new Vector((width - paddleWidth) / 2, paddleY),
    width: paddleWidth,
    height: PADDLE_HEIGHT,
  };
  const ball = {
    center: new Vector(
      width / 2,
      height / 2 + BALL_INITIAL_OFFSET * BALL_RADIUS
    ),
    radius: BALL_RADIUS,
    direction: getRandomFrom(LEFT_UP, RIGHT_UP, UP),
  };

  return {
    paddle,
    ball,
  };
};

const { BLOCK_HEIGHT, PADDLE_AREA } = GAME_CONFIG;

export const gameStateFromLevel = ({ lives, paddleWidth, speed, blocks }) => {
  const width = blocks[0].length;
  const height = width;

  const blockStartY =
    (height - height * PADDLE_AREA - blocks.length * BLOCK_HEIGHT) / 2;

  const rowsOfBlocks = blocks.map((row, i) =>
    row.map((density, j) => ({
      density,
      position: new Vector(j, blockStartY + i * BLOCK_HEIGHT),
      width: 1,
      height: BLOCK_HEIGHT,
    }))
  );

  const size = {
    width,
    height,
  };

  return {
    size,
    blocks: flatten(rowsOfBlocks),
    ...getInitialPaddleAndBall(width, height, paddleWidth),
    lives,
    speed,
  };
};

const { LEFT, RIGHT } = GAME_CONFIG;

const getNewPaddle = (paddle, size, distanceToBeCovered, movement) => {
  if (!movement) return paddle;
  const direction = movement === MOVEMENT.LEFT ? LEFT : RIGHT;

  const { x } = paddle.position.add(direction.scaleBy(distanceToBeCovered));
  const updateTheValueFromX = (x) => ({
    ...paddle,
    position: new Vector(x, paddle.position.y),
  });

  if (x < 0) {
    return updateTheValueFromX(0);
  }

  if (x + paddle.width > size.width) {
    return updateTheValueFromX(size.width - paddle.width);
  }

  return updateTheValueFromX(x);
};

const { DISTANCE_COVERED_IN_1_MILI_SECOND_WITH_SPEED_1, DOWN } = GAME_CONFIG;

export const getNewGameState = (state, movement, timespan) => {
  const { size, speed, lives, blocks, ball } = state;
  const distanceCovered =
    timespan * DISTANCE_COVERED_IN_1_MILI_SECOND_WITH_SPEED_1 * speed;
  const paddle = getNewPaddle(state.paddle, size, distanceCovered, movement);

  const newBallCenter = ball.center.add(
    ball.direction.scaleBy(distanceCovered)
  ); // The new ball position after the displacement
  const ballBounds = {
    left: newBallCenter.x - ball.radius,
    right: newBallCenter.x + ball.radius,
    top: newBallCenter.y - ball.radius,
    bottom: newBallCenter.y + ball.radius,
  };

  if (ballBounds.bottom >= size.height) {
    return {
      ...state,
      ...getInitialPaddleAndBall(size.width, size.height, paddle.width),
      lives: lives - 1,
    };
  }

  const getUpdatedGameStateWithBall = (newBallProps) => ({
    ...state,
    paddle,
    ball: { ...ball, ...newBallProps },
  });

  const ballGoingDown = ball.direction.y > 0;
  const paddleBounds = {
    left: paddle.position.x,
    right: paddle.position.x + paddle.width,
    top: paddle.position.y,
    bottom: paddle.position.y + paddle.height,
  };

  const EPSILON = 0.1; // We define it to help us make the side colision with the paddle

  const hitPaddleTop =
    ballGoingDown &&
    ballBounds.bottom >= paddleBounds.top &&
    ballBounds.right >= paddleBounds.left &&
    ballBounds.left <= paddleBounds.right;

  const hitPaddleSide =
    !hitPaddleTop &&
    ballBounds.bottom >= paddleBounds.top &&
    ballBounds.top <= paddleBounds.bottom &&
    (Math.abs(ballBounds.right - paddleBounds.left) <= EPSILON || // We use EPSILON because it will not always be exactly side by side
      Math.abs(ballBounds.left - paddleBounds.right) <= EPSILON);

  if (hitPaddleTop)
    return withNewBallDirection(
      ball.direction,
      UP,
      getUpdatedGameStateWithBall
    );
  if (hitPaddleSide)
    return withNewBallDirection(
      ball.direction,
      Math.abs(ballBounds.right - paddleBounds.left) <= EPSILON ? LEFT : RIGHT,
      getUpdatedGameStateWithBall
    );

  if (ballBounds.top <= 0)
    return withNewBallDirection(
      ball.direction,
      DOWN,
      getUpdatedGameStateWithBall
    );
  if (ballBounds.left <= 0)
    return withNewBallDirection(
      ball.direction,
      RIGHT,
      getUpdatedGameStateWithBall
    );
  if (ballBounds.right >= size.width)
    return withNewBallDirection(
      ball.direction,
      LEFT,
      getUpdatedGameStateWithBall
    );

  const hittedBlock = blocks.find(
    ({ position, width, height }) =>
      isGoingToHit(
        ballBounds.top,
        ballBounds.bottom,
        position.y,
        position.y + height
      ) &&
      isGoingToHit(
        ballBounds.left,
        ballBounds.right,
        position.x,
        position.x + width
      )
  );

  if (hittedBlock) {
    const newDensity = hittedBlock.density - 1;
    const newBlock = { ...hittedBlock, density: newDensity };
    const newBlocks =
      newDensity < 0
        ? removeElement(blocks, hittedBlock)
        : updateElement(blocks, hittedBlock, newBlock);

    return {
      ...withNewBallDirection(
        ball.direction,
        calculateBallReflectionNormal(hittedBlock, ballBounds, ball.radius),
        getUpdatedGameStateWithBall
      ),
      blocks: newBlocks,
    };
  }

  return getUpdatedGameStateWithBall({ center: newBallCenter });
};
