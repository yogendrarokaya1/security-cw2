import { PackageRepository } from "../repositories/package.repository";
import { DestinationRepository } from "../repositories/destination.repository";
import {
  CreatePackageInput,
  UpdatePackageInput,
  PackageQuery,
} from "../validators/package.validator";
import { NotFoundError } from "../middlewares/error.middleware";
import {
  IPackage,
  PackageStatus,
  ICostBreakdown,
  IDayItinerary,
} from "../models/Package.model";
import { DifficultyLevel } from "../models/Destination.model";

const packageRepository = new PackageRepository();
const destinationRepository = new DestinationRepository();

// ── Helpers ───────────────────────────────────────────
const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const castCostBreakdown = (
  cost: CreatePackageInput["costBreakdown"]
): ICostBreakdown => {
  return {
    transport: cost.transport,
    accommodation: cost.accommodation,
    meals: cost.meals,
    guide: cost.guide,
    permits: cost.permits,
    other: cost.other,
  };
};

const castItinerary = (
  itinerary: CreatePackageInput["itinerary"]
): IDayItinerary[] => {
  return itinerary.map((day) => ({
    day: day.day,
    title: day.title,
    description: day.description,
    accommodation: day.accommodation,
    meals: day.meals,
    distance: day.distance,
  }));
};

class PackageService {

  // ── Create ────────────────────────────────────────────
  async create(
    input: CreatePackageInput,
    userId: string
  ) {
    // Verify destination exists
    const destination = await destinationRepository.findById(
      input.destination
    );
    if (!destination) {
      throw new NotFoundError("Destination not found");
    }

    const slug = generateSlug(input.title);

    const data: Partial<IPackage> = {
      ...input,
      slug,
      difficulty: input.difficulty as DifficultyLevel,
      status: input.status as PackageStatus,
      costBreakdown: castCostBreakdown(input.costBreakdown),
      itinerary: castItinerary(input.itinerary),
      destination: input.destination as any,
      createdBy: userId as any,
    };

    return packageRepository.create(data);
  }

  // ── Get All ───────────────────────────────────────────
 async getAll(query: PackageQuery) {
  const { page, limit, ...rest } = query;

  const filter: Record<string, unknown> = {
    destination: rest.destination,
    difficulty: rest.difficulty as DifficultyLevel | undefined,
    minPrice: rest.minPrice,
    maxPrice: rest.maxPrice,
    duration: rest.duration,
    search: rest.search,
  };

  if (rest.isFeatured !== undefined) filter.isFeatured = rest.isFeatured;
  if (rest.isBestSeller !== undefined) filter.isBestSeller = rest.isBestSeller;

  return packageRepository.findAll(filter as any, page, limit);
}

  // ── Get By ID ─────────────────────────────────────────
  async getById(id: string) {
    const pkg = await packageRepository.findById(id);
    if (!pkg) throw new NotFoundError("Package not found");
    return pkg;
  }

  // ── Get By Slug ───────────────────────────────────────
  async getBySlug(slug: string) {
    const pkg = await packageRepository.findBySlug(slug);
    if (!pkg) throw new NotFoundError("Package not found");
    return pkg;
  }

  // ── Get By Destination ────────────────────────────────
  async getByDestination(destinationId: string) {
    const destination = await destinationRepository.findById(
      destinationId
    );
    if (!destination) {
      throw new NotFoundError("Destination not found");
    }
    return packageRepository.findByDestination(destinationId);
  }

  // ── Get Featured ──────────────────────────────────────
  async getFeatured() {
    return packageRepository.findFeatured();
  }

  // ── Update ────────────────────────────────────────────
  async update(
    id: string,
    input: UpdatePackageInput
  ) {
    const pkg = await packageRepository.findById(id);
    if (!pkg) throw new NotFoundError("Package not found");

    // Verify destination exists if changed
    if (input.destination) {
      const destination =
        await destinationRepository.findById(
          input.destination
        );
      if (!destination) {
        throw new NotFoundError("Destination not found");
      }
    }

    const data: Partial<IPackage> = {
      ...input,
      difficulty: input.difficulty as
        | DifficultyLevel
        | undefined,
      status: input.status as PackageStatus | undefined,
      costBreakdown: input.costBreakdown
        ? castCostBreakdown(input.costBreakdown)
        : undefined,
      itinerary: input.itinerary
        ? castItinerary(input.itinerary)
        : undefined,
      destination: input.destination as any,
    };

    // Regenerate slug if title changed
    if (input.title) {
      data.slug = generateSlug(input.title);
    }

    return packageRepository.update(id, data);
  }

  // ── Delete ────────────────────────────────────────────
  async delete(id: string) {
    const pkg = await packageRepository.findById(id);
    if (!pkg) throw new NotFoundError("Package not found");

    await packageRepository.delete(id);
    return { message: "Package deleted successfully" };
  }
}


export default new PackageService();