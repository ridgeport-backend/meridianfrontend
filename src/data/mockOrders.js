// Mock order history for the Account page. In production this comes from
// GET /api/orders/mine, already modeled by the backend's Order schema
// (see backend/models/Order.js) with the same status values used here.

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

export const mockOrders = [
  {
    orderNumber: "ORD-8F2A91",
    vehicle: { make: "Toyota", model: "Land Cruiser", year: 2021 },
    date: daysAgo(4),
    amount: 60650,
    currency: "USD",
    paymentStatus: "paid",
    status: "shipped",
    shipping: { trackingNumber: "MRD-48213", estimatedDelivery: daysAgo(-18) },
  },
  {
    orderNumber: "ORD-1C77D0",
    vehicle: { make: "BMW", model: "M4 Competition", year: 2023 },
    date: daysAgo(46),
    amount: 89830,
    currency: "USD",
    paymentStatus: "paid",
    status: "completed",
    shipping: { trackingNumber: "MRD-40119", estimatedDelivery: daysAgo(20) },
  },
];
