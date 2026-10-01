import { fireEvent, render, screen } from '@testing-library/react';
import RatingSlider from './RatingSlider';

const formatValue = (value) => `${value}/10`;

test('dragging displays live values without updating the app until release', () => {
  const onRate = jest.fn();
  const onCommit = jest.fn();
  render(<RatingSlider rating={2} onRate={onRate} onCommit={onCommit} formatValue={formatValue} />);
  const slider = screen.getByRole('slider');
  fireEvent.pointerDown(slider);
  for (const value of ['3', '5', '7.5']) {
    fireEvent.change(slider, { target: { value } });
  }
  expect(screen.getByText('7.5/10')).toBeInTheDocument();
  expect(onRate).not.toHaveBeenCalled();
  expect(onCommit).not.toHaveBeenCalled();
  fireEvent.pointerUp(slider);
  fireEvent.lostPointerCapture(slider);
  expect(onRate).toHaveBeenCalledTimes(1);
  expect(onRate).toHaveBeenCalledWith(7.5);
  expect(onCommit).toHaveBeenCalledTimes(1);
});

test.each(['pointerCancel', 'blur'])('%s finishes an interrupted drag once', (event) => {
  const onRate = jest.fn();
  render(<RatingSlider rating={2} onRate={onRate} formatValue={formatValue} />);
  const slider = screen.getByRole('slider');
  fireEvent.pointerDown(slider);
  fireEvent.change(slider, { target: { value: '8' } });
  fireEvent[event](slider);
  fireEvent.pointerUp(slider);
  expect(onRate).toHaveBeenCalledTimes(1);
  expect(onRate).toHaveBeenCalledWith(8);
});

test('keyboard/accessibility changes save immediately', () => {
  const onRate = jest.fn();
  render(<RatingSlider rating={2} onRate={onRate} formatValue={formatValue} />);
  fireEvent.change(screen.getByRole('slider'), { target: { value: '2.5' } });
  expect(onRate).toHaveBeenCalledWith(2.5);
});

test('incoming saved values do not interrupt an active drag', () => {
  const onRate = jest.fn();
  const { rerender } = render(<RatingSlider rating={2} onRate={onRate} formatValue={formatValue} />);
  const slider = screen.getByRole('slider');
  fireEvent.pointerDown(slider);
  fireEvent.change(slider, { target: { value: '8' } });
  rerender(<RatingSlider rating={3} onRate={onRate} formatValue={formatValue} />);
  expect(slider.value).toBe('8');
  fireEvent.pointerUp(slider);
  expect(onRate).toHaveBeenCalledWith(8);
});
