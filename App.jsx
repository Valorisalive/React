import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedBloodGroup, setSelectedBloodGroup] = useState("All");
  const [searchCity, setSearchCity] = useState("");

  const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

  // Fetch donors on component mount
  useEffect(() => {
    fetchDonors();
  }, []);

  // Fetch function with proper error handling
  const fetchDonors = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        "https://jsonplaceholder.typicode.com/users"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch donors");
      }

      const data = await response.json();

      // Transform API users into donors
      const donorsWithExtra = data.map((user) => ({
        id: user.id,
        name: user.name,
        city: user.address.city,

        // deterministic blood group 
        bloodGroup: bloodGroups[user.id % bloodGroups.length],

        // random availability 
        available: Math.random() > 0.3,

        requestSent: false,
      }));

      setDonors(donorsWithExtra);

    } catch (error) {
      console.error("Error fetching donors:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter donors dynamically (no duplicate state)
  const filteredDonors = donors.filter((donor) => {
    const matchesBlood =
      selectedBloodGroup === "All" ||
      donor.bloodGroup === selectedBloodGroup;

    const matchesCity =
      donor.city.toLowerCase().includes(searchCity.toLowerCase());

    return matchesBlood && matchesCity;
  });

  // Handle request button click safely
  const handleRequest = (id) => {
    setDonors((prevDonors) =>
      prevDonors.map((donor) =>
        donor.id === id
          ? { ...donor, requestSent: true }
          : donor
      )
    );
  };

  // Count available donors
  const availableCount = filteredDonors.filter(
    (donor) => donor.available
  ).length;

  return (
    <div className="container">
      <h1>Community Blood Donor Finder</h1>

      {/* Filters */}
      <div className="controls">

        <select
          value={selectedBloodGroup}
          onChange={(e) => setSelectedBloodGroup(e.target.value)}
        >
          <option value="All">All Blood Groups</option>

          {bloodGroups.map((group) => (
            <option key={group} value={group}>
              {group}
            </option>
          ))}

        </select>

        <input
          type="text"
          placeholder="Search by city..."
          value={searchCity}
          onChange={(e) => setSearchCity(e.target.value)}
        />

      </div>

      {/* Counts */}
      <p>Total donors: {filteredDonors.length}</p>
      <p>Available donors: {availableCount}</p>

      {/* Loading */}
      {loading && (
        <p className="loading">Loading donors...</p>
      )}

      {/* Empty state */}
      {!loading && filteredDonors.length === 0 && (
        <p>No donors found</p>
      )}

      {/* Donor cards */}
      {!loading && (
        <div className="donor-grid">

          {filteredDonors.map((donor) => (

            <div key={donor.id} className="donor-card">

              <h3>{donor.name}</h3>

              <p>
                <strong>Blood Group:</strong> {donor.bloodGroup}
              </p>

              <p>
                <strong>City:</strong> {donor.city}
              </p>

              <p
                className={
                  donor.available
                    ? "available"
                    : "not-available"
                }
              >
                {donor.available
                  ? "Available"
                  : "Not Available"}
              </p>

              <button
                disabled={
                  !donor.available ||
                  donor.requestSent
                }
                onClick={() => handleRequest(donor.id)}
              >
                {donor.requestSent
                  ? "Request Sent"
                  : "Request Help"}
              </button>

            </div>

          ))}

        </div>
      )}

    </div>
  );
}

export default App;