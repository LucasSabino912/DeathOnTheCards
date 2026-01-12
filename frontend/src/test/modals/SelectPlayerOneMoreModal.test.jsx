import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

// 🔧 Mocks antes de los imports reales
vi.mock("../../context/GameContext.jsx", () => ({
  useGame: vi.fn(),
}));
vi.mock("../../context/UserContext.jsx", () => ({
  useUser: vi.fn(),
}));

import { useGame } from "../../context/GameContext.jsx";
import { useUser } from "../../context/UserContext.jsx";
import SelectPlayerOneMoreModal from "../../components/modals/SelectPlayerOneMoreModal.jsx";

describe("SelectPlayerOneMoreModal", () => {
  const onConfirm = vi.fn();
  const mockUser = { id: 99, name: "Tester" };

  const renderModal = (mockGameState, isOpen = true) => {
    useGame.mockReturnValue({ gameState: mockGameState });
    useUser.mockReturnValue({ userState: mockUser });
    return render(<SelectPlayerOneMoreModal isOpen={isOpen} onConfirm={onConfirm} />);
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("no se renderiza si isOpen es false", () => {
    const { container } = renderModal({ jugadores: [] }, false);
    expect(container.firstChild).toBeNull();
  });

  it("renderiza jugadores y avatares correctamente", () => {
    const mockState = {
      jugadores: [
        { player_id: 1, name: "Flor", avatar_src: "./img1.png" },
        { player_id: 2, name: "Bapu", avatar_src: "./img2.png" },
      ],
    };
    renderModal(mockState);
    expect(screen.getByText("Flor")).toBeTruthy();
    expect(screen.getByText("Bapu")).toBeTruthy();
    const imgs = screen.getAllByRole("img");
    expect(imgs.length).toBe(2);
    expect(imgs[0].getAttribute("src")).toContain("img1");
  });

  it("usa imagen por defecto si no hay avatar_src", () => {
    const mockState = {
      jugadores: [{ player_id: 1, name: "Flor", avatar_src: null }],
    };
    renderModal(mockState);
    const img = screen.getByRole("img");
    expect(img.getAttribute("src")).toBe("/default-avatar.png");
  });

  it("permite seleccionar jugador y aplica estilo seleccionado", () => {
    const mockState = {
      jugadores: [{ player_id: 1, name: "Flor" }],
    };
    const { container } = renderModal(mockState);
    const card = screen.getByText("Flor");
    fireEvent.click(card);
    const selected = container.querySelector(".outline");
    expect(selected).toBeTruthy();
  });

  it("deshabilita Confirmar si no hay selección", () => {
    const mockState = { jugadores: [{ player_id: 1, name: "Flor" }] };
    renderModal(mockState);
    const button = screen.getByText("Confirmar");
    expect(button).toBeDisabled();
  });

  it("habilita Confirmar al seleccionar y llama onConfirm", () => {
    const mockState = { jugadores: [{ player_id: 1, name: "Flor" }] };
    renderModal(mockState);
    const card = screen.getByText("Flor");
    const button = screen.getByText("Confirmar");
    fireEvent.click(card);
    expect(button).not.toBeDisabled();
    fireEvent.click(button);
    expect(onConfirm).toHaveBeenCalledWith(1);
  });

  it("estructura general del modal (sin error por Tailwind)", () => {
    const mockState = { jugadores: [{ player_id: 1, name: "Flor" }] };
    const { container } = renderModal(mockState);
    const overlay = container.querySelector(".fixed");
    const box = container.querySelector("[class*='bg-']");
    expect(overlay).toBeTruthy();
    expect(box).toBeTruthy();
  });

  it("muestra correctamente estilos de texto", () => {
    const mockState = { jugadores: [{ player_id: 1, name: "Flor" }] };
    renderModal(mockState);
    expect(screen.getByText(/Elegí un jugador/i)).toBeTruthy();
    expect(screen.getByText("Flor")).toBeTruthy();
  });
});
