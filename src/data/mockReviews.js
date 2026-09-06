// Backdated reviews spanning roughly the last five years, used to seed the
// homepage testimonials and each vehicle's review section. Dates are
// relative to "today" so the spread stays realistic no matter when this is
// viewed. Swap for /api/reviews once the reviews endpoint exists.

function monthsAgo(n) {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  return d.toISOString();
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

export const mockReviews = [
  {
    id: "r1", vehicleId: "v2", rating: 5, verified: true,
    title: "Exactly as described, seamless shipping to Manchester",
    body: "Bought the Range Rover sight unseen from Lagos and it arrived in better condition than photos suggested. The inspection report was thorough and accurate.",
    author: "T. Adeyemi", date: monthsAgo(59),
  },
  {
    id: "r2", vehicleId: "v3", rating: 5, verified: true,
    title: "Export process was painless",
    body: "The Land Cruiser was exactly as inspected, and Meridian handled all the export paperwork. Would buy again.",
    author: "K. Mensah", date: monthsAgo(51),
  },
  {
    id: "r3", vehicleId: "v1", rating: 4, verified: true,
    title: "Great car, shipping took a bit longer than quoted",
    body: "The Taycan itself is fantastic and well looked after. Delivery ran about two weeks past the original estimate, but support kept me updated throughout.",
    author: "R. van Dijk", date: monthsAgo(44),
  },
  {
    id: "r4", vehicleId: "v4", rating: 5, verified: true,
    title: "Best used-car buying experience I've had",
    body: "The M4 was detailed beautifully and the whole process, from deposit to delivery, took under three weeks.",
    author: "S. Okafor", date: monthsAgo(37),
  },
  {
    id: "r5", vehicleId: "v9", rating: 5, verified: true,
    title: "Honest condition report, no surprises",
    body: "Appreciated that the listing disclosed a minor curb rash on one wheel that I wouldn't have noticed otherwise. That kind of honesty is rare.",
    author: "L. Fischer", date: monthsAgo(30),
  },
  {
    id: "r6", vehicleId: "v6", rating: 4, verified: true,
    title: "Solid truck, financing was straightforward",
    body: "Financing approval took two days and the F-150 has been trouble-free since delivery six months ago.",
    author: "J. Whitfield", date: monthsAgo(23),
  },
  {
    id: "r7", vehicleId: "v8", rating: 5, verified: true,
    title: "White-glove service from start to finish",
    body: "My account dashboard made it easy to track the order status the whole way through customs. The EQS arrived spotless.",
    author: "A. Hoffmann", date: monthsAgo(16),
  },
  {
    id: "r8", vehicleId: "v12", rating: 5, verified: true,
    title: "Would recommend to anyone buying internationally",
    body: "Clear communication at every stage, and the Q8 e-tron matched the listing exactly. Support answered questions within the hour.",
    author: "M. Dubois", date: monthsAgo(9),
  },
  {
    id: "r9", vehicleId: "v5", rating: 5, verified: true,
    title: "Plaid arrived faster than expected",
    body: "Ordered the Model S Plaid and it showed up ten days ahead of the delivery window. Immaculate condition.",
    author: "D. Nguyen", date: monthsAgo(4),
  },
  {
    id: "r10", vehicleId: "v19", rating: 4, verified: true,
    title: "Impressive vehicle, minor delay at customs",
    body: "The R1S is everything I hoped for. Customs held it an extra few days but Meridian's support team handled the paperwork so I didn't have to.",
    author: "P. Okonkwo", date: monthsAgo(1),
  },
  {
    id: "r11", vehicleId: "v24", rating: 5, verified: true,
    title: "Ioniq 5 was flawless, support chat is genuinely fast",
    body: "Had a question about charging cables the same day I placed the order and got a reply on live chat within minutes. The car itself is immaculate.",
    author: "N. Larsen", date: daysAgo(18),
  },
  {
    id: "r12", vehicleId: "v22", rating: 5, verified: true,
    title: "G90 exceeded expectations",
    body: "Ordered the Genesis G90 and the whole process — deposit, bank transfer confirmation, and delivery tracking — was clearer than any dealership I've used locally.",
    author: "C. Reyes", date: daysAgo(9),
  },
  {
    id: "r13", vehicleId: "v14", rating: 4, verified: true,
    title: "Ram 1500 arrived clean, easy account tracking",
    body: "Could see my order move from pending to shipped right in my account without having to call anyone for updates.",
    author: "B. Ellison", date: daysAgo(3),
  },
];

export function reviewsForVehicle(vehicleId) {
  return mockReviews.filter((r) => r.vehicleId === vehicleId);
}

export function averageRating(vehicleId) {
  const reviews = reviewsForVehicle(vehicleId);
  if (reviews.length === 0) return null;
  return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
}

export const overallAverageRating =
  mockReviews.reduce((sum, r) => sum + r.rating, 0) / mockReviews.length;
