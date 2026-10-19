import * as THREE from 'three';
import { createHazardTexture, createBuildingTexture } from './textures';
import { ObstacleType, PowerUpType } from '../types';

export const LANE_WIDTH = 3.6;

// Reusable shared materials to maximize performance and batching
const materials = {
  runnerArmor: new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.25,
    metalness: 0.85,
  }),
  runnerAccent: new THREE.MeshStandardMaterial({
    color: 0x06b6d4, // Neon cyan
    roughness: 0.2,
    metalness: 0.9,
    emissive: 0x0891b2,
    emissiveIntensity: 0.8,
  }),
  runnerVisor: new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    roughness: 0.1,
    metalness: 0.95,
    emissive: 0x0284c7,
    emissiveIntensity: 1.5,
  }),
  runnerSkin: new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.5,
    metalness: 0.3,
  }),
  contactShadow: new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0.45,
    depthWrite: false,
  }),
  barrierMetal: new THREE.MeshStandardMaterial({
    color: 0x475569,
    roughness: 0.5,
    metalness: 0.7,
  }),
  droneBody: new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.3,
    metalness: 0.85,
  }),
  droneEye: new THREE.MeshStandardMaterial({
    color: 0xef4444, // Red hazard
    emissive: 0xdc2626,
    emissiveIntensity: 1.8,
    roughness: 0.1,
    metalness: 0.9,
  }),
  coinGold: new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    roughness: 0.15,
    metalness: 0.9,
    emissive: 0xd97706,
    emissiveIntensity: 0.6,
  }),
  coinRim: new THREE.MeshStandardMaterial({
    color: 0xfef08a,
    roughness: 0.1,
    metalness: 0.95,
    emissive: 0xf59e0b,
    emissiveIntensity: 0.9,
  }),
  shieldBubble: new THREE.MeshPhysicalMaterial({
    color: 0x38bdf8,
    roughness: 0.1,
    metalness: 0.1,
    transmission: 0.85,
    transparent: true,
    opacity: 0.75,
    emissive: 0x0284c7,
    emissiveIntensity: 0.8,
  }),
  gantryBeam: new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.6,
    metalness: 0.6,
  }),
  hazardSign: new THREE.MeshStandardMaterial({
    color: 0xf43f5e,
    emissive: 0xe11d48,
    emissiveIntensity: 1.2,
    roughness: 0.2,
  }),
  lightPole: new THREE.MeshStandardMaterial({
    color: 0x64748b,
    roughness: 0.4,
    metalness: 0.8,
  }),
  lightGlow: new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
  }),
};

/**
 * Runner Character: Composite articulated humanoid cyber-runner
 * Composed of:
 * 1. Root group with grounded contact shadow
 * 2. Torso with cyber chestplate & back power unit
 * 3. Aerodynamic helmet with cyan glowing visor
 * 4. Left/Right upper and lower arms (for dynamic running swing)
 * 5. Left/Right thighs, shins, and boots (for running stride kinematics)
 */
export interface RunnerModelNodes {
  group: THREE.Group;
  torso: THREE.Group;
  head: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  shieldMesh: THREE.Mesh;
  magnetFx: THREE.Group;
  shadowMesh: THREE.Mesh;
}

export function createRunnerModel(): RunnerModelNodes {
  const group = new THREE.Group();

  // 1. Soft contact shadow plane beneath runner
  const shadowGeo = new THREE.CircleGeometry(0.75, 16);
  shadowGeo.rotateX(-Math.PI / 2);
  const shadowMesh = new THREE.Mesh(shadowGeo, materials.contactShadow);
  shadowMesh.position.y = 0.02;
  group.add(shadowMesh);

  // 2. Hip / Torso group (centered around waist height ~ 1.0)
  const torso = new THREE.Group();
  torso.position.y = 1.0;

  // Chest / upper body
  const chestGeo = new THREE.BoxGeometry(0.55, 0.6, 0.35);
  const chestMesh = new THREE.Mesh(chestGeo, materials.runnerArmor);
  chestMesh.castShadow = true;
  chestMesh.position.y = 0.3;
  torso.add(chestMesh);

  // Cyber chest core (accent glow)
  const coreGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.06, 8);
  coreGeo.rotateX(Math.PI / 2);
  const coreMesh = new THREE.Mesh(coreGeo, materials.runnerAccent);
  coreMesh.position.set(0, 0.35, 0.18);
  torso.add(coreMesh);

  // Back thruster / powerpack
  const packGeo = new THREE.BoxGeometry(0.35, 0.4, 0.15);
  const packMesh = new THREE.Mesh(packGeo, materials.runnerArmor);
  packMesh.position.set(0, 0.3, -0.22);
  torso.add(packMesh);

  // Thruster nozzles
  const nozzleGeo = new THREE.CylinderGeometry(0.04, 0.06, 0.12, 8);
  const nozzleL = new THREE.Mesh(nozzleGeo, materials.runnerAccent);
  nozzleL.position.set(-0.1, 0.12, -0.25);
  const nozzleR = new THREE.Mesh(nozzleGeo, materials.runnerAccent);
  nozzleR.position.set(0.1, 0.12, -0.25);
  torso.add(nozzleL, nozzleR);

  // 3. Head & Helmet
  const head = new THREE.Group();
  head.position.set(0, 0.65, 0.02);

  const helmetGeo = new THREE.BoxGeometry(0.32, 0.35, 0.34);
  const helmetMesh = new THREE.Mesh(helmetGeo, materials.runnerArmor);
  helmetMesh.castShadow = true;
  head.add(helmetMesh);

  // Visor (curved cyber slit)
  const visorGeo = new THREE.BoxGeometry(0.28, 0.1, 0.1);
  const visorMesh = new THREE.Mesh(visorGeo, materials.runnerVisor);
  visorMesh.position.set(0, 0.02, 0.16);
  head.add(visorMesh);

  torso.add(head);

  // 4. Arms
  const armGeo = new THREE.BoxGeometry(0.14, 0.55, 0.14);
  armGeo.translate(0, -0.25, 0); // pivot at shoulder

  const leftArm = new THREE.Group();
  leftArm.position.set(-0.35, 0.55, 0);
  const leftArmMesh = new THREE.Mesh(armGeo, materials.runnerSkin);
  leftArmMesh.castShadow = true;
  // Wrist guard
  const cuffGeo = new THREE.BoxGeometry(0.16, 0.15, 0.16);
  const cuffL = new THREE.Mesh(cuffGeo, materials.runnerAccent);
  cuffL.position.y = -0.4;
  leftArm.add(leftArmMesh, cuffL);

  const rightArm = new THREE.Group();
  rightArm.position.set(0.35, 0.55, 0);
  const rightArmMesh = new THREE.Mesh(armGeo, materials.runnerSkin);
  rightArmMesh.castShadow = true;
  const cuffR = new THREE.Mesh(cuffGeo, materials.runnerAccent);
  cuffR.position.y = -0.4;
  rightArm.add(rightArmMesh, cuffR);

  torso.add(leftArm, rightArm);
  group.add(torso);

  // 5. Legs
  const legGeo = new THREE.BoxGeometry(0.18, 0.85, 0.18);
  legGeo.translate(0, -0.42, 0); // pivot at hip

  const leftLeg = new THREE.Group();
  leftLeg.position.set(-0.16, 0.95, 0);
  const leftLegMesh = new THREE.Mesh(legGeo, materials.runnerSkin);
  leftLegMesh.castShadow = true;
  // Cyber boot
  const bootGeo = new THREE.BoxGeometry(0.2, 0.22, 0.32);
  const bootL = new THREE.Mesh(bootGeo, materials.runnerAccent);
  bootL.position.set(0, -0.85, 0.06);
  leftLeg.add(leftLegMesh, bootL);

  const rightLeg = new THREE.Group();
  rightLeg.position.set(0.16, 0.95, 0);
  const rightLegMesh = new THREE.Mesh(legGeo, materials.runnerSkin);
  rightLegMesh.castShadow = true;
  const bootR = new THREE.Mesh(bootGeo, materials.runnerAccent);
  bootR.position.set(0, -0.85, 0.06);
  rightLeg.add(rightLegMesh, bootR);

  group.add(leftLeg, rightLeg);

  // 6. Shield Energy Bubble (invisible unless active)
  const shieldGeo = new THREE.SphereGeometry(1.25, 24, 24);
  const shieldMesh = new THREE.Mesh(shieldGeo, materials.shieldBubble);
  shieldMesh.position.y = 1.0;
  shieldMesh.visible = false;
  group.add(shieldMesh);

  // 7. Magnet VFX aura ring
  const magnetRingGeo = new THREE.TorusGeometry(0.9, 0.04, 8, 24);
  magnetRingGeo.rotateX(Math.PI / 2);
  const magnetRingMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    wireframe: true,
    transparent: true,
    opacity: 0.6,
  });
  const magnetRingMesh = new THREE.Mesh(magnetRingGeo, magnetRingMat);
  const magnetFx = new THREE.Group();
  magnetFx.position.y = 0.5;
  magnetFx.add(magnetRingMesh);
  magnetFx.visible = false;
  group.add(magnetFx);

  return {
    group,
    torso,
    head,
    leftArm,
    rightArm,
    leftLeg,
    rightLeg,
    shieldMesh,
    magnetFx,
    shadowMesh,
  };
}

/**
 * Creates 3D Obstacle models based on type
 */
export function createObstacleModel(type: ObstacleType): THREE.Group {
  const group = new THREE.Group();

  switch (type) {
    case 'BARRIER': {
      // Low Road Barrier (jump over or switch lane, height ~0.8)
      // Contact shadow
      const shadowGeo = new THREE.PlaneGeometry(2.4, 0.8);
      shadowGeo.rotateX(-Math.PI / 2);
      const shadow = new THREE.Mesh(shadowGeo, materials.contactShadow);
      shadow.position.y = 0.02;
      group.add(shadow);

      // Support pillars
      const pillarGeo = new THREE.CylinderGeometry(0.12, 0.16, 0.75, 8);
      const pillarL = new THREE.Mesh(pillarGeo, materials.barrierMetal);
      pillarL.position.set(-0.9, 0.38, 0);
      pillarL.castShadow = true;
      const pillarR = new THREE.Mesh(pillarGeo, materials.barrierMetal);
      pillarR.position.set(0.9, 0.38, 0);
      pillarR.castShadow = true;
      group.add(pillarL, pillarR);

      // Hazard Crossbar
      const barGeo = new THREE.BoxGeometry(2.2, 0.3, 0.18);
      const hazardTex = createHazardTexture();
      hazardTex.repeat.set(4, 1);
      const hazardMat = new THREE.MeshStandardMaterial({
        map: hazardTex,
        roughness: 0.4,
        metalness: 0.5,
      });
      const bar = new THREE.Mesh(barGeo, hazardMat);
      bar.position.set(0, 0.55, 0);
      bar.castShadow = true;
      group.add(bar);

      // Top amber hazard flashers
      const flasherGeo = new THREE.SphereGeometry(0.08, 8, 8);
      const flasherMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
      const flasherL = new THREE.Mesh(flasherGeo, flasherMat);
      flasherL.position.set(-0.9, 0.78, 0);
      const flasherR = new THREE.Mesh(flasherGeo, flasherMat);
      flasherR.position.set(0.9, 0.78, 0);
      group.add(flasherL, flasherR);
      break;
    }

    case 'HIGH_BEAM': {
      // Overhead Highway Warning Gantry (clearance under is ~1.1, top is 2.5)
      // Must SLIDE underneath or change lane!
      const legGeo = new THREE.BoxGeometry(0.2, 2.5, 0.2);
      const legL = new THREE.Mesh(legGeo, materials.gantryBeam);
      legL.position.set(-1.4, 1.25, 0);
      legL.castShadow = true;
      const legR = new THREE.Mesh(legGeo, materials.gantryBeam);
      legR.position.set(1.4, 1.25, 0);
      legR.castShadow = true;
      group.add(legL, legR);

      // Overhead beam
      const beamGeo = new THREE.BoxGeometry(3.0, 0.35, 0.35);
      const beam = new THREE.Mesh(beamGeo, materials.gantryBeam);
      beam.position.set(0, 2.3, 0);
      beam.castShadow = true;
      group.add(beam);

      // Hanging cyber hazard laser curtain / sign
      const signGeo = new THREE.BoxGeometry(2.6, 0.8, 0.1);
      const sign = new THREE.Mesh(signGeo, materials.hazardSign);
      sign.position.set(0, 1.7, 0);
      group.add(sign);

      // Glowing laser warning line at bottom of sign (at height ~1.3)
      const laserGeo = new THREE.CylinderGeometry(0.04, 0.04, 2.5, 8);
      laserGeo.rotateZ(Math.PI / 2);
      const laserMat = new THREE.MeshBasicMaterial({ color: 0xff0055 });
      const laser = new THREE.Mesh(laserGeo, laserMat);
      laser.position.set(0, 1.3, 0);
      group.add(laser);
      break;
    }

    case 'DRONE': {
      // Hovering Cyber Patrol Drone (floating at chest height ~1.2)
      // Must change lane to avoid!
      const shadowGeo = new THREE.CircleGeometry(0.5, 12);
      shadowGeo.rotateX(-Math.PI / 2);
      const shadow = new THREE.Mesh(shadowGeo, materials.contactShadow);
      shadow.position.y = 0.02;
      group.add(shadow);

      const droneGroup = new THREE.Group();
      droneGroup.name = 'droneAnimated';
      droneGroup.position.y = 1.25;

      // Central core
      const coreGeo = new THREE.SphereGeometry(0.42, 16, 16);
      const core = new THREE.Mesh(coreGeo, materials.droneBody);
      core.castShadow = true;
      droneGroup.add(core);

      // Red scanning eye
      const eyeGeo = new THREE.SphereGeometry(0.18, 12, 12);
      const eye = new THREE.Mesh(eyeGeo, materials.droneEye);
      eye.position.set(0, 0, 0.32);
      droneGroup.add(eye);

      // Side thruster pods
      const podGeo = new THREE.CylinderGeometry(0.1, 0.12, 0.45, 8);
      const podL = new THREE.Mesh(podGeo, materials.barrierMetal);
      podL.position.set(-0.55, 0, 0);
      podL.castShadow = true;
      const podR = new THREE.Mesh(podGeo, materials.barrierMetal);
      podR.position.set(0.55, 0, 0);
      podR.castShadow = true;
      droneGroup.add(podL, podR);

      // Blue thruster flame glow
      const flameGeo = new THREE.ConeGeometry(0.08, 0.25, 8);
      const flameMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
      const flameL = new THREE.Mesh(flameGeo, flameMat);
      flameL.position.set(-0.55, -0.28, 0);
      const flameR = new THREE.Mesh(flameGeo, flameMat);
      flameR.position.set(0.55, -0.28, 0);
      droneGroup.add(flameL, flameR);

      group.add(droneGroup);
      break;
    }

    case 'ROAD_BLOCK': {
      // Concrete hazard block with warning stripes
      const shadowGeo = new THREE.PlaneGeometry(1.8, 1.2);
      shadowGeo.rotateX(-Math.PI / 2);
      const shadow = new THREE.Mesh(shadowGeo, materials.contactShadow);
      shadow.position.y = 0.02;
      group.add(shadow);

      const blockGeo = new THREE.BoxGeometry(1.6, 1.2, 0.8);
      const blockMat = new THREE.MeshStandardMaterial({
        color: 0x334155,
        roughness: 0.8,
        metalness: 0.2,
      });
      const block = new THREE.Mesh(blockGeo, blockMat);
      block.position.y = 0.6;
      block.castShadow = true;
      group.add(block);

      // Front hazard panel
      const panelGeo = new THREE.PlaneGeometry(1.5, 0.8);
      const hazardTex = createHazardTexture();
      hazardTex.repeat.set(2, 1);
      const panelMat = new THREE.MeshStandardMaterial({ map: hazardTex });
      const panel = new THREE.Mesh(panelGeo, panelMat);
      panel.position.set(0, 0.6, 0.41);
      group.add(panel);

      // Top red beacon
      const beaconGeo = new THREE.CylinderGeometry(0.08, 0.1, 0.25, 8);
      const beacon = new THREE.Mesh(beaconGeo, materials.droneEye);
      beacon.position.set(0, 1.3, 0);
      group.add(beacon);
      break;
    }
  }

  return group;
}

/**
 * Creates 3D Golden Energy Coin
 */
export function createCoinModel(): THREE.Group {
  const group = new THREE.Group();

  // Floating shadow beneath coin
  const shadowGeo = new THREE.CircleGeometry(0.35, 12);
  shadowGeo.rotateX(-Math.PI / 2);
  const shadow = new THREE.Mesh(shadowGeo, materials.contactShadow);
  shadow.position.y = 0.02;
  group.add(shadow);

  // Outer beveled ring
  const coinGroup = new THREE.Group();
  coinGroup.name = 'coinSpinGroup';
  coinGroup.position.y = 0.85;

  const coinGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.09, 16);
  coinGeo.rotateX(Math.PI / 2);
  const coinMesh = new THREE.Mesh(coinGeo, materials.coinGold);
  coinMesh.castShadow = true;
  coinGroup.add(coinMesh);

  // Raised rim
  const rimGeo = new THREE.TorusGeometry(0.38, 0.04, 8, 16);
  const rimMesh = new THREE.Mesh(rimGeo, materials.coinRim);
  coinGroup.add(rimMesh);

  group.add(coinGroup);
  return group;
}

/**
 * Creates 3D Powerup Model (Magnet, Shield, Multiplier)
 */
export function createPowerUpModel(type: PowerUpType): THREE.Group {
  const group = new THREE.Group();

  const shadowGeo = new THREE.CircleGeometry(0.5, 12);
  shadowGeo.rotateX(-Math.PI / 2);
  const shadow = new THREE.Mesh(shadowGeo, materials.contactShadow);
  shadow.position.y = 0.02;
  group.add(shadow);

  const inner = new THREE.Group();
  inner.name = 'powerupSpinGroup';
  inner.position.y = 1.0;

  if (type === 'MAGNET') {
    // Horseshoe shape
    const magnetMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      metalness: 0.8,
      roughness: 0.2,
      emissive: 0xb91c1c,
      emissiveIntensity: 0.5,
    });
    const tipMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      metalness: 0.9,
      roughness: 0.1,
      emissive: 0x0284c7,
      emissiveIntensity: 1.0,
    });
    const archGeo = new THREE.TorusGeometry(0.35, 0.1, 8, 16, Math.PI);
    const arch = new THREE.Mesh(archGeo, magnetMat);
    arch.rotation.z = Math.PI;
    inner.add(arch);

    const tipL = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.25, 0.2), tipMat);
    tipL.position.set(-0.35, -0.15, 0);
    const tipR = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.25, 0.2), tipMat);
    tipR.position.set(0.35, -0.15, 0);
    inner.add(tipL, tipR);
  } else if (type === 'SHIELD') {
    // Energy shield icon (icosahedron with glowing cyan core)
    const orbGeo = new THREE.IcosahedronGeometry(0.4, 1);
    const orbMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      metalness: 0.9,
      roughness: 0.1,
      emissive: 0x0284c7,
      emissiveIntensity: 1.2,
      wireframe: true,
    });
    const orb = new THREE.Mesh(orbGeo, orbMat);
    inner.add(orb);

    const coreMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.25, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0x06b6d4 })
    );
    inner.add(coreMesh);
  } else {
    // Multiplier "2X" (Golden star octahedron with amber glow)
    const starGeo = new THREE.OctahedronGeometry(0.4, 0);
    const starMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.95,
      roughness: 0.15,
      emissive: 0xd97706,
      emissiveIntensity: 1.2,
    });
    const star = new THREE.Mesh(starGeo, starMat);
    inner.add(star);

    const ringGeo = new THREE.TorusGeometry(0.55, 0.03, 8, 20);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    inner.add(ring);
  }

  group.add(inner);
  return group;
}

/**
 * Creates Overhead Highway Arch / Overpass that spans across all 3 lanes
 */
export function createHighwayArch(): THREE.Group {
  const group = new THREE.Group();

  const totalWidth = 14;
  const height = 6.5;

  // Concrete pillars left and right
  const colGeo = new THREE.BoxGeometry(0.8, height, 0.8);
  const colMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.7,
    metalness: 0.3,
  });
  const colL = new THREE.Mesh(colGeo, colMat);
  colL.position.set(-totalWidth / 2, height / 2, 0);
  colL.castShadow = true;

  const colR = new THREE.Mesh(colGeo, colMat);
  colR.position.set(totalWidth / 2, height / 2, 0);
  colR.castShadow = true;
  group.add(colL, colR);

  // Cross girder overhead
  const beamGeo = new THREE.BoxGeometry(totalWidth + 1.2, 0.9, 1.2);
  const beam = new THREE.Mesh(beamGeo, colMat);
  beam.position.set(0, height - 0.45, 0);
  beam.castShadow = true;
  group.add(beam);

  // Glowing cyan neon overhead strip
  const neonGeo = new THREE.BoxGeometry(totalWidth - 1, 0.12, 0.08);
  const neon = new THREE.Mesh(neonGeo, materials.runnerVisor);
  neon.position.set(0, height - 0.7, 0.62);
  group.add(neon);

  return group;
}

/**
 * Creates modern street light pole positioned along highway edge
 */
export function createStreetLight(isRightSide: boolean): THREE.Group {
  const group = new THREE.Group();
  const dir = isRightSide ? 1 : -1;

  // Vertical pole
  const poleGeo = new THREE.CylinderGeometry(0.1, 0.15, 6, 8);
  const pole = new THREE.Mesh(poleGeo, materials.lightPole);
  pole.position.set(0, 3, 0);
  pole.castShadow = true;
  group.add(pole);

  // Cantilever arm curving over the road
  const armGeo = new THREE.BoxGeometry(1.6, 0.1, 0.1);
  const arm = new THREE.Mesh(armGeo, materials.lightPole);
  arm.position.set(-dir * 0.8, 5.9, 0);
  group.add(arm);

  // Light fixture head
  const headGeo = new THREE.BoxGeometry(0.6, 0.08, 0.25);
  const head = new THREE.Mesh(headGeo, materials.lightGlow);
  head.position.set(-dir * 1.5, 5.85, 0);
  group.add(head);

  return group;
}

/**
 * Creates background skyscraper for procedural skyline
 */
export function createSkyscraper(height: number, width: number, depth: number): THREE.Mesh {
  const geo = new THREE.BoxGeometry(width, height, depth);
  const buildingTex = createBuildingTexture();
  buildingTex.repeat.set(width > 12 ? 3 : 2, Math.max(1, Math.floor(height / 15)));

  const mat = new THREE.MeshStandardMaterial({
    map: buildingTex,
    roughness: 0.6,
    metalness: 0.4,
  });

  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.y = height / 2;
  return mesh;
}
