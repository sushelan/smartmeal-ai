// src/app/recipe-browsing/page.test.js
import { render, screen, waitFor } from "@testing-library/react";
import RecipesPage from "./page";
import "@testing-library/jest-dom";

// silence expected console.error
beforeAll(() => {
  jest.spyOn(console, "error").mockImplementation(() => {});
});
afterAll(() => {
  console.error.mockRestore();
});

global.fetch = jest.fn();

describe("RecipesPage", () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it("renders the nav bar and page title after loading", async () => {
    // stub a successful (empty) response
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ meals: [] }),
    });

    render(<RecipesPage />);

    // wait for loading → false
    await waitFor(() => {
      expect(screen.queryByText(/Loading recipes/i)).not.toBeInTheDocument();
    });

    expect(screen.getByText("SmartMeal")).toBeInTheDocument();
    expect(screen.getByText("Browse Recipes")).toBeInTheDocument();
  });

  it("shows loading then a recipe card with correct link and image", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        meals: [
          {
            idMeal: "123",
            strMeal: "Test Dish",
            strMealThumb: "/thumb.jpg",
            strArea: "TestLand",
            strCategory: "TestCat",
            strInstructions: "Do things",
          },
        ],
      }),
    });

    render(<RecipesPage />);
    expect(screen.getByText(/Loading recipes.../i)).toBeInTheDocument();

    await waitFor(() => screen.getByText("Test Dish"));

    const link = screen.getByRole("link", { name: /Test Dish/i });
    expect(link).toHaveAttribute("href", "/recipe-browsing/123");

    const img = screen.getByAltText("Test Dish");
    expect(img).toHaveAttribute("src", "/thumb.jpg");
  });

  it("renders multiple recipe cards when there are several meals", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        meals: [
          {
            idMeal: "A",
            strMeal: "Dish A",
            strMealThumb: "/a.jpg",
            strArea: "",
            strCategory: "",
            strInstructions: "",
          },
          {
            idMeal: "B",
            strMeal: "Dish B",
            strMealThumb: "/b.jpg",
            strArea: "",
            strCategory: "",
            strInstructions: "",
          },
        ],
      }),
    });

    render(<RecipesPage />);
    await waitFor(() => screen.getByText("Dish A"));

    // only pick links that point at our recipe-detail route
    const allLinks = screen.getAllByRole("link");
    const recipeLinks = allLinks.filter((ln) =>
      ln.getAttribute("href")?.startsWith("/recipe-browsing/")
    );
    expect(recipeLinks).toHaveLength(2);
    expect(recipeLinks[0]).toHaveAttribute("href", "/recipe-browsing/A");
    expect(recipeLinks[1]).toHaveAttribute("href", "/recipe-browsing/B");
  });

  it("renders footer links", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ meals: [] }),
    });

    render(<RecipesPage />);
    await waitFor(() =>
      expect(screen.getByText("Terms of Service")).toBeInTheDocument()
    );

    expect(screen.getByText("Privacy Policy")).toBeInTheDocument();
    expect(screen.getByText("Contact Us")).toBeInTheDocument();
  });

  it("handles fetch error path", async () => {
    fetch.mockResolvedValueOnce({ ok: false });
    render(<RecipesPage />);

    await waitFor(() =>
      expect(
        screen.getByText(/Failed to load recipes/i)
      ).toBeInTheDocument()
    );
  });
});
