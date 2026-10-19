import React from 'react';import {render,screen,fireEvent,waitFor} from '@testing-library/react';
import DataProtection from './DataProtection';
import {offlineState,listTrash,restoreTrash} from '../services/d1Data';
import {deviceRead} from '../services/deviceStore';
jest.mock('../firebase',()=>({auth:{currentUser:{uid:'fixture'}}}));
jest.mock('../services/deviceStore',()=>({deviceRead:jest.fn(),captureBackup:jest.fn()}));
jest.mock('../services/d1Data',()=>({d1Enabled:true,offlineState:jest.fn(),setOfflineEnabled:jest.fn(),syncOffline:jest.fn(),discardConflict:jest.fn(),listTrash:jest.fn(),restoreTrash:jest.fn()}));
const payload={games:[{id:'one',name:'Portal'}],hardware:[]};
beforeEach(()=>{offlineState.mockResolvedValue({jobs:[],enabled:true});deviceRead.mockResolvedValue([{id:'v1',reason:'Manuelle',createdAt:'2026-10-19T10:00:00Z',payload}]);Object.defineProperty(navigator,'onLine',{value:true,configurable:true});});
test('restoration requires an explicit confirmation, cancel does not restore',async()=>{
 const restore=jest.fn(async()=>{});render(<DataProtection onRestore={restore} onCapture={jest.fn()}/>);
 fireEvent.click(await screen.findByRole('button',{name:'Restaurer',exact:true}));expect(screen.getByRole('alertdialog')).toBeVisible();expect(restore).not.toHaveBeenCalled();
 fireEvent.click(screen.getByRole('button',{name:'Annuler',exact:true}));expect(screen.queryByRole('alertdialog')).toBeNull();expect(restore).not.toHaveBeenCalled();
 fireEvent.click(screen.getByRole('button',{name:'Restaurer',exact:true}));fireEvent.click(screen.getByRole('button',{name:'Confirmer',exact:true}));
 await waitFor(()=>expect(restore).toHaveBeenCalledWith(payload));expect(await screen.findByText('Restauration préparée. Vérifie la synchronisation ci-dessous.')).toBeVisible();
});
test('recovering an item refreshes the trash and acknowledges the recovery',async()=>{
 listTrash.mockResolvedValueOnce([{id:'one',collection:'games',data:{name:'Portal',_deletedAt:'2026-10-19T10:00:00Z'}}]).mockResolvedValueOnce([]);restoreTrash.mockResolvedValue();
 render(<DataProtection/>);fireEvent.click(screen.getByRole('button',{name:'Voir la corbeille'}));fireEvent.click(await screen.findByRole('button',{name:'Récupérer'}));
 expect(await screen.findByText('Fiche restaurée.')).toBeVisible();expect(restoreTrash).toHaveBeenCalledWith('games','one');expect(screen.getByText('Ta corbeille est vide.')).toBeVisible();
});
test('the offline queue cannot be disabled with pending changes',async()=>{
 offlineState.mockResolvedValue({jobs:[{id:'job',ref:{path:'games/one'},body:{}}],enabled:true});render(<DataProtection/>);
 await screen.findByText('1 modification(s) en attente');expect(screen.getByRole('checkbox')).toBeDisabled();
});
