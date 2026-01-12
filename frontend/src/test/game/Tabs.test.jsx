import { render, screen, fireEvent } from "@testing-library/react";
import Tabs from "../../components/game/Tabs";
import TabPanel from "../../components/game/TabPanel";

describe("Tabs component", () => {
  it("renderiza los tabs y muestra el primero activo por defecto", () => {
    render(
      <Tabs>
        <TabPanel label="Tab 1">Contenido 1</TabPanel>
        <TabPanel label="Tab 2">Contenido 2</TabPanel>
      </Tabs>
    );

    const tab1Button = screen.getByText("Tab 1");
    const tab2Button = screen.getByText("Tab 2");
    expect(tab1Button).toBeInTheDocument();
    expect(tab2Button).toBeInTheDocument();

    expect(screen.getByText("Contenido 1")).toBeInTheDocument();

    expect(tab1Button.className).toMatch(/text-white/);

    expect(tab2Button.className).toMatch(/text-gray-300/);
  });

  it("cambia de tab al hacer click y actualiza clases", () => {
    render(
      <Tabs>
        <TabPanel label="Tab A">Panel A</TabPanel>
        <TabPanel label="Tab B">Panel B</TabPanel>
        <TabPanel label="Tab C">Panel C</TabPanel>
      </Tabs>
    );

    const tabA = screen.getByText("Tab A");
    const tabB = screen.getByText("Tab B");
    const tabC = screen.getByText("Tab C");

    fireEvent.click(tabB);
    expect(screen.getByText("Panel B")).toBeInTheDocument();
    expect(tabB.className).toMatch(/text-white/);
    expect(tabA.className).toMatch(/text-gray-300/);

    fireEvent.click(tabC);
    expect(screen.getByText("Panel C")).toBeInTheDocument();
    expect(tabC.className).toMatch(/text-white/);
  });

  it("no rompe si solo hay un hijo", () => {
    render(
      <Tabs>
        <TabPanel label="Único">Contenido único</TabPanel>
      </Tabs>
    );

    expect(screen.getByText("Único")).toBeInTheDocument();
    expect(screen.getByText("Contenido único")).toBeInTheDocument();
  });
});
