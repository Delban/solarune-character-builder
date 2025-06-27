// src/data/index.ts
import listeDons from './listeDons.json';

console.log("DEBUG listeDons from JSON:", listeDons);

export const allDons = Array.isArray(listeDons) ? listeDons : [];
