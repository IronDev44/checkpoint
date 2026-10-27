import {automaticProfileHandle, publishProfileWithIdentity} from './profileIdentity';

test('homonyms get separate addresses and accents are supported', () => {
  expect(automaticProfileHandle('Nástasia', 'user-one')).toMatch(/^nastasia-/);
  expect(automaticProfileHandle('Nastasia', 'user-one')).not.toBe(automaticProfileHandle('Nastasia', 'user-two'));
  expect(automaticProfileHandle('🎮', 'user-one')).toMatch(/^joueur-/);
  expect(automaticProfileHandle('Un pseudo beaucoup plus long que la limite', 'a-long-account-owner',9).length).toBeLessThanOrEqual(32);
});

test('an existing address survives a pseudo change', async () => {
  const write = jest.fn();
  await expect(publishProfileWithIdentity({profile:{handle:'old-address',displayName:'New name'},owner:'user',write})).resolves.toBe('old-address');
  expect(write).toHaveBeenCalledTimes(1);
  expect(write).toHaveBeenCalledWith({handle:'old-address',displayName:'New name'});
});

test('a reserved address or concurrent claim chooses another without overwriting', async () => {
  const write = jest.fn().mockRejectedValueOnce({status:403}).mockRejectedValueOnce({status:409}).mockResolvedValue(undefined);
  const handle = await publishProfileWithIdentity({profile:{displayName:'Nastasia'},owner:'user',write});
  expect(new Set(write.mock.calls.map(([profile])=>profile.handle)).size).toBe(3);
  expect(handle).toBe(write.mock.calls[2][0].handle);
});

test('network errors are returned instead of creating extra addresses', async () => {
  const write = jest.fn().mockRejectedValue(new Error('offline'));
  await expect(publishProfileWithIdentity({profile:{displayName:'Nastasia'},owner:'user',write})).rejects.toThrow('offline');
  expect(write).toHaveBeenCalledTimes(1);
});

test('missing authentication never writes a profile', async () => {
  const write = jest.fn();
  await expect(publishProfileWithIdentity({profile:{displayName:'Nastasia'},write})).rejects.toThrow('Connecte-toi');
  expect(write).not.toHaveBeenCalled();
});

test('persistent address conflicts stop after a bounded number of attempts', async () => {
  const write = jest.fn().mockRejectedValue({status:409});
  await expect(publishProfileWithIdentity({profile:{displayName:'Nastasia'},owner:'user',write})).rejects.toEqual({status:409});
  expect(write).toHaveBeenCalledTimes(10);
});
