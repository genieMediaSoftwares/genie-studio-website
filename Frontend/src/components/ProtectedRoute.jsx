import { useEffect, useState } from "react";
import { getToken } from "../lib/auth";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const [ready, setReady] = useState(false);
  useEffect(() => { queueMicrotask(() => setReady(true)); }, []);
  if (!ready) return <div role="status" className="min-h-[50vh] flex items-center justify-center pt-24">Checking session...</div>;
  if (!getToken()) return <Navigate to="/admin" replace />;
  return children;
}
