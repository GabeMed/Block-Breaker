import { BLOCK_MAX_DENSITY } from "./game/levels";

// Here we define some helper functions that will be used in other files

export const toDegrees = (radians) => (radians * 180) / Math.PI;
export const toRadians = (degree) => (Math.PI * degree) / 180;

export const getRange = (length) => [...Array(length).keys()];
export const getRandomFrom = (...args) =>
  args[Math.floor(Math.random() * args.length)];
export const flatten = (arrays) =>
  arrays.reduce((acc, row) => [...acc, ...row], []);
export const removeElement = (array, element) =>
  array.filter((e) => e !== element); // To eliminate the low density blocks from screen
export const updateElement = (array, toBeUpdatedElement, newValue) =>
  array.map((e) => (e === toBeUpdatedElement ? newValue : e)); // To remove density from blocks

export const registerListener = (eventName, handler) => {
  window.addEventListener(eventName, handler);
  return () => window.removeEventListener(eventName, handler);
};

export const getRandomBlock = () =>
  Math.floor(Math.random() * BLOCK_MAX_DENSITY);
export const getBlocks = (rows, columns) =>
  getRange(rows).map(() => getRange(columns).map(getRandomBlock));
