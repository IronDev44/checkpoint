import {render,screen,fireEvent,waitFor} from '@testing-library/react';
import UsageDashboard from './UsageDashboard';
import {usageRequest} from '../services/appUsage';
jest.mock('../services/appUsage',()=>({usageRequest:jest.fn()}));
const data={summary:{total:12,active1:2,active7:4,active30:8,new7:3,since:'2026-10-25T10:00:00Z'},accounts:[{uid:'test-account',excluded:false,lastSeen:null}],updatedAt:'2026-10-25T10:00:00Z'};
beforeEach(()=>usageRequest.mockReset());
test('shows errors without inventing zero counts, then retries',async()=>{
 usageRequest.mockRejectedValueOnce(Error('Indisponible')).mockResolvedValue(data);render(<UsageDashboard/>);
 expect(await screen.findByRole('alert')).toHaveTextContent('Indisponible');expect(screen.queryByText('Comptes connus')).toBeNull();
 fireEvent.click(screen.getByRole('button',{name:'Actualiser'}));expect(await screen.findByText('Comptes connus')).toBeVisible();expect(screen.getByText('12')).toBeVisible();
});
test('excludes a test account and refreshes the statistics',async()=>{
 usageRequest.mockResolvedValue(data);render(<UsageDashboard/>);await screen.findByText('Comptes connus');
 fireEvent.click(screen.getByText('Exclure les comptes de test'));fireEvent.click(screen.getByRole('button',{name:'Exclure le compte test-account'}));
 await waitFor(()=>expect(usageRequest).toHaveBeenCalledWith({action:'exclude',uid:'test-account',excluded:true}));await waitFor(()=>expect(usageRequest).toHaveBeenCalledTimes(3));
});
