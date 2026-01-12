import { render, screen, fireEvent } from '@testing-library/react';
import NombreDePartida from '../../components/create/NombreDePartida';

test('actualiza el nombre y limpia el error', () => {
  const setNombrePartida = vi.fn();
  const setError = vi.fn();

  render(
    <NombreDePartida
      nombre_partida=""
      setNombrePartida={setNombrePartida}
      setError={setError}
    />
  );

  const input = screen.getByRole('textbox');
  fireEvent.change(input, { target: { value: 'NuevaPartida' } });

  expect(setNombrePartida).toHaveBeenCalledWith('NuevaPartida');
  expect(setError).toHaveBeenCalledWith('');
});
