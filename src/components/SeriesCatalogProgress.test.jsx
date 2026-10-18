import {render,screen} from '@testing-library/react';
import SeriesCatalogProgress from './SeriesCatalogProgress';
import {loadSeriesCatalog} from '../services/seriesCatalog';
jest.mock('../services/seriesCatalog',()=>({...jest.requireActual('../services/seriesCatalog'),loadSeriesCatalog:jest.fn()}));
test('series cards show remaining games beyond the library and refresh the count after a completion',async()=>{
 loadSeriesCatalog.mockResolvedValue({games:[{name:'Halo'},{name:'Halo 2'},{name:'Halo 3'}],complete:true});
 const isFinished=g=>g.completed;
 const view=render(<SeriesCatalogProgress name="Halo" games={[{name:'Halo',completed:true},{name:'Halo 2'}]} isFinished={isFinished}/>);
 expect(await screen.findByText('2 jeux répertoriés à terminer · 1 hors bibliothèque')).toBeVisible();
 view.rerender(<SeriesCatalogProgress name="Halo" games={[{name:'Halo',completed:true},{name:'Halo 2',completed:true}]} isFinished={isFinished}/>);
 expect(screen.getByText('1 jeu répertorié à terminer · 1 hors bibliothèque')).toBeVisible();expect(loadSeriesCatalog).toHaveBeenCalledTimes(1);
});
test('unavailable catalogues do not become a misleading zero',async()=>{
 loadSeriesCatalog.mockRejectedValue(new Error('offline'));render(<SeriesCatalogProgress name="Halo" games={[]} isFinished={()=>false}/>);
 expect(await screen.findByText('Autres jeux de la série : catalogue indisponible')).toBeVisible();expect(screen.queryByText(/0 jeu/)).toBeNull();
});
