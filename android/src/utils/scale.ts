import { Dimensions } from 'react-native';

const DESIGN_WIDTH = 1280;
const DESIGN_HEIGHT = 800;

const { width, height } = Dimensions.get('window');

const W = Math.max(width, height); // always landscape
const H = Math.min(width, height);

export const hs = (px: number) => Math.round((px * W) / DESIGN_WIDTH);
export const vs = (px: number) => Math.round((px * H) / DESIGN_HEIGHT);
export const s  = (px: number) => Math.round((px * Math.min(W, H)) / Math.min(DESIGN_WIDTH, DESIGN_HEIGHT));
