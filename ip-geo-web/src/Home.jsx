import React, { useEffect, useState } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const IPV4_REGEX =
  /^(25[0-5]|2[0-4]\d|1?\d{1,2})(\.(25[0-5]|2[0-4]\d|1?\d{1,2})){3}$/;
const IPV6_REGEX = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;

export default function Home({ api, user, onLogout }) {
  const [geo, setGeo] = useState(null);
  const [query, setQuery] = useState("");
  const [history, setHistory] = useState([]);
  const [selected, setSelected] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCurrent();
    fetchHistory();
  }, []);

  // Fix missing default icon
  delete L.Icon.Default.prototype._getIconUrl;

  L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
  });

  function RecenterMap({ lat, lng }) {
    const map = useMap();
    useEffect(() => {
      if (lat && lng) {
        map.setView([lat, lng]);
      }
    }, [lat, lng]);
    return null;
  }

  async function loadCurrent() {
    try {
      setLoading(true);
      const res = await axios.get(api + "/api/geo");
      setGeo(res.data);
    } catch {
      setError("Failed to load geo");
    } finally {
      setLoading(false);
    }
  }

  async function fetchHistory() {
    try {
      const res = await axios.get(api + "/api/history");
      setHistory(res.data.history || []);
    } catch {
      /* ignore */
    }
  }

  const isValidIp = (s) => IPV4_REGEX.test(s) || IPV6_REGEX.test(s);

  async function handleSearch(e) {
    e && e.preventDefault();
    setError(null);
    if (!query) return;
    if (!isValidIp(query)) {
      setError("❌ Not a valid IP address");
      return;
    }
    try {
      setLoading(true);
      const res = await axios.get(api + "/api/geo/" + query);
      setGeo(res.data);
      await axios.post(api + "/api/history", { ip: query, data: res.data });
      fetchHistory();
    } catch {
      setError("❌ Lookup failed");
    } finally {
      setLoading(false);
    }
  }

  function clearSearch() {
    setQuery("");
    setError(null);
    loadCurrent();
  }

  function toggleSelect(id) {
    setSelected((s) => ({ ...s, [id]: !s[id] }));
  }

  async function deleteSelected() {
    const ids = Object.keys(selected).filter((k) => selected[k]);
    if (ids.length === 0) return;
    await axios.delete(api + "/api/history", { data: { ids } });
    setSelected({});
    fetchHistory();
  }

  const loc = geo?.loc ? geo.loc.split(",").map(Number) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-500 via-indigo-500 to-purple-600 text-gray-800 flex items-center justify-center py-10">
      <div className="max-w-6xl w-full bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-8">
        <div className="flex justify-between items-center mb-6 border-b pb-3">
          <h1 className="text-2xl font-bold text-sky-700">
            🌍 IP Geolocation Dashboard
          </h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">Hi, {user?.name}</span>
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg shadow-md"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* LEFT: Search + Info + Map */}
          <div className="md:col-span-2 space-y-5">
            {/* Search */}
            <form
              onSubmit={handleSearch}
              className="flex gap-2 bg-white p-3 rounded-lg shadow"
            >
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter IP (e.g. 8.8.8.8)"
                className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-400 focus:outline-none"
              />
              <button
                className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:opacity-90 transition"
                disabled={loading}
              >
                {loading ? "Searching..." : "Lookup"}
              </button>
              <button
                type="button"
                onClick={clearSearch}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
              >
                Clear
              </button>
            </form>

            {error && (
              <div className="text-sm text-red-600 bg-red-100 p-2 rounded">
                {error}
              </div>
            )}

            {/* Geo Info */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-sky-700">
                📍 Current Geolocation
              </h3>
              {geo ? (
                <div className="mt-2 text-sm bg-gray-50 p-3 rounded overflow-auto max-h-60">
                  <pre>{JSON.stringify(geo, null, 2)}</pre>
                </div>
              ) : (
                <div className="mt-2 text-gray-500">Loading...</div>
              )}
            </div>

            {/* Map */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-sky-700">🗺️ Map</h3>
              {loc ? (
                <div className="mt-3 rounded-lg overflow-hidden h-80">
                  <MapContainer
                    center={loc}
                    zoom={8}
                    scrollWheelZoom={false}
                    className="h-full w-full"
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={loc}>
                      <Popup>
                        {geo?.city}, {geo?.region}
                      </Popup>
                    </Marker>
                    <RecenterMap lat={loc[0]} lng={loc[1]} />
                  </MapContainer>
                </div>
              ) : (
                <div className="mt-2 text-gray-500">
                  No coordinates available
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: History */}
          <aside className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-lg font-semibold text-sky-700">🕒 History</h4>
              <button
                onClick={deleteSelected}
                className="text-sm text-red-600 hover:underline"
              >
                Delete Selected
              </button>
            </div>

            <div className="space-y-2 max-h-[500px] overflow-auto">
              {history.length === 0 && (
                <div className="text-sm text-gray-500">No history yet</div>
              )}
              {history.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center p-2 border border-gray-200 rounded hover:bg-sky-50 transition"
                >
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={!!selected[item.id]}
                      onChange={() => toggleSelect(item.id)}
                    />
                    <button
                      className="ml-2 text-sky-600 hover:underline text-sm"
                      onClick={() => {
                        setQuery(item.ip);
                        handleSearch();
                      }}
                    >
                      {item.ip}
                    </button>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(item.when).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
