export function metricScale(meters:number,pixels:number) {
  if(!Number.isFinite(meters)||meters<=0||!Number.isFinite(pixels)||pixels<=0)return null;
  const magnitude=10**Math.floor(Math.log10(meters));
  const rounded=([5,2,1].find(n=>n*magnitude<=meters)??1)*magnitude;
  return {width:rounded/meters*pixels,distance:rounded>=1000?rounded/1000:rounded,unit:rounded>=1000?'千米':'米'};
}
