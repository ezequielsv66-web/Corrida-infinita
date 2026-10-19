import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { createRoadTexture, createGlowTexture } from './textures';
import {
  LANE_WIDTH,
  createRunnerModel,
  RunnerModelNodes,
  createObstacleModel,
  createCoinModel,
  createPowerUpModel,
  createHighwayArch,
  createStreetLight,
  createSkyscraper,
} from './models';
import { soundManager } from '../audio/SoundManager';
import { GameStatus, LaneIndex, ObstacleType, PowerUpType, GameStats } from '../types';

interface ActiveObstacle {
  id: number;
  mesh: THREE.Group;
  type: ObstacleType;
  lane: LaneIndex;
  z: number;
  cleared: boolean;
  box: THREE.Box3;
}

interface ActiveCoin {
  id: number;
  mesh: THREE.Group;
  lane: LaneIndex;
  z: number;
  y: number;
  collected: boolean;
}

interface ActivePowerUp {
  id: number;
  mesh: THREE.Group;
  type: PowerUpType;
  lane: LaneIndex;
  z: number;
  collected: boolean;
}

interface RoadChunk {
  mesh: THREE.Mesh;
  z: number;
}

interface ArchEntry {
  mesh: THREE.Group;
  z: number;
}

interface LightPoleEntry {
  mesh: THREE.Group;
  z: number;
}

export class GameEngine {
  private container: HTMLElement;
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private isDestroyed: boolean = false;
  private animationFrameId: number | null = null;
  private lastTime: number = 0;

  // Game state
  public status: GameStatus = 'TITLE';
  public stats: GameStats = {
    score: 0,
    highScore: 0,
    coins: 0,
    totalCoins: 0,
    distance: 0,
    speed: 24,
    shieldActive: false,
    magnetActive: false,
    multiplierActive: false,
    magnetTimeLeft: 0,
    multiplierTimeLeft: 0,
    newHighScore: false,
  };

  private onStatsUpdate?: (stats: GameStats) => void;
  private onGameOver?: (finalStats: GameStats) => void;

  // Runner
  private runnerNodes!: RunnerModelNodes;
  private currentLane: LaneIndex = 0;
  private targetLane: LaneIndex = 0;
  private runnerX: number = 0;
  private runnerY: number = 0;
  private velocityY: number = 0;
  private isJumping: boolean = false;
  private isSliding: boolean = false;
  private slideTimer: number = 0;
  private runCycle: number = 0;
  private rollAngle: number = 0;

  // World & Spawning
  private roadChunks: RoadChunk[] = [];
  private roadTexture!: THREE.CanvasTexture;
  private arches: ArchEntry[] = [];
  private lightPoles: LightPoleEntry[] = [];
  private obstacles: ActiveObstacle[] = [];
  private coins: ActiveCoin[] = [];
  private powerUps: ActivePowerUp[] = [];
  private nextObstacleZ: number = -40;
  private nextPowerUpDistance: number = 250;
  private objectIdCounter: number = 0;

  // Particles
  private particleGroup!: THREE.Group;
  private particles: {
    mesh: THREE.Mesh;
    vx: number;
    vy: number;
    vz: number;
    life: number;
    maxLife: number;
  }[] = [];

  // Speed lines
  private speedLines!: THREE.LineSegments;

  // Camera Shake
  private cameraShake: number = 0;
  private hitstopTimer: number = 0;

  constructor(
    container: HTMLElement,
    callbacks: {
      onStatsUpdate?: (stats: GameStats) => void;
      onGameOver?: (finalStats: GameStats) => void;
    }
  ) {
    this.container = container;
    this.onStatsUpdate = callbacks.onStatsUpdate;
    this.onGameOver = callbacks.onGameOver;

    // Load persistent high score & total coins
    const savedHighScore = parseInt(localStorage.getItem('corrida_infinita_highscore') || '0', 10);
    const savedTotalCoins = parseInt(localStorage.getItem('corrida_infinita_total_coins') || '0', 10);
    this.stats.highScore = isNaN(savedHighScore) ? 0 : savedHighScore;
    this.stats.totalCoins = isNaN(savedTotalCoins) ? 0 : savedTotalCoins;

    this.initScene();
    this.initWorld();
    this.initRunner();
    this.initParticles();
    this.initSpeedLines();
    this.setupWindowListeners();

    this.lastTime = performance.now();
    this.loop = this.loop.bind(this);
    this.animationFrameId = requestAnimationFrame(this.loop);
  }

  private initScene() {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    // Renderer setup
    this.renderer = new THREE.WebGLRenderer({
      powerPreference: 'high-performance',
      antialias: true,
      stencil: false,
      depth: true,
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.appendChild(this.renderer.domElement);

    // Scene & Fog (Atmospheric night highway with subtle dusk blue/indigo)
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x060913);
    this.scene.fog = new THREE.FogExp2(0x060913, 0.012);

    // Camera
    this.camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 400);
    this.camera.position.set(0, 3.8, 7.5);
    this.camera.lookAt(0, 1.4, -12);

    // Studio Environment reflection
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    // Lighting: Key Warm Directional Light with tight shadow frustum
    const dirLight = new THREE.DirectionalLight(0xfff1e6, 2.8);
    dirLight.position.set(15, 25, 10);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 70;
    dirLight.shadow.camera.left = -12;
    dirLight.shadow.camera.right = 12;
    dirLight.shadow.camera.top = 18;
    dirLight.shadow.camera.bottom = -6;
    dirLight.shadow.bias = -0.0005;
    dirLight.shadow.normalBias = 0.02;
    this.scene.add(dirLight);

    // Cool fill light: HemisphereLight (sky cyan/blue, ground slate)
    const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x0f172a, 1.2);
    this.scene.add(hemiLight);

    // Subtle front road accent light
    const frontLight = new THREE.PointLight(0x06b6d4, 1.5, 25);
    frontLight.position.set(0, 3, -4);
    this.scene.add(frontLight);
  }

  private initWorld() {
    this.roadTexture = createRoadTexture();
    this.roadTexture.repeat.set(1, 10);

    const roadGeo = new THREE.PlaneGeometry(13.2, 50);
    roadGeo.rotateX(-Math.PI / 2);

    const roadMat = new THREE.MeshStandardMaterial({
      map: this.roadTexture,
      roughness: 0.8,
      metalness: 0.15,
    });

    // 6 chunks spanning from Z = 25 down to Z = -225
    for (let i = 0; i < 6; i++) {
      const z = 25 - i * 50;
      const mesh = new THREE.Mesh(roadGeo, roadMat);
      mesh.receiveShadow = true;
      mesh.position.set(0, 0, z);
      this.scene.add(mesh);
      this.roadChunks.push({ mesh, z });
    }

    // Ground terrain outside road (dark terrain plane)
    const terrainGeo = new THREE.PlaneGeometry(240, 300);
    terrainGeo.rotateX(-Math.PI / 2);
    const terrainMat = new THREE.MeshStandardMaterial({
      color: 0x04060a,
      roughness: 0.95,
      metalness: 0.05,
    });
    const terrain = new THREE.Mesh(terrainGeo, terrainMat);
    terrain.position.set(0, -0.05, -75);
    terrain.receiveShadow = true;
    this.scene.add(terrain);

    // Overhead Arches
    for (let i = 0; i < 5; i++) {
      const arch = createHighwayArch();
      const z = -40 - i * 55;
      arch.position.set(0, 0, z);
      this.scene.add(arch);
      this.arches.push({ mesh: arch, z });
    }

    // Street Light Poles along the left and right curbs
    for (let i = 0; i < 12; i++) {
      const isRight = i % 2 === 0;
      const pole = createStreetLight(isRight);
      const z = -15 - i * 22;
      pole.position.set(isRight ? 7.2 : -7.2, 0, z);
      this.scene.add(pole);
      this.lightPoles.push({ mesh: pole, z });
    }

    // Distant procedural skyscraper skyline flanking both sides
    const skylineGroup = new THREE.Group();
    for (let i = 0; i < 26; i++) {
      const isRight = i % 2 === 0;
      const height = 40 + Math.random() * 80;
      const width = 12 + Math.random() * 16;
      const depth = 12 + Math.random() * 16;
      const building = createSkyscraper(height, width, depth);
      const x = (isRight ? 1 : -1) * (26 + Math.random() * 50);
      const z = -20 - i * 16;
      building.position.set(x, height / 2, z);
      skylineGroup.add(building);
    }
    this.scene.add(skylineGroup);
  }

  private initRunner() {
    this.runnerNodes = createRunnerModel();
    this.runnerNodes.group.position.set(0, 0, 0);
    this.scene.add(this.runnerNodes.group);
  }

  private initParticles() {
    this.particleGroup = new THREE.Group();
    const glowTex = createGlowTexture();
    const particleMat = new THREE.MeshBasicMaterial({
      map: glowTex,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particleGeo = new THREE.PlaneGeometry(0.3, 0.3);

    for (let i = 0; i < 60; i++) {
      const mesh = new THREE.Mesh(particleGeo, particleMat.clone());
      mesh.visible = false;
      this.particleGroup.add(mesh);
      this.particles.push({
        mesh,
        vx: 0,
        vy: 0,
        vz: 0,
        life: 0,
        maxLife: 1,
      });
    }
    this.scene.add(this.particleGroup);
  }

  private initSpeedLines() {
    const lineCount = 40;
    const positions = new Float32Array(lineCount * 6); // 2 vertices per line

    for (let i = 0; i < lineCount; i++) {
      const x = (Math.random() - 0.5) * 16;
      const y = 0.5 + Math.random() * 5;
      const z = -10 - Math.random() * 60;
      const len = 4 + Math.random() * 6;

      const idx = i * 6;
      positions[idx] = x;
      positions[idx + 1] = y;
      positions[idx + 2] = z;

      positions[idx + 3] = x;
      positions[idx + 4] = y;
      positions[idx + 5] = z + len;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending,
    });

    this.speedLines = new THREE.LineSegments(geo, mat);
    this.scene.add(this.speedLines);
  }

  public emitBurst(x: number, y: number, z: number, colorHex: number, count: number = 16) {
    let spawned = 0;
    for (const p of this.particles) {
      if (p.life <= 0) {
        p.mesh.visible = true;
        p.mesh.position.set(x, y, z);
        (p.mesh.material as THREE.MeshBasicMaterial).color.setHex(colorHex);

        const angle = Math.random() * Math.PI * 2;
        const speed = 2.5 + Math.random() * 6;
        p.vx = Math.cos(angle) * speed;
        p.vy = 2 + Math.random() * 5;
        p.vz = Math.sin(angle) * speed;
        p.life = 0.4 + Math.random() * 0.4;
        p.maxLife = p.life;

        spawned++;
        if (spawned >= count) break;
      }
    }
  }

  // --- Controls & Input ---
  public moveLeft() {
    if (this.status !== 'PLAYING') return;
    if (this.targetLane > -1) {
      this.targetLane = (this.targetLane - 1) as LaneIndex;
      soundManager.playLaneSwitch();
    }
  }

  public moveRight() {
    if (this.status !== 'PLAYING') return;
    if (this.targetLane < 1) {
      this.targetLane = (this.targetLane + 1) as LaneIndex;
      soundManager.playLaneSwitch();
    }
  }

  public jump() {
    if (this.status !== 'PLAYING') return;
    if (!this.isJumping) {
      this.isJumping = true;
      this.velocityY = 17;
      this.isSliding = false;
      this.slideTimer = 0;
      soundManager.playJump();
    }
  }

  public slide() {
    if (this.status !== 'PLAYING') return;
    if (!this.isSliding) {
      this.isSliding = true;
      this.slideTimer = 0.65; // duration of slide
      // Fast fall if sliding mid-air
      if (this.isJumping) {
        this.velocityY = -22;
      }
      soundManager.playSlide();
    }
  }

  // --- Game Lifecycle ---
  public startGame() {
    this.status = 'PLAYING';
    this.resetStats();
    soundManager.startMusic();
  }

  public pauseGame() {
    if (this.status === 'PLAYING') {
      this.status = 'PAUSED';
      soundManager.stopMusic();
    }
  }

  public resumeGame() {
    if (this.status === 'PAUSED') {
      this.status = 'PLAYING';
      this.lastTime = performance.now();
      soundManager.startMusic();
    }
  }

  public restartGame() {
    this.clearSpawnedObjects();
    this.targetLane = 0;
    this.currentLane = 0;
    this.runnerX = 0;
    this.runnerY = 0;
    this.velocityY = 0;
    this.isJumping = false;
    this.isSliding = false;
    this.slideTimer = 0;
    this.nextObstacleZ = -40;
    this.nextPowerUpDistance = 250;
    this.startGame();
  }

  private resetStats() {
    const savedHighScore = parseInt(localStorage.getItem('corrida_infinita_highscore') || '0', 10);
    const savedTotalCoins = parseInt(localStorage.getItem('corrida_infinita_total_coins') || '0', 10);

    this.stats = {
      score: 0,
      highScore: isNaN(savedHighScore) ? 0 : savedHighScore,
      coins: 0,
      totalCoins: isNaN(savedTotalCoins) ? 0 : savedTotalCoins,
      distance: 0,
      speed: 24,
      shieldActive: false,
      magnetActive: false,
      multiplierActive: false,
      magnetTimeLeft: 0,
      multiplierTimeLeft: 0,
      newHighScore: false,
    };
    this.onStatsUpdate?.(this.stats);
  }

  private triggerGameOver() {
    this.status = 'GAMEOVER';
    this.cameraShake = 0.8;
    this.hitstopTimer = 0.08;
    soundManager.playCrash();
    soundManager.stopMusic();

    this.emitBurst(this.runnerX, this.runnerY + 1, 0, 0xef4444, 30);

    // Save high score and total coins
    if (this.stats.score > this.stats.highScore) {
      this.stats.highScore = this.stats.score;
      this.stats.newHighScore = true;
      localStorage.setItem('corrida_infinita_highscore', String(this.stats.highScore));
    }
    this.stats.totalCoins += this.stats.coins;
    localStorage.setItem('corrida_infinita_total_coins', String(this.stats.totalCoins));

    this.onGameOver?.(this.stats);
    this.onStatsUpdate?.(this.stats);
  }

  private clearSpawnedObjects() {
    for (const obs of this.obstacles) {
      this.scene.remove(obs.mesh);
    }
    this.obstacles = [];

    for (const coin of this.coins) {
      this.scene.remove(coin.mesh);
    }
    this.coins = [];

    for (const p of this.powerUps) {
      this.scene.remove(p.mesh);
    }
    this.powerUps = [];
  }

  // --- Spawning System ---
  private updateSpawning(dt: number) {
    if (this.status !== 'PLAYING') return;

    // Check if we need to spawn next obstacle wave
    // Maintain obstacles ahead up to Z = -160
    while (this.nextObstacleZ > -160) {
      this.spawnObstacleWave(this.nextObstacleZ);
      // Gap scales inversely with speed to maintain fair reaction time (minimum 25m, max 45m)
      const gap = Math.max(25, 42 - (this.stats.speed - 24) * 0.25);
      this.nextObstacleZ -= gap;
    }

    // Powerup check
    if (this.stats.distance >= this.nextPowerUpDistance) {
      this.spawnPowerUp(this.nextObstacleZ - 10);
      this.nextPowerUpDistance += 280 + Math.random() * 150;
    }
  }

  private spawnObstacleWave(z: number) {
    const types: ObstacleType[] = ['BARRIER', 'HIGH_BEAM', 'DRONE', 'ROAD_BLOCK'];
    // Pick 1 or 2 lanes to block (NEVER block all 3 lanes, always at least 1 open or jumpable/slideable lane)
    const blockedCount = Math.random() > 0.4 ? 2 : 1;
    const lanes: LaneIndex[] = [-1, 0, 1];
    // Shuffle lanes
    for (let i = lanes.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [lanes[i], lanes[j]] = [lanes[j], lanes[i]];
    }

    for (let i = 0; i < blockedCount; i++) {
      const lane = lanes[i];
      const type = types[Math.floor(Math.random() * types.length)];
      const mesh = createObstacleModel(type);
      mesh.position.set(lane * LANE_WIDTH, 0, z);
      this.scene.add(mesh);

      this.obstacles.push({
        id: ++this.objectIdCounter,
        mesh,
        type,
        lane,
        z,
        cleared: false,
        box: new THREE.Box3(),
      });
    }

    // In the free lane(s), spawn a trail of coins!
    const freeLane = lanes[blockedCount === 1 ? (Math.random() > 0.5 ? 1 : 2) : 2];
    this.spawnCoinTrail(freeLane, z - 8, 4);
  }

  private spawnCoinTrail(lane: LaneIndex, startZ: number, count: number) {
    for (let i = 0; i < count; i++) {
      const z = startZ - i * 3.5;
      const mesh = createCoinModel();
      mesh.position.set(lane * LANE_WIDTH, 0, z);
      this.scene.add(mesh);

      this.coins.push({
        id: ++this.objectIdCounter,
        mesh,
        lane,
        z,
        y: 0,
        collected: false,
      });
    }
  }

  private spawnPowerUp(z: number) {
    const types: PowerUpType[] = ['MAGNET', 'SHIELD', 'MULTIPLIER'];
    const type = types[Math.floor(Math.random() * types.length)];
    const lanes: LaneIndex[] = [-1, 0, 1];
    const lane = lanes[Math.floor(Math.random() * lanes.length)];

    const mesh = createPowerUpModel(type);
    mesh.position.set(lane * LANE_WIDTH, 0, z);
    this.scene.add(mesh);

    this.powerUps.push({
      id: ++this.objectIdCounter,
      mesh,
      type,
      lane,
      z,
      collected: false,
    });
  }

  // --- Main Tick / Animation Loop ---
  private loop(time: number) {
    if (this.isDestroyed) return;

    const rawDt = (time - this.lastTime) / 1000;
    this.lastTime = time;
    const dt = Math.min(rawDt, 0.05); // Clamp dt to prevent tunneling on lag spike

    if (this.hitstopTimer > 0) {
      this.hitstopTimer -= dt;
    } else {
      this.update(dt);
    }

    this.render(dt);

    this.animationFrameId = requestAnimationFrame(this.loop);
  }

  private update(dt: number) {
    // 1. Title mode camera orbit & subtle idle runner breathing
    if (this.status === 'TITLE') {
      const elapsed = performance.now() * 0.001;
      this.camera.position.x = Math.sin(elapsed * 0.5) * 4;
      this.camera.position.y = 2.8 + Math.cos(elapsed * 0.7) * 0.4;
      this.camera.position.z = 6.5;
      this.camera.lookAt(0, 1.2, -4);

      // Idle breathing for runner
      this.runnerNodes.torso.position.y = 1.0 + Math.sin(elapsed * 3) * 0.02;
      this.runnerNodes.leftArm.rotation.x = Math.sin(elapsed * 2) * 0.1;
      this.runnerNodes.rightArm.rotation.x = -Math.sin(elapsed * 2) * 0.1;
      return;
    }

    if (this.status !== 'PLAYING') return;

    // 2. Speed progression: ramps up smoothly with distance
    this.stats.speed = Math.min(64, 24 + this.stats.distance * 0.014);
    const speed = this.stats.speed;
    const distanceDelta = speed * dt;
    this.stats.distance += distanceDelta;

    // Score calculation (10 pts per meter, doubled if multiplier active)
    const pointsPerMeter = this.stats.multiplierActive ? 20 : 10;
    this.stats.score += Math.round(distanceDelta * pointsPerMeter);

    // 3. Powerup Timers
    if (this.stats.magnetActive) {
      this.stats.magnetTimeLeft -= dt;
      if (this.stats.magnetTimeLeft <= 0) {
        this.stats.magnetActive = false;
        this.runnerNodes.magnetFx.visible = false;
      }
    }

    if (this.stats.multiplierActive) {
      this.stats.multiplierTimeLeft -= dt;
      if (this.stats.multiplierTimeLeft <= 0) {
        this.stats.multiplierActive = false;
      }
    }

    // 4. Runner Physics & Kinematics
    // Lane switching with exponential damping
    const targetX = this.targetLane * LANE_WIDTH;
    const lateralSpeed = 16;
    const dx = targetX - this.runnerX;
    this.runnerX += dx * (1 - Math.exp(-lateralSpeed * dt));

    // Banking roll angle when switching lanes
    const targetRoll = -dx * 0.12;
    this.rollAngle += (targetRoll - this.rollAngle) * (1 - Math.exp(-12 * dt));
    this.runnerNodes.group.rotation.z = this.rollAngle;

    // Jump & Gravity
    if (this.isJumping) {
      this.runnerY += this.velocityY * dt;
      this.velocityY -= 46 * dt; // Gravity
      if (this.runnerY <= 0) {
        this.runnerY = 0;
        this.isJumping = false;
        this.velocityY = 0;
        // Landing dust puff
        this.emitBurst(this.runnerX, 0.1, 0, 0x64748b, 8);
      }
    }

    // Slide logic
    if (this.isSliding) {
      this.slideTimer -= dt;
      if (this.slideTimer <= 0) {
        this.isSliding = false;
      }
    }

    // Update runner mesh positions
    this.runnerNodes.group.position.set(this.runnerX, this.runnerY, 0);

    // Articulated Running / Jumping / Sliding Animation
    this.runCycle += dt * (speed * 0.7);
    const legSwing = Math.sin(this.runCycle);
    const armSwing = Math.cos(this.runCycle);

    if (this.isSliding) {
      // Crouch and slide pose
      this.runnerNodes.torso.position.y = 0.45;
      this.runnerNodes.torso.rotation.x = 0.8;
      this.runnerNodes.leftLeg.rotation.x = -1.2;
      this.runnerNodes.rightLeg.rotation.x = -1.0;
      this.runnerNodes.leftArm.rotation.x = 0.6;
      this.runnerNodes.rightArm.rotation.x = 0.6;
      this.runnerNodes.shadowMesh.scale.set(1.4, 1.4, 1.4);
    } else if (this.isJumping) {
      // Mid-air pose
      this.runnerNodes.torso.position.y = 1.0;
      this.runnerNodes.torso.rotation.x = -0.15;
      this.runnerNodes.leftLeg.rotation.x = 0.4;
      this.runnerNodes.rightLeg.rotation.x = -0.2;
      this.runnerNodes.leftArm.rotation.x = -1.1;
      this.runnerNodes.rightArm.rotation.x = -1.1;
      // Shrink contact shadow as player jumps high
      const shadowScale = Math.max(0.2, 1 - this.runnerY * 0.25);
      this.runnerNodes.shadowMesh.scale.set(shadowScale, shadowScale, shadowScale);
    } else {
      // Regular sprint cycle
      this.runnerNodes.torso.position.y = 1.0 + Math.abs(legSwing) * 0.08;
      this.runnerNodes.torso.rotation.x = 0.18; // slight forward sprint lean
      this.runnerNodes.leftLeg.rotation.x = legSwing * 0.85;
      this.runnerNodes.rightLeg.rotation.x = -legSwing * 0.85;
      this.runnerNodes.leftArm.rotation.x = -armSwing * 0.9;
      this.runnerNodes.rightArm.rotation.x = armSwing * 0.9;
      this.runnerNodes.shadowMesh.scale.set(1, 1, 1);
    }

    // 5. Scroll World (Road Chunks, Arches, Poles)
    const moveZ = speed * dt;

    // Road chunks recycle
    for (const chunk of this.roadChunks) {
      chunk.z += moveZ;
      if (chunk.z > 35) {
        chunk.z -= 6 * 50; // Recycle to the far distance
      }
      chunk.mesh.position.z = chunk.z;
    }

    // Texture continuous offset scrolling
    this.roadTexture.offset.y -= (speed * dt) / 50;

    // Overhead highway arches
    for (const arch of this.arches) {
      arch.z += moveZ;
      if (arch.z > 25) {
        arch.z -= 5 * 55;
      }
      arch.mesh.position.z = arch.z;
    }

    // Street light poles
    for (const pole of this.lightPoles) {
      pole.z += moveZ;
      if (pole.z > 25) {
        pole.z -= 12 * 22;
      }
      pole.mesh.position.z = pole.z;
    }

    // Next obstacle spawn anchor moves towards player
    this.nextObstacleZ += moveZ;
    this.updateSpawning(dt);

    // 6. Move & Check Obstacles
    const playerBounds = this.getPlayerBoundingBox();

    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      obs.z += moveZ;
      obs.mesh.position.z = obs.z;

      // Animate drone hovering
      if (obs.type === 'DRONE') {
        const droneGroup = obs.mesh.getObjectByName('droneAnimated');
        if (droneGroup) {
          droneGroup.position.y = 1.25 + Math.sin(performance.now() * 0.005 + obs.id) * 0.2;
        }
      }

      // Check collision if obstacle is near player (Z between -1.5 and 1.5)
      if (!obs.cleared && obs.z > -2.2 && obs.z < 2.0) {
        obs.box.setFromObject(obs.mesh);
        // Slightly shrink obstacle box for fair, forgiving collision feel
        obs.box.expandByScalar(-0.15);

        if (playerBounds.intersectsBox(obs.box)) {
          if (this.stats.shieldActive) {
            // Shield absorbs hit!
            this.stats.shieldActive = false;
            this.runnerNodes.shieldMesh.visible = false;
            soundManager.playShieldBreak();
            this.emitBurst(obs.mesh.position.x, 1, obs.z, 0x38bdf8, 20);
            this.scene.remove(obs.mesh);
            this.obstacles.splice(i, 1);
            this.cameraShake = 0.4;
            continue;
          } else {
            // Fatal collision
            this.triggerGameOver();
            return;
          }
        }
      }

      // Clear obstacles that passed behind camera
      if (obs.z > 25) {
        this.scene.remove(obs.mesh);
        this.obstacles.splice(i, 1);
      }
    }

    // 7. Move & Collect Coins
    for (let i = this.coins.length - 1; i >= 0; i--) {
      const coin = this.coins[i];
      coin.z += moveZ;

      // Spin coin
      const spinGroup = coin.mesh.getObjectByName('coinSpinGroup');
      if (spinGroup) {
        spinGroup.rotation.y += dt * 4;
      }

      // Magnet effect: suck coin towards player
      if (this.stats.magnetActive && coin.z > -25 && coin.z < 10) {
        const coinPos = coin.mesh.position;
        const dx = this.runnerX - coinPos.x;
        const dy = (this.runnerY + 1) - coinPos.y;
        const dz = 0 - coinPos.z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist > 0.1) {
          const pullSpeed = 24 * dt;
          coinPos.x += (dx / dist) * pullSpeed;
          coinPos.y += (dy / dist) * pullSpeed;
          coinPos.z += (dz / dist) * pullSpeed;
          coin.z = coinPos.z;
        }
      } else {
        coin.mesh.position.z = coin.z;
      }

      // Collect detection
      const coinPos = coin.mesh.position;
      const distX = Math.abs(coinPos.x - this.runnerX);
      const distY = Math.abs((this.runnerY + 0.9) - coinPos.y);
      const distZ = Math.abs(coinPos.z - 0);

      if (!coin.collected && distX < 1.1 && distY < 1.4 && distZ < 1.4) {
        coin.collected = true;
        this.stats.coins += 1;
        this.stats.score += this.stats.multiplierActive ? 50 : 25;
        soundManager.playCoin();
        this.emitBurst(coinPos.x, coinPos.y, coinPos.z, 0xfbbf24, 10);
        this.scene.remove(coin.mesh);
        this.coins.splice(i, 1);
        continue;
      }

      if (coin.z > 25) {
        this.scene.remove(coin.mesh);
        this.coins.splice(i, 1);
      }
    }

    // 8. Move & Collect Powerups
    for (let i = this.powerUps.length - 1; i >= 0; i--) {
      const pu = this.powerUps[i];
      pu.z += moveZ;
      pu.mesh.position.z = pu.z;

      const spinGroup = pu.mesh.getObjectByName('powerupSpinGroup');
      if (spinGroup) {
        spinGroup.rotation.y += dt * 3;
      }

      const puPos = pu.mesh.position;
      const distX = Math.abs(puPos.x - this.runnerX);
      const distY = Math.abs((this.runnerY + 0.9) - 1.0);
      const distZ = Math.abs(pu.z - 0);

      if (!pu.collected && distX < 1.2 && distY < 1.6 && distZ < 1.5) {
        pu.collected = true;
        soundManager.playPowerup();
        this.applyPowerUp(pu.type);
        this.emitBurst(puPos.x, 1, pu.z, 0x06b6d4, 18);
        this.scene.remove(pu.mesh);
        this.powerUps.splice(i, 1);
        continue;
      }

      if (pu.z > 25) {
        this.scene.remove(pu.mesh);
        this.powerUps.splice(i, 1);
      }
    }

    // 9. Particles simulation
    for (const p of this.particles) {
      if (p.life > 0) {
        p.life -= dt;
        p.mesh.position.x += p.vx * dt;
        p.mesh.position.y += p.vy * dt;
        p.mesh.position.z += p.vz * dt;
        p.vy -= 12 * dt; // gravity

        const alpha = Math.max(0, p.life / p.maxLife);
        (p.mesh.material as THREE.MeshBasicMaterial).opacity = alpha;

        if (p.life <= 0) {
          p.mesh.visible = false;
        }
      }
    }

    // 10. Speed Lines animation
    const posAttr = this.speedLines.geometry.attributes.position as THREE.BufferAttribute;
    const posArray = posAttr.array as Float32Array;
    const lineSpeed = speed * 1.5;

    for (let i = 0; i < posArray.length; i += 6) {
      posArray[i + 2] += lineSpeed * dt;
      posArray[i + 5] += lineSpeed * dt;

      if (posArray[i + 2] > 15) {
        const resetZ = -60 - Math.random() * 40;
        const len = 5 + Math.random() * 8;
        posArray[i + 2] = resetZ;
        posArray[i + 5] = resetZ + len;
      }
    }
    posAttr.needsUpdate = true;

    // 11. Camera Follow & Dynamic Breathing
    const targetCamX = this.runnerX * 0.35;
    this.camera.position.x += (targetCamX - this.camera.position.x) * (1 - Math.exp(-8 * dt));
    const targetCamY = 3.6 + this.runnerY * 0.25;
    this.camera.position.y += (targetCamY - this.camera.position.y) * (1 - Math.exp(-10 * dt));

    // Dynamic FOV based on speed (gives intense sense of velocity)
    const targetFov = 65 + (speed - 24) * 0.35;
    this.camera.fov += (targetFov - this.camera.fov) * (1 - Math.exp(-5 * dt));
    this.camera.updateProjectionMatrix();

    // Camera lookAt
    this.camera.lookAt(this.runnerX * 0.2, 1.4, -12);

    // Apply camera shake if any
    if (this.cameraShake > 0) {
      this.camera.position.x += (Math.random() - 0.5) * this.cameraShake * 0.6;
      this.camera.position.y += (Math.random() - 0.5) * this.cameraShake * 0.6;
      this.cameraShake = Math.max(0, this.cameraShake - dt * 2.5);
    }

    // Report stats to React HUD
    this.onStatsUpdate?.({ ...this.stats });
  }

  private applyPowerUp(type: PowerUpType) {
    if (type === 'MAGNET') {
      this.stats.magnetActive = true;
      this.stats.magnetTimeLeft = 10; // 10s magnet
      this.runnerNodes.magnetFx.visible = true;
    } else if (type === 'SHIELD') {
      this.stats.shieldActive = true;
      this.runnerNodes.shieldMesh.visible = true;
    } else if (type === 'MULTIPLIER') {
      this.stats.multiplierActive = true;
      this.stats.multiplierTimeLeft = 12; // 12s 2x multiplier
    }
  }

  private getPlayerBoundingBox(): THREE.Box3 {
    const box = new THREE.Box3();
    const halfWidth = 0.38;

    if (this.isSliding) {
      // Crouch collider: height 0.65, depth 1.1
      box.min.set(this.runnerX - halfWidth, this.runnerY, -0.6);
      box.max.set(this.runnerX + halfWidth, this.runnerY + 0.65, 0.6);
    } else {
      // Normal / jumping collider: height 1.85, depth 0.45
      box.min.set(this.runnerX - halfWidth, this.runnerY, -0.35);
      box.max.set(this.runnerX + halfWidth, this.runnerY + 1.85, 0.35);
    }
    return box;
  }

  private render(_dt: number) {
    this.renderer.render(this.scene, this.camera);
  }

  private setupWindowListeners() {
    const handleResize = () => {
      if (!this.container || this.isDestroyed) return;
      const width = this.container.clientWidth;
      const height = this.container.clientHeight;
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);
  }

  public destroy() {
    this.isDestroyed = true;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    soundManager.stopMusic();
    this.clearSpawnedObjects();
    this.renderer.dispose();
    if (this.renderer.domElement && this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
  }
}
