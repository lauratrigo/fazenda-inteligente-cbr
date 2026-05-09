import type { CharacterCustomization } from "../types";

export const defaultCustomization: CharacterCustomization = {
  farmerName: "Fazendeiro CBR",
  skinColor: "#f1b77a",
  hairColor: "#7a4a24",
  outfitColor: "#4d6fb3",
  style: "curto",
  outfitStyle: "avental",
};

export const skinOptions = ["#f1b77a", "#c98b5d", "#8b5a3c", "#f3cfaa", "#6f4634", "#d6a06f"];
export const hairOptions = ["#7a4a24", "#263027", "#c47a35", "#f4cc58", "#7f4ab8", "#8f3d44"];
export const outfitOptions = ["#4d6fb3", "#3f9a49", "#b95234", "#8d5fb8", "#d68b3a", "#5fa8d3"];
export const styleOptions: Array<{ id: CharacterCustomization["style"]; label: string }> = [
  { id: "curto", label: "Curto" },
  { id: "medio", label: "Médio" },
  { id: "longo", label: "Longo" },
  { id: "rabo", label: "Rabo de cavalo" },
  { id: "cacheado", label: "Cacheado" },
  { id: "tranca", label: "Trança simples" },
  { id: "femininoA", label: "Feminino A" },
  { id: "femininoB", label: "Feminino B" },
  { id: "neutroA", label: "Neutro A" },
  { id: "bone", label: "Boné" },
  { id: "chapeu", label: "Chapéu de campo" },
  { id: "chapeuPalha", label: "Chapéu de palha" },
];

export const outfitStyleOptions: Array<{ id: CharacterCustomization["outfitStyle"]; label: string }> = [
  { id: "avental", label: "Avental" },
  { id: "macacao", label: "Macacão" },
  { id: "camisa", label: "Camisa" },
  { id: "jardineira", label: "Jardineira" },
  { id: "casaco", label: "Casaco" },
  { id: "vestido", label: "Roupa longa" },
  { id: "alca", label: "Camiseta com alça" },
  { id: "fazenda", label: "Roupa de fazenda" },
];
