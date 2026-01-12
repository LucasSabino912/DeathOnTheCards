import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

// 🔧 Mocks antes de los imports reales
vi.mock("../../context/GameContext.jsx", () => ({
  useGame: vi.fn(),
}));

import { useGame } from "../../context/GameContext.jsx";
import OneMoreSecretsModal from "../../components/modals/OneMoreSecretsModal.jsx";

describe("OneMoreSecretsModal", () => {
  const onConfirm = vi.fn();

  const renderModal = (mockState, isOpen = true) => {
    useGame.mockReturnValue({ gameState: mockState });
    return render(<OneMoreSecretsModal isOpen={isOpen} onConfirm={onConfirm} />);
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("no se renderiza si isOpen es false", () => {
    const state = { eventCards: { oneMore: { availableSecrets: [] } } };
    const { container } = renderModal(state, false);
    expect(container.firstChild).toBeNull();
  });

  it("muestra mensaje y botón Cerrar si no hay secretos", () => {
    const state = { eventCards: { oneMore: { availableSecrets: [] } } };
    renderModal(state);
    expect(screen.getByText(/No hay secretos revelados/i)).toBeTruthy();
    expect(screen.getByText(/Cerrar/i)).toBeTruthy();
  });

  it("renderiza correctamente los secretos agrupados por jugador", () => {
    const mockState = {
      jugadores: [
        { player_id: 1, name: "Flor" },
        { player_id: 2, name: "Bapu" },
      ],
      eventCards: {
        oneMore: {
          availableSecrets: [
            { id: 101, owner_id: 1 },
            { id: 102, owner_id: 2 },
          ],
        },
      },
    };
    renderModal(mockState);
    expect(screen.getByText("Flor")).toBeTruthy();
    expect(screen.getByText("Bapu")).toBeTruthy();
    expect(screen.getAllByAltText(/Secreto revelado/i).length).toBe(2);
  });

  it('usa nombre "Jugador <id>" si no encuentra el jugador', () => {
    const mockState = {
      jugadores: [],
      eventCards: { oneMore: { availableSecrets: [{ id: 999, owner_id: 42 }] } },
    };
    renderModal(mockState);
    expect(screen.getByText("Jugador 42")).toBeTruthy();
  });

  it("deshabilita el botón Confirmar al inicio y lo habilita al seleccionar", () => {
    const mockState = {
      jugadores: [{ player_id: 1, name: "Flor" }],
      eventCards: { oneMore: { availableSecrets: [{ id: 201, owner_id: 1 }] } },
    };
    renderModal(mockState);
    const button = screen.getByText("Confirmar");
    expect(button).toBeDisabled();
    fireEvent.click(screen.getByAltText(/Secreto revelado 201/i));
    expect(button).not.toBeDisabled();
  });

  it("resalta la carta seleccionada con la clase correcta", () => {
    const mockState = {
      jugadores: [{ player_id: 1, name: "Flor" }],
      eventCards: { oneMore: { availableSecrets: [{ id: 303, owner_id: 1 }] } },
    };
    const { container } = renderModal(mockState);
    const card = screen.getByAltText(/Secreto revelado 303/i);
    fireEvent.click(card);
    const selected = container.querySelector(".scale-105");
    expect(selected).toBeTruthy();
  });

  it("renderiza correctamente el título", () => {
    const state = { eventCards: { oneMore: { availableSecrets: [] } } };
    renderModal(state);
    expect(screen.getByText("Secretos Revelados")).toBeTruthy();
  });

  it("renderiza las imágenes con el src correcto", () => {
    const mockState = {
      jugadores: [{ player_id: 1, name: "Flor" }],
      eventCards: { oneMore: { availableSecrets: [{ id: 404, owner_id: 1 }] } },
    };
    renderModal(mockState);
    const img = screen.getByAltText(/Secreto revelado 404/i);
    expect(img.getAttribute("src")).toBe("/cards/secret_back.png");
  });

  it("cubre el camino visual del contenedor y overlay", () => {
    const state = { eventCards: { oneMore: { availableSecrets: [] } } };
    const { container } = renderModal(state);
    const overlay = container.querySelector(".fixed");
    const inner = container.querySelector("[class*='bg-']");
    expect(overlay).toBeTruthy();
    expect(inner).toBeTruthy();
  });
});
