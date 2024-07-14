export class RNG {

  seed: number;
  curr: number;

  constructor(seed: number | undefined) {
    if (seed === undefined) {
      this.seed = (Math.random()*2**32)>>>0;
    } else {
      this.seed = seed>>>0;
    }
    this.curr = this.seed;
  }

  // splitmix32
  random(): number {
    this.curr += 0x9e3779b9 | 0;
    let t = this.curr ^ this.curr >>> 16;
    t = Math.imul(t, 0x21f0aaad);
    t = t ^ t >>> 15;
    t = Math.imul(t, 0x735a2d97);
    return ((t = t ^ t >>> 15) >>> 0) / 4294967296;
  }
}
