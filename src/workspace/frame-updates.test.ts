import {expect,test,vi} from 'vitest';
import {createFrameUpdater,createLatestFrameUpdater} from './frame-updates';

test('rapid updates draw only the latest state and cancellation prevents stale updates',()=>{
  const pending=new Map<number,FrameRequestCallback>();let serial=0;
  const seen:number[]=[];
  const queue=createFrameUpdater<number>(n=>seen.push(n),fn=>{pending.set(++serial,fn);return serial;},id=>{pending.delete(id);});
  queue.push(755);queue.push(756);queue.push(757);
  expect(seen).toEqual([]);expect(pending.size).toBe(1);
  const first=[...pending.values()][0];pending.clear();first(0);
  expect(seen).toEqual([757]);
  queue.push(758);queue.dispose();
  expect(pending.size).toBe(0);expect(seen).toEqual([757]);
});

test('coalesces previews and flushes the final value even when unchanged',()=>{
  const pending=new Map<number,FrameRequestCallback>();
  const applied:{value:number;revision:number}[]=[];
  let serial=0;
  const updater=createLatestFrameUpdater<number>(
    (value,revision)=>applied.push({value,revision}),
    callback=>{pending.set(++serial,callback);return serial;},
    id=>pending.delete(id),
  );
  updater.push(800);
  updater.push(1271);
  [...pending.values()][0](0);
  const previewRevision=applied[0].revision;
  updater.flush(1271);
  expect(applied).toEqual([
    {value:1271,revision:previewRevision},
    {value:1271,revision:previewRevision+1},
  ]);
});

test('dispose cancels a pending preview',()=>{
  const apply=vi.fn();
  let pendingCallback:FrameRequestCallback=()=>{};
  const cancel=vi.fn();
  const updater=createLatestFrameUpdater(apply,callback=>{
    pendingCallback=callback;
    return 1;
  },cancel);
  updater.push(1644);
  updater.dispose();
  pendingCallback(0);
  expect(apply).not.toHaveBeenCalled();
  expect(cancel).toHaveBeenCalledWith(1);
});
