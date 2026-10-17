import {fireEvent,render,screen} from '@testing-library/react';
import DeveloperTools from './DeveloperTools';
import {ownerUid} from '../services/accountConfig';

function InternalProbe(){throw new Error('Internal tool mounted for a visitor');}
test.each([undefined,'another-player'])('does not mount internal tools for %s',accountUid=>{
 render(<DeveloperTools accountUid={accountUid} tests={<InternalProbe/>} events={<InternalProbe/>} feedback={<InternalProbe/>}/>);
 expect(screen.queryByRole('group',{name:'Rubriques développeur'})).toBeNull();
});
test('switching owner sections preserves the live form draft and hides other tools',()=>{
 render(<DeveloperTools accountUid={ownerUid} tests={<button>Lancer une épreuve</button>} events={<label>Nom du live<input/></label>} feedback={<h2>Boîte de réception</h2>}/>);
 expect(screen.getByRole('button',{name:'Lancer une épreuve'})).toBeVisible();
 fireEvent.click(screen.getByRole('button',{name:'Lives et actus',exact:true}));
 fireEvent.change(screen.getByLabelText('Nom du live'),{target:{value:'Prochain direct'}});
 fireEvent.click(screen.getByRole('button',{name:'Retours',exact:true}));
 expect(screen.getByRole('heading',{name:'Boîte de réception'})).toBeVisible();
 expect(screen.queryByRole('button',{name:'Lancer une épreuve'})).toBeNull();
 fireEvent.click(screen.getByRole('button',{name:'Lives et actus',exact:true}));
 expect(screen.getByLabelText('Nom du live')).toHaveValue('Prochain direct');
 expect(screen.getByRole('button',{name:'Lives et actus',exact:true})).toHaveAttribute('aria-pressed','true');
});
