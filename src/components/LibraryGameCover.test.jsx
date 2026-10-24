import {render,screen,waitFor,fireEvent} from '@testing-library/react';
import LibraryGameCover from './LibraryGameCover';
import {resolveGameCover} from '../services/gameCovers';
jest.mock('../services/gameCovers',()=>({...jest.requireActual('../services/gameCovers'),resolveGameCover:jest.fn()}));
const cover='https://images.igdb.com/igdb/image/upload/t_cover_big/co-test.jpg';
beforeEach(()=>resolveGameCover.mockReset());
test('known covers take priority over gameplay without a lookup',()=>{
 render(<LibraryGameCover game={{name:'Portal',cover_image:cover}} fallback="https://media.rawg.io/gameplay.jpg"/>);
 expect(screen.getByRole('img',{name:'Portal'})).toHaveAttribute('src',cover);expect(resolveGameCover).not.toHaveBeenCalled();
});
test('resolves a cover progressively and restores the fallback if its image fails',async()=>{
 resolveGameCover.mockResolvedValue(cover);
 render(<LibraryGameCover game={{name:'Portal'}} fallback="https://media.rawg.io/gameplay.jpg"/>);
 await waitFor(()=>expect(screen.getByRole('img',{name:'Portal'})).toHaveAttribute('src',cover));
 fireEvent.error(screen.getByRole('img',{name:'Portal'}));expect(screen.getByRole('img',{name:'Portal'})).toHaveAttribute('src','https://media.rawg.io/gameplay.jpg');
});
