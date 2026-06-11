"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { HelipadParams, HelipadResults } from "@/lib/helipad";

interface Props {
  params: HelipadParams;
  results: HelipadResults;
}

/**
 * Build a stylised helicopter from primitives. `scale` sizes it relative to
 * the pad. Returns the group plus the rotor sub-groups so the caller can
 * animate them. All parts are measured from the bottom of the skids (y = 0).
 */
function buildHelicopter(scale: number) {
  const group = new THREE.Group();

  const bodyMat = new THREE.MeshStandardMaterial({
    color: "#1d4ed8",
    metalness: 0.3,
    roughness: 0.45,
  });
  const accentMat = new THREE.MeshStandardMaterial({
    color: "#e2e8f0",
    metalness: 0.2,
    roughness: 0.6,
  });
  const darkMat = new THREE.MeshStandardMaterial({
    color: "#1e293b",
    metalness: 0.4,
    roughness: 0.5,
  });
  const glassMat = new THREE.MeshStandardMaterial({
    color: "#93c5fd",
    metalness: 0.1,
    roughness: 0.1,
    transparent: true,
    opacity: 0.6,
  });

  const add = (
    geo: THREE.BufferGeometry,
    mat: THREE.Material,
    x: number,
    y: number,
    z: number,
    parent: THREE.Object3D = group,
  ) => {
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    parent.add(mesh);
    return mesh;
  };

  // Fuselage (capsule lying along z, nose toward +z)
  const fuselage = add(
    new THREE.CapsuleGeometry(0.85, 2.0, 8, 16),
    bodyMat,
    0,
    1.25,
    0,
  );
  fuselage.rotation.x = Math.PI / 2;

  // Cockpit glass at the nose
  const glass = add(new THREE.SphereGeometry(0.7, 20, 16), glassMat, 0, 1.3, 1.35);
  glass.scale.set(1, 0.85, 0.9);

  // Tail boom
  const boom = add(
    new THREE.CylinderGeometry(0.16, 0.22, 2.6, 16),
    bodyMat,
    0,
    1.45,
    -2.3,
  );
  boom.rotation.x = Math.PI / 2;

  // Vertical tail fin
  add(new THREE.BoxGeometry(0.12, 0.9, 0.7), accentMat, 0, 1.85, -3.5);

  // Tail rotor (spins around z, mounted on the side of the fin)
  const tailRotor = new THREE.Group();
  tailRotor.position.set(0.22, 1.85, -3.5);
  group.add(tailRotor);
  add(new THREE.CylinderGeometry(0.07, 0.07, 0.1, 12), darkMat, 0, 0, 0, tailRotor).rotation.z =
    Math.PI / 2;
  for (let i = 0; i < 2; i++) {
    const blade = add(new THREE.BoxGeometry(0.06, 1.1, 0.12), darkMat, 0, 0, 0, tailRotor);
    blade.rotation.x = (i * Math.PI) / 2;
  }

  // Landing skids
  const railGeo = new THREE.CylinderGeometry(0.08, 0.08, 3.0, 12);
  [-0.75, 0.75].forEach((x) => {
    const rail = add(railGeo.clone(), darkMat, x, 0.12, 0.1);
    rail.rotation.x = Math.PI / 2;
  });
  [-0.9, 0.9].forEach((z) => {
    [-0.55, 0.55].forEach((x) => {
      add(new THREE.CylinderGeometry(0.05, 0.05, 0.7, 10), darkMat, x, 0.5, z);
    });
  });

  // Main rotor mast
  add(new THREE.CylinderGeometry(0.1, 0.1, 0.6, 12), darkMat, 0, 2.35, 0);

  // Main rotor (spins around y) — hub + 4 blades
  const mainRotor = new THREE.Group();
  mainRotor.position.set(0, 2.65, 0);
  group.add(mainRotor);
  add(new THREE.CylinderGeometry(0.2, 0.2, 0.18, 16), darkMat, 0, 0, 0, mainRotor);
  for (let i = 0; i < 4; i++) {
    const blade = add(new THREE.BoxGeometry(0.16, 0.04, 5.4), darkMat, 0, 0.05, 0, mainRotor);
    blade.rotation.y = (i * Math.PI) / 2;
  }

  group.scale.setScalar(scale);
  return { group, mainRotor, tailRotor };
}

export default function Helipad3D({ params, results }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const markaRef = useRef<THREE.Group | null>(null);
  const mainRotorRef = useRef<THREE.Group | null>(null);
  const tailRotorRef = useRef<THREE.Group | null>(null);

  // One-time setup of renderer / scene / camera / controls.
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth;
    const height = mount.clientHeight || 420;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#eaeef3");
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 26, 30);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.target.set(0, 0, 0);

    scene.add(new THREE.AmbientLight(0xffffff, 0.75));
    const dir = new THREE.DirectionalLight(0xffffff, 1.1);
    dir.position.set(15, 30, 20);
    dir.castShadow = true;
    scene.add(dir);

    const marka = new THREE.Group();
    markaRef.current = marka;
    scene.add(marka);

    let raf = 0;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      if (mainRotorRef.current) mainRotorRef.current.rotation.y += 0.35;
      if (tailRotorRef.current) tailRotorRef.current.rotation.x += 0.5;
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight || 420;
      if (w === 0 || h === 0) return; // container hidden — skip
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    // Re-fit whenever the container changes size (e.g. when the 3D tab,
    // initially hidden with width 0, becomes visible).
    const ro = new ResizeObserver(() => onResize());
    ro.observe(mount);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      ro.disconnect();
      controls.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Rebuild geometry whenever params change.
  useEffect(() => {
    const marka = markaRef.current;
    if (!marka) return;

    // clear previous
    mainRotorRef.current = null;
    tailRotorRef.current = null;
    while (marka.children.length) {
      const c = marka.children.pop()!;
      c.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        if (mesh.material) {
          const m = mesh.material as THREE.Material | THREE.Material[];
          if (Array.isArray(m)) m.forEach((mm) => mm.dispose());
          else m.dispose();
        }
      });
    }

    const half = params.totalArea / 2;

    // Ground area (grey square)
    const ground = new THREE.Mesh(
      new THREE.BoxGeometry(params.totalArea, 0.4, params.totalArea),
      new THREE.MeshStandardMaterial({ color: "#5d646e" }),
    );
    ground.position.y = -0.2;
    ground.receiveShadow = true;
    marka.add(ground);

    // Yellow ring (thin cylinder)
    const yellow = new THREE.Mesh(
      new THREE.CylinderGeometry(results.radiusKuning, results.radiusKuning, 0.12, 64),
      new THREE.MeshStandardMaterial({ color: "#f4e000" }),
    );
    yellow.position.y = 0.06;
    marka.add(yellow);

    // Green TLOF circle
    const green = new THREE.Mesh(
      new THREE.CylinderGeometry(results.radiusHijau, results.radiusHijau, 0.16, 64),
      new THREE.MeshStandardMaterial({ color: "#6fae1f" }),
    );
    green.position.y = 0.1;
    marka.add(green);

    // White H (three bars)
    const whiteMat = new THREE.MeshStandardMaterial({ color: "#ffffff" });
    const barY = 0.2;
    const mkBar = (w: number, d: number, x: number, z: number) => {
      const bar = new THREE.Mesh(new THREE.BoxGeometry(w, 0.08, d), whiteMat);
      bar.position.set(x, barY, z);
      marka.add(bar);
    };
    mkBar(params.hStroke, params.hHeight, -(params.hWidth / 2 - params.hStroke / 2), 0);
    mkBar(params.hStroke, params.hHeight, params.hWidth / 2 - params.hStroke / 2, 0);
    mkBar(params.hWidth, params.hStroke, 0, 0);

    // Helicopter resting on the pad, scaled to the TLOF diameter.
    const heli = buildHelicopter(Math.max(params.diameterTLOF, 4) / 9);
    heli.group.position.y = 0.28;
    marka.add(heli.group);
    mainRotorRef.current = heli.mainRotor;
    tailRotorRef.current = heli.tailRotor;

    // helper grid bounds reference (subtle)
    void half;
  }, [params, results]);

  return <div ref={mountRef} className="h-[420px] w-full rounded-xl" />;
}
