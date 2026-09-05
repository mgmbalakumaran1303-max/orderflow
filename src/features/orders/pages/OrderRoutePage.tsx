import { Navigate, useParams } from "react-router-dom";

export function OrderRoutePage() {
  const { orderId } = useParams();
  return <Navigate to={`/orders?orderId=${orderId ?? ""}`} replace />;
}
