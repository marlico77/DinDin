import {
  getAllCategoryNames,
  getCategoriesByType,
  getCategoryDisplayName,
  getCategoryColor,
  CategoryType,
  CUSTOM_CATEGORY_PREFIX,
} from '../lib/enums';
import type { Translations } from '../context/I18nContext';
import type { CustomCategoryInfo } from '../lib/enums';

/** Item for merged list: value = enum or "CUSTOM:uuid", display = translated/user name */
export interface MergedCategoryOption {
  value: string;
  display: string;
  color?: string;
  icon?: string;
}

/**
 * Get base categories using i18n translations (system only)
 * @deprecated Prefer getMergedCategories to include custom categories
 */
export function getBaseCategories(translations: Translations): string[] {
  return getAllCategoryNames().map((name) => getCategoryDisplayName(name, translations as unknown as Record<string, string>));
}

/**
 * Base categories using enum values (fallback, uses static Portuguese names)
 * @deprecated Use getBaseCategories with translations instead
 */
export const BASE_CATEGORIES = getAllCategoryNames().map((name) => getCategoryDisplayName(name));

/**
 * Merged list of system + custom categories for combos.
 * @param type - CategoryType (INCOME/EXPENSE) or undefined. undefined = all (income+expense+TRANSFER+ALLOCATION).
 * @param custom - Custom categories from API (isSystem=false). Can be pre-filtered by type or not.
 * @param t - Translations for system display names.
 */
export function getMergedCategories(
  type: CategoryType | undefined,
  custom: CustomCategoryInfo[],
  t: Record<string, string>
): MergedCategoryOption[] {
  const systemNames =
    type === CategoryType.INCOME
      ? getCategoriesByType(CategoryType.INCOME)
      : type === CategoryType.EXPENSE
        ? getCategoriesByType(CategoryType.EXPENSE)
        : getAllCategoryNames();
  const system: MergedCategoryOption[] = systemNames.map((name) => ({
    value: name,
    display: getCategoryDisplayName(name, t),
    color: getCategoryColor(name),
    icon: undefined,
  }));
  const customFiltered =
    type != null ? custom.filter((c: { type?: CategoryType }) => c.type === type) : custom;
  const customOpts: MergedCategoryOption[] = customFiltered.map((c) => ({
    value: `${CUSTOM_CATEGORY_PREFIX}${c.id}`,
    display: c.name,
    color: c.color ?? undefined,
    icon: c.icon ?? undefined,
  }));
  return [...system, ...customOpts];
}

