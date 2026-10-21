import * as THREE from 'three';
import {
  createHazardTexture,
  createBuildingTexture,
  createSubwayTrainTexture,
  createBrickTunnelTexture,
  createHoverboardTexture,
  createMysteryBoxTexture,
} from './textures';
import { ObstacleType, PowerUpType } from '../types';

export const TRACK_WIDTH = 3.6; // Distance between tracks: -3.6, 0, +3.6
export const TRAIN_ROOF_HEIGHT = 3.2; // Height of train roof above ground

// Shared materials for 60fps rendering performance
const materials = {
  // Runner Character Materials (Subway Surfers Jake Style)
  runnerDenimVest: new THREE.MeshStandardMaterial({
    color: 0x1d4ed8, // Vibrant royal denim blue vest
    roughness: 0.45,
    metalness: 0.1,
  }),
  runnerHoodieWhite: new THREE.MeshStandardMaterial({
    color: 0xf8fafc, // Clean white hoodie underneath
    roughness: 0.5,
    metalness: 0.05,
  }),
  runnerCapRed: new THREE.MeshStandardMaterial({
    color: 0xef4444, // Red street backwards cap
    roughness: 0.4,
    metalness: 0.1,
  }),
  runnerCapBrimWhite: new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.3,
  }),
  runnerSkin: new THREE.MeshStandardMaterial({
    color: 0xfbbf24, // Warm stylized skin tone
    roughness: 0.6,
  }),
  runnerSneakers: new THREE.MeshStandardMaterial({
    color: 0xef4444, // Red high-tops with white sole
    roughness: 0.3,
    metalness: 0.2,
  }),
  runnerSneakerSole: new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.4,
  }),
  runnerSprayCan: new THREE.MeshStandardMaterial({
    color: 0x06b6d4, // Cyan spray paint can
    roughness: 0.2,
    metalness: 0.8,
  }),
  runnerPants: new THREE.MeshStandardMaterial({
    color: 0x1e293b, // Dark denim cargo pants
    roughness: 0.65,
    metalness: 0.05,
  }),
  contactShadow: new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0.45,
    depthWrite: false,
  }),

  // Inspector Guard Materials
  inspectorUniform: new THREE.MeshStandardMaterial({
    color: 0x0f172a, // Deep navy police uniform
    roughness: 0.4,
    metalness: 0.15,
  }),
  inspectorBadge: new THREE.MeshStandardMaterial({
    color: 0xfbbf24, // Gold police badge
    roughness: 0.2,
    metalness: 0.9,
    emissive: 0xd97706,
    emissiveIntensity: 0.4,
  }),
  inspectorHatVisor: new THREE.MeshStandardMaterial({
    color: 0x020617,
    roughness: 0.1,
    metalness: 0.9,
  }),
  inspectorMustache: new THREE.MeshStandardMaterial({
    color: 0x1c1917, // Thick dark mustache
    roughness: 0.9,
  }),

  // Pitbull Dog Materials
  dogFur: new THREE.MeshStandardMaterial({
    color: 0x92400e, // Warm brown bulldog fur
    roughness: 0.7,
  }),
  dogWhitePatch: new THREE.MeshStandardMaterial({
    color: 0xfef3c7,
    roughness: 0.7,
  }),
  dogCollar: new THREE.MeshStandardMaterial({
    color: 0xdc2626, // Red studded spiked collar
    roughness: 0.3,
  }),
  dogSpikes: new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.2,
    metalness: 0.9,
  }),

  // Train Materials
  trainSteel: new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.4,
    metalness: 0.8,
  }),
  trainRampWood: new THREE.MeshStandardMaterial({
    color: 0xd97706,
    roughness: 0.6,
    metalness: 0.2,
  }),
  trainHeadlight: new THREE.MeshBasicMaterial({
    color: 0xffffff,
  }),
  trainYellowLight: new THREE.MeshBasicMaterial({
    color: 0xfbbf24,
  }),
  trainBogie: new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.8,
    metalness: 0.9,
  }),
  trainRoof: new THREE.MeshStandardMaterial({
    color: 0x475569,
    roughness: 0.5,
    metalness: 0.6,
  }),

  // Railway Infrastructure & Tunnel
  catenarySteel: new THREE.MeshStandardMaterial({
    color: 0x64748b,
    roughness: 0.4,
    metalness: 0.75,
  }),
  signalRed: new THREE.MeshBasicMaterial({
    color: 0xef4444,
  }),
  signalGreen: new THREE.MeshBasicMaterial({
    color: 0x10b981,
  }),

  // Coins & Powerups
  coinGold: new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    roughness: 0.12,
    metalness: 0.92,
    emissive: 0xd97706,
    emissiveIntensity: 0.75,
  }),
  coinRim: new THREE.MeshStandardMaterial({
    color: 0xfef08a,
    roughness: 0.1,
    metalness: 0.95,
  }),
  jetpackMetal: new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    metalness: 0.9,
    roughness: 0.2,
  }),
  jetpackNozzle: new THREE.MeshStandardMaterial({
    color: 0xef4444,
    emissive: 0xdc2626,
    emissiveIntensity: 0.8,
    roughness: 0.3,
  }),
  hoverboardGlow: new THREE.MeshBasicMaterial({
    color: 0x06b6d4,
  }),
  letterGold: new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    metalness: 0.9,
    roughness: 0.15,
    emissive: 0xd97706,
    emissiveIntensity: 0.8,
  }),
};

export interface RunnerModelNodes {
  group: THREE.Group;
  torso: THREE.Group;
  head: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  sprayCan: THREE.Group;
  hoverboardMesh: THREE.Group;
  jetpackMesh: THREE.Group;
  magnetFx: THREE.Group;
  shadowMesh: THREE.Mesh;
}

export interface InspectorModelNodes {
  group: THREE.Group;
  torso: THREE.Group;
  head: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
}

export interface DogModelNodes {
  group: THREE.Group;
  body: THREE.Group;
  head: THREE.Group;
  tail: THREE.Mesh;
  legFL: THREE.Group;
  legFR: THREE.Group;
  legBL: THREE.Group;
  legBR: THREE.Group;
}

/**
 * Creates Subway Surfers Jake Runner Character
 */
export function createRunnerModel(): RunnerModelNodes {
  const group = new THREE.Group();

  // Contact shadow
  const shadowGeo = new THREE.CircleGeometry(0.7, 16);
  shadowGeo.rotateX(-Math.PI / 2);
  const shadowMesh = new THREE.Mesh(shadowGeo, materials.contactShadow);
  shadowMesh.position.y = 0.02;
  group.add(shadowMesh);

  // Torso
  const torso = new THREE.Group();
  torso.position.y = 1.0;

  // White Hoodie underlayer
  const hoodieGeo = new THREE.BoxGeometry(0.52, 0.64, 0.36);
  const hoodieMesh = new THREE.Mesh(hoodieGeo, materials.runnerHoodieWhite);
  hoodieMesh.castShadow = true;
  hoodieMesh.position.y = 0.32;
  torso.add(hoodieMesh);

  // Denim Vest over hoodie
  const vestGeo = new THREE.BoxGeometry(0.55, 0.58, 0.39);
  const vestMesh = new THREE.Mesh(vestGeo, materials.runnerDenimVest);
  vestMesh.castShadow = true;
  vestMesh.position.y = 0.34;
  torso.add(vestMesh);

  // Red Hoodie Collar
  const collarMesh = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.16, 0.38), materials.runnerCapRed);
  collarMesh.position.y = 0.62;
  torso.add(collarMesh);

  // Head
  const head = new THREE.Group();
  head.position.set(0, 0.72, 0.02);

  const faceGeo = new THREE.BoxGeometry(0.32, 0.34, 0.32);
  const faceMesh = new THREE.Mesh(faceGeo, materials.runnerSkin);
  faceMesh.castShadow = true;
  head.add(faceMesh);

  // Backwards Red Street Cap
  const capCrownGeo = new THREE.BoxGeometry(0.34, 0.22, 0.34);
  const capCrown = new THREE.Mesh(capCrownGeo, materials.runnerCapRed);
  capCrown.position.set(0, 0.14, 0);
  head.add(capCrown);

  // Backwards brim (pointing backwards)
  const brimGeo = new THREE.BoxGeometry(0.32, 0.05, 0.26);
  const brimMesh = new THREE.Mesh(brimGeo, materials.runnerCapBrimWhite);
  brimMesh.position.set(0, 0.1, -0.25);
  head.add(brimMesh);

  torso.add(head);

  // Arms
  const armGeo = new THREE.BoxGeometry(0.14, 0.54, 0.14);
  armGeo.translate(0, -0.24, 0);

  const leftArm = new THREE.Group();
  leftArm.position.set(-0.35, 0.56, 0);
  const leftArmMesh = new THREE.Mesh(armGeo, materials.runnerHoodieWhite);
  leftArmMesh.castShadow = true;
  leftArm.add(leftArmMesh);

  const rightArm = new THREE.Group();
  rightArm.position.set(0.35, 0.56, 0);
  const rightArmMesh = new THREE.Mesh(armGeo, materials.runnerHoodieWhite);
  rightArmMesh.castShadow = true;
  rightArm.add(rightArmMesh);

  // Spray Paint Can in right hand!
  const sprayCan = new THREE.Group();
  const canGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.22, 10);
  const canMesh = new THREE.Mesh(canGeo, materials.runnerSprayCan);
  const nozzleGeo = new THREE.CylinderGeometry(0.02, 0.03, 0.05, 8);
  const nozzleMesh = new THREE.Mesh(nozzleGeo, materials.catenarySteel);
  nozzleMesh.position.y = 0.13;
  sprayCan.add(canMesh, nozzleMesh);
  sprayCan.position.set(0, -0.5, 0.1);
  sprayCan.rotation.x = 0.4;
  rightArm.add(sprayCan);

  torso.add(leftArm, rightArm);
  group.add(torso);

  // Legs & High-top Sneakers
  const legGeo = new THREE.BoxGeometry(0.18, 0.85, 0.18);
  legGeo.translate(0, -0.42, 0);

  const leftLeg = new THREE.Group();
  leftLeg.position.set(-0.16, 0.95, 0);
  const leftLegMesh = new THREE.Mesh(legGeo, materials.runnerPants);
  leftLegMesh.castShadow = true;

  const shoeL = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.34), materials.runnerSneakers);
  shoeL.position.set(0, -0.85, 0.06);
  shoeL.castShadow = true;
  const soleL = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.06, 0.36), materials.runnerSneakerSole);
  soleL.position.set(0, -0.96, 0.06);
  leftLeg.add(leftLegMesh, shoeL, soleL);

  const rightLeg = new THREE.Group();
  rightLeg.position.set(0.16, 0.95, 0);
  const rightLegMesh = new THREE.Mesh(legGeo, materials.runnerPants);
  rightLegMesh.castShadow = true;

  const shoeR = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.34), materials.runnerSneakers);
  shoeR.position.set(0, -0.85, 0.06);
  shoeR.castShadow = true;
  const soleR = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.06, 0.36), materials.runnerSneakerSole);
  soleR.position.set(0, -0.96, 0.06);
  rightLeg.add(rightLegMesh, shoeR, soleR);

  group.add(leftLeg, rightLeg);

  // Hoverboard
  const hoverboardMesh = createHoverboardMesh();
  hoverboardMesh.position.set(0, 0.1, 0);
  hoverboardMesh.visible = false;
  group.add(hoverboardMesh);

  // Jetpack
  const jetpackMesh = createJetpackMesh();
  jetpackMesh.position.set(0, 1.35, -0.28);
  jetpackMesh.visible = false;
  group.add(jetpackMesh);

  // Magnet VFX aura ring
  const magnetRingGeo = new THREE.TorusGeometry(0.95, 0.045, 8, 24);
  magnetRingGeo.rotateX(Math.PI / 2);
  const magnetRingMat = new THREE.MeshBasicMaterial({
    color: 0xf59e0b,
    wireframe: true,
    transparent: true,
    opacity: 0.7,
  });
  const magnetRingMesh = new THREE.Mesh(magnetRingGeo, magnetRingMat);
  const magnetFx = new THREE.Group();
  magnetFx.position.y = 0.6;
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
    sprayCan,
    hoverboardMesh,
    jetpackMesh,
    magnetFx,
    shadowMesh,
  };
}

/**
 * Creates the Inspector (Guarda/Polícia do Subway Surfers)
 */
export function createInspectorModel(): InspectorModelNodes {
  const group = new THREE.Group();

  // Shadow
  const shadowGeo = new THREE.CircleGeometry(0.85, 16);
  shadowGeo.rotateX(-Math.PI / 2);
  const shadow = new THREE.Mesh(shadowGeo, materials.contactShadow);
  shadow.position.y = 0.02;
  group.add(shadow);

  // Torso
  const torso = new THREE.Group();
  torso.position.y = 1.1;

  // Sturdy broad chest in Navy Uniform
  const chestGeo = new THREE.BoxGeometry(0.68, 0.75, 0.44);
  const chest = new THREE.Mesh(chestGeo, materials.inspectorUniform);
  chest.castShadow = true;
  chest.position.y = 0.38;
  torso.add(chest);

  // Gold Police Badge
  const badge = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.14, 0.04), materials.inspectorBadge);
  badge.position.set(-0.2, 0.52, 0.23);
  torso.add(badge);

  // Black Belt with Gold Buckle
  const belt = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.12, 0.46), materials.inspectorHatVisor);
  belt.position.y = 0.08;
  const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.14, 0.05), materials.inspectorBadge);
  buckle.position.set(0, 0.08, 0.24);
  torso.add(belt, buckle);

  // Head
  const head = new THREE.Group();
  head.position.set(0, 0.88, 0.02);

  const face = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.38, 0.36), materials.runnerSkin);
  face.castShadow = true;
  head.add(face);

  // Big Bushy Mustache
  const mustache = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.1, 0.08), materials.inspectorMustache);
  mustache.position.set(0, -0.06, 0.2);
  head.add(mustache);

  // Police Officer Peaked Cap
  const capBase = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.18, 0.44), materials.inspectorUniform);
  capBase.position.set(0, 0.2, 0);
  const capVisor = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.06, 0.22), materials.inspectorHatVisor);
  capVisor.position.set(0, 0.14, 0.24);
  capVisor.rotation.x = 0.15;
  const capEmblem = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.09, 0.04), materials.inspectorBadge);
  capEmblem.position.set(0, 0.24, 0.23);
  head.add(capBase, capVisor, capEmblem);

  torso.add(head);

  // Arms (Sturdy heavy arms)
  const armGeo = new THREE.BoxGeometry(0.18, 0.6, 0.18);
  armGeo.translate(0, -0.28, 0);

  const leftArm = new THREE.Group();
  leftArm.position.set(-0.44, 0.65, 0);
  const leftArmMesh = new THREE.Mesh(armGeo, materials.inspectorUniform);
  leftArmMesh.castShadow = true;
  leftArm.add(leftArmMesh);

  const rightArm = new THREE.Group();
  rightArm.position.set(0.44, 0.65, 0);
  const rightArmMesh = new THREE.Mesh(armGeo, materials.inspectorUniform);
  rightArmMesh.castShadow = true;
  rightArm.add(rightArmMesh);

  // Police baton/nightstick in right hand
  const batonGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.5, 8);
  const baton = new THREE.Mesh(batonGeo, materials.inspectorHatVisor);
  baton.position.set(0, -0.45, 0.15);
  baton.rotation.x = 0.5;
  rightArm.add(baton);

  torso.add(leftArm, rightArm);
  group.add(torso);

  // Legs & Black Boots
  const legGeo = new THREE.BoxGeometry(0.22, 0.95, 0.22);
  legGeo.translate(0, -0.45, 0);

  const leftLeg = new THREE.Group();
  leftLeg.position.set(-0.2, 1.05, 0);
  const leftLegMesh = new THREE.Mesh(legGeo, materials.inspectorUniform);
  leftLegMesh.castShadow = true;
  const bootL = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.22, 0.38), materials.inspectorHatVisor);
  bootL.position.set(0, -0.95, 0.06);
  bootL.castShadow = true;
  leftLeg.add(leftLegMesh, bootL);

  const rightLeg = new THREE.Group();
  rightLeg.position.set(0.2, 1.05, 0);
  const rightLegMesh = new THREE.Mesh(legGeo, materials.inspectorUniform);
  rightLegMesh.castShadow = true;
  const bootR = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.22, 0.38), materials.inspectorHatVisor);
  bootR.position.set(0, -0.95, 0.06);
  bootR.castShadow = true;
  rightLeg.add(rightLegMesh, bootR);

  group.add(leftLeg, rightLeg);

  return {
    group,
    torso,
    head,
    leftArm,
    rightArm,
    leftLeg,
    rightLeg,
  };
}

/**
 * Creates the Pitbull Dog (O Cãozinho do Guarda)
 */
export function createPitbullDogModel(): DogModelNodes {
  const group = new THREE.Group();

  // Shadow
  const shadowGeo = new THREE.CircleGeometry(0.48, 12);
  shadowGeo.rotateX(-Math.PI / 2);
  const shadow = new THREE.Mesh(shadowGeo, materials.contactShadow);
  shadow.position.y = 0.02;
  group.add(shadow);

  // Body
  const body = new THREE.Group();
  body.position.y = 0.42;

  // Stocky bulldog torso
  const torsoGeo = new THREE.BoxGeometry(0.38, 0.38, 0.65);
  const torso = new THREE.Mesh(torsoGeo, materials.dogFur);
  torso.castShadow = true;
  body.add(torso);

  // White chest patch
  const chest = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.28, 0.08), materials.dogWhitePatch);
  chest.position.set(0, -0.04, 0.33);
  body.add(chest);

  // Spiked red collar
  const collar = new THREE.Mesh(new THREE.BoxGeometry(0.39, 0.08, 0.4), materials.dogCollar);
  collar.position.set(0, 0.14, 0.28);
  body.add(collar);

  // Head
  const head = new THREE.Group();
  head.position.set(0, 0.24, 0.42);

  const skull = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.3, 0.32), materials.dogFur);
  skull.castShadow = true;
  head.add(skull);

  // Snout & jowls
  const snout = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.18, 0.18), materials.dogWhitePatch);
  snout.position.set(0, -0.06, 0.2);
  head.add(snout);

  // Black nose
  const nose = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, 0.06), materials.inspectorHatVisor);
  nose.position.set(0, 0, 0.3);
  head.add(nose);

  // Pink tongue out!
  const tongueMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e });
  const tongue = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.04, 0.14), tongueMat);
  tongue.position.set(0.04, -0.12, 0.26);
  tongue.rotation.x = 0.2;
  head.add(tongue);

  // Floppy ears
  const earL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.14, 0.1), materials.dogFur);
  earL.position.set(-0.19, 0.12, 0);
  earL.rotation.z = -0.3;
  const earR = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.14, 0.1), materials.dogFur);
  earR.position.set(0.19, 0.12, 0);
  earR.rotation.z = 0.3;
  head.add(earL, earR);

  body.add(head);

  // Wagging tail
  const tailGeo = new THREE.CylinderGeometry(0.03, 0.05, 0.24, 6);
  const tail = new THREE.Mesh(tailGeo, materials.dogFur);
  tail.position.set(0, 0.14, -0.36);
  tail.rotation.x = -0.8;
  body.add(tail);

  group.add(body);

  // 4 Animated Running Legs
  const legGeo = new THREE.BoxGeometry(0.1, 0.32, 0.1);
  legGeo.translate(0, -0.16, 0);

  const legFL = new THREE.Group();
  legFL.position.set(-0.16, 0.32, 0.22);
  legFL.add(new THREE.Mesh(legGeo, materials.dogFur));

  const legFR = new THREE.Group();
  legFR.position.set(0.16, 0.32, 0.22);
  legFR.add(new THREE.Mesh(legGeo, materials.dogFur));

  const legBL = new THREE.Group();
  legBL.position.set(-0.16, 0.32, -0.22);
  legBL.add(new THREE.Mesh(legGeo, materials.dogFur));

  const legBR = new THREE.Group();
  legBR.position.set(0.16, 0.32, -0.22);
  legBR.add(new THREE.Mesh(legGeo, materials.dogFur));

  group.add(legFL, legFR, legBL, legBR);

  return {
    group,
    body,
    head,
    tail,
    legFL,
    legFR,
    legBL,
    legBR,
  };
}

/**
 * Creates 3D Hoverboard model
 */
function createHoverboardMesh(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'hoverboard';

  const deckGeo = new THREE.BoxGeometry(0.65, 0.08, 1.5);
  const boardTex = createHoverboardTexture();
  const deckMat = new THREE.MeshStandardMaterial({
    map: boardTex,
    roughness: 0.3,
    metalness: 0.6,
  });
  const deck = new THREE.Mesh(deckGeo, deckMat);
  deck.castShadow = true;
  group.add(deck);

  // Glowing cyan repulsor plates underneath
  const thrusterGeo = new THREE.CylinderGeometry(0.12, 0.14, 0.06, 12);
  const thrusterF = new THREE.Mesh(thrusterGeo, materials.hoverboardGlow);
  thrusterF.position.set(0, -0.06, 0.5);
  const thrusterB = new THREE.Mesh(thrusterGeo, materials.hoverboardGlow);
  thrusterB.position.set(0, -0.06, -0.5);
  group.add(thrusterF, thrusterB);

  return group;
}

/**
 * Creates 3D Jetpack model for high flying
 */
function createJetpackMesh(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'jetpack';

  // Dual cylinders
  const tankGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.6, 12);
  const tankL = new THREE.Mesh(tankGeo, materials.jetpackMetal);
  tankL.position.set(-0.16, 0, 0);
  const tankR = new THREE.Mesh(tankGeo, materials.jetpackMetal);
  tankR.position.set(0.16, 0, 0);
  group.add(tankL, tankR);

  // Red rocket nozzles
  const nozzleGeo = new THREE.ConeGeometry(0.1, 0.18, 12);
  nozzleGeo.rotateX(Math.PI);
  const nozL = new THREE.Mesh(nozzleGeo, materials.jetpackNozzle);
  nozL.position.set(-0.16, -0.38, 0);
  const nozR = new THREE.Mesh(nozzleGeo, materials.jetpackNozzle);
  nozR.position.set(0.16, -0.38, 0);
  group.add(nozL, nozR);

  return group;
}

/**
 * Creates a Subway Commuter Train (Parked, with Ramp, or Moving towards player)
 */
export function createSubwayTrainModel(hasRamp: boolean = false, isMoving: boolean = false): THREE.Group {
  const group = new THREE.Group();

  const trainLength = 12.0;
  const trainWidth = 2.4;
  const trainHeight = 2.8;

  // Ground contact shadow
  const shadowGeo = new THREE.PlaneGeometry(trainWidth + 0.4, trainLength + (hasRamp ? 4.5 : 0.6));
  shadowGeo.rotateX(-Math.PI / 2);
  const shadow = new THREE.Mesh(shadowGeo, materials.contactShadow);
  shadow.position.set(0, 0.02, hasRamp ? 2.0 : 0);
  group.add(shadow);

  // Train Carriage Body with Red/Orange Graffiti Livery
  const bodyGeo = new THREE.BoxGeometry(trainWidth, trainHeight, trainLength);
  const trainColor = isMoving ? '#dc2626' : (hasRamp ? '#ea580c' : '#b91c1c');
  const trainTex = createSubwayTrainTexture(trainColor);
  trainTex.repeat.set(2, 1);
  const bodyMat = new THREE.MeshStandardMaterial({
    map: trainTex,
    roughness: 0.35,
    metalness: 0.6,
  });
  const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
  bodyMesh.position.set(0, trainHeight / 2 + 0.45, 0);
  bodyMesh.castShadow = true;
  bodyMesh.receiveShadow = true;
  group.add(bodyMesh);

  // Train Roof Walkway
  const roofGeo = new THREE.BoxGeometry(trainWidth * 0.95, 0.1, trainLength);
  const roof = new THREE.Mesh(roofGeo, materials.trainRoof);
  roof.position.set(0, trainHeight + 0.5, 0);
  roof.receiveShadow = true;
  group.add(roof);

  // Roof A/C Units & details
  for (const rz of [-3.5, 3.5]) {
    const acGeo = new THREE.BoxGeometry(1.2, 0.25, 2.2);
    const ac = new THREE.Mesh(acGeo, materials.trainSteel);
    ac.position.set(0, trainHeight + 0.65, rz);
    group.add(ac);
  }

  // Front Cab Nose
  const cabGeo = new THREE.BoxGeometry(trainWidth * 0.98, trainHeight * 0.9, 1.2);
  const cab = new THREE.Mesh(cabGeo, materials.trainSteel);
  cab.position.set(0, trainHeight / 2 + 0.4, trainLength / 2 + 0.6);
  cab.castShadow = true;
  group.add(cab);

  // Front Headlights
  const hlGeo = new THREE.SphereGeometry(0.18, 12, 12);
  const hlL = new THREE.Mesh(hlGeo, materials.trainHeadlight);
  hlL.position.set(-0.75, 1.1, trainLength / 2 + 1.22);
  const hlR = new THREE.Mesh(hlGeo, materials.trainHeadlight);
  hlR.position.set(0.75, 1.1, trainLength / 2 + 1.22);
  group.add(hlL, hlR);

  // If train is moving towards player, add glaring headlight beams!
  if (isMoving) {
    const beamGeo = new THREE.ConeGeometry(1.2, 8.0, 16);
    beamGeo.rotateX(Math.PI / 2);
    beamGeo.translate(0, 0, 4.0);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0xfffbeb,
      transparent: true,
      opacity: 0.28,
      depthWrite: false,
    });
    const beamL = new THREE.Mesh(beamGeo, beamMat);
    beamL.position.set(-0.75, 1.1, trainLength / 2 + 1.22);
    const beamR = new THREE.Mesh(beamGeo, beamMat);
    beamR.position.set(0.75, 1.1, trainLength / 2 + 1.22);
    group.add(beamL, beamR);
  }

  // Yellow warning lights
  const ylL = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), materials.trainYellowLight);
  ylL.position.set(-0.85, 0.65, trainLength / 2 + 1.22);
  const ylR = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), materials.trainYellowLight);
  ylR.position.set(0.85, 0.65, trainLength / 2 + 1.22);
  group.add(ylL, ylR);

  // Front Ramp (Inclined ramp allows running up onto train roof)
  if (hasRamp) {
    const rampLength = 5.2;
    const rampShape = new THREE.Shape();
    rampShape.moveTo(0, 0);
    rampShape.lineTo(0, TRAIN_ROOF_HEIGHT);
    rampShape.lineTo(rampLength, 0);
    rampShape.closePath();

    const extrudeSettings = { depth: trainWidth * 0.9, bevelEnabled: false };
    const rampGeo = new THREE.ExtrudeGeometry(rampShape, extrudeSettings);
    rampGeo.center();
    rampGeo.rotateY(Math.PI / 2);

    const rampMesh = new THREE.Mesh(rampGeo, materials.trainRampWood);
    rampMesh.position.set(0, TRAIN_ROOF_HEIGHT / 2, trainLength / 2 + rampLength / 2 + 0.4);
    rampMesh.castShadow = true;
    rampMesh.receiveShadow = true;
    group.add(rampMesh);

    const hazardBarGeo = new THREE.BoxGeometry(0.15, 0.15, rampLength);
    const hazardTex = createHazardTexture();
    const hazardMat = new THREE.MeshStandardMaterial({ map: hazardTex });
    const barL = new THREE.Mesh(hazardBarGeo, hazardMat);
    barL.position.set(-trainWidth * 0.44, TRAIN_ROOF_HEIGHT / 2, trainLength / 2 + rampLength / 2 + 0.4);
    barL.rotation.x = Math.atan2(TRAIN_ROOF_HEIGHT, rampLength);
    const barR = new THREE.Mesh(hazardBarGeo, hazardMat);
    barR.position.set(trainWidth * 0.44, TRAIN_ROOF_HEIGHT / 2, trainLength / 2 + rampLength / 2 + 0.4);
    barR.rotation.x = Math.atan2(TRAIN_ROOF_HEIGHT, rampLength);
    group.add(barL, barR);
  }

  // Wheel Trucks / Bogies
  for (const bz of [-4.2, 4.2]) {
    const bogieGroup = new THREE.Group();
    bogieGroup.position.set(0, 0.28, bz);

    const frame = new THREE.Mesh(new THREE.BoxGeometry(trainWidth * 0.8, 0.24, 2.2), materials.trainBogie);
    bogieGroup.add(frame);

    const wheelGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.12, 12);
    wheelGeo.rotateZ(Math.PI / 2);

    for (const wz of [-0.65, 0.65]) {
      const wL = new THREE.Mesh(wheelGeo, materials.trainSteel);
      wL.position.set(-trainWidth * 0.42, 0, wz);
      const wR = new THREE.Mesh(wheelGeo, materials.trainSteel);
      wR.position.set(trainWidth * 0.42, 0, wz);
      bogieGroup.add(wL, wR);
    }
    group.add(bogieGroup);
  }

  return group;
}

/**
 * Creates 3D Obstacle models based on Subway Surfers theme
 */
export function createObstacleModel(type: ObstacleType): THREE.Group {
  const group = new THREE.Group();

  switch (type) {
    case 'TRAIN':
      return createSubwayTrainModel(false, false);

    case 'TRAIN_RAMP':
      return createSubwayTrainModel(true, false);

    case 'TRAIN_MOVING':
      return createSubwayTrainModel(false, true);

    case 'BARRIER': {
      // Classic Red and White Subway Surfers hurdle / barrier (jump over, height ~0.75m)
      const shadowGeo = new THREE.PlaneGeometry(2.4, 0.8);
      shadowGeo.rotateX(-Math.PI / 2);
      const shadow = new THREE.Mesh(shadowGeo, materials.contactShadow);
      shadow.position.y = 0.02;
      group.add(shadow);

      const postGeo = new THREE.BoxGeometry(0.16, 0.8, 0.16);
      const postMat = new THREE.MeshStandardMaterial({ color: 0xef4444 });
      const postL = new THREE.Mesh(postGeo, postMat);
      postL.position.set(-0.95, 0.4, 0);
      postL.castShadow = true;
      const postR = new THREE.Mesh(postGeo, postMat);
      postR.position.set(0.95, 0.4, 0);
      postR.castShadow = true;
      group.add(postL, postR);

      const barGeo = new THREE.BoxGeometry(2.3, 0.32, 0.14);
      const hazardTex = createHazardTexture();
      hazardTex.repeat.set(4, 1);
      const hazardMat = new THREE.MeshStandardMaterial({
        map: hazardTex,
        roughness: 0.4,
        metalness: 0.3,
      });
      const bar = new THREE.Mesh(barGeo, hazardMat);
      bar.position.set(0, 0.54, 0);
      bar.castShadow = true;
      group.add(bar);

      const flasherGeo = new THREE.SphereGeometry(0.09, 8, 8);
      const flasherL = new THREE.Mesh(flasherGeo, materials.signalRed);
      flasherL.position.set(-0.95, 0.86, 0);
      const flasherR = new THREE.Mesh(flasherGeo, materials.signalRed);
      flasherR.position.set(0.95, 0.86, 0);
      group.add(flasherL, flasherR);
      break;
    }

    case 'HIGH_BEAM': {
      // Overhead Railway Signal Gantry (Clearance ~1.15m: SLIDE underneath)
      const legGeo = new THREE.BoxGeometry(0.18, 2.6, 0.18);
      const legL = new THREE.Mesh(legGeo, materials.catenarySteel);
      legL.position.set(-1.35, 1.3, 0);
      legL.castShadow = true;
      const legR = new THREE.Mesh(legGeo, materials.catenarySteel);
      legR.position.set(1.35, 1.3, 0);
      legR.castShadow = true;
      group.add(legL, legR);

      const trussGeo = new THREE.BoxGeometry(2.9, 0.3, 0.25);
      const truss = new THREE.Mesh(trussGeo, materials.catenarySteel);
      truss.position.set(0, 2.4, 0);
      truss.castShadow = true;
      group.add(truss);

      const signGeo = new THREE.BoxGeometry(2.5, 0.75, 0.08);
      const signMat = new THREE.MeshStandardMaterial({
        color: 0xe11d48,
        emissive: 0xbe123c,
        emissiveIntensity: 0.8,
        roughness: 0.3,
      });
      const sign = new THREE.Mesh(signGeo, signMat);
      sign.position.set(0, 1.7, 0);
      group.add(sign);

      const laserGeo = new THREE.CylinderGeometry(0.03, 0.03, 2.4, 8);
      laserGeo.rotateZ(Math.PI / 2);
      const laser = new THREE.Mesh(laserGeo, materials.signalRed);
      laser.position.set(0, 1.28, 0);
      group.add(laser);
      break;
    }

    case 'ROAD_BLOCK': {
      // Concrete buffer stop / Track maintenance block
      const shadowGeo = new THREE.PlaneGeometry(1.8, 1.2);
      shadowGeo.rotateX(-Math.PI / 2);
      const shadow = new THREE.Mesh(shadowGeo, materials.contactShadow);
      shadow.position.y = 0.02;
      group.add(shadow);

      const blockGeo = new THREE.BoxGeometry(1.6, 1.15, 0.85);
      const blockMat = new THREE.MeshStandardMaterial({
        color: 0x334155,
        roughness: 0.8,
        metalness: 0.2,
      });
      const block = new THREE.Mesh(blockGeo, blockMat);
      block.position.y = 0.58;
      block.castShadow = true;
      group.add(block);

      const panelGeo = new THREE.PlaneGeometry(1.4, 0.75);
      const hazardTex = createHazardTexture();
      hazardTex.repeat.set(2, 1);
      const panelMat = new THREE.MeshStandardMaterial({ map: hazardTex });
      const panel = new THREE.Mesh(panelGeo, panelMat);
      panel.position.set(0, 0.58, 0.44);
      group.add(panel);

      const beaconGeo = new THREE.CylinderGeometry(0.08, 0.1, 0.22, 8);
      const beacon = new THREE.Mesh(beaconGeo, materials.signalRed);
      beacon.position.set(0, 1.25, 0);
      group.add(beacon);
      break;
    }
  }

  return group;
}

/**
 * Creates Collectible Golden Subway Coin
 */
export function createCoinModel(): THREE.Group {
  const group = new THREE.Group();

  const shadowGeo = new THREE.CircleGeometry(0.35, 12);
  shadowGeo.rotateX(-Math.PI / 2);
  const shadow = new THREE.Mesh(shadowGeo, materials.contactShadow);
  shadow.position.y = 0.02;
  group.add(shadow);

  const coinGroup = new THREE.Group();
  coinGroup.name = 'coinSpinGroup';
  coinGroup.position.y = 0.85;

  const coinGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.08, 16);
  coinGeo.rotateX(Math.PI / 2);
  const coinMesh = new THREE.Mesh(coinGeo, materials.coinGold);
  coinMesh.castShadow = true;
  coinGroup.add(coinMesh);

  const rimGeo = new THREE.TorusGeometry(0.36, 0.035, 8, 16);
  const rimMesh = new THREE.Mesh(rimGeo, materials.coinRim);
  coinGroup.add(rimMesh);

  group.add(coinGroup);
  return group;
}

/**
 * Creates Mystery Box Model (Caixa Mistério clássica do Subway Surfers)
 */
export function createMysteryBoxModel(): THREE.Group {
  const group = new THREE.Group();

  const shadowGeo = new THREE.CircleGeometry(0.5, 14);
  shadowGeo.rotateX(-Math.PI / 2);
  const shadow = new THREE.Mesh(shadowGeo, materials.contactShadow);
  shadow.position.y = 0.02;
  group.add(shadow);

  const inner = new THREE.Group();
  inner.name = 'powerupSpinGroup';
  inner.position.y = 1.0;

  const boxGeo = new THREE.BoxGeometry(0.75, 0.75, 0.75);
  const boxTex = createMysteryBoxTexture();
  const boxMat = new THREE.MeshStandardMaterial({
    map: boxTex,
    roughness: 0.3,
    metalness: 0.4,
  });
  const boxMesh = new THREE.Mesh(boxGeo, boxMat);
  boxMesh.castShadow = true;
  inner.add(boxMesh);

  // Sparkling golden aura ring
  const ringGeo = new THREE.TorusGeometry(0.65, 0.035, 8, 20);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0xfde047 });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = Math.PI / 2;
  inner.add(ring);

  group.add(inner);
  return group;
}

/**
 * Creates 3D Chunky Golden Letter for Word Hunt (S - U - R - F)
 */
export function createLetterModel(char: string): THREE.Group {
  const group = new THREE.Group();

  const shadowGeo = new THREE.CircleGeometry(0.45, 12);
  shadowGeo.rotateX(-Math.PI / 2);
  const shadow = new THREE.Mesh(shadowGeo, materials.contactShadow);
  shadow.position.y = 0.02;
  group.add(shadow);

  const inner = new THREE.Group();
  inner.name = 'powerupSpinGroup';
  inner.position.y = 1.0;

  // Render chunky block letter
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, 128, 128);
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 8;
  ctx.strokeRect(4, 4, 120, 120);

  ctx.font = '900 80px "Arial Black", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#fde047';
  ctx.fillText(char, 64, 64);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  const letterMat = new THREE.MeshStandardMaterial({
    map: tex,
    roughness: 0.2,
    metalness: 0.8,
    emissive: 0xd97706,
    emissiveIntensity: 0.4,
  });

  const letterMesh = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.7, 0.25), letterMat);
  letterMesh.castShadow = true;
  inner.add(letterMesh);

  // Glowing halo ring
  const haloGeo = new THREE.TorusGeometry(0.55, 0.03, 8, 16);
  const haloMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
  const halo = new THREE.Mesh(haloGeo, haloMat);
  inner.add(halo);

  group.add(inner);
  return group;
}

/**
 * Creates Subway Surfers Powerups (Magnet, Jetpack, Sneakers, Multiplier, Hoverboard, Mystery Box, Letters)
 */
export function createPowerUpModel(type: PowerUpType): THREE.Group {
  if (type === 'MYSTERY_BOX') {
    return createMysteryBoxModel();
  }
  if (type === 'LETTER_S') return createLetterModel('S');
  if (type === 'LETTER_U') return createLetterModel('U');
  if (type === 'LETTER_R') return createLetterModel('R');
  if (type === 'LETTER_F') return createLetterModel('F');

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
    // Red & silver horseshoe magnet
    const magnetMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      metalness: 0.8,
      roughness: 0.2,
      emissive: 0xb91c1c,
      emissiveIntensity: 0.5,
    });
    const archGeo = new THREE.TorusGeometry(0.35, 0.1, 8, 16, Math.PI);
    const arch = new THREE.Mesh(archGeo, magnetMat);
    arch.rotation.z = Math.PI;
    inner.add(arch);

    const tipMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      metalness: 0.9,
      roughness: 0.1,
    });
    const tipL = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.25, 0.2), tipMat);
    tipL.position.set(-0.35, -0.15, 0);
    const tipR = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.25, 0.2), tipMat);
    tipR.position.set(0.35, -0.15, 0);
    inner.add(tipL, tipR);
  } else if (type === 'JETPACK') {
    // Rocket Jetpack pickup
    const jetpack = createJetpackMesh();
    jetpack.scale.set(1.5, 1.5, 1.5);
    inner.add(jetpack);
  } else if (type === 'SNEAKERS') {
    // Super Jump High-top Sneaker pickup with spring sole
    const shoeGeo = new THREE.BoxGeometry(0.4, 0.45, 0.7);
    const shoeMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xd97706,
      emissiveIntensity: 0.6,
      metalness: 0.3,
    });
    const shoe = new THREE.Mesh(shoeGeo, shoeMat);
    inner.add(shoe);

    const springGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.2, 8);
    const spring = new THREE.Mesh(springGeo, materials.catenarySteel);
    spring.position.y = -0.3;
    inner.add(spring);
  } else if (type === 'HOVERBOARD') {
    // Hoverboard pickup
    const board = createHoverboardMesh();
    board.scale.set(0.8, 0.8, 0.8);
    board.rotation.x = 0.5;
    inner.add(board);
  } else {
    // 2X Multiplier Star
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
 * Creates Brick Tunnel Arch spanning the 3 tracks
 */
export function createSubwayTunnel(): THREE.Group {
  const group = new THREE.Group();

  const totalWidth = 14.5;
  const height = 7.2;

  const colGeo = new THREE.BoxGeometry(1.2, height, 1.8);
  const brickTex = createBrickTunnelTexture();
  const brickMat = new THREE.MeshStandardMaterial({
    map: brickTex,
    roughness: 0.75,
    metalness: 0.2,
  });
  const colL = new THREE.Mesh(colGeo, brickMat);
  colL.position.set(-totalWidth / 2, height / 2, 0);
  colL.castShadow = true;

  const colR = new THREE.Mesh(colGeo, brickMat);
  colR.position.set(totalWidth / 2, height / 2, 0);
  colR.castShadow = true;
  group.add(colL, colR);

  const archGeo = new THREE.BoxGeometry(totalWidth + 1.2, 1.2, 2.0);
  const arch = new THREE.Mesh(archGeo, brickMat);
  arch.position.set(0, height - 0.6, 0);
  arch.castShadow = true;
  group.add(arch);

  const lightGeo = new THREE.SphereGeometry(0.2, 8, 8);
  const lantern = new THREE.Mesh(lightGeo, materials.trainYellowLight);
  lantern.position.set(0, height - 1.3, 0);
  group.add(lantern);

  return group;
}

/**
 * Creates Trackside Railway Signal Mast
 */
export function createSignalPost(isRight: boolean): THREE.Group {
  const group = new THREE.Group();
  const dir = isRight ? 1 : -1;

  const mastGeo = new THREE.CylinderGeometry(0.09, 0.12, 5.5, 8);
  const mast = new THREE.Mesh(mastGeo, materials.catenarySteel);
  mast.position.set(0, 2.75, 0);
  mast.castShadow = true;
  group.add(mast);

  const plateGeo = new THREE.BoxGeometry(0.35, 0.9, 0.1);
  const plate = new THREE.Mesh(plateGeo, materials.trainSteel);
  plate.position.set(-dir * 0.2, 4.8, 0);
  group.add(plate);

  const redLight = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), materials.signalRed);
  redLight.position.set(-dir * 0.2, 5.0, 0.06);
  const greenLight = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), materials.signalGreen);
  greenLight.position.set(-dir * 0.2, 4.6, 0.06);
  group.add(redLight, greenLight);

  return group;
}

/**
 * Creates modern city skyscraper for background
 */
export function createSkyscraper(height: number, width: number, depth: number): THREE.Mesh {
  const geo = new THREE.BoxGeometry(width, height, depth);
  const buildingTex = createBuildingTexture();
  buildingTex.repeat.set(width > 12 ? 3 : 2, Math.max(1, Math.floor(height / 15)));

  const mat = new THREE.MeshStandardMaterial({
    map: buildingTex,
    roughness: 0.5,
    metalness: 0.45,
  });

  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.y = height / 2;
  return mesh;
}
