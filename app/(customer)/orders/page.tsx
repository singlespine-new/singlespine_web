import { Suspense } from "react";
import OrdersPageContent from "./ordersPageContent";

export default function OrdersPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <OrdersPageContent />
    </Suspense>
  )
}
