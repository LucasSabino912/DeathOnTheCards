import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Secrets from "../../components/game/Secrets";
import * as GameContext from "../../context/GameContext";

const mockSecretos = [
  { id: 1, name: "You are the Murderer" },  // Imagen en IMAGE_MAP
  { id: 2, name: "You are the Accomplice" },// Imagen en IMAGE_MAP
  { id: 3, name: "Unknown Secret" },        // fallback back
];

vi.spyOn(GameContext, "useGame").mockReturnValue({ gameState: { secretos: mockSecretos } });

describe("Secrets component", () => {
  it("renderiza secretos y cambia imagen en hover", () => {
    render(<Secrets />);
    const buttons = screen.getAllByRole("button");
    const images = () => screen.getAllByRole("img");

    expect(buttons.length).toBe(3);
    images().forEach(img => expect(img.src).toContain("/cards/secret_front.png"));

    fireEvent.mouseEnter(buttons[0]);
    expect(images()[0].src).toContain("/cards/secret_murderer.png");

    fireEvent.mouseLeave(buttons[0]);
    fireEvent.mouseEnter(buttons[1]);
    expect(images()[1].src).toContain("/cards/secret_accomplice.png");

    fireEvent.mouseLeave(buttons[1]);
    fireEvent.mouseEnter(buttons[2]);
    expect(images()[2].src).toContain("/cards/secret_back.png");

    fireEvent.mouseLeave(buttons[2]);
    expect(images()[2].src).toContain("/cards/secret_front.png");
  });
});
