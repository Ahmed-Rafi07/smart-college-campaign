import { useState, useEffect } from "react";

const AttendanceProofViewer = ({ subjectId, subjectName, token }) => {
  const [proofs, setProofs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProof, setSelectedProof] = useState(null);

  useEffect(() => {
    if (subjectId) {
      fetchProofs();
    }
  }, [subjectId]);

  const fetchProofs = async () => {
    try {
      const res = await fetch(
        `https://smart-college-campaign.onrender.com/api/attendance/proofs?subject=${subjectId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok) {
        const data = await res.json();
        setProofs(data);
      }
    } catch (err) {
      console.error("Fetch proofs error:", err);
    } finally {
      setLoading(false);
    }
  };

  const verifyProof = async (attendanceId) => {
    try {
      const res = await fetch(
        `https://smart-college-campaign.onrender.com/api/attendance/verify/${attendanceId}`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok) {
        // Update local state
        setProofs(
          proofs.map((p) =>
            p._id === attendanceId ? { ...p, verified: true } : p
          )
        );
        if (selectedProof && selectedProof._id === attendanceId) {
          setSelectedProof({ ...selectedProof, verified: true });
        }
      }
    } catch (err) {
      console.error("Verify error:", err);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
        <p className="text-gray-600">Loading proofs...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        📸 Attendance Proofs: {subjectName}
      </h3>

      {proofs.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-gray-600">No attendance proofs submitted yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {proofs.map((proof) => (
            <div
              key={proof._id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
            >
              <div className="flex items-start gap-4">
                {/* Photo Thumbnail */}
                <div className="flex-shrink-0">
                  {proof.proofPhoto ? (
                    <img
                      src={`https://smart-college-campaign.onrender.com/${proof.proofPhoto}`}
                      alt="Proof"
                      className="w-24 h-24 object-cover rounded-lg cursor-pointer border-2 border-gray-300 hover:border-blue-500 transition"
                      onClick={() => setSelectedProof(proof)}
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                      <span className="text-gray-400">No Photo</span>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-semibold text-gray-800">
                        {proof.user?.username || "Unknown Student"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {proof.user?.email}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {proof.verified ? (
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                          ✓ Verified
                        </span>
                      ) : (
                        <button
                          onClick={() => verifyProof(proof._id)}
                          className="bg-blue-600 text-white px-4 py-1 rounded-lg hover:bg-blue-700 transition text-sm"
                        >
                          Verify
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <span>📅</span>
                      <span>{new Date(proof.createdAt).toLocaleString()}</span>
                    </div>

                    {proof.classCode && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <span>🔐</span>
                        <span className="font-mono">{proof.classCode}</span>
                      </div>
                    )}

                    {proof.location?.latitude && (
                      <div className="col-span-2">
                        <a
                          href={`https://maps.google.com/?q=${proof.location.latitude},${proof.location.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:underline"
                        >
                          <span>📍</span>
                          <span>
                            View Location ({proof.location.latitude.toFixed(4)}, {proof.location.longitude.toFixed(4)})
                          </span>
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for full image view */}
      {selectedProof && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedProof(null)}
        >
          <div
            className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-bold text-gray-800">
                Attendance Proof Details
              </h4>
              <button
                onClick={() => setSelectedProof(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            {selectedProof.proofPhoto && (
              <img
                src={`https://smart-college-campaign.onrender.com/${selectedProof.proofPhoto}`}
                alt="Proof"
                className="w-full rounded-lg mb-4"
              />
            )}

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="font-semibold">Student:</span>
                <span>{selectedProof.user?.username}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-semibold">Email:</span>
                <span>{selectedProof.user?.email}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-semibold">Date:</span>
                <span>{new Date(selectedProof.createdAt).toLocaleString()}</span>
              </div>

              {selectedProof.classCode && (
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Code Used:</span>
                  <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                    {selectedProof.classCode}
                  </span>
                </div>
              )}

              {selectedProof.location?.latitude && (
                <div>
                  <span className="font-semibold">Location:</span>
                  <div className="mt-2">
                    <a
                      href={`https://maps.google.com/?q=${selectedProof.location.latitude},${selectedProof.location.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      📍 View on Google Maps
                    </a>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <span className="font-semibold">Status:</span>
                {selectedProof.verified ? (
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                    ✓ Verified
                  </span>
                ) : (
                  <button
                    onClick={() => verifyProof(selectedProof._id)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    Verify Now
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceProofViewer;
