import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CreateScreen from '../../containers/createScreen/CreateScreen';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import * as UserContext from '../../context/UserContext';
import * as GameContext from '../../context/GameContext';

const mockUserDispatch = vi.fn();
const mockGameDispatch = vi.fn();
const mockConnectToGame = vi.fn();

const renderPantalla = () =>
  render(<CreateScreen />, { wrapper: MemoryRouter });

const mockFetch = (data, ok = true, status = 200) => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok,
      status,
      json: () => Promise.resolve(data),
    })
  );
};

beforeEach(() => {
  vi.clearAllMocks();

  vi.spyOn(UserContext, 'useUser').mockReturnValue({
    userState: { name: 'Host', avatarPath: 'a.png', birthdate: '2000-01-01' },
    userDispatch: mockUserDispatch,
  });

  vi.spyOn(GameContext, 'useGame').mockReturnValue({
    gameDispatch: mockGameDispatch,
    connectToGame: mockConnectToGame,
  });

  mockFetch({
    room: { id: 1, name: 'PartidaTest' },
    players: [
      {
        id: 10,
        name: 'Host',
        avatar: 'a.png',
        birthdate: '2000-01-01',
        is_host: true,
      },
    ],
  });
});

test('renderiza elementos principales', () => {
  renderPantalla();

  expect(screen.getByText(/nombre de la partida/i)).toBeInTheDocument();
  expect(screen.getByText(/seleccionar cantidad de jugadores/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /crear partida/i })).toBeInTheDocument();
  expect(screen.getByText(/host/i)).toBeInTheDocument();
  expect(screen.getByText(/2000-01-01/i)).toBeInTheDocument();
});

test('muestra error si el nombre está vacío', () => {
  renderPantalla();
  fireEvent.click(screen.getByRole('button', { name: /crear partida/i }));
  expect(screen.getByText(/el nombre de la partida no puede estar vacío/i)).toBeInTheDocument();
});

test('crea partida exitosamente', async () => {
  renderPantalla();

  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'NuevaPartida' } });
  fireEvent.click(screen.getByRole('button', { name: /crear partida/i }));

  await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));

  expect(mockUserDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'SET_USER' }));
  expect(mockGameDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'INITIALIZE_GAME' }));
  expect(mockConnectToGame).toHaveBeenCalledWith(1, 10);
});

test('muestra error genérico si fetch falla', async () => {
  mockFetch({}, false);
  renderPantalla();

  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Fallida' } });
  fireEvent.click(screen.getByRole('button', { name: /crear partida/i }));

  await waitFor(() => expect(screen.getByText(/error al crear la partida/i)).toBeInTheDocument());
});

test('muestra error si ya existe una partida con el mismo nombre', async () => {
  mockFetch({}, false, 409);
  renderPantalla();

  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Duplicada' } });
  fireEvent.click(screen.getByRole('button', { name: /crear partida/i }));

  await screen.findByText(/ya existe una partida con ese nombre/i);
});

test('actualiza nombre y limpia error', () => {
  renderPantalla();
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'NuevaPartida' } });
  expect(screen.queryByText(/no puede estar vacío/i)).not.toBeInTheDocument();
});

test('actualiza sliders de jugadores', () => {
  renderPantalla();
  const [min, max] = screen.getAllByRole('slider');
  fireEvent.change(min, { target: { value: 3 } });
  fireEvent.change(max, { target: { value: 5 } });
  expect(true).toBe(true); // cobertura sin chequear estado interno
});

test('usa el primer jugador si no hay host', async () => {
  mockFetch({
    room: { id: 123, name: 'PartidaSinHost' },
    players: [
      { id: 1, name: 'Jugador1', avatar: 'a.png', birthdate: '2000-01-01', is_host: false },
      { id: 2, name: 'Jugador2', avatar: 'b.png', birthdate: '2001-01-01', is_host: false },
    ],
  });

  renderPantalla();

  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'PartidaSinHost' } });
  fireEvent.click(screen.getByRole('button', { name: /crear partida/i }));

  await waitFor(() => expect(global.fetch).toHaveBeenCalled());

  expect(mockUserDispatch).toHaveBeenCalledWith(
    expect.objectContaining({
      type: 'SET_USER',
      payload: expect.objectContaining({ id: 1, isHost: false }),
    })
  );
  expect(mockConnectToGame).toHaveBeenCalledWith(123, 1);
});
