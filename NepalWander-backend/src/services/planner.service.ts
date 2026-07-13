import { PackageRepository } from "../repositories/package.repository";
import { DestinationRepository } from "../repositories/destination.repository";
import { GeneratePlanInput } from "../validators/planner.validator";
import { BadRequestError } from "../middlewares/error.middleware";
import { PackageDocument } from "../models/Package.model";
import { DestinationDocument } from "../models/Destination.model";

const packageRepository = new PackageRepository();
const destinationRepository = new DestinationRepository();

// ── Interest to difficulty map ─────────────────────────
const fitnessMap: Record<string, string[]> = {
  easy: ["easy"],
  moderate: ["easy", "moderate"],
  hard: ["easy", "moderate", "hard"],
};

// ── Score package by interest match ───────────────────
const scorePackage = (
  pkg: PackageDocument,
  interests: string[]
): number => {
  let score = 0;

  // Base score from rating
  score += pkg.rating * 10;

  // Best seller bonus
  if (pkg.isBestSeller) score += 20;

  // Featured bonus
  if (pkg.isFeatured) score += 15;

  // Interest matching via title and description
  const pkgText =
    `${pkg.title} ${pkg.description}`.toLowerCase();
  interests.forEach((interest) => {
    if (pkgText.includes(interest.toLowerCase())) {
      score += 25;
    }
  });

  return score;
};

// ── Get season status for a month ─────────────────────
const getSeasonStatus = (
  destination: DestinationDocument,
  date: Date
): string => {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const monthName = months[date.getMonth()];
  const season = destination.seasonalCalendar.find(
    (s) => s.month === monthName
  );
  return season?.status || "unknown";
};

// ── Generate cost breakdown ────────────────────────────
const generateCostBreakdown = (
  pkg: PackageDocument,
  groupSize: number
) => {
  const cb = pkg.costBreakdown;
  return {
    transport: cb.transport * groupSize,
    accommodation: cb.accommodation * groupSize,
    meals: cb.meals * groupSize,
    guide: cb.guide,
    permits: cb.permits * groupSize,
    other: cb.other * groupSize,
    total: pkg.price * groupSize,
    perPerson: pkg.price,
  };
};

// ── Generate day by day itinerary ─────────────────────
const generateItinerary = (
  pkg: PackageDocument,
  startDate: Date
) => {
  return pkg.itinerary.map((day) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + day.day - 1);
    return {
      day: day.day,
      date: date.toISOString().split("T")[0],
      title: day.title,
      description: day.description,
      accommodation: day.accommodation,
      meals: day.meals,
      distance: day.distance,
    };
  });
};

class PlannerService {

  async generatePlan(input: GeneratePlanInput) {
    const {
      budget,
      duration,
      groupSize,
      interests,
      fitnessLevel,
      startDate,
      region,
    } = input;

    const start = new Date(startDate);

    // Get allowed difficulty levels
    const allowedDifficulties = fitnessMap[fitnessLevel];

    // Get all published packages
    const allPackagesResult = await packageRepository.findAll(
      {},
      1,
      100
    );
    const allPackages = allPackagesResult.packages;

    // Filter packages by criteria
    const filteredPackages = allPackages.filter((pkg) => {
      // Filter by duration
      if (pkg.duration > duration) return false;

      // Filter by difficulty
      if (
        !allowedDifficulties.includes(pkg.difficulty)
      )
        return false;

      // Filter by budget per person
      if (pkg.price < budget.min / groupSize) return false;
      if (pkg.price > budget.max / groupSize) return false;

      // Filter by group size
      if (groupSize < pkg.groupSize.min) return false;
      if (groupSize > pkg.groupSize.max) return false;

      return true;
    });

    // No packages found
    if (filteredPackages.length === 0) {
      throw new BadRequestError(
        "No packages found matching your criteria. Try adjusting your budget, duration or fitness level."
      );
    }

    // Score and rank packages
    const scoredPackages = filteredPackages
      .map((pkg) => ({
        pkg,
        score: scorePackage(pkg, interests),
      }))
      .sort((a, b) => b.score - a.score);

    // Top 3 recommendations
    const topPackages = scoredPackages
      .slice(0, 3)
      .map(({ pkg }) => pkg);

    // Best match
    const bestMatch = topPackages[0];

    // Get destination for best match
    const destination =
      await destinationRepository.findById(
        bestMatch.destination.toString()
      );

    // Season check
    const seasonStatus = destination
      ? getSeasonStatus(destination, start)
      : "unknown";

    // Generate itinerary for best match
    const itinerary = generateItinerary(
      bestMatch,
      start
    );

    // Calculate end date
    const endDate = new Date(start);
    endDate.setDate(endDate.getDate() + bestMatch.duration);

    // Cost breakdown
    const costBreakdown = generateCostBreakdown(
      bestMatch,
      groupSize
    );

    // Season warning
    const seasonWarning =
      seasonStatus === "avoid"
        ? "⚠️ This period is not ideal for travel to this destination. Consider changing your dates."
        : seasonStatus === "best"
        ? "✅ Great timing! This is the best season for this destination."
        : "ℹ️ This is a shoulder season. Conditions are acceptable but not peak.";

    return {
      message: "Trip plan generated successfully",
      plan: {
        // Best match
        recommendedPackage: {
          id: bestMatch._id,
          title: bestMatch.title,
          slug: bestMatch.slug,   
          duration: bestMatch.duration,
          difficulty: bestMatch.difficulty,
          price: bestMatch.price,
          rating: bestMatch.rating,
          isBestSeller: bestMatch.isBestSeller,
        },

        // Destination info
        destination: destination
          ? {
              id: destination._id,
              name: destination.name,
              region: destination.region,
              altitude: destination.altitude,
              safetyInfo: destination.safetyInfo,
            }
          : null,

        // Trip summary
        tripSummary: {
          startDate: start.toISOString().split("T")[0],
          endDate: endDate.toISOString().split("T")[0],
          duration: bestMatch.duration,
          groupSize,
          fitnessLevel,
        },

        // Season info
        seasonInfo: {
          status: seasonStatus,
          message: seasonWarning,
        },

        // Cost
        costBreakdown,

        // Day by day plan
        itinerary,

        // What is included
        includes: bestMatch.includes,
        excludes: bestMatch.excludes,

        // Safety
        safetyInfo: destination?.safetyInfo || null,

        // Alternative packages
        alternatives: topPackages.slice(1).map((pkg) => ({
          id: pkg._id,
          title: pkg.title,
          duration: pkg.duration,
          difficulty: pkg.difficulty,
          price: pkg.price,
          rating: pkg.rating,
        })),
      },
    };
  }
}

export default new PlannerService();