import { render, screen } from "@testing-library/react";
import TabPanel from "../../components/game/TabPanel";

describe("TabPanel component", () => {
  it("renderiza correctamente los children y la clase", () => {
    render(
      <TabPanel label="Detalles">
        <p>Contenido del tab</p>
      </TabPanel>
    );

    const content = screen.getByText("Contenido del tab");
    expect(content).toBeInTheDocument();

    const container = content.closest("div");
    expect(container).toHaveClass("tab-panel");
  });

  it("acepta la prop label aunque no se use", () => {
    const { container } = render(<TabPanel label="Información adicional">Texto</TabPanel>);
    expect(container).toBeInTheDocument();
  });
});
