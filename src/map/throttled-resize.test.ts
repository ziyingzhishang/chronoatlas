import { expect, test, vi } from 'vitest';
import { createThrottledResize } from './throttled-resize';

function clock(){
  let now=0;
  let nextId=0;
  const timers=new Map<number,()=>void>();
  const frames=new Map<number,()=>void>();
  return {
    timers,frames,
    now:()=>now,
    requestAnimationFrame:(callback:FrameRequestCallback)=>{const id=++nextId;frames.set(id,()=>callback(now));return id;},
    cancelAnimationFrame:(id:number)=>{frames.delete(id);},
    setTimeout:(callback:()=>void,delay:number)=>{const id=++nextId;timers.set(id,()=>{now+=delay;callback();});return id;},
    clearTimeout:(id:number)=>{timers.delete(id);},
    advanceFrame:()=>{const callbacks=[...frames.values()];frames.clear();callbacks.forEach(callback=>callback());},
    advanceTimer:()=>{const [id,callback]=timers.entries().next().value??[];if(id!==undefined){timers.delete(id);callback?.();}},
    advance:(milliseconds:number)=>{now+=milliseconds;},
  };
}

test('throttles resize work to at most fifteen times a second and flushes the final size',()=>{
  const runtime=clock();
  const resize=vi.fn();
  const scheduler=createThrottledResize(resize,1000/15,runtime);
  scheduler.schedule();runtime.advanceFrame();
  expect(resize).toHaveBeenCalledOnce();
  scheduler.schedule();scheduler.schedule();
  expect(runtime.timers).toHaveLength(1);
  runtime.advanceTimer();runtime.advanceFrame();
  expect(resize).toHaveBeenCalledTimes(2);
  scheduler.schedule();
  scheduler.flush();runtime.advanceFrame();
  expect(resize).toHaveBeenCalledTimes(3);
  scheduler.cancel();
});
