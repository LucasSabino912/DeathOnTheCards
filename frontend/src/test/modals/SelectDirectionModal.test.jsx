import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import SelectDirectionModal from "../../components/modals/SelectDirectionModal";

// Mock del botón común
vi.mock("../../components/common/Button.jsx", () => ({
  __esModule: true,
  default: ({ onClick, disabled, children }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      data-testid="mock-button"
    >
      {children}
    </button>
  ),
}));

describe("SelectDirectionModal", () => {
  const defaultProps = {
    isOpen: true,
    onConfirm: vi.fn(),
  };

  const renderModal = (props = {}) =>
    render(<SelectDirectionModal {...defaultProps} {...props} />);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("no renderiza nada si isOpen es false", () => {
    renderModal({ isOpen: false });
    expect(
      screen.queryByText("Elige la dirección de rotación")
    ).toBeNull();
  });

  it("renderiza correctamente el título y las opciones", () => {
    renderModal();
    expect(
      screen.getByText("Elige la dirección de rotación")
    ).toBeInTheDocument();
    expect(screen.getByText("IZQUIERDA")).toBeInTheDocument();
    expect(screen.getByText("DERECHA")).toBeInTheDocument();
    expect(screen.getByText("⬅️")).toBeInTheDocument();
    expect(screen.getByText("➡️")).toBeInTheDocument();
  });

  it("aplica las clases de estilo esperadas al contenedor principal", () => {
    renderModal();
    const modal = screen.getByText("Elige la dirección de rotación").closest("div");
    expect(modal).toHaveClass("bg-[#1D0000]", "border-4", "border-[#825012]");
  });

  it("no llama a onConfirm si no hay selección al presionar Confirmar", () => {
    const onConfirm = vi.fn();
    renderModal({ onConfirm });
    fireEvent.click(screen.getByTestId("mock-button"));
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("permite seleccionar la dirección IZQUIERDA", () => {
    renderModal();
    const leftCard = screen.getByText("IZQUIERDA").parentElement;
    const rightCard = screen.getByText("DERECHA").parentElement;

    // Inicialmente sin selección
    expect(leftCard).not.toHaveClass("outline-[#FFD700]");
    expect(rightCard).not.toHaveClass("outline-[#FFD700]");

    fireEvent.click(leftCard);
    expect(leftCard).toHaveClass("outline-[#FFD700]");
    expect(rightCard).not.toHaveClass("outline-[#FFD700]");
  });

  it("permite seleccionar la dirección DERECHA", () => {
    renderModal();
    const rightCard = screen.getByText("DERECHA").parentElement;
    fireEvent.click(rightCard);
    expect(rightCard).toHaveClass("outline-[#FFD700]");
  });

  it("solo una dirección puede estar seleccionada a la vez", () => {
    renderModal();
    const leftCard = screen.getByText("IZQUIERDA").parentElement;
    const rightCard = screen.getByText("DERECHA").parentElement;

    fireEvent.click(leftCard);
    expect(leftCard).toHaveClass("outline-[#FFD700]");

    fireEvent.click(rightCard);
    expect(leftCard).not.toHaveClass("outline-[#FFD700]");
    expect(rightCard).toHaveClass("outline-[#FFD700]");
  });

  it("habilita el botón de confirmar solo después de seleccionar una dirección", () => {
    renderModal();
    const button = screen.getByTestId("mock-button");
    const leftCard = screen.getByText("IZQUIERDA").parentElement;

    expect(button).toBeDisabled();
    fireEvent.click(leftCard);
    expect(button).not.toBeDisabled();
  });

  it("llama onConfirm con 'LEFT' al seleccionar izquierda y confirmar", () => {
    const onConfirm = vi.fn();
    renderModal({ onConfirm });
    const leftCard = screen.getByText("IZQUIERDA").parentElement;
    const button = screen.getByTestId("mock-button");

    fireEvent.click(leftCard);
    fireEvent.click(button);

    expect(onConfirm).toHaveBeenCalledWith("LEFT");
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("llama onConfirm con 'RIGHT' al seleccionar derecha y confirmar", () => {
    const onConfirm = vi.fn();
    renderModal({ onConfirm });
    const rightCard = screen.getByText("DERECHA").parentElement;
    const button = screen.getByTestId("mock-button");

    fireEvent.click(rightCard);
    fireEvent.click(button);

    expect(onConfirm).toHaveBeenCalledWith("RIGHT");
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("aplica las clases de transición y hover a las cartas", () => {
    renderModal();
    const cards = screen.getAllByText(/IZQUIERDA|DERECHA/).map(p => p.parentElement);
    cards.forEach(card => {
      expect(card).toHaveClass(
        "cursor-pointer",
        "transition-all",
        "hover:scale-105",
        "rounded-xl"
      );
    });
  });

  it("muestra correctamente el texto y color del título", () => {
    renderModal();
    const title = screen.getByText("Elige la dirección de rotación");
    expect(title).toHaveClass("text-[#FFE0B2]", "text-2xl", "font-semibold");
  });

  it("aplica el estilo correcto a las etiquetas IZQUIERDA y DERECHA", () => {
    renderModal();
    const leftLabel = screen.getByText("IZQUIERDA");
    const rightLabel = screen.getByText("DERECHA");

    expect(leftLabel).toHaveClass("text-lg", "font-bold", "text-[#B49150]");
    expect(rightLabel).toHaveClass("text-lg", "font-bold", "text-[#B49150]");
  });
});
