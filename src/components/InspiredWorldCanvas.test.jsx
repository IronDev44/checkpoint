import { render } from "@testing-library/react";
import InspiredWorldCanvas from "./InspiredWorldCanvas";

function context(){
  const gradient={addColorStop:()=>{}};
  return new Proxy({drawImage:jest.fn(),createLinearGradient:()=>gradient,createRadialGradient:()=>gradient},{get:(target,key)=>key in target?target[key]:(()=>{})});
}

test('scene changes and unmount cancel their animation and release resize/visibility listeners',()=>{
  const original=window.CanvasRenderingContext2D;
  window.CanvasRenderingContext2D=function(){};
  const draw=context();
  const canvas=jest.spyOn(HTMLCanvasElement.prototype,'getContext').mockReturnValue(draw);
  const rect=jest.spyOn(HTMLCanvasElement.prototype,'getBoundingClientRect').mockReturnValue({width:390,height:844});
  const raf=jest.spyOn(window,'requestAnimationFrame').mockReturnValue(123);
  const cancel=jest.spyOn(window,'cancelAnimationFrame');
  const remove=jest.spyOn(document,'removeEventListener');
  const removeWindow=jest.spyOn(window,'removeEventListener');
  try{
    const view=render(<InspiredWorldCanvas motif="jurassic"/>);
    expect(document.querySelector('canvas')).toHaveAttribute('data-ready','true');
    expect(draw.drawImage).toHaveBeenCalled();
    view.rerender(<InspiredWorldCanvas motif="godwar" light/>);
    expect(cancel).toHaveBeenCalledWith(123);
    expect(document.querySelector('canvas').width).toBe(390);
    view.unmount();
    expect(remove).toHaveBeenCalledWith('visibilitychange',expect.any(Function));
    expect(removeWindow).toHaveBeenCalledWith('resize',expect.any(Function));
  }finally{window.CanvasRenderingContext2D=original;canvas.mockRestore();rect.mockRestore();raf.mockRestore();cancel.mockRestore();remove.mockRestore();removeWindow.mockRestore();}
});

test('the CSS scenery fallback stays mounted when a canvas context is unavailable',()=>{
  const original=window.CanvasRenderingContext2D;
  window.CanvasRenderingContext2D=undefined;
  try{
    render(<InspiredWorldCanvas motif="halo"/>);
    expect(document.querySelector('.iw-sky-fallback')).not.toBeNull();
    expect(document.querySelector('[data-original-world=halo]')).not.toBeNull();
    expect(document.querySelector('img')).toBeNull();
  }finally{window.CanvasRenderingContext2D=original;}
});
