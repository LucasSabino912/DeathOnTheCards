import { render, screen, fireEvent } from '@testing-library/react';
import Continuar from '../../components/create/Continuar';

test('valida nombre vacío', () => {
  const setError = vi.fn();
  const onContinue = vi.fn();

  render(<Continuar nombre="" setError={setError} onContinue={onContinue} />);

  fireEvent.click(screen.getByText('Crear Partida'));
  expect(setError).toHaveBeenCalledWith(
    'El nombre de la partida no puede estar vacío'
  );
});

test('valida caracteres inválidos', () => {
  const setError = vi.fn();
  const onContinue = vi.fn();

  render(
    <Continuar nombre="@@@" setError={setError} onContinue={onContinue} />
  );

  fireEvent.click(screen.getByText('Crear Partida'));
  expect(setError).toHaveBeenCalledWith(
    'El nombre de la partida solo puede contener letras, números y espacios'
  );
});

test('valida longitud máxima del nombre', () => {
  const setError = vi.fn();
  const onContinue = vi.fn();

  const nombreLargo = 'a'.repeat(201);
  render(<Continuar nombre={nombreLargo} setError={setError} onContinue={onContinue} />);

  fireEvent.click(screen.getByText('Crear Partida'));
  expect(setError).toHaveBeenCalledWith(
    'El nombre de la partida no puede tener más de 200 caracteres'
  );
});

test('llama a onContinue si todo es válido', () => {
  const setError = vi.fn();
  const onContinue = vi.fn();

  render(
    <Continuar
      nombre="PartidaValida"
      setError={setError}
      onContinue={onContinue}
    />
  );

  fireEvent.click(screen.getByText('Crear Partida'));
  expect(onContinue).toHaveBeenCalled();
  expect(setError).not.toHaveBeenCalled();
});
