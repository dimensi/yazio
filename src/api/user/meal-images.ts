import type { Token } from "@/types/auth";
import { DaytimeSchema } from "@/types/yazio";
import { parseDate } from "@/utils/date";
import { fetchYazio } from "@/utils/fetch";
import { z } from "zod";

export const GetUserMealImagesOptionsSchema = z.object({
  date: z.union([z.date(), z.string()]).optional(),
});
export type GetUserMealImagesOptions = z.infer<typeof GetUserMealImagesOptionsSchema>;

/** One photo URL per meal slot; an empty day returns {}. */
export const UserMealImagesSchema = z.record(DaytimeSchema, z.string().url());
export type UserMealImages = z.infer<typeof UserMealImagesSchema>;

/**
 * Get diary photo URLs for a date (defaults to today).
 * Photos are grouped by meal slot, not by consumed-item ID.
 */
export const getUserMealImages = async (
  token: Token,
  options?: GetUserMealImagesOptions
): Promise<UserMealImages> => {
  const data = await fetchYazio<unknown>(
    `/user/meal-images/${parseDate(options?.date ?? new Date())}`,
    { headers: { Authorization: `Bearer ${token.access_token}` } }
  );
  return UserMealImagesSchema.parse(data);
};
