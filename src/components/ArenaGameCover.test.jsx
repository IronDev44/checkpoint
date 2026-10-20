import {render,screen,waitFor,fireEvent,act} from '@testing-library/react';
import '@testing-library/jest-dom';
import ArenaGameCover from './ArenaGameCover';
const cover='https://images.igdb.com/igdb/image/upload/t_cover_big/co3qbo.jpg';
test('never shows a gameplay fallback and resolves the actual cover without changing the game',async()=>{
 const game={id:'rawg:1',name:'Metal Gear Solid',image:'https://media.rawg.io/gameplay.jpg'},before=JSON.stringify(game),resolve=jest.fn().mockResolvedValue(cover);
 const {container}=render(<ArenaGameCover game={game} resolveCover={resolve}/>);expect(container.querySelector('img')).toBeNull();expect(screen.getByText('Recherche de la jaquette…')).toBeVisible();
 await waitFor(()=>expect(container.querySelector('img')).toHaveAttribute('src',cover));expect(resolve).toHaveBeenCalledWith(game);expect(JSON.stringify(game)).toBe(before);
});
test('ignores stale results when the next duel arrives before a cover resolves',async()=>{
 let finish;const resolve=jest.fn().mockImplementationOnce(()=>new Promise(done=>{finish=done;})).mockResolvedValueOnce('https://example.test/second-cover.jpg');
 const view=render(<ArenaGameCover game={{id:'a',name:'First'}} resolveCover={resolve}/>);await waitFor(()=>expect(resolve).toHaveBeenCalledTimes(1));view.rerender(<ArenaGameCover game={{id:'b',name:'Second'}} resolveCover={resolve}/>);await waitFor(()=>expect(view.container.querySelector('img')).toHaveAttribute('src','https://example.test/second-cover.jpg'));
 await act(async()=>finish(cover));expect(view.container.querySelector('img')).toHaveAttribute('src','https://example.test/second-cover.jpg');
});
test('rejects returned gameplay URLs and handles a missing or broken cover cleanly',async()=>{
 const view=render(<ArenaGameCover game={{name:'Missing'}} resolveCover={async()=> 'https://media.rawg.io/gameplay.jpg'}/>);await screen.findByText('Jaquette indisponible');expect(view.container.querySelector('img')).toBeNull();
 view.rerender(<ArenaGameCover game={{name:'Known',cover_image:cover}} resolveCover={jest.fn()}/>);fireEvent.error(view.container.querySelector('img'));expect(screen.getByText('Jaquette indisponible')).toBeVisible();expect(view.container.querySelector('img')).toBeNull();
});
test('requests unknown covers only when approaching the visible area',async()=>{
 const previous=global.IntersectionObserver;let notify;const disconnect=jest.fn(),observe=jest.fn();global.IntersectionObserver=jest.fn(callback=>{notify=callback;return{observe,disconnect}});
 try{const resolve=jest.fn().mockResolvedValue(cover);const view=render(<ArenaGameCover game={{name:'Offscreen'}} resolveCover={resolve}/>);expect(resolve).not.toHaveBeenCalled();await act(async()=>notify([{isIntersecting:false}]));expect(resolve).not.toHaveBeenCalled();await act(async()=>notify([{isIntersecting:true}]));expect(resolve).toHaveBeenCalledTimes(1);expect(disconnect).toHaveBeenCalled();expect(view.container.querySelector('img')).toHaveAttribute('src',cover);view.unmount();}finally{global.IntersectionObserver=previous;}
});
