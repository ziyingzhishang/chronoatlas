/** Horizontal center of a native range thumb, including its finite travel. */
export function sliderThumbCenter(value:number, min:number, max:number, left:number, width:number, paddingLeft:number, paddingRight:number, thumbSize:number):number {
  const innerWidth = Math.max(0,width-paddingLeft-paddingRight);
  const thumb = Math.min(thumbSize,innerWidth);
  const ratio = max>min ? Math.max(0,Math.min(1,(value-min)/(max-min))) : 0;
  return left+paddingLeft+thumb/2+ratio*(innerWidth-thumb);
}

export function alignedSourceScroll(scrollLeft:number, buttonCenter:number, thumbCenter:number, maximum:number):number {
  return Math.max(0,Math.min(maximum,scrollLeft+buttonCenter-thumbCenter));
}
