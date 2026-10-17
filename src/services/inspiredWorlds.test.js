import { getInspiredWorldBudget, INSPIRED_WORLDS, paintInspiredBackdrop, paintInspiredMotion } from "./inspiredWorlds";

export function drawingContext(){
  const calls=[];
  const gradient={addColorStop:jest.fn()};
  const methods={createLinearGradient:()=>gradient,createRadialGradient:()=>gradient};
  const context=new Proxy(methods,{get(target,key){if(key in target)return target[key];return (...args)=>{calls.push([key,...args]);};}});
  return {context,calls};
}

test('mobile reduction lowers both raster resolution and ongoing animation work',()=>{
  const full=getInspiredWorldBudget(390,844,{dpr:3});
  const light=getInspiredWorldBudget(390,844,{light:true,dpr:3});
  expect(light.pixelRatio).toBeLessThan(full.pixelRatio);
  expect(light.fps).toBeLessThan(full.fps);
  expect(light.particles).toBeLessThan(full.particles);
  const large=getInspiredWorldBudget(4000,2500,{dpr:3});
  expect(4000*2500*large.pixelRatio**2).toBeLessThanOrEqual(2200001);
});

test.each([...INSPIRED_WORLDS])('%s paints valid geometry on small, wide and desktop canvases',motif=>{
  for(const [w,h] of [[320,568],[844,390],[1440,900]]){
    const {context,calls}=drawingContext();
    paintInspiredBackdrop(context,w,h,motif,false);
    for(const time of [0,3.5,30])paintInspiredMotion(context,w,h,motif,time,getInspiredWorldBudget(w,h),false);
    expect(calls.length).toBeGreaterThan(100);
    const coordinates=calls.flatMap(([, ...args])=>args.filter(value=>typeof value==='number'));
    expect(coordinates.every(Number.isFinite)).toBe(true);
    expect(calls.some(([method])=>method==='drawImage')).toBe(false);
  }
});

test.each([...INSPIRED_WORLDS])('%s keeps a lighter moving scene without removing its establishing view',motif=>{
  const full=drawingContext(),light=drawingContext();
  paintInspiredMotion(full.context,390,844,motif,3,getInspiredWorldBudget(390,844),false);
  paintInspiredMotion(light.context,390,844,motif,3,getInspiredWorldBudget(390,844,{light:true}),true);
  expect(light.calls.length).toBeLessThan(full.calls.length);
  const sky=drawingContext();paintInspiredBackdrop(sky.context,390,844,motif,true);
  expect(sky.calls.length).toBeGreaterThan(100);
});
