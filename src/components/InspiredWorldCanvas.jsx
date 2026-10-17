import { useEffect, useRef } from "react";
import { getInspiredWorldBudget, paintInspiredBackdrop, paintInspiredMotion } from "../services/inspiredWorlds";
import "./InspiredWorldCanvas.css";

export default function InspiredWorldCanvas({motif,light=false}) {
  const ref=useRef(null);
  useEffect(()=>{
    const canvas=ref.current;
    // jsdom and browsers without a canvas implementation retain the CSS sky.
    if(typeof window.CanvasRenderingContext2D!=="function")return;
    let c;try{c=canvas.getContext("2d",{alpha:false});}catch{return;}
    if(!c)return;
    const backdrop=document.createElement("canvas"),sky=backdrop.getContext("2d",{alpha:false});
    if(!sky)return;
    let w=1,h=1,budget,frame=0,last=null,elapsed=0,stopped=false;
    const draw=()=>{
      c.save();const settle=light?1:1+.018*Math.exp(-elapsed*.32);c.translate(w*.5,h*.36);c.scale(settle,settle);c.translate(-w*.5,-h*.36);c.drawImage(backdrop,0,0,w,h);paintInspiredMotion(c,w,h,motif,elapsed,budget,light);c.restore();
      canvas.dataset.ready="true";
    };
    const resize=()=>{
      const r=canvas.getBoundingClientRect();w=Math.max(1,r.width);h=Math.max(1,r.height);
      budget=getInspiredWorldBudget(w,h,{light,dpr:window.devicePixelRatio});
      canvas.width=backdrop.width=Math.max(1,Math.round(w*budget.pixelRatio));canvas.height=backdrop.height=Math.max(1,Math.round(h*budget.pixelRatio));
      c.setTransform(budget.pixelRatio,0,0,budget.pixelRatio,0,0);sky.setTransform(budget.pixelRatio,0,0,budget.pixelRatio,0,0);
      paintInspiredBackdrop(sky,w,h,motif,light);draw();
    };
    const tick=now=>{
      if(stopped)return;
      if(last===null)last=now;
      const delta=now-last;
      if(delta>=1000/budget.fps-.5){elapsed+=Math.min(delta/1000,.15);last=now;draw();}
      frame=requestAnimationFrame(tick);
    };
    const start=()=>{if(stopped||document.hidden||frame)return;last=null;frame=requestAnimationFrame(tick);};
    const visibility=()=>{cancelAnimationFrame(frame);frame=0;last=null;start();};
    resize();start();
    const observer=typeof ResizeObserver==="function"?new ResizeObserver(resize):null;
    observer?.observe(canvas);if(!observer)window.addEventListener("resize",resize);
    document.addEventListener("visibilitychange",visibility);
    return()=>{stopped=true;cancelAnimationFrame(frame);observer?.disconnect();window.removeEventListener("resize",resize);document.removeEventListener("visibilitychange",visibility);};
  },[motif,light]);
  return <div className={`iw-world iw-${motif}`} data-original-world={motif} aria-hidden="true"><div className="iw-sky-fallback"/><canvas ref={ref} className="iw-world-canvas"/><div className="iw-scene-fade"/></div>;
}
