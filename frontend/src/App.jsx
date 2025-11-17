import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import React from "react";



function App() {
  // Top table editable fields
  const [flightInfo, setFlightInfo] = useState({
    flightNumber: "",
    date: "",
    filedBy: "",
    filingTime: "",
    departureLocation: "",
    departureTime: "",
    arrivalLocation: "",
    arrivalTime: ""
  });

  const [editingFlightField, setEditingFlightField] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);




  const defaultChecks = [
    "Check Digital Sky for airspace clearance",
    "WINDY DATA - at 0m alt, at 100m alt",
    "Anemometer wind speed & Wind Direction",
    "Inform the GC to power up the aircraft",
    "Choose the respective mission",
    "Write and read the mission",
    "Reconfirm UAV heading and WP heading",
    "Check WP numbering & altitudes."
  ];

  const [items, setItems] = useState([]);
  //const [editingId, setEditingId] = useState(null); delete

useEffect(() => {
  Promise.all([
    //axios.get("http://localhost:5000/api/checklist"),
    //axios.get("http://localhost:5000/api/flight-info")
  ]).then(([checklistRes, flightInfoRes]) => {
    const requiredItems = defaultChecks.map((txt, index) => ({
      id: index + 1,
      checkItem: txt,
      status: "",
      comment: ""
    }));
    setItems(requiredItems);
    setFlightInfo(flightInfoRes.data);
  });
}, []);

// Debug: log flightInfo changes
useEffect(() => {
  if (!flightInfo.flightNumber) return; // Skip on first load
  console.log("Flight info updated:", flightInfo);
}, [flightInfo]);
function saveFlightField(field, value) {
  const updated = { ...flightInfo, [field]: value };
  setFlightInfo(updated);
  setEditingFlightField(null);
}
function saveEntireForm() {
  const payload = {
    flightInfo,
    checklist: items
  };

  axios
    .post("http://localhost:5000/api/save-all", payload)
    .then((res) => {
      alert("Flight info and checklist saved successfully!");
    })
    .catch((err) => {
      console.error("Failed to save data:", err);
      alert("Error saving data");
    });
}




  // Persist the full flight info to backend (manual Save button)
  function saveAllFlightInfo() {
    axios
      .put("http://localhost:5000/api/flight-info", flightInfo)
      .then((res) => {
        // If server returns saved object, use it; otherwise keep local state
        if (res.data) setFlightInfo(res.data);
      })
      .catch((err) => {
        console.error("Failed to save flight info:", err);
      });
  }

  // Save the top table values
  function handleTopFieldSave(field, value) {
    setFlightInfo({ ...flightInfo, [field]: value });
    setEditingField(null);
  }

  return (
    <div className="container">

      <h1 className="title">PRE-FLIGHT CHECKLIST:</h1>

     <div className="top-row">

<div>
  <b>FLIGHT NUMBER:</b>

  {/* Display Mode */}
  {editingFlightField !== "flightNumber" && (
    <span
      onClick={() => setEditingFlightField("flightNumber")}
      style={{ cursor: "pointer", marginLeft: "10px", borderBottom: "1px dashed black" }}
    >
      {flightInfo.flightNumber || "Enter Flight Number"}
    </span>
  )}

  {/* Edit Mode */}
  {editingFlightField === "flightNumber" && (
    <input
      autoFocus
      className="top-input"
      defaultValue={flightInfo.flightNumber}
      style={{ marginLeft: "10px" }}
      onBlur={(e) => {
  const val = e.target.value.trim();

  if (!val) return;

  // --- 1️⃣ Fetch flight info ---
  axios
    .get(`http://localhost:5000/api/flight-info?flightNumber=${encodeURIComponent(val)}`)
    .then((res) => {
      const apiData = Array.isArray(res.data) ? res.data[0] : res.data;

      if (!apiData) {
        // ❌ Flight number does NOT exist → clear everything
        setFlightInfo({
          flightNumber: val,
          date: "",
          filedBy: "",
          filingTime: "",
          departureLocation: "",
          departureTime: "",
          arrivalLocation: "",
          arrivalTime: ""
        });

        // Reset checklist to default
        setItems(
          defaultChecks.map((txt, index) => ({
            id: index + 1,
            checkItem: txt,
            status: "",
            comment: ""
          }))
        );

        return;
      }

      // ✔ Flight Number exists → load flight info
      const newFlightInfo = {
        flightNumber: val,
        date: apiData.flightDate || apiData.date || "",
        filedBy: apiData.filedBy || "",
        filingTime: apiData.filingTime || "",
        departureLocation: apiData.departureLocation || "",
        departureTime: apiData.departureTime || "",
        arrivalLocation: apiData.arrivalLocation || "",
        arrivalTime: apiData.arrivalTime || ""
      };

      setFlightInfo(newFlightInfo);

      // --- 2️⃣ Fetch checklist for the same flight ---
      axios
        .get(`http://localhost:5000/api/checklist?flightNumber=${encodeURIComponent(val)}`)
        .then((chkRes) => {
          const checklistRows = chkRes.data;

          if (!checklistRows || checklistRows.length === 0) {
            // No checklist in DB → show default
            setItems(
              defaultChecks.map((txt, index) => ({
                id: index + 1,
                checkItem: txt,
                status: "",
                comment: ""
              }))
            );
          } else {
            // Checklist found
            const updated = checklistRows.map((row, index) => ({
              id: index + 1,
              checkItem: row.checkItem,
              status: row.status || "",
              comment: row.comment || ""
            }));
            setItems(updated);
          }
        });
    })
    .catch((err) => {
      console.error("Flight info fetch failed:", err);

      // Clear everything on error
      setFlightInfo({
        flightNumber: val,
        date: "",
        filedBy: "",
        filingTime: "",
        departureLocation: "",
        departureTime: "",
        arrivalLocation: "",
        arrivalTime: ""
      });

      setItems(
        defaultChecks.map((txt, index) => ({
          id: index + 1,
          checkItem: txt,
          status: "",
          comment: ""
        }))
      );
    });
}}
    />
  )}
</div>

      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
  <b>DATE:</b>

  {!showDatePicker ? (
    // --- Click to Show Date Picker ---
    <span
      onClick={() => setShowDatePicker(true)}
      style={{
        cursor: "pointer",
        borderBottom: "1px dashed black",
        padding: "4px 6px"
      }}
    >
      {flightInfo.date ? flightInfo.date : "Select Date"}
    </span>
  ) : (
    // --- Calendar Picker ---
    <div style={{ position: "relative" }}>
      <DatePicker
        selected={selectedDate}
        onChange={(date) => {
          setSelectedDate(date);
          const formatted = date.toLocaleDateString("en-GB"); // DD/MM/YYYY

          // Save to backend
          saveFlightField("date", formatted);

          // Close calendar
          setShowDatePicker(false);
        }}
        inline
      />
    </div>
  )}

  <span
    onClick={() => setShowDatePicker(true)}
    style={{
      cursor: "pointer",
      fontSize: "18px",
      marginLeft: "8px"
    }}
  >
    📅
  </span>
</div>


      </div>


            {/* TOP INFORMATION TABLE */}
      <table className="info-table">
        <tbody>
          {/* ROW 1 */}
          <tr>
            <td>Filed By</td>
           <td onClick={() => setEditingFlightField("filedBy")}>
            {editingFlightField === "filedBy" ? (
              <input
                autoFocus
                className="top-input"
                value={flightInfo.filedBy}
                onChange={(e) => setFlightInfo({ ...flightInfo, filedBy: e.target.value })}
                onBlur={() => setEditingFlightField(null)}
              />
            ) : (
              flightInfo.filedBy
              )}
              </td>


            <td>Filing Time</td>
            <td onClick={() => setEditingFlightField("filingTime")}>
              {editingFlightField === "filingTime" ? (
                  <input
                    autoFocus
                    className="top-input"
                    value={flightInfo.filingTime}
                    onChange={(e) => setFlightInfo({ ...flightInfo, filingTime: e.target.value })}
                    onBlur={() => setEditingFlightField(null)}
                  />
              ) : (
                flightInfo.filingTime
              )}
            </td>
          </tr>

          {/* ROW 2 */}
          <tr>
            <td>Departure Location</td>
            <td onClick={() => setEditingFlightField("departureLocation")}>
              {editingFlightField === "departureLocation" ? (
                <input
                  autoFocus
                  className="top-input"
                  value={flightInfo.departureLocation}
                  onChange={(e) => setFlightInfo({ ...flightInfo, departureLocation: e.target.value })}
                  onBlur={() => setEditingFlightField(null)}
                />
              ) : (
                flightInfo.departureLocation
              )}
            </td>

            <td>Departure Time</td>
            <td onClick={() => setEditingFlightField("departureTime")}>
              {editingFlightField === "departureTime" ? (
                  <input
                    autoFocus
                    className="top-input"
                    value={flightInfo.departureTime}
                    onChange={(e) => setFlightInfo({ ...flightInfo, departureTime: e.target.value })}
                    onBlur={() => setEditingFlightField(null)}
                  />
              ) : (
                flightInfo.departureTime
              )}
            </td>
          </tr>

          {/* ROW 3 */}
          <tr>
            <td>Arrival Location</td>
            <td onClick={() => setEditingFlightField("arrivalLocation")}>
              {editingFlightField === "arrivalLocation" ? (
                <input
                  autoFocus
                  className="top-input"
                  value={flightInfo.arrivalLocation}
                  onChange={(e) => setFlightInfo({ ...flightInfo, arrivalLocation: e.target.value })}
                  onBlur={() => setEditingFlightField(null)}
                />
              ) : (
                flightInfo.arrivalLocation
              )}
            </td>

            <td>Est. Arrival Time</td>
            <td onClick={() => setEditingFlightField("arrivalTime")}>
              {editingFlightField === "arrivalTime" ? (
                  <input
                    autoFocus
                    className="top-input"
                    value={flightInfo.arrivalTime}
                    onChange={(e) => setFlightInfo({ ...flightInfo, arrivalTime: e.target.value })}
                    onBlur={() => setEditingFlightField(null)}
                  />
              ) : (
                flightInfo.arrivalTime
              )}
            </td>
          </tr>
        </tbody>
      </table>


      {/* PREFLIGHT CHECKS */}
      <h2 className="subheading">Preflight Checks</h2>

      <table className="checklist-table">
        <thead>
          <tr>
            <th>CHECKS</th>
            <th>STATUS</th>
            <th>COMMENT(S)</th>
          </tr>
        </thead>

        <tbody>
  {items.map((item) => (
    <tr key={item.id}>
      {/* CHECK NAME (non-editable) */}
      <td>{item.checkItem}</td>

      {/* STATUS DROPDOWN */}
      <td>
        <select
          className="row-input"
          value={item.status}
          onChange={(e) =>
            setItems(items.map((i) =>
              i.id === item.id ? { ...i, status: e.target.value } : i
            ))
          }
        >
          <option value="">--</option>
          <option value="Pending">Pending</option>
          <option value="Completed">Completed</option>
          <option value="Not Required">Not Required</option>
        </select>
      </td>

      {/* COMMENT FIELD */}
      <td>
        <input
          className="row-input"
          value={item.comment}
          onChange={(e) =>
            setItems(items.map((i) =>
              i.id === item.id ? { ...i, comment: e.target.value } : i
            ))
          }
        />
      </td>

    </tr>
  ))}
</tbody>

      </table>

      <div style={{ marginTop: 20, textAlign: "right" }}>
  <button onClick={saveEntireForm}>Save Flight + Checklist</button>
</div>

<div style={{ marginTop: 10, textAlign: "right" }}>
  <button
    style={{ background: "red" }}
    onClick={() => {
      if (!flightInfo.flightNumber) {
        alert("Enter a flight number first");
        return;
      }

      axios
        .delete(
          `http://localhost:5000/api/delete-flight?flightNumber=${flightInfo.flightNumber}`
        )
        .then(() => {
          alert("Deleted successfully");

          // Clear UI
          setFlightInfo({
            flightNumber: "",
            date: "",
            filedBy: "",
            filingTime: "",
            departureLocation: "",
            departureTime: "",
            arrivalLocation: "",
            arrivalTime: ""
          });

          setItems(
            defaultChecks.map((txt, index) => ({
              id: index + 1,
              checkItem: txt,
              status: "",
              comment: ""
            }))
          );
        });
    }}
  >
    Delete Flight + Checklist
  </button>
</div>
    </div>
  );
}

export default App;
