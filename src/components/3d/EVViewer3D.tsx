import React, { Suspense, useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  OrbitControls,
  useGLTF,
  MeshReflectorMaterial,
  Environment,
  ContactShadows,
  Float,
} from '@react-three/drei';
import * as THREE from 'three';

interface EVViewer3DProps {
  interactive?: boolean;
  accentColor?: string;
  wireframeMode?: boolean;
}

// ---------------------------------------------------------------------------
// 3D Car Model Component loaded directly from /Models/scene.gltf
// ---------------------------------------------------------------------------
function CarModel({ wireframe = false }: { wireframe?: boolean }) {
  // Load using standard GLTF loader via drei hook
  const { scene } = useGLTF('/Models/scene.gltf');
  const groupRef = useRef<THREE.Group>(null);

  // Compute bounding box, center model and tune automotive materials
  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);

    // Calculate bounding box of the whole model
    const bbox = new THREE.Box3().setFromObject(clone);
    const center = new THREE.Vector3();
    const size = new THREE.Vector3();
    bbox.getCenter(center);
    bbox.getSize(size);

    // Center geometry so rotation pivot is centered at origin and bottom sits precisely on floor
    clone.position.x = -center.x;
    clone.position.y = -bbox.min.y;
    clone.position.z = -center.z;

    // Apply cinematic glossy black automotive materials and cyan rim enhancements
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        const mat = mesh.material as THREE.MeshStandardMaterial;
        if (mat) {
          mat.wireframe = wireframe;

          const matName = mat.name || '';

          // Exterior Car Paint: Glossy deep obsidian black with high clearcoat/reflection
          if (matName.includes('Exterior')) {
            mat.metalness = 0.95;
            mat.roughness = 0.15;
            if ('clearcoat' in mat) {
              (mat as THREE.MeshPhysicalMaterial).clearcoat = 1.0;
              (mat as THREE.MeshPhysicalMaterial).clearcoatRoughness = 0.05;
            }
            if (mat.color) {
              // Deepen to mirror-gloss black
              mat.color.multiplyScalar(0.2);
            }
          }

          // Glass: Dark tinted high-reflectance glass
          if (matName.includes('Glass')) {
            mat.transparent = true;
            mat.opacity = 0.85;
            mat.roughness = 0.05;
            mat.metalness = 0.9;
            if (mat.color) {
              mat.color.set('#040b10');
            }
          }

          // Wheels & Rims: Metallic finish
          if (matName.includes('Wheel')) {
            mat.roughness = 0.28;
            mat.metalness = 0.88;
          }

          // Cockpit / Interior: Subtle dark contrast
          if (matName.includes('Cockpit')) {
            mat.roughness = 0.5;
          }

          mat.needsUpdate = true;
        }
      }
    });

    return clone;
  }, [scene, wireframe]);

  return (
    <group ref={groupRef} scale={[1, 1, 1]}>
      <primitive object={clonedScene} />
    </group>
  );
}

// Preload the gltf asset for instant responsiveness
useGLTF.preload('/Models/scene.gltf');

// ---------------------------------------------------------------------------
// Studio Rig with Cinematic Cyan/Turquoise Rim Lighting & Reflective Studio Floor
// ---------------------------------------------------------------------------
function StudioEnvironment({ accentColor = '#00f2fe' }: { accentColor?: string }) {
  const lightGroupRef = useRef<THREE.Group>(null);

  // Subtle breathing float for ambient rim lights
  useFrame((state) => {
    if (lightGroupRef.current) {
      const t = state.clock.getElapsedTime();
      lightGroupRef.current.position.y = Math.sin(t * 1.2) * 0.1;
    }
  });

  return (
    <>
      {/* Dark Studio Base Ambient */}
      <ambientLight intensity={0.45} />

      {/* Main Overhead Key Light */}
      <spotLight
        position={[0, 10, 2]}
        angle={0.6}
        penumbra={0.9}
        intensity={2.8}
        color="#ffffff"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0001}
      />

      {/* Dramatic Studio Rim Lights in Turquoise/Cyan */}
      <group ref={lightGroupRef}>
        {/* Left Rim Light - Intense Cyan Edge Glow */}
        <spotLight
          position={[-6, 2.8, -4]}
          angle={0.85}
          penumbra={1}
          intensity={6.5}
          color={accentColor}
          distance={16}
        />

        {/* Right Rim Light - Crisp Soft Turquoise Silhouette Accent */}
        <spotLight
          position={[6, 2.5, -4]}
          angle={0.85}
          penumbra={1}
          intensity={5.8}
          color="#00e5ff"
          distance={16}
        />

        {/* Front-Low Chin Accent */}
        <pointLight position={[0, 0.4, 4.2]} intensity={1.8} color="#00f2fe" distance={7} />

        {/* Rear Aerodynamic Glow */}
        <pointLight position={[0, 0.9, -4.5]} intensity={3.5} color="#00bcd4" distance={8} />

        {/* Lateral Rim Strip Fill */}
        <pointLight position={[-4.5, 1.2, 0]} intensity={2.2} color="#00e5ff" distance={8} />
        <pointLight position={[4.5, 1.2, 0]} intensity={2.0} color="#38bdf8" distance={8} />
      </group>

      {/* Reflective Studio Floor with Mirror Reflection */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <MeshReflectorMaterial
          blur={[400, 200]}
          resolution={1024}
          mirror={0.75}
          mixBlur={1.0}
          mixStrength={4.5}
          roughness={0.25}
          depthScale={1.2}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#040608"
          metalness={0.85}
        />
      </mesh>

      {/* Contact Shadow on Floor right below chassis */}
      <ContactShadows
        position={[0, 0, 0]}
        opacity={0.85}
        scale={10}
        blur={2.0}
        far={3.5}
        resolution={1024}
        color="#000000"
      />

      {/* Ground Neon Accent Rings matching reference */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <ringGeometry args={[3.8, 3.86, 128]} />
        <meshBasicMaterial
          color={accentColor}
          transparent
          opacity={0.35}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 0]}>
        <ringGeometry args={[4.4, 4.43, 128]} />
        <meshBasicMaterial
          color="#00e5ff"
          transparent
          opacity={0.18}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Subtle Studio HDR Reflections */}
      <Environment preset="city" environmentIntensity={0.65} />
    </>
  );
}

// ---------------------------------------------------------------------------
// Main Exported EVViewer3D Component
// ---------------------------------------------------------------------------
export const EVViewer3D: React.FC<EVViewer3DProps> = ({
  interactive = true,
  accentColor = '#00f2fe',
  wireframeMode = false,
}) => {
  const controlsRef = useRef<any>(null);

  // Resume gentle rotation after interaction
  useEffect(() => {
    let timer: any;
    const controls = controlsRef.current;
    if (!controls) return;

    const handleStart = () => {
      clearTimeout(timer);
      controls.autoRotate = false;
    };

    const handleEnd = () => {
      timer = setTimeout(() => {
        if (controlsRef.current) {
          controlsRef.current.autoRotate = true;
        }
      }, 2500);
    };

    controls.addEventListener('start', handleStart);
    controls.addEventListener('end', handleEnd);

    return () => {
      clearTimeout(timer);
      controls.removeEventListener('start', handleStart);
      controls.removeEventListener('end', handleEnd);
    };
  }, []);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '440px',
        backgroundColor: '#05070a',
        borderRadius: 'inherit',
        overflow: 'hidden',
        userSelect: 'none',
      }}
    >
      <Canvas
        shadows
        camera={{ position: [5.2, 2.2, 5.8], fov: 42, near: 0.1, far: 100 }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.15,
          powerPreference: 'high-performance',
        }}
        dpr={[1, 2]}
        style={{ width: '100%', height: '100%' }}
      >
        <color attach="background" args={['#05080c']} />
        <fog attach="fog" args={['#05080c', 12, 28]} />

        <Suspense fallback={null}>
          <StudioEnvironment accentColor={accentColor} />

          {/* Floated car presentation with smooth auto-rotation */}
          <Float
            speed={1.2}
            rotationIntensity={0.08}
            floatIntensity={0.12}
            floatingRange={[-0.03, 0.03]}
          >
            <CarModel wireframe={wireframeMode} />
          </Float>

          {/* Interactive Camera Controls */}
          {interactive && (
            <OrbitControls
              ref={controlsRef}
              enableZoom={true}
              enablePan={false}
              enableRotate={true}
              autoRotate={true}
              autoRotateSpeed={0.9}
              minDistance={3.8}
              maxDistance={12}
              maxPolarAngle={Math.PI / 2 - 0.04} // Prevent camera clipping through the reflective floor
              minPolarAngle={Math.PI / 6}
              target={[0, 0.75, 0]}
              dampingFactor={0.05}
            />
          )}
        </Suspense>
      </Canvas>

      {/* Cinematic HUD Badge Overlay */}
      {interactive && (
        <div
          style={{
            position: 'absolute',
            bottom: '14px',
            right: '16px',
            pointerEvents: 'none',
            fontSize: '0.75rem',
            letterSpacing: '0.06em',
            color: '#38bdf8',
            background: 'rgba(5, 12, 20, 0.78)',
            backdropFilter: 'blur(10px)',
            padding: '6px 14px',
            borderRadius: '999px',
            border: '1px solid rgba(56, 189, 248, 0.28)',
            boxShadow: '0 4px 18px rgba(0, 242, 254, 0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontWeight: 500,
          }}
        >
          <span
            style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              backgroundColor: '#00f2fe',
              boxShadow: '0 0 8px #00f2fe',
              display: 'inline-block',
            }}
          />
          Interactive 3D Studio &bull; Drag to rotate &bull; Scroll to zoom
        </div>
      )}
    </div>
  );
};
