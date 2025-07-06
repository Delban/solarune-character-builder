// src/data/index.ts
import listeDons from './listeDons.json';
import classesNWN from './classesNWN.json';
import listeSorts from './listeSorts.json';

console.log("DEBUG listeDons from JSON:", listeDons);
console.log("DEBUG classesNWN from JSON:", classesNWN);

export const allDons = Array.isArray(listeDons) ? listeDons : [];
export const allClasses = Array.isArray(classesNWN) ? classesNWN : [];
export const allSorts = Array.isArray(listeSorts) ? listeSorts : [];
