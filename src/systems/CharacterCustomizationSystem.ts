import { defaultCustomization } from "../data/characterOptions";
import type { CharacterCustomization, CharacterHairStyle, CharacterOutfitStyle } from "../types";

const customizationKey = "vale-dos-casos-customization";
const oldCausosCustomizationKey = "vale-dos-causos-customization";
const legacyCustomizationKey = "fazendinha-cbr-customization";

function sanitizeColor(value: string | undefined, fallback: string): string {
  return typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value) ? value : fallback;
}

export class CharacterCustomizationSystem {
  static load(): CharacterCustomization {
    const raw = localStorage.getItem(customizationKey) ?? localStorage.getItem(oldCausosCustomizationKey) ?? localStorage.getItem(legacyCustomizationKey);
    if (!raw) return { ...defaultCustomization };

    try {
      return this.normalize(JSON.parse(raw) as Partial<CharacterCustomization>);
    } catch {
      return { ...defaultCustomization };
    }
  }

  static save(customization: CharacterCustomization): void {
    localStorage.setItem(customizationKey, JSON.stringify(this.normalize(customization)));
    localStorage.removeItem(oldCausosCustomizationKey);
    localStorage.removeItem(legacyCustomizationKey);
  }

  static clear(): void {
    localStorage.removeItem(customizationKey);
    localStorage.removeItem(oldCausosCustomizationKey);
    localStorage.removeItem(legacyCustomizationKey);
  }

  static normalize(value?: Partial<CharacterCustomization>): CharacterCustomization {
    const rawStyle = value?.style as unknown;
    const legacyStyle = rawStyle === "B" ? "medio" : rawStyle === "C" ? "longo" : rawStyle;

    return {
      farmerName: typeof value?.farmerName === "string" && value.farmerName.trim() ? value.farmerName.trim().slice(0, 24) : defaultCustomization.farmerName,
      skinColor: sanitizeColor(value?.skinColor, defaultCustomization.skinColor),
      hairColor: sanitizeColor(value?.hairColor, defaultCustomization.hairColor),
      outfitColor: sanitizeColor(value?.outfitColor, defaultCustomization.outfitColor),
      style: this.normalizeHairStyle(legacyStyle),
      outfitStyle: this.normalizeOutfitStyle(value?.outfitStyle),
    };
  }

  private static normalizeHairStyle(value: unknown): CharacterHairStyle {
    const allowed: CharacterHairStyle[] = ["curto", "medio", "longo", "rabo", "cacheado", "tranca", "femininoA", "femininoB", "neutroA", "bone", "chapeu", "chapeuPalha"];
    return allowed.includes(value as CharacterHairStyle) ? value as CharacterHairStyle : defaultCustomization.style;
  }

  private static normalizeOutfitStyle(value: unknown): CharacterOutfitStyle {
    const allowed: CharacterOutfitStyle[] = ["avental", "macacao", "camisa", "jardineira", "casaco", "vestido", "alca", "fazenda"];
    return allowed.includes(value as CharacterOutfitStyle) ? value as CharacterOutfitStyle : defaultCustomization.outfitStyle;
  }
}
