export interface ResizeSchedulerRuntime {
  now: () => number;
  requestAnimationFrame: (callback: FrameRequestCallback) => number;
  cancelAnimationFrame: (id: number) => void;
  setTimeout: (callback: () => void, delay: number) => number;
  clearTimeout: (id: number) => void;
}

const browserRuntime: ResizeSchedulerRuntime = {
  now: () => performance.now(),
  requestAnimationFrame: callback => requestAnimationFrame(callback),
  cancelAnimationFrame: id => cancelAnimationFrame(id),
  setTimeout: (callback, delay) => window.setTimeout(callback, delay),
  clearTimeout: id => window.clearTimeout(id),
};

export function createThrottledResize(resize: () => void, interval = 1000 / 15, runtime = browserRuntime) {
  let lastRun = Number.NEGATIVE_INFINITY;
  let timer: number | undefined;
  let frame: number | undefined;

  const enqueueFrame = () => {
    if (frame !== undefined) return;
    frame = runtime.requestAnimationFrame(() => {
      frame = undefined;
      resize();
      lastRun = runtime.now();
    });
  };
  const schedule = (immediate = false) => {
    if (timer !== undefined) {
      if (!immediate) return;
      runtime.clearTimeout(timer);
      timer = undefined;
    }
    if (frame !== undefined) return;
    const remaining = interval - (runtime.now() - lastRun);
    if (!immediate && remaining > 0) {
      timer = runtime.setTimeout(() => {
        timer = undefined;
        enqueueFrame();
      }, remaining);
      return;
    }
    enqueueFrame();
  };
  const cancel = () => {
    if (timer !== undefined) runtime.clearTimeout(timer);
    if (frame !== undefined) runtime.cancelAnimationFrame(frame);
    timer = undefined;
    frame = undefined;
  };

  return { schedule, flush: () => schedule(true), cancel };
}
