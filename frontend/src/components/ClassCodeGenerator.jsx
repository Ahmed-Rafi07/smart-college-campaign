import { useState, useEffect } from "react";

const ClassCodeGenerator = ({ subjects, token }) => {
  const [selectedSubject, setSelectedSubject] = useState("");
  const [expiryMinutes, setExpiryMinutes] = useState(5);
  const [activeCodes, setActiveCodes] = useState([]);
  const [generatedCode, setGeneratedCode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch active codes on load
  useEffect(() => {
    fetchActiveCodes();
    const interval = setInterval(fetchActiveCodes, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const fetchActiveCodes = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/attendance/class-code/active", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setActiveCodes(data);
      }
    } catch (err) {
      console.error("Fetch codes error:", err);
    }
  };

  const generateCode = async () => {
    if (!selectedSubject) {
      setError("Please select a subject");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:5000/api/attendance/class-code/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subjectId: selectedSubject,
          expiryMinutes: parseInt(expiryMinutes),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message);
      }

      setGeneratedCode(data);
      fetchActiveCodes();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deactivateCode = async (codeId) => {
    try {
      await fetch(`http://localhost:5000/api/attendance/class-code/${codeId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      fetchActiveCodes();
      if (generatedCode && generatedCode._id === codeId) {
        setGeneratedCode(null);
      }
    } catch (err) {
      console.error("Deactivate error:", err);
    }
  };

  const getTimeRemaining = (expiresAt) => {
    const diff = new Date(expiresAt) - new Date();
    if (diff <= 0) return "Expired";

    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    return `${minutes}m ${seconds}s`;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        🔐 Class Code Generator
      </h3>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      {/* Generate Code Form */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 mb-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Subject
          </label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Choose subject...</option>
            {subjects.map((subject) => (
              <option key={subject._id} value={subject._id}>
                {subject.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Code Validity (minutes)
          </label>
          <div className="flex gap-2">
            {[2, 5, 10, 15].map((min) => (
              <button
                key={min}
                onClick={() => setExpiryMinutes(min)}
                className={`flex-1 py-2 rounded-lg font-medium transition ${
                  expiryMinutes === min
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                {min} min
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={generateCode}
          disabled={loading || !selectedSubject}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
        >
          {loading ? "Generating..." : "🔐 Generate Code"}
        </button>
      </div>

      {/* Generated Code Display */}
      {generatedCode && (
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6 mb-6 shadow-lg">
          <p className="text-sm opacity-90 mb-2">Active Code:</p>
          <div className="text-6xl font-bold text-center mb-3 tracking-wider font-mono">
            {generatedCode.code}
          </div>
          <div className="text-center text-sm opacity-90">
            <p>Share this code with students</p>
            <p className="font-semibold mt-1">
              ⏱️ Expires: {new Date(generatedCode.expiresAt).toLocaleTimeString()}
            </p>
          </div>
        </div>
      )}

      {/* Active Codes List */}
      <div>
        <h4 className="font-semibold text-gray-700 mb-3">Active Codes</h4>
        
        {activeCodes.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">
            No active codes
          </p>
        ) : (
          <div className="space-y-2">
            {activeCodes.map((code) => (
              <div
                key={code._id}
                className="flex items-center justify-between bg-gray-50 rounded-lg p-4 border border-gray-200"
              >
                <div className="flex-1">
                  <p className="font-mono text-2xl font-bold text-gray-800">
                    {code.code}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {code.subject?.name || "Unknown Subject"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    ⏱️ {getTimeRemaining(code.expiresAt)} remaining
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    👥 Used by {code.usedBy?.length || 0} students
                  </p>
                </div>
                <button
                  onClick={() => deactivateCode(code._id)}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition text-sm"
                >
                  Deactivate
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassCodeGenerator;
