import { fireEvent, render, screen } from '@testing-library/react';
import GameExperiencePanel from './GameExperiencePanel';

test('the three experiences remain changeable without deleting notes', () => {
  const onChange = jest.fn();
  render(<GameExperiencePanel game={{ id: 'a', rating: 7 }} onChange={onChange} />);
  fireEvent.click(screen.getByRole('button', { name: /Terminé Ton expérience complète/ }));
  expect(onChange).toHaveBeenCalledWith('a', expect.objectContaining({ ratingExperience: 'completed', completed: true }));
  expect(onChange.mock.calls[0][1]).not.toHaveProperty('rating');
});

test('discovery supports multiple feelings, toggling and revealing more choices', () => {
  const onChange = jest.fn();
  const game = { id: 'a', ratingExperience: 'tried', discoveryFeelings: ['style'] };
  render(<GameExperiencePanel game={game} onChange={onChange} />);
  fireEvent.click(screen.getByRole('button', { name: /Pas le bon moment/ }));
  expect(onChange).toHaveBeenLastCalledWith('a', { discoveryFeelings: ['style', 'timing'] });
  fireEvent.click(screen.getByRole('button', { name: /Pas tout à fait mon style/ }));
  expect(onChange).toHaveBeenLastCalledWith('a', { discoveryFeelings: [] });
  expect(screen.queryByRole('button', { name: /Un autre ressenti/ })).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Voir plus de ressentis' }));
  expect(screen.getByRole('button', { name: /Un autre ressenti/ })).toBeInTheDocument();
});
