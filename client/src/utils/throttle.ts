const throttle = (fn: any, time: number) => {
  let lastFired = 0;
  return (...args: any[]) => {
    const now = Date.now();
    if (now - lastFired >= time) {
      lastFired = now;
      return fn(...args);
    }
  };
};

export default throttle;
