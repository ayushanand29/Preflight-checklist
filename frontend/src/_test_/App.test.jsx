import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import App from "../App";
import axios from "axios";

// ---- MOCK AXIOS ----
jest.mock("axios");

beforeEach(() => {
  jest.clearAllMocks();

  axios.get.mockImplementation((url) => {
    // Mock checklist API
    if (url.includes("/api/checklist")) {
      return Promise.resolve({
        data: [
          { id: 1, checkItem: "Check Digital Sky for airspace clearance", status: "", comment: "" },
          { id: 2, checkItem: "WINDY DATA - at 0m alt, at 100m alt", status: "", comment: "" },
          { id: 3, checkItem: "Anemometer wind speed & Wind Direction", status: "", comment: "" },
          { id: 4, checkItem: "Inform the GC to power up the aircraft", status: "", comment: "" },
          { id: 5, checkItem: "Choose the respective mission", status: "", comment: "" },
          { id: 6, checkItem: "Write and read the mission", status: "", comment: "" },
          { id: 7, checkItem: "Reconfirm UAV heading and WP heading", status: "", comment: "" },
          { id: 8, checkItem: "Check WP numbering & altitudes.", status: "", comment: "" }
        ]
      });
    }

    // Mock flight info API
    if (url.includes("/api/flight-info")) {
      return Promise.resolve({
        data: {
          flightNumber: "",
          filedBy: "",
          filingTime: "",
          departureLocation: "",
          departureTime: "",
          arrivalLocation: "",
          arrivalTime: "",
          date: ""
        }
      });
    }

    return Promise.resolve({ data: [] });
  });

  axios.post.mockResolvedValue({ data: { success: true } });
  axios.delete.mockResolvedValue({ data: { success: true } });
});

// ---- TEST 1: Heading appears ----
test("renders PRE-FLIGHT CHECKLIST heading", async () => {
  render(<App />);
  const heading = await screen.findByText(/PRE-FLIGHT CHECKLIST:/i);
  expect(heading).toBeInTheDocument();
});

// ---- TEST 2: Default checklist rows render ----
test("renders all default checklist items", async () => {
  render(<App />);

  const expectedChecks = [
    "Check Digital Sky for airspace clearance",
    "WINDY DATA - at 0m alt, at 100m alt",
    "Anemometer wind speed & Wind Direction",
    "Inform the GC to power up the aircraft",
    "Choose the respective mission",
    "Write and read the mission",
    "Reconfirm UAV heading and WP heading",
    "Check WP numbering & altitudes."
  ];

  for (const check of expectedChecks) {
    expect(await screen.findByText(check)).toBeInTheDocument();
  }
});

// ---- TEST 3: Flight number field becomes editable ----
test("flight number field becomes editable", async () => {
  render(<App />);

  const flightNumberSpan = await screen.findByText(/Enter Flight Number/i);
  expect(flightNumberSpan).toBeInTheDocument();

  // Click to change into input box
  fireEvent.click(flightNumberSpan);

  // Should now see an input box
  const input = await screen.findByRole("textbox");
  expect(input).toBeInTheDocument();
});

// ---- TEST 4: Save Flight + Checklist button works ----
test("save button exists and triggers API call", async () => {
  render(<App />);

  const saveBtn = await screen.findByText(/Save Flight \+ Checklist/i);
  expect(saveBtn).toBeInTheDocument();

  fireEvent.click(saveBtn);

  await waitFor(() => {
    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(axios.post).toHaveBeenCalledWith(
      "http://localhost:5000/api/save-all",
      expect.any(Object)
    );
  });
});
