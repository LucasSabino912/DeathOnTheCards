import { render, screen, fireEvent } from '@testing-library/react';
import CantidadDeJugadores from '../../components/create/CantidadDeJugadores';

test('actualiza valores mínimo y máximo', () => {
  const setMin = vi.fn();
  const setMax = vi.fn();

  render(
    <CantidadDeJugadores
      jugadoresMin={2}
      setJugadoresMin={setMin}
      jugadoresMax={6}
      setJugadoresMax={setMax}
    />
  );

  const sliders = screen.getAllByRole('slider');
  fireEvent.change(sliders[0], { target: { value: '3' } });
  fireEvent.change(sliders[1], { target: { value: '5' } });

  expect(setMin).toHaveBeenCalledWith(3);
  expect(setMax).toHaveBeenCalledWith(5);
});
