import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import SelectQtyModal from "../../components/modals/SelectQtyModal.jsx";

describe("SelectQtyModal", () => {
  const onConfirm = vi.fn();

  const renderModal = (isOpen = true) => render(<SelectQtyModal isOpen={isOpen} onConfirm={onConfirm} />);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("no se renderiza si isOpen es false", () => {
    const { container } = renderModal(false);
    expect(container.firstChild).toBeNull();
  });

  it("renderiza correctamente el título y subtítulo", () => {
    renderModal();
    expect(screen.getByText("Delay the Murderer’s Escape")).toBeTruthy();
    expect(screen.getByText(/Elegí cuántas cartas querés devolver/i)).toBeTruthy();
  });

  it("muestra la cantidad inicial en 1", () => {
    renderModal();
    expect(screen.getByText("1")).toBeTruthy();
  });

  it("incrementa la cantidad al hacer clic en +", () => {
    renderModal();
    const plus = screen.getByText("+");
    fireEvent.click(plus);
    expect(screen.getByText("2")).toBeTruthy();
  });

  it("no permite superar 5 al hacer clic muchas veces", () => {
    renderModal();
    const plus = screen.getByText("+");
    for (let i = 0; i < 10; i++) fireEvent.click(plus);
    expect(screen.getByText("5")).toBeTruthy();
  });

  it("decrementa la cantidad al hacer clic en −", () => {
    renderModal();
    const plus = screen.getByText("+");
    const minus = screen.getByText("−");
    fireEvent.click(plus);
    fireEvent.click(plus);
    expect(screen.getByText("3")).toBeTruthy();
    fireEvent.click(minus);
    expect(screen.getByText("2")).toBeTruthy();
  });

  it("no permite bajar de 1 al hacer clic en − repetidamente", () => {
    renderModal();
    const minus = screen.getByText("−");
    for (let i = 0; i < 5; i++) fireEvent.click(minus);
    expect(screen.getByText("1")).toBeTruthy();
  });

  it("llama a onConfirm con la cantidad correcta", () => {
    renderModal();
    const plus = screen.getByText("+");
    fireEvent.click(plus);
    fireEvent.click(plus);
    const confirm = screen.getByText("Confirmar");
    fireEvent.click(confirm);
    expect(onConfirm).toHaveBeenCalledWith(3);
  });

  it("reinicia la cantidad a 1 después de confirmar", () => {
    renderModal();
    const plus = screen.getByText("+");
    fireEvent.click(plus);
    fireEvent.click(screen.getByText("Confirmar"));
    expect(screen.getByText("1")).toBeTruthy();
  });

  it("aplica las clases y estructura visual principales", () => {
    const { container } = renderModal();
    const overlay = container.querySelector(".fixed");
    const innerBox = container.querySelector("[class*='rounded-2xl']");
    expect(overlay).toBeTruthy();
    expect(innerBox).toBeTruthy();
  });
});
