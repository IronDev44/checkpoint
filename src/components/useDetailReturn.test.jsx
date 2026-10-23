import {render,act} from '@testing-library/react';
import useDetailReturn from './useDetailReturn';
function Detail({open}) {useDetailReturn(open);return null;}
let frames;
beforeEach(()=>{
 frames=new Map();
 jest.spyOn(window,'scrollTo').mockImplementation(()=>{});
 jest.spyOn(window,'requestAnimationFrame').mockImplementation(callback=>{const id=frames.size+1;frames.set(id,callback);return id;});
 jest.spyOn(window,'cancelAnimationFrame').mockImplementation(id=>frames.delete(id));
});
afterEach(()=>jest.restoreAllMocks());
test('closing returns to the captured list position; editing the open fiche does not reset it',()=>{
 Object.defineProperty(window,'scrollY',{configurable:true,value:650});
 const view=render(<Detail open/>);
 Object.defineProperty(window,'scrollY',{configurable:true,value:20});
 view.rerender(<Detail open/>);expect(window.scrollTo).not.toHaveBeenCalled();
 view.rerender(<Detail open={false}/>);
 act(()=>{frames.forEach(callback=>callback());frames.clear();});
 expect(window.scrollTo).toHaveBeenCalledWith({top:650,left:0,behavior:'instant'});
});
test('leaving for another tab skips restoring the previous tab scroll',()=>{
 const view=render(<><div className="bottom-tabs"><button className="tab-btn active">Bibliothèque</button></div><Detail open/></>);
 view.rerender(<div className="bottom-tabs"><button className="tab-btn active">Accueil</button></div>);
 act(()=>{frames.forEach(callback=>callback());frames.clear();});
 expect(window.scrollTo).not.toHaveBeenCalled();
});
