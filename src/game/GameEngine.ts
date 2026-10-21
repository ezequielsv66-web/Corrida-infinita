import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { createRailwayTexture, createGlowTexture } from './textures';
import {
  TRACK_WIDTH,
  TRAIN_ROOF_HEIGHT,
  createRunnerModel,
  RunnerModelNodes,
  createInspectorModel,
  InspectorModelNodes,
  createPitbullDogModel,
  DogModelNodes,
  createObstacleModel,
  createCoinModel,
  createPowerUpModel,
  createSubwayTunnel,
  createSignalPost,
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
  isMoving?: boolean;
  hornPlayed?: boolean;
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

interface TrackBedChunk {
  mesh: THREE.Mesh;
  z: number;
}

interface TunnelEntry {
  mesh: THREE.Group;
  z: number;
}

interface SignalPostEntry {
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
    scoreMultiplier: 30,
    hoverboardActive: false,
    hoverboardTimeLeft: 0,
    hoverboardsAvailable: 3,
    jetpackActive: false,
    jetpackTimeLeft: 0,
    sneakersActive: false,
    sneakersTimeLeft: 0,
    magnetActive: false,
    magnetTimeLeft: 0,
    multiplierActive: false,
    multiplierTimeLeft: 0,
    shieldActive: false,
    newHighScore: false,
    mysteryBoxesCollected: 0,
    lettersCollected: [],
    inspectorAlert: true,
  };

  private onStatsUpdate?: (stats: GameStats) => void;
  private onGameOver?: (finalStats: GameStats) => void;

  // Runner kinematics
  private runnerNodes!: RunnerModelNodes;
  private inspectorNodes!: InspectorModelNodes;
  private dogNodes!: DogModelNodes;
  private currentLane: LaneIndex = 0;
  private targetLane: LaneIndex = 0;
  private runnerX: number = 0;
  private runnerY: number = 0;
  private baseY: number = 0; // 0 for ground, 3.2 for train roof, 8.5 for jetpack
  private velocityY: number = 0;
  private isJumping: boolean = false;
  private isSliding: boolean = false;
  private slideTimer: number = 0;
  private runCycle: number = 0;
  private rollAngle: number = 0;

  // Inspector & Dog Chase Dynamics
  private inspectorZ: number = 3.2; // Distance behind runner (0 is runner position)
  private inspectorTargetZ: number = 3.2;
  private inspectorRunCycle: number = 0;
  private inspectorActive: boolean = true;
  private chaseAlertTimer: number = 0;

  // Railway Chunks & World
  private trackChunks: TrackBedChunk[] = [];
  private trackTexture!: THREE.CanvasTexture;
  private tunnels: TunnelEntry[] = [];
  private signalPosts: SignalPostEntry[] = [];
  private obstacles: ActiveObstacle[] = [];
  private coins: ActiveCoin[] = [];
  private powerUps: ActivePowerUp[] = [];
  private nextObstacleZ: number = -50;
  private nextPowerUpDistance: number = 180;
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

  // Camera Shake & Hitstop
  private cameraShake: number = 0;
  private hitstopTimer: number = 0;

  // Double-tap Space detection
  private lastSpacePressTime: number = 0;

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

    // Load persistent records
    try {
      const savedHighScore = parseInt(localStorage.getItem('corrida_infinita_highscore') || '0', 10);
      const savedTotalCoins = parseInt(localStorage.getItem('corrida_infinita_total_coins') || '0', 10);
      const savedBoards = parseInt(localStorage.getItem('corrida_infinita_boards') || '3', 10);
      this.stats.highScore = isNaN(savedHighScore) ? 0 : savedHighScore;
      this.stats.totalCoins = isNaN(savedTotalCoins) ? 0 : savedTotalCoins;
      this.stats.hoverboardsAvailable = isNaN(savedBoards) ? 3 : Math.max(1, savedBoards);
    } catch {
      this.stats.highScore = 0;
      this.stats.totalCoins = 0;
      this.stats.hoverboardsAvailable = 3;
    }

    this.initScene();
    this.initWorld();
    this.initCharacters();
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

    const isMobile = /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const pixelRatio = isMobile ? Math.min(window.devicePixelRatio, 1.5) : Math.min(window.devicePixelRatio, 2);

    this.renderer = new THREE.WebGLRenderer({
      powerPreference: 'high-performance',
      antialias: !isMobile,
      stencil: false,
      depth: true,
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(pixelRatio);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.3;
    this.renderer.shadowMap.enabled = !isMobile;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.appendChild(this.renderer.domElement);

    // Vibrant Sunny Daylight Subway Surfers Blue Sky
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x38bdf8); // Sunny azure sky
    this.scene.fog = new THREE.FogExp2(0x7dd3fc, 0.008);

    // 3rd Person Perspective Camera behind runner
    this.camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 400);
    this.camera.position.set(0, 3.8, 7.5);
    this.camera.lookAt(0, 1.4, -12);

    // Studio Environment lighting
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    // Warm Golden Key Sunlight
    const sunLight = new THREE.DirectionalLight(0xfffbeb, 3.4);
    sunLight.position.set(22, 34, 18);
    sunLight.castShadow = !isMobile;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 85;
    sunLight.shadow.camera.left = -16;
    sunLight.shadow.camera.right = 16;
    sunLight.shadow.camera.top = 22;
    sunLight.shadow.camera.bottom = -6;
    sunLight.shadow.bias = -0.0005;
    sunLight.shadow.normalBias = 0.02;
    this.scene.add(sunLight);

    // Warm Ambient sky fill
    const hemiLight = new THREE.HemisphereLight(0xbae6fd, 0x1e293b, 1.4);
    this.scene.add(hemiLight);
  }

  private initWorld() {
    this.trackTexture = createRailwayTexture();
    this.trackTexture.repeat.set(1, 8);

    const trackBedGeo = new THREE.PlaneGeometry(13.2, 50);
    trackBedGeo.rotateX(-Math.PI / 2);

    const trackBedMat = new THREE.MeshStandardMaterial({
      map: this.trackTexture,
      roughness: 0.8,
      metalness: 0.25,
    });

    for (let i = 0; i < 6; i++) {
      const z = 25 - i * 50;
      const mesh = new THREE.Mesh(trackBedGeo, trackBedMat);
      mesh.receiveShadow = true;
      mesh.position.set(0, 0, z);
      this.scene.add(mesh);
      this.trackChunks.push({ mesh, z });
    }

    // Outer embankment terrain (Warm gravel terrain)
    const terrainGeo = new THREE.PlaneGeometry(260, 320);
    terrainGeo.rotateX(-Math.PI / 2);
    const terrainMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.95,
      metalness: 0.05,
    });
    const terrain = new THREE.Mesh(terrainGeo, terrainMat);
    terrain.position.set(0, -0.05, -75);
    terrain.receiveShadow = true;
    this.scene.add(terrain);

    // Subway Brick Tunnel Arches
    for (let i = 0; i < 4; i++) {
      const tunnel = createSubwayTunnel();
      const z = -60 - i * 65;
      tunnel.position.set(0, 0, z);
      this.scene.add(tunnel);
      this.tunnels.push({ mesh: tunnel, z });
    }

    // Signal Posts
    for (let i = 0; i < 10; i++) {
      const isRight = i % 2 === 0;
      const post = createSignalPost(isRight);
      const z = -20 - i * 26;
      post.position.set(isRight ? 7.2 : -7.2, 0, z);
      this.scene.add(post);
      this.signalPosts.push({ mesh: post, z });
    }

    // City Skyline with skyscrapers
    const skylineGroup = new THREE.Group();
    for (let i = 0; i < 28; i++) {
      const isRight = i % 2 === 0;
      const height = 45 + Math.random() * 85;
      const width = 12 + Math.random() * 18;
      const depth = 12 + Math.random() * 18;
      const building = createSkyscraper(height, width, depth);
      const x = (isRight ? 1 : -1) * (26 + Math.random() * 45);
      const z = -20 - i * 16;
      building.position.set(x, height / 2, z);
      skylineGroup.add(building);
    }
    this.scene.add(skylineGroup);
  }

  private initCharacters() {
    // 1. Subway Surfers Runner (Jake)
    this.runnerNodes = createRunnerModel();
    this.runnerNodes.group.position.set(0, 0, 0);
    this.scene.add(this.runnerNodes.group);

    // 2. Inspector (O Guarda)
    this.inspectorNodes = createInspectorModel();
    this.inspectorNodes.group.position.set(0, 0, 3.2);
    this.scene.add(this.inspectorNodes.group);

    // 3. Pitbull Dog (O Cãozinho)
    this.dogNodes = createPitbullDogModel();
    this.dogNodes.group.position.set(-0.85, 0, 3.6);
    this.scene.add(this.dogNodes.group);
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

    const particleGeo = new THREE.PlaneGeometry(0.35, 0.35);

    for (let i = 0; i < 85; i++) {
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
    const lineCount = 36;
    const positions = new Float32Array(lineCount * 6);

    for (let i = 0; i < lineCount; i++) {
      const x = (Math.random() - 0.5) * 16;
      const y = 0.5 + Math.random() * 8;
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
      color: 0xffffff,
      transparent: true,
      opacity: 0.3,
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

  // --- Controls & Action Triggers ---
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
      // Super Sneakers jump boost! (Allows leaping over entire trains!)
      this.velocityY = this.stats.sneakersActive ? 25.5 : 18.0;
      this.isSliding = false;
      this.slideTimer = 0;

      if (this.stats.sneakersActive) {
        soundManager.playSuperBounce();
        this.emitBurst(this.runnerX, this.runnerY + 0.2, 0, 0xf59e0b, 14);
      } else {
        soundManager.playJump();
      }
    }
  }

  public slide() {
    if (this.status !== 'PLAYING') return;
    if (!this.isSliding) {
      this.isSliding = true;
      this.slideTimer = 0.65;
      if (this.isJumping) {
        this.velocityY = -26; // Fast drop & roll
      }
      soundManager.playSlide();
    }
  }

  /**
   * Activates the Subway Surfers Hoverboard with crash immunity
   */
  public activateHoverboard(): boolean {
    if (this.status !== 'PLAYING' || this.stats.hoverboardActive) return false;
    if (this.stats.hoverboardsAvailable <= 0) return false;

    this.stats.hoverboardActive = true;
    this.stats.hoverboardTimeLeft = 30; // 30s hoverboard ride
    this.stats.hoverboardsAvailable -= 1;
    this.runnerNodes.hoverboardMesh.visible = true;
    soundManager.playPowerup();
    this.emitBurst(this.runnerX, this.runnerY + 0.2, 0, 0x06b6d4, 25);

    try {
      localStorage.setItem('corrida_infinita_boards', String(this.stats.hoverboardsAvailable));
    } catch {}

    this.onStatsUpdate?.({ ...this.stats });
    return true;
  }

  public handleSpacePress() {
    if (this.status === 'TITLE') {
      this.startGame();
      return;
    }
    if (this.status === 'GAMEOVER') {
      this.restartGame();
      return;
    }

    // Double-tap Space triggers Hoverboard!
    const now = performance.now();
    if (now - this.lastSpacePressTime < 320) {
      this.activateHoverboard();
    } else {
      this.jump();
    }
    this.lastSpacePressTime = now;
  }

  // --- Game Lifecycle ---
  public startGame() {
    this.status = 'PLAYING';
    this.resetStats();

    // Start with authentic Subway Surfers chase sequence!
    soundManager.playSprayCan();
    setTimeout(() => soundManager.playWhistle(), 250);
    setTimeout(() => soundManager.playDogBark(), 500);
    soundManager.startMusic();

    this.inspectorZ = 3.0;
    this.inspectorTargetZ = 3.2;
    this.inspectorActive = true;
    this.chaseAlertTimer = 8.0; // Chase stays close for initial 8 seconds
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
    this.baseY = 0;
    this.velocityY = 0;
    this.isJumping = false;
    this.isSliding = false;
    this.slideTimer = 0;
    this.nextObstacleZ = -50;
    this.nextPowerUpDistance = 180;
    this.startGame();
  }

  private resetStats() {
    let savedHighScore = 0;
    let savedTotalCoins = 0;
    let savedBoards = 3;
    try {
      savedHighScore = parseInt(localStorage.getItem('corrida_infinita_highscore') || '0', 10);
      savedTotalCoins = parseInt(localStorage.getItem('corrida_infinita_total_coins') || '0', 10);
      savedBoards = parseInt(localStorage.getItem('corrida_infinita_boards') || '3', 10);
    } catch {}

    this.stats = {
      score: 0,
      highScore: isNaN(savedHighScore) ? 0 : savedHighScore,
      coins: 0,
      totalCoins: isNaN(savedTotalCoins) ? 0 : savedTotalCoins,
      distance: 0,
      speed: 24,
      scoreMultiplier: 30, // Subway Surfers standard 30x
      hoverboardActive: false,
      hoverboardTimeLeft: 0,
      hoverboardsAvailable: isNaN(savedBoards) ? 3 : Math.max(1, savedBoards),
      jetpackActive: false,
      jetpackTimeLeft: 0,
      sneakersActive: false,
      sneakersTimeLeft: 0,
      magnetActive: false,
      magnetTimeLeft: 0,
      multiplierActive: false,
      multiplierTimeLeft: 0,
      shieldActive: false,
      newHighScore: false,
      mysteryBoxesCollected: 0,
      lettersCollected: [],
      inspectorAlert: true,
    };

    this.runnerNodes.hoverboardMesh.visible = false;
    this.runnerNodes.jetpackMesh.visible = false;
    this.runnerNodes.magnetFx.visible = false;
    this.onStatsUpdate?.(this.stats);
  }

  /**
   * Stumble event: when player bumps or lands poorly, Inspector catches up!
   */
  public triggerStumble() {
    if (this.status !== 'PLAYING') return;
    this.inspectorZ = 2.4; // Inspector gets right behind you!
    this.chaseAlertTimer = 5.0;
    this.stats.inspectorAlert = true;
    soundManager.playWhistle();
    soundManager.playDogBark();
    this.cameraShake = 0.35;
  }

  private triggerGameOver() {
    this.status = 'GAMEOVER';
    this.cameraShake = 0.9;
    this.hitstopTimer = 0.08;
    soundManager.playCrash();
    soundManager.stopMusic();

    this.emitBurst(this.runnerX, this.runnerY + 1, 0, 0xef4444, 35);

    // Inspector runs in to catch player!
    this.inspectorZ = 0.8;
    this.inspectorNodes.group.position.set(this.runnerX, this.runnerY, 0.8);
    this.dogNodes.group.position.set(this.runnerX - 0.7, this.runnerY, 1.1);

    try {
      if (this.stats.score > this.stats.highScore) {
        this.stats.highScore = this.stats.score;
        this.stats.newHighScore = true;
        localStorage.setItem('corrida_infinita_highscore', String(this.stats.highScore));
      }
      this.stats.totalCoins += this.stats.coins;
      localStorage.setItem('corrida_infinita_total_coins', String(this.stats.totalCoins));
    } catch {}

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
  private updateSpawning(_dt: number) {
    if (this.status !== 'PLAYING') return;

    while (this.nextObstacleZ > -160) {
      this.spawnObstacleWave(this.nextObstacleZ);
      const gap = Math.max(28, 44 - (this.stats.speed - 24) * 0.28);
      this.nextObstacleZ -= gap;
    }

    if (this.stats.distance >= this.nextPowerUpDistance) {
      this.spawnPowerUp(this.nextObstacleZ - 12);
      this.nextPowerUpDistance += 190 + Math.random() * 110;
    }
  }

  private spawnObstacleWave(z: number) {
    const lanes: LaneIndex[] = [-1, 0, 1];
    for (let i = lanes.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [lanes[i], lanes[j]] = [lanes[j], lanes[i]];
    }

    // 60% chance of spawning subway trains (stationary, with ramp, or MOVING towards player!)
    const spawnTrain = Math.random() > 0.4;

    if (spawnTrain) {
      const trainLane = lanes[0];
      const roll = Math.random();
      let type: ObstacleType = 'TRAIN';
      let isMoving = false;

      if (roll < 0.35) {
        type = 'TRAIN_RAMP';
      } else if (roll < 0.7 && this.stats.distance > 80) {
        type = 'TRAIN_MOVING';
        isMoving = true;
      } else {
        type = 'TRAIN';
      }

      const mesh = createObstacleModel(type);
      mesh.position.set(trainLane * TRACK_WIDTH, 0, z);
      this.scene.add(mesh);

      this.obstacles.push({
        id: ++this.objectIdCounter,
        mesh,
        type,
        lane: trainLane,
        z,
        cleared: false,
        box: new THREE.Box3(),
        isMoving,
        hornPlayed: false,
      });

      // If train has ramp, spawn rooftop coins!
      if (type === 'TRAIN_RAMP') {
        for (let c = 0; c < 4; c++) {
          const coinZ = z - c * 2.8;
          const coinMesh = createCoinModel();
          coinMesh.position.set(trainLane * TRACK_WIDTH, TRAIN_ROOF_HEIGHT + 0.1, coinZ);
          this.scene.add(coinMesh);

          this.coins.push({
            id: ++this.objectIdCounter,
            mesh: coinMesh,
            lane: trainLane,
            z: coinZ,
            y: TRAIN_ROOF_HEIGHT + 0.1,
            collected: false,
          });
        }
      }

      // Secondary obstacle in another lane
      if (Math.random() > 0.5) {
        const otherLane = lanes[1];
        const secType: ObstacleType = Math.random() > 0.5 ? 'BARRIER' : 'HIGH_BEAM';
        const secMesh = createObstacleModel(secType);
        secMesh.position.set(otherLane * TRACK_WIDTH, 0, z);
        this.scene.add(secMesh);

        this.obstacles.push({
          id: ++this.objectIdCounter,
          mesh: secMesh,
          type: secType,
          lane: otherLane,
          z,
          cleared: false,
          box: new THREE.Box3(),
        });
      }

      // Safe lane coins
      const freeLane = lanes[2];
      this.spawnCoinTrail(freeLane, z - 6, 5, 0);
    } else {
      // Classic hurdles, high beams, or buffer stops
      const types: ObstacleType[] = ['BARRIER', 'HIGH_BEAM', 'ROAD_BLOCK'];
      const blockedCount = Math.random() > 0.4 ? 2 : 1;

      for (let i = 0; i < blockedCount; i++) {
        const lane = lanes[i];
        const type = types[Math.floor(Math.random() * types.length)];
        const mesh = createObstacleModel(type);
        mesh.position.set(lane * TRACK_WIDTH, 0, z);
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

      const freeLane = lanes[blockedCount === 1 ? (Math.random() > 0.5 ? 1 : 2) : 2];
      this.spawnCoinTrail(freeLane, z - 8, 4, 0);
    }
  }

  private spawnCoinTrail(lane: LaneIndex, startZ: number, count: number, yOffset: number = 0) {
    for (let i = 0; i < count; i++) {
      const z = startZ - i * 3.4;
      const mesh = createCoinModel();
      mesh.position.set(lane * TRACK_WIDTH, yOffset, z);
      this.scene.add(mesh);

      this.coins.push({
        id: ++this.objectIdCounter,
        mesh,
        lane,
        z,
        y: yOffset,
        collected: false,
      });
    }
  }

  private spawnPowerUp(z: number) {
    // Powerups: MAGNET, JETPACK, SNEAKERS, MULTIPLIER, HOVERBOARD, MYSTERY_BOX, WORD HUNT LETTERS
    const powerupList: PowerUpType[] = [
      'MAGNET',
      'JETPACK',
      'SNEAKERS',
      'MULTIPLIER',
      'HOVERBOARD',
      'MYSTERY_BOX',
      'LETTER_S',
      'LETTER_U',
      'LETTER_R',
      'LETTER_F',
    ];

    const type = powerupList[Math.floor(Math.random() * powerupList.length)];
    const lanes: LaneIndex[] = [-1, 0, 1];
    const lane = lanes[Math.floor(Math.random() * lanes.length)];

    const mesh = createPowerUpModel(type);
    mesh.position.set(lane * TRACK_WIDTH, 0, z);
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

  // --- Animation / Render Loop ---
  private loop(time: number) {
    if (this.isDestroyed) return;

    const rawDt = (time - this.lastTime) / 1000;
    this.lastTime = time;
    const dt = Math.min(rawDt, 0.05);

    if (this.hitstopTimer > 0) {
      this.hitstopTimer -= dt;
    } else {
      this.update(dt);
    }

    this.render(dt);

    this.animationFrameId = requestAnimationFrame(this.loop);
  }

  private update(dt: number) {
    if (this.status === 'TITLE') {
      const elapsed = performance.now() * 0.001;
      this.camera.position.x = Math.sin(elapsed * 0.45) * 4.2;
      this.camera.position.y = 2.8 + Math.cos(elapsed * 0.6) * 0.35;
      this.camera.position.z = 6.8;
      this.camera.lookAt(0, 1.3, -6);

      // Jake idle spray paint pose
      this.runnerNodes.torso.position.y = 1.0 + Math.sin(elapsed * 3) * 0.02;
      this.runnerNodes.rightArm.rotation.x = -0.5 + Math.sin(elapsed * 4) * 0.2;
      this.runnerNodes.leftArm.rotation.x = 0.2;

      // Inspector and dog idle behind
      this.inspectorNodes.group.position.set(0.6, 0, 3.8);
      this.dogNodes.group.position.set(-0.6, 0, 4.2);
      this.dogNodes.tail.rotation.z = Math.sin(elapsed * 8) * 0.4;
      return;
    }

    if (this.status !== 'PLAYING') return;

    // 1. Speed ramp
    this.stats.speed = Math.min(65, 24 + this.stats.distance * 0.015);
    const speed = this.stats.speed;
    const distanceDelta = speed * dt;
    this.stats.distance += distanceDelta;

    const baseMult = this.stats.scoreMultiplier;
    const activeMult = this.stats.multiplierActive ? baseMult * 2 : baseMult;
    this.stats.score += Math.round(distanceDelta * (activeMult / 3));

    // 2. Powerup Timers
    if (this.stats.hoverboardActive) {
      this.stats.hoverboardTimeLeft -= dt;
      if (this.stats.hoverboardTimeLeft <= 0) {
        this.stats.hoverboardActive = false;
        this.runnerNodes.hoverboardMesh.visible = false;
      }
    }

    if (this.stats.jetpackActive) {
      this.stats.jetpackTimeLeft -= dt;
      if (this.stats.jetpackTimeLeft <= 0) {
        this.stats.jetpackActive = false;
        this.runnerNodes.jetpackMesh.visible = false;
      }
    }

    if (this.stats.sneakersActive) {
      this.stats.sneakersTimeLeft -= dt;
      if (this.stats.sneakersTimeLeft <= 0) {
        this.stats.sneakersActive = false;
      }
    }

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

    // 3. Inspector & Dog Chase Logic
    if (this.chaseAlertTimer > 0) {
      this.chaseAlertTimer -= dt;
      this.inspectorTargetZ = 3.2; // Stay right on your tail!
      this.stats.inspectorAlert = true;
    } else {
      this.inspectorTargetZ = 16.0; // Fall behind when running clean
      this.stats.inspectorAlert = false;
    }

    this.inspectorZ += (this.inspectorTargetZ - this.inspectorZ) * (1 - Math.exp(-2.5 * dt));

    // Position Inspector and Dog in world
    this.inspectorNodes.group.position.set(this.runnerX * 0.85, this.runnerY, this.inspectorZ);
    this.dogNodes.group.position.set(this.runnerX * 0.85 - 0.75, this.runnerY, this.inspectorZ + 0.4);

    // Inspector and Dog Running animations
    this.inspectorRunCycle += dt * (speed * 0.75);
    const inspLegSwing = Math.sin(this.inspectorRunCycle);
    const inspArmSwing = Math.cos(this.inspectorRunCycle);

    this.inspectorNodes.leftLeg.rotation.x = inspLegSwing * 0.9;
    this.inspectorNodes.rightLeg.rotation.x = -inspLegSwing * 0.9;
    this.inspectorNodes.leftArm.rotation.x = -inspArmSwing * 0.95;
    this.inspectorNodes.rightArm.rotation.x = inspArmSwing * 0.95;
    this.inspectorNodes.torso.rotation.x = 0.22;

    const dogLegSwing = Math.sin(this.inspectorRunCycle * 1.5);
    this.dogNodes.legFL.rotation.x = dogLegSwing * 0.8;
    this.dogNodes.legFR.rotation.x = -dogLegSwing * 0.8;
    this.dogNodes.legBL.rotation.x = -dogLegSwing * 0.8;
    this.dogNodes.legBR.rotation.x = dogLegSwing * 0.8;
    this.dogNodes.tail.rotation.z = Math.sin(this.inspectorRunCycle * 3) * 0.5;

    // 4. Jetpack High Altitude Flight Target
    if (this.stats.jetpackActive) {
      this.baseY = 8.5; // Fly high in the sky above all obstacles!
      if (Math.random() > 0.2) {
        this.emitBurst(this.runnerX - 0.2, this.runnerY + 1.1, 0.4, 0xef4444, 2);
        this.emitBurst(this.runnerX + 0.2, this.runnerY + 1.1, 0.4, 0xf59e0b, 2);
      }
    } else {
      let onRoof = false;
      for (const obs of this.obstacles) {
        if (
          (obs.type === 'TRAIN' || obs.type === 'TRAIN_RAMP' || obs.type === 'TRAIN_MOVING') &&
          obs.lane === this.targetLane &&
          obs.z > -6.0 &&
          obs.z < 6.0 &&
          this.runnerY >= TRAIN_ROOF_HEIGHT - 0.5
        ) {
          onRoof = true;
          break;
        }
      }
      this.baseY = onRoof ? TRAIN_ROOF_HEIGHT : 0;
    }

    // 5. Smooth Lane Switching
    const targetX = this.targetLane * TRACK_WIDTH;
    const lateralSpeed = 16;
    const dx = targetX - this.runnerX;
    this.runnerX += dx * (1 - Math.exp(-lateralSpeed * dt));

    const targetRoll = -dx * 0.12;
    this.rollAngle += (targetRoll - this.rollAngle) * (1 - Math.exp(-12 * dt));
    this.runnerNodes.group.rotation.z = this.rollAngle;

    // 6. Jump, Gravity & Ramp Climbing
    if (this.stats.jetpackActive) {
      this.runnerY += (this.baseY - this.runnerY) * (1 - Math.exp(-5 * dt));
      this.isJumping = false;
      this.velocityY = 0;
    } else {
      let onRamp = false;
      for (const obs of this.obstacles) {
        if (obs.type === 'TRAIN_RAMP' && obs.lane === this.targetLane) {
          if (obs.z > -8.5 && obs.z < -2.0) {
            const rampProgress = ((-obs.z - 2.0) / 6.5);
            if (rampProgress >= 0 && rampProgress <= 1) {
              const targetRampY = rampProgress * TRAIN_ROOF_HEIGHT;
              this.runnerY = Math.max(this.runnerY, targetRampY);
              onRamp = true;
            }
          }
        }
      }

      if (!onRamp) {
        if (this.isJumping) {
          this.runnerY += this.velocityY * dt;
          this.velocityY -= 46 * dt; // Gravity
          if (this.runnerY <= this.baseY) {
            this.runnerY = this.baseY;
            this.isJumping = false;
            this.velocityY = 0;
            this.emitBurst(this.runnerX, this.runnerY + 0.1, 0, 0x64748b, 8);
          }
        } else {
          if (this.runnerY > this.baseY) {
            this.runnerY += (this.baseY - this.runnerY) * (1 - Math.exp(-14 * dt));
          } else {
            this.runnerY = this.baseY;
          }
        }
      }
    }

    if (this.isSliding) {
      this.slideTimer -= dt;
      if (this.slideTimer <= 0) {
        this.isSliding = false;
      }
    }

    // Position runner group
    this.runnerNodes.group.position.set(this.runnerX, this.runnerY, 0);

    // Hoverboard particle trail
    if (this.stats.hoverboardActive) {
      this.runnerNodes.hoverboardMesh.rotation.z = -this.rollAngle * 0.8;
      if (Math.random() > 0.4) {
        this.emitBurst(this.runnerX, this.runnerY + 0.1, 0.4, 0x06b6d4, 2);
      }
    }

    // Kinematics Animations
    this.runCycle += dt * (speed * 0.72);
    const legSwing = Math.sin(this.runCycle);
    const armSwing = Math.cos(this.runCycle);

    if (this.stats.hoverboardActive) {
      // Surfing skate pose
      this.runnerNodes.torso.position.y = 0.85;
      this.runnerNodes.torso.rotation.x = 0;
      this.runnerNodes.torso.rotation.y = 0.6; // turned sideways surfing stance
      this.runnerNodes.leftLeg.rotation.x = -0.3;
      this.runnerNodes.rightLeg.rotation.x = 0.3;
      this.runnerNodes.leftArm.rotation.x = -0.4;
      this.runnerNodes.rightArm.rotation.x = 0.4;
    } else if (this.isSliding) {
      this.runnerNodes.torso.position.y = 0.45;
      this.runnerNodes.torso.rotation.x = 0.8;
      this.runnerNodes.torso.rotation.y = 0;
      this.runnerNodes.leftLeg.rotation.x = -1.2;
      this.runnerNodes.rightLeg.rotation.x = -1.0;
      this.runnerNodes.leftArm.rotation.x = 0.6;
      this.runnerNodes.rightArm.rotation.x = 0.6;
    } else if (this.isJumping) {
      this.runnerNodes.torso.position.y = 1.0;
      this.runnerNodes.torso.rotation.x = -0.15;
      this.runnerNodes.torso.rotation.y = 0;
      this.runnerNodes.leftLeg.rotation.x = 0.4;
      this.runnerNodes.rightLeg.rotation.x = -0.2;
      this.runnerNodes.leftArm.rotation.x = -1.1;
      this.runnerNodes.rightArm.rotation.x = -1.1;
    } else {
      this.runnerNodes.torso.position.y = 1.0 + Math.abs(legSwing) * 0.08;
      this.runnerNodes.torso.rotation.x = 0.18;
      this.runnerNodes.torso.rotation.y = 0;
      this.runnerNodes.leftLeg.rotation.x = legSwing * 0.85;
      this.runnerNodes.rightLeg.rotation.x = -legSwing * 0.85;
      this.runnerNodes.leftArm.rotation.x = -armSwing * 0.9;
      this.runnerNodes.rightArm.rotation.x = armSwing * 0.9;
    }

    // 7. Scroll World & Handle Moving Trains
    const moveZ = speed * dt;

    for (const chunk of this.trackChunks) {
      chunk.z += moveZ;
      if (chunk.z > 35) {
        chunk.z -= 6 * 50;
      }
      chunk.mesh.position.z = chunk.z;
    }

    this.trackTexture.offset.y -= (speed * dt) / 50;

    for (const tunnel of this.tunnels) {
      tunnel.z += moveZ;
      if (tunnel.z > 25) {
        tunnel.z -= 4 * 65;
      }
      tunnel.mesh.position.z = tunnel.z;
    }

    for (const post of this.signalPosts) {
      post.z += moveZ;
      if (post.z > 25) {
        post.z -= 10 * 26;
      }
      post.mesh.position.z = post.z;
    }

    this.nextObstacleZ += moveZ;
    this.updateSpawning(dt);

    // 8. Check Obstacle Collisions & Moving Trains
    if (!this.stats.jetpackActive) {
      const playerBounds = this.getPlayerBoundingBox();

      for (let i = this.obstacles.length - 1; i >= 0; i--) {
        const obs = this.obstacles[i];

        // If obstacle is a moving train, it rushes forward with extra speed!
        const extraSpeed = obs.isMoving ? 16 * dt : 0;
        obs.z += moveZ + extraSpeed;
        obs.mesh.position.z = obs.z;

        // Train Horn Alert when approaching player
        if (obs.isMoving && !obs.hornPlayed && obs.z > -70 && obs.z < -25) {
          obs.hornPlayed = true;
          soundManager.playTrainHorn();
        }

        const isTrain = obs.type === 'TRAIN' || obs.type === 'TRAIN_RAMP' || obs.type === 'TRAIN_MOVING';
        const zNear = isTrain ? -7.0 : -2.2;
        const zFar = isTrain ? 7.0 : 2.0;

        if (!obs.cleared && obs.z > zNear && obs.z < zFar) {
          if (isTrain && this.runnerY >= TRAIN_ROOF_HEIGHT - 0.2) {
            continue;
          }

          if (obs.type === 'TRAIN_RAMP' && obs.lane === this.targetLane && obs.z < -2.0) {
            continue;
          }

          obs.box.setFromObject(obs.mesh);
          obs.box.expandByScalar(-0.16);

          if (playerBounds.intersectsBox(obs.box)) {
            // Hoverboard Crash Protection!
            if (this.stats.hoverboardActive) {
              this.stats.hoverboardActive = false;
              this.runnerNodes.hoverboardMesh.visible = false;
              soundManager.playShieldBreak();
              this.emitBurst(obs.mesh.position.x, this.runnerY + 0.5, obs.z, 0x06b6d4, 30);
              this.cameraShake = 0.5;
              this.hitstopTimer = 0.06;
              this.scene.remove(obs.mesh);
              this.obstacles.splice(i, 1);
              continue;
            } else if (this.stats.shieldActive) {
              this.stats.shieldActive = false;
              soundManager.playShieldBreak();
              this.emitBurst(obs.mesh.position.x, 1, obs.z, 0x38bdf8, 22);
              this.scene.remove(obs.mesh);
              this.obstacles.splice(i, 1);
              this.cameraShake = 0.45;
              continue;
            } else {
              // Fatal Crash!
              this.triggerGameOver();
              return;
            }
          }
        }

        const maxPassZ = isTrain ? 35 : 25;
        if (obs.z > maxPassZ) {
          this.scene.remove(obs.mesh);
          this.obstacles.splice(i, 1);
        }
      }
    } else {
      for (let i = this.obstacles.length - 1; i >= 0; i--) {
        const obs = this.obstacles[i];
        obs.z += moveZ;
        obs.mesh.position.z = obs.z;
        if (obs.z > 35) {
          this.scene.remove(obs.mesh);
          this.obstacles.splice(i, 1);
        }
      }
    }

    // 9. Move & Collect Coins
    for (let i = this.coins.length - 1; i >= 0; i--) {
      const coin = this.coins[i];
      coin.z += moveZ;

      const spinGroup = coin.mesh.getObjectByName('coinSpinGroup');
      if (spinGroup) {
        spinGroup.rotation.y += dt * 4;
      }

      const shouldMagnetize = this.stats.magnetActive || this.stats.jetpackActive;
      if (shouldMagnetize && coin.z > -28 && coin.z < 12) {
        const coinPos = coin.mesh.position;
        const cdx = this.runnerX - coinPos.x;
        const cdy = (this.runnerY + 1) - coinPos.y;
        const cdz = 0 - coinPos.z;
        const dist = Math.sqrt(cdx * cdx + cdy * cdy + cdz * cdz);
        if (dist > 0.1) {
          const pullSpeed = 30 * dt;
          coinPos.x += (cdx / dist) * pullSpeed;
          coinPos.y += (cdy / dist) * pullSpeed;
          coinPos.z += (cdz / dist) * pullSpeed;
          coin.z = coinPos.z;
        }
      } else {
        coin.mesh.position.z = coin.z;
      }

      const coinPos = coin.mesh.position;
      const distX = Math.abs(coinPos.x - this.runnerX);
      const distY = Math.abs((this.runnerY + 0.9) - coinPos.y);
      const distZ = Math.abs(coinPos.z - 0);

      if (!coin.collected && distX < 1.25 && distY < 1.5 && distZ < 1.5) {
        coin.collected = true;
        this.stats.coins += 1;
        this.stats.score += this.stats.multiplierActive ? 60 : 30;
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

    // 10. Move & Collect Powerups
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

      if (!pu.collected && distX < 1.3 && distY < 1.7 && distZ < 1.6) {
        pu.collected = true;
        this.applyPowerUp(pu.type);
        this.emitBurst(puPos.x, 1, pu.z, 0x06b6d4, 25);
        this.scene.remove(pu.mesh);
        this.powerUps.splice(i, 1);
        continue;
      }

      if (pu.z > 25) {
        this.scene.remove(pu.mesh);
        this.powerUps.splice(i, 1);
      }
    }

    // 11. Particle System
    for (const p of this.particles) {
      if (p.life > 0) {
        p.life -= dt;
        p.mesh.position.x += p.vx * dt;
        p.mesh.position.y += p.vy * dt;
        p.mesh.position.z += p.vz * dt;
        p.vy -= 12 * dt;

        const alpha = Math.max(0, p.life / p.maxLife);
        (p.mesh.material as THREE.MeshBasicMaterial).opacity = alpha;

        if (p.life <= 0) {
          p.mesh.visible = false;
        }
      }
    }

    // 12. Speed Lines
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

    // 13. Dynamic Camera
    const targetCamX = this.runnerX * 0.35;
    const targetCamY = 3.6 + this.runnerY * 0.45;
    const targetCamZ = 7.5;

    this.camera.position.x += (targetCamX - this.camera.position.x) * (1 - Math.exp(-8 * dt));
    this.camera.position.y += (targetCamY - this.camera.position.y) * (1 - Math.exp(-10 * dt));
    this.camera.position.z += (targetCamZ - this.camera.position.z) * (1 - Math.exp(-6 * dt));

    const targetFov = (this.stats.jetpackActive ? 75 : 65) + (speed - 24) * 0.35;
    this.camera.fov += (targetFov - this.camera.fov) * (1 - Math.exp(-5 * dt));
    this.camera.updateProjectionMatrix();

    this.camera.lookAt(this.runnerX * 0.2, 1.4 + this.runnerY * 0.4, -12);

    if (this.cameraShake > 0) {
      this.camera.position.x += (Math.random() - 0.5) * this.cameraShake * 0.6;
      this.camera.position.y += (Math.random() - 0.5) * this.cameraShake * 0.6;
      this.cameraShake = Math.max(0, this.cameraShake - dt * 2.5);
    }

    this.onStatsUpdate?.({ ...this.stats });
  }

  private applyPowerUp(type: PowerUpType) {
    if (type === 'MAGNET') {
      soundManager.playPowerup();
      this.stats.magnetActive = true;
      this.stats.magnetTimeLeft = 14;
      this.runnerNodes.magnetFx.visible = true;
    } else if (type === 'JETPACK') {
      soundManager.playPowerup();
      this.stats.jetpackActive = true;
      this.stats.jetpackTimeLeft = 10;
      this.runnerNodes.jetpackMesh.visible = true;
      // High altitude coin trails
      for (let c = 0; c < 16; c++) {
        const lane = (c % 3 - 1) as LaneIndex;
        const coinZ = -15 - c * 4;
        const mesh = createCoinModel();
        mesh.position.set(lane * TRACK_WIDTH, 8.5, coinZ);
        this.scene.add(mesh);
        this.coins.push({
          id: ++this.objectIdCounter,
          mesh,
          lane,
          z: coinZ,
          y: 8.5,
          collected: false,
        });
      }
    } else if (type === 'SNEAKERS') {
      soundManager.playSuperBounce();
      this.stats.sneakersActive = true;
      this.stats.sneakersTimeLeft = 15;
    } else if (type === 'HOVERBOARD') {
      soundManager.playPowerup();
      this.stats.hoverboardActive = true;
      this.stats.hoverboardTimeLeft = 30;
      this.runnerNodes.hoverboardMesh.visible = true;
    } else if (type === 'MULTIPLIER') {
      soundManager.playPowerup();
      this.stats.multiplierActive = true;
      this.stats.multiplierTimeLeft = 16;
    } else if (type === 'MYSTERY_BOX') {
      soundManager.playMysteryBox();
      this.stats.mysteryBoxesCollected += 1;
      // Surprise mystery gift!
      const gifts = ['coins_250', 'coins_500', 'board', 'sneakers'];
      const gift = gifts[Math.floor(Math.random() * gifts.length)];
      if (gift === 'coins_250') {
        this.stats.coins += 250;
      } else if (gift === 'coins_500') {
        this.stats.coins += 500;
      } else if (gift === 'board') {
        this.stats.hoverboardsAvailable += 1;
      } else {
        this.stats.sneakersActive = true;
        this.stats.sneakersTimeLeft = 15;
      }
    } else if (type.startsWith('LETTER_')) {
      soundManager.playPowerup();
      const letter = type.replace('LETTER_', '');
      if (!this.stats.lettersCollected.includes(letter)) {
        this.stats.lettersCollected.push(letter);
        // Check if all S-U-R-F collected!
        if (['S', 'U', 'R', 'F'].every((l) => this.stats.lettersCollected.includes(l))) {
          soundManager.playMysteryBox();
          this.stats.coins += 1000; // Mega Word Hunt Jackpot!
          this.stats.hoverboardsAvailable += 2;
        }
      }
    }
  }

  private getPlayerBoundingBox(): THREE.Box3 {
    const box = new THREE.Box3();
    const halfWidth = 0.38;

    if (this.isSliding) {
      box.min.set(this.runnerX - halfWidth, this.runnerY, -0.6);
      box.max.set(this.runnerX + halfWidth, this.runnerY + 0.65, 0.6);
    } else {
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
