interface Array<T> {
  minBy(callback: (element: T) => number): T;
  maxBy(callback: (element: T) => number): T;
}

Array.prototype.minBy = function<T>(this: T[], callback: (element: T) => number): T | undefined {
  if (this.length === 0) {
    return undefined;
  }

  let minElement = this[0];
  let minValue = callback(minElement);

  for (let i = 1; i < this.length; i++) {
      const currentValue = callback(this[i]);
      if (currentValue < minValue) {
          minElement = this[i];
          minValue = currentValue;
      }
  }

  return minElement;
};

Array.prototype.maxBy = function<T>(this: T[], callback: (element: T) => number): T | undefined {
  if (this.length === 0) {
    return undefined;
  }

  let maxElement = this[0];
  let maxValue = callback(maxElement);

  for (let i = 1; i < this.length; i++) {
      const currentValue = callback(this[i]);
      if (currentValue > maxValue) {
          maxElement = this[i];
          maxValue = currentValue;
      }
  }

  return maxElement;
};