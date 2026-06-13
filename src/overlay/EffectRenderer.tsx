import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import type { ActiveEffect } from "./queue";
import { positionStyle } from "./positions";
import { ANIMATION_VARIANTS } from "./animations";
import { ModelViewer } from "./ModelViewer";

interface EffectRendererProps {
  active: ActiveEffect;
  /** Wird genau einmal aufgerufen, wenn der Effekt zu Ende ist */
  onDone: () => void;
}

export function EffectRenderer({ active, onDone }: EffectRendererProps) {
  const { effect, url } = active;
  const doneRef = useRef(false);

  const done = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    onDone();
  };
  const doneCb = useRef(done);
  doneCb.current = done;

  // Zeitgesteuertes Ende für Bilder, Modelle und geloopte Medien.
  // Videos/Sounds ohne Loop enden über das "ended"-Event.
  useEffect(() => {
    const naturalEnd =
      (effect.kind === "video" || effect.kind === "audio") && !effect.loop;
    const ms = effect.durationMs > 0 ? effect.durationMs : 5000;
    if (naturalEnd && effect.durationMs === 0) {
      // Sicherheitsnetz, falls das Medium nie "ended" feuert
      const fallback = window.setTimeout(() => doneCb.current(), 10 * 60 * 1000);
      return () => window.clearTimeout(fallback);
    }
    const t = window.setTimeout(() => doneCb.current(), ms);
    return () => window.clearTimeout(t);
  }, [effect]);

  if (effect.kind === "audio") {
    return (
      <audio
        src={url}
        autoPlay
        loop={effect.loop}
        ref={(el) => {
          if (el) el.volume = effect.volume;
        }}
        onEnded={done}
        onError={done}
      />
    );
  }

  return (
    <div style={positionStyle(effect)}>
      <motion.div
        variants={ANIMATION_VARIANTS[effect.animation]}
        initial="initial"
        animate="animate"
        exit="exit"
        style={{ width: "100%" }}
      >
        {effect.kind === "image" && (
          <img src={url} alt="" style={{ width: "100%", display: "block" }} draggable={false} />
        )}
        {effect.kind === "video" && (
          <video
            src={url}
            autoPlay
            loop={effect.loop}
            muted={effect.volume === 0}
            ref={(el) => {
              if (el) el.volume = effect.volume;
            }}
            onEnded={effect.loop ? undefined : done}
            onError={done}
            style={{ width: "100%", display: "block" }}
          />
        )}
        {effect.kind === "model" && <ModelViewer url={url} />}
      </motion.div>
    </div>
  );
}
