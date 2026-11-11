import {render,screen,fireEvent} from '@testing-library/react';
import '@testing-library/jest-dom';
import ExternalVideo from './ExternalVideo';
test('no YouTube iframe before consent, and removal unmounts the player',()=>{
 const {container}=render(<ExternalVideo videoId="test123" title="Bande-annonce"/>);
 expect(container.querySelector('iframe')).toBeNull();
 fireEvent.click(screen.getByRole('button',{name:'Autoriser et charger YouTube'}));
 expect(screen.getByTitle('Bande-annonce')).toHaveAttribute('src','https://www.youtube-nocookie.com/embed/test123');
 fireEvent.click(screen.getByRole('button',{name:'Arrêter et retirer le lecteur'}));
 expect(container.querySelector('iframe')).toBeNull();
});
