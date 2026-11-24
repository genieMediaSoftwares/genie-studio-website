import { useEffect, useState } from "react";
import { getToken } from "../lib/auth";
import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const [ready, setReady] = useState(false);
  const location = useLocation();

  useEffect(() => {
    queueMicrotask(() => setReady(true));
  }, []);

  if (!ready) {
    return (
      <div role="status" className="min-h-[50vh] flex items-center justify-center pt-24 text-stone-600 text-sm">
        Checking session...
      </div>
    );
  }

  if (!getToken()) {
    return <Navigate to="/admin" state={{ from: location }} replace />;
  }

  return children;
}
