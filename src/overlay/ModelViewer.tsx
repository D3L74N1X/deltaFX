import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Center, useGLTF } from "@react-three/drei";
import type { Group } from "three";

function SpinningModel({ url }: { url: string }) {
  const group = useRef<Group>(null);
  const { scene } = useGLTF(url);

  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.6;
  });

  return (
    <group ref={group}>
      <Center>
        <primitive object={scene} />
      </Center>
    </group>
  );
}

/**
 * Rendert ein GLTF/GLB-Modell auf einem transparenten Canvas,
 * damit in OBS nur das Modell selbst sichtbar ist.
 */
export function ModelViewer({ url }: { url: string }) {
  return (
    <Canvas
      gl={{ alpha: true, antialias: true }}
      camera={{ position: [0, 0.8, 3.2], fov: 45 }}
      style={{ width: "100%", aspectRatio: "1 / 1", background: "transparent" }}
    >
      <ambientLight intensity={0.9} />
      <directionalLight position={[3, 5, 2]} intensity={1.4} />
      <directionalLight position={[-3, 2, -2]} intensity={0.5} />
      <Suspense fallback={null}>
        <SpinningModel url={url} />
      </Suspense>
    </Canvas>
  );
}
