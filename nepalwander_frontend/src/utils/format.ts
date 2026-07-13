// Format price in NPR
export const formatPrice = (amount: number): string => {
  return `NPR ${amount.toLocaleString("en-NP")}`;
};

// Format date
export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Get difficulty color
export const getDifficultyColor = (
  difficulty: string
): string => {
  switch (difficulty) {
    case "easy":
      return "text-semantic-success bg-green-50";
    case "moderate":
      return "text-semantic-warning bg-yellow-50";
    case "hard":
      return "text-semantic-danger bg-red-50";
    case "extreme":
      return "text-red-900 bg-red-100";
    default:
      return "text-outline bg-surface-high";
  }
};

// Get season color
export const getSeasonColor = (
  status: string
): string => {
  switch (status) {
    case "best":
      return "bg-semantic-success text-white";
    case "shoulder":
      return "bg-semantic-warning text-white";
    case "avoid":
      return "bg-semantic-danger text-white";
    default:
      return "bg-surface-high text-outline";
  }
};

// Get booking status color
export const getBookingStatusColor = (
  status: string
): string => {
  switch (status) {
    case "confirmed":
      return "bg-semantic-success text-white";
    case "pending":
      return "bg-semantic-warning text-white";
    case "cancelled":
      return "bg-semantic-danger text-white";
    case "completed":
      return "bg-semantic-info text-white";
    case "refunded":
      return "bg-outline text-white";
    default:
      return "bg-surface-high text-outline";
  }
};