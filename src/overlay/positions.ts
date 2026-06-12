import type { CSSProperties } from "react";
import type { EffectConfig } from "../types";

const PAD = "3%";

/**
 * Berechnet die absolute Position eines Effekts im Overlay-Fenster
 * aus dem Positionierungs-Grid bzw. den Custom-Koordinaten.
 */
export function positionStyle(effect: EffectConfig): CSSProperties {
  const base: CSSProperties = {
    position: "absolute",
    width: `${effect.size}%`,
  };

  switch (effect.position) {
    case "top-left":
      return { ...base, top: PAD, left: PAD };
    case "top-center":
      return { ...base, top: PAD, left: "50%", transform: "translateX(-50%)" };
    case "top-right":
      return { ...base, top: PAD, right: PAD };
    case "middle-left":
      return { ...base, top: "50%", left: PAD, transform: "translateY(-50%)" };
    case "center":
      return {
        ...base,
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      };
    case "middle-right":
      return { ...base, top: "50%", right: PAD, transform: "translateY(-50%)" };
    case "bottom-left":
      return { ...base, bottom: PAD, left: PAD };
    case "bottom-center":
      return {
        ...base,
        bottom: PAD,
        left: "50%",
        transform: "translateX(-50%)",
      };
    case "bottom-right":
      return { ...base, bottom: PAD, right: PAD };
    case "custom":
      return {
        ...base,
        top: `${effect.customY}%`,
        left: `${effect.customX}%`,
        transform: "translate(-50%, -50%)",
      };
  }
}
