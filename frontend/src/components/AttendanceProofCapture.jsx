import { useState, useRef } from "react";

const AttendanceProofCapture = ({ subjectId, subjectName, onSuccess, onCancel, token }) => {
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [classCode, setClassCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [location, setLocation] = useState(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const fileInputRef = useRef(null);

  // 📸 Handle photo capture/upload
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
      setError("");
    }
  };

  // 📍 Get GPS location
  const captureLocation = () => {
    setGettingLocation(true);
    setError("");

    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      setGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
        setGettingLocation(false);
      },
      (err) => {
        setError("Failed to get location: " + err.message);
        setGettingLocation(false);
      }
    );
  };

  // ✅ Submit attendance with proof
  const submitAttendance = async () => {
    // At least one proof required
    if (!photo && !classCode && !location) {
      setError("Please provide at least one proof: Photo OR Location OR Class Code");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("subjectId", subjectId);
      formData.append("status", "present");
      
      // Only append proofs that exist
      if (photo) {
        formData.append("proofPhoto", photo);
      }
      if (location) {
        formData.append("latitude", location.latitude);
        formData.append("longitude", location.longitude);
        if (location.accuracy !== undefined && location.accuracy !== null) {
          formData.append("accuracy", location.accuracy);
        }
      }
      if (classCode) {
        formData.append("classCode", classCode);
      }

      const res = await fetch("http://localhost:5000/api/attendance", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to mark attendance");
      }

      // ✅ Show success animation
      setSuccess(true);
      
      // Reset form
      setPhoto(null);
      setPhotoPreview(null);
      setClassCode("");
      setLocation(null);

      // Wait for animation then call onSuccess
      setTimeout(() => {
        onSuccess && onSuccess(data);
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-md mx-auto relative overflow-hidden">
      {/* Success Animation Overlay */}
      {success && (
        <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-500 z-50 flex flex-col items-center justify-center transition-opacity duration-300">
          <div className="animate-bounce mb-4">
            <div className="text-8xl">✅</div>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2 animate-pulse">Attendance Marked!</h3>
          <p className="text-white/90 text-sm">Returning to attendance list...</p>
          <div className="mt-4">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </div>
      )}

      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center justify-between">
        <span className="flex items-center gap-2">
          📸 Mark Attendance: {subjectName}
        </span>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition"
            title="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </h3>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      {/* Photo Upload */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          📷 Selfie Proof
        </label>
        
        {photoPreview ? (
          <div className="relative">
            <img
              src={photoPreview}
              alt="Preview"
              className="w-full h-48 object-cover rounded-lg border-2 border-gray-300"
            />
            <button
              onClick={() => {
                setPhoto(null);
                setPhotoPreview(null);
              }}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition"
            >
              ✕
            </button>
          </div>
        ) : (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="user"
              onChange={handlePhotoChange}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-blue-500 hover:bg-blue-50 transition text-center"
            >
              <div className="text-4xl mb-2">📸</div>
              <p className="text-sm text-gray-600">Tap to capture selfie</p>
            </button>
          </div>
        )}
      </div>

      {/* Location Capture */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          📍 Location Proof
        </label>
        {location ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
            <p className="text-green-700 font-medium">✅ Location captured</p>
            <p className="text-gray-600 text-xs mt-1">
              Lat: {location.latitude.toFixed(6)}, Lng: {location.longitude.toFixed(6)}
            </p>
          </div>
        ) : (
          <button
            onClick={captureLocation}
            disabled={gettingLocation}
            className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition disabled:bg-gray-400 flex items-center justify-center gap-2"
          >
            {gettingLocation ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Getting location...
              </>
            ) : (
              <>📍 Capture Location</>
            )}
          </button>
        )}
      </div>

      {/* Class Code */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          🔐 Class Code
        </label>
        <input
          type="text"
          value={classCode}
          onChange={(e) => setClassCode(e.target.value.toUpperCase())}
          placeholder="Enter 6-digit code"
          maxLength={6}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl font-mono tracking-widest"
        />
      </div>

      {/* Active Proofs Indicator */}
      {(photo || location || classCode) && (
        <div className="text-xs text-center mb-3 text-blue-600 font-medium">
          {photo && "📸 Photo selected"}
          {location && " 📍 Location captured"}
          {classCode && " 🔐 Code entered"}
        </div>
      )}

      {/* Submit Button */}
      <div className="flex gap-3">
        {onCancel && (
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-4 rounded-lg transition font-semibold text-lg bg-gray-500 text-white hover:bg-gray-600 disabled:opacity-50"
          >
            ✖️ Cancel
          </button>
        )}
        <button
          onClick={submitAttendance}
          disabled={loading || (!photo && !location && !classCode)}
          className={`${onCancel ? 'flex-1' : 'w-full'} py-4 rounded-lg transition font-semibold text-lg ${
            loading || (!photo && !location && !classCode)
              ? "bg-gray-400 text-white cursor-not-allowed"
              : "bg-emerald-600 text-white hover:bg-emerald-700"
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              Submitting...
            </span>
          ) : (
            "✅ Mark Present"
          )}
        </button>
      </div>

      <p className="text-xs text-gray-500 text-center mt-3">
        Any one proof is enough: Photo <b>or</b> Location <b>or</b> Class Code
      </p>
    </div>
  );
};

export default AttendanceProofCapture;
