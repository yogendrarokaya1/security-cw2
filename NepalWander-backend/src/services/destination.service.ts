import { DestinationFilter, DestinationRepository } from "../repositories/destination.repository";
import {
  CreateDestinationInput,
  UpdateDestinationInput,
  DestinationQuery,
} from "../validators/destination.validator";
import { NotFoundError } from "../middlewares/error.middleware";
import {
  IDestination,
  DestinationRegion,
  DifficultyLevel,
  RiskLevel,
  ISafetyInfo,
} from "../models/Destination.model";

const destinationRepository = new DestinationRepository();

// ── Helpers ───────────────────────────────────────────
const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const castSafetyInfo = (
  safetyInfo: CreateDestinationInput["safetyInfo"]
): ISafetyInfo => {
  return {
    ...safetyInfo,
    riskLevel: safetyInfo.riskLevel as RiskLevel,
  };
};

class DestinationService {

  // ── Create ────────────────────────────────────────────
  async create(
    input: CreateDestinationInput,
    userId: string
  ) {
    const slug = generateSlug(input.name);

    const data: Partial<IDestination> = {
      ...input,
      slug,
      region: input.region as DestinationRegion,
      difficulty: input.difficulty as DifficultyLevel,
      safetyInfo: castSafetyInfo(input.safetyInfo),
      createdBy: userId as any,
    };

    return destinationRepository.create(data);
  }

  // ── Get All ───────────────────────────────────────────
  async getAll(query: DestinationQuery) {
  const { page, limit, ...rest } = query;

  const filter: DestinationFilter = {
    region: rest.region as DestinationRegion | undefined,
    difficulty: rest.difficulty as DifficultyLevel | undefined,
    search: rest.search,
    isFeatured: rest.isFeatured === true ? true : undefined,
  };

  return destinationRepository.findAll(filter, page, limit);
}

  // ── Get By ID ─────────────────────────────────────────
  async getById(id: string) {
    const destination =
      await destinationRepository.findById(id);
    if (!destination) {
      throw new NotFoundError("Destination not found");
    }
    return destination;
  }

  // ── Get By Slug ───────────────────────────────────────
  async getBySlug(slug: string) {
    const destination =
      await destinationRepository.findBySlug(slug);
    if (!destination) {
      throw new NotFoundError("Destination not found");
    }
    return destination;
  }

  // ── Get Featured ──────────────────────────────────────
  async getFeatured() {
    return destinationRepository.findFeatured();
  }

  // ── Update ────────────────────────────────────────────
  async update(
    id: string,
    input: UpdateDestinationInput
  ) {
    const destination =
      await destinationRepository.findById(id);
    if (!destination) {
      throw new NotFoundError("Destination not found");
    }

    const data: Partial<IDestination> = {
      ...input,
      region: input.region as DestinationRegion | undefined,
      difficulty: input.difficulty as DifficultyLevel | undefined,
      safetyInfo: input.safetyInfo
        ? castSafetyInfo(input.safetyInfo)
        : undefined,
    };

    if (input.name) {
      data.slug = generateSlug(input.name);
    }

    return destinationRepository.update(id, data);
  }

  // ── Delete ────────────────────────────────────────────
  async delete(id: string) {
    const destination =
      await destinationRepository.findById(id);
    if (!destination) {
      throw new NotFoundError("Destination not found");
    }

    await destinationRepository.delete(id);
    return { message: "Destination deleted successfully" };
  }
}

export default new DestinationService();