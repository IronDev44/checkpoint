import {StrictMode} from 'react';
import {fireEvent,render,screen} from '@testing-library/react';
import PlayerShareCard from './PlayerShareCard';
import {renderPlayerCard} from '../services/playerCard';
jest.mock('../services/playerCard',()=>({...jest.requireActual('../services/playerCard'),renderPlayerCard:jest.fn()}));
test('the generated image is previewed before saving, honours options, and releases obsolete previews',async()=>{
 URL.createObjectURL=jest.fn(()=> 'blob:preview');URL.revokeObjectURL=jest.fn();
 renderPlayerCard.mockResolvedValue(new Blob(['png'],{type:'image/png'}));
 const view=render(<StrictMode><PlayerShareCard profile={{displayName:'Jordan',identityGameIds:['one'],photoURL:'photo.jpg',platform:'PS5'}} games={[{id:'one',name:'Halo'}]} level={54}/></StrictMode>);
 expect(screen.queryByRole('link',{name:'Enregistrer l’image'})).toBeNull();
 fireEvent.click(screen.getByRole('button',{name:'Créer ma carte'}));
 expect(await screen.findByRole('img',{name:'Aperçu de ta carte de joueur'})).toHaveAttribute('src','blob:preview');
 expect(screen.getByRole('link',{name:'Enregistrer l’image'})).toHaveAttribute('download','mon-profil-checkpoint.png');
 fireEvent.click(screen.getByRole('checkbox',{name:'Ma photo'}));
 expect(screen.queryByRole('img')).toBeNull();expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:preview');
 fireEvent.click(screen.getByRole('button',{name:'Créer ma carte'}));await screen.findByRole('img');
 expect(renderPlayerCard.mock.calls.at(-1)[0].photo).toBe('');
 view.unmount();expect(URL.revokeObjectURL.mock.calls.length).toBeGreaterThanOrEqual(2);
});
