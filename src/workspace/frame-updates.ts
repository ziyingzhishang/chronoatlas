export function createFrameUpdater<T>(apply:(value:T)=>void,schedule:(fn:FrameRequestCallback)=>number=requestAnimationFrame,cancel:(id:number)=>void=cancelAnimationFrame){
  let frame:number|undefined;
  let latest:T;
  let disposed=false;
  return {
    push(value:T){
      if(disposed)return;
      latest=value;
      if(frame!==undefined)return;
      frame=schedule(()=>{frame=undefined;if(!disposed)apply(latest);});
    },
    dispose(){disposed=true;if(frame!==undefined)cancel(frame);frame=undefined;},
  };
}

export function createLatestFrameUpdater<T>(
  apply:(value:T,revision:number)=>void,
  schedule:(fn:FrameRequestCallback)=>number=requestAnimationFrame,
  cancel:(id:number)=>void=cancelAnimationFrame,
){
  let frame:number|undefined;
  let latest:T;
  let revision=0;
  let disposed=false;
  const run=()=>{
    frame=undefined;
    if(!disposed)apply(latest,revision);
  };
  return {
    push(value:T){
      if(disposed)return revision;
      latest=value;
      revision+=1;
      if(frame===undefined)frame=schedule(run);
      return revision;
    },
    flush(value:T){
      if(disposed)return revision;
      latest=value;
      revision+=1;
      if(frame!==undefined)cancel(frame);
      run();
      return revision;
    },
    dispose(){
      disposed=true;
      if(frame!==undefined)cancel(frame);
      frame=undefined;
    },
  };
}
