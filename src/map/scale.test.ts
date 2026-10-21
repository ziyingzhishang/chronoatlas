import { expect,test } from 'vitest';
import { metricScale } from './scale';
test('scale rounds down to a readable distance and preserves its physical screen ratio',()=>{
  expect(metricScale(740000,100)).toEqual({width:500000/740000*100,distance:500,unit:'千米'});
  expect(metricScale(350,100)).toEqual({width:200/350*100,distance:200,unit:'米'});
  expect(metricScale(0,100)).toBeNull();
  expect(metricScale(Infinity,100)).toBeNull();
});
