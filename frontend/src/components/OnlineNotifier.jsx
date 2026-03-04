import { useEffect, useState } from "react";
import useOnlineStatus from "../hooks/useOnlineStatus";

const OnlineNotifier = () => {
  const online = useOnlineStatus();
  const [showNotification, setShowNotification] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (online && token) {
      setShowNotification(true);
      
      // Auto-hide after 4 seconds
      const timeout = setTimeout(() => setShowNotification(false), 4000);
      return () => clearTimeout(timeout);
    }
  }, [online, token]);

  if (!showNotification) return null;

  return (
    <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-slide-in">
      <span className="text-lg">✅</span>
      <span className="font-medium">Back online! Syncing your data...</span>
    </div>
  );
};

export default OnlineNotifier;
