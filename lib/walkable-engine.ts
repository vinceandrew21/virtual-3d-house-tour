import * as THREE from 'three';
import { Scene, Hotspot, WalkableConfig, FurnitureItem, LightConfig } from '@/types/tour';
import { drawNavigationFloorRing, drawHotspotIcon } from './hotspot-sprites';

export interface WalkableHotspotMesh {
  mesh: THREE.Group;
  hotspot: Hotspot;
  sprite: THREE.Sprite;
}

export class WalkableViewer {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private container: HTMLElement;
  private clock = new THREE.Clock();

  // Camera controls (click-and-drag, like 360 panorama)
  private euler = new THREE.Euler(0, 0, 0, 'YXZ');
  private isDragging = false;
  private dragStartX = 0;
  private dragStartY = 0;
  private dragMoved = false;
  private mouseSensitivity = 0.003;

  // WASD movement (optional)
  private moveForward = false;
  private moveBackward = false;
  private moveLeft = false;
  private moveRight = false;
  private velocity = new THREE.Vector3();
  private playerHeight = 1.7;
  private moveSpeed = 32.0;

  // Collision
  private collisionBoxes: THREE.Box3[] = [];
  private roomBounds = new THREE.Box3();
  private playerRadius = 0.3;

  // Room meshes (for cleanup)
  private roomMeshes: THREE.Object3D[] = [];
  private roomLights: THREE.Light[] = [];

  // Hotspots
  private hotspotMeshes: WalkableHotspotMesh[] = [];
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();

  // Transition
  private isTransitioning = false;
  private transitionProgress = 0;
  private fadeOverlay: THREE.Mesh | null = null;

  // Callbacks
  private onHotspotHover: ((hotspot: Hotspot | null) => void) | null = null;
  private onHotspotClick: ((hotspot: Hotspot) => void) | null = null;

  // Touch controls
  private isTouchDevice = false;
  private touchStartX = 0;
  private touchStartY = 0;
  private touchStartTime = 0;
  private prevTouchX = 0;
  private prevTouchY = 0;
  private touchSensitivity = 0.004;

  // Pending click (processed in animation loop for reliable raycasting)
  private pendingClick = false;
  private clickCoords = new THREE.Vector2();

  // Teleport animation
  private teleportFrom = new THREE.Vector3();
  private teleportTarget = new THREE.Vector3();
  private teleportProgress = -1; // -1 means not teleporting
  private teleportDuration = 0.4; // seconds

  constructor(container: HTMLElement) {
    this.container = container;

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a1a1a);
    this.scene.fog = new THREE.Fog(0x1a1a1a, 12, 30);

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      70,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    this.camera.position.set(0, this.playerHeight, 0);
    this.scene.add(this.camera);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.5;
    this.renderer.domElement.style.touchAction = 'none';
    container.appendChild(this.renderer.domElement);

    // Fade overlay for transitions
    const fadeGeo = new THREE.PlaneGeometry(2, 2);
    const fadeMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0,
      depthTest: false,
      depthWrite: false,
    });
    this.fadeOverlay = new THREE.Mesh(fadeGeo, fadeMat);
    this.fadeOverlay.renderOrder = 9999;
    this.fadeOverlay.position.z = -0.1;
    this.camera.add(this.fadeOverlay);

    this.bindEvents();
    this.renderer.setAnimationLoop(this.animate);
  }

  private bindEvents() {
    const el = this.renderer.domElement;

    this.isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    // Mouse: click-and-drag to look, click to interact with hotspots
    el.addEventListener('mousedown', this.handleMouseDown);
    el.addEventListener('mousemove', this.handleMouseMove);
    // Bind mouseup on window so it's never missed (UI overlays can steal canvas mouseup)
    window.addEventListener('mouseup', this.handleMouseUp);
    el.addEventListener('mouseleave', this.handleMouseLeave);

    // Keyboard: WASD (optional movement)
    document.addEventListener('keydown', this.handleKeyDown);
    document.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('resize', this.handleResize);

    // Touch events
    el.addEventListener('touchstart', this.handleTouchStart, { passive: false });
    el.addEventListener('touchmove', this.handleTouchMove, { passive: false });
    el.addEventListener('touchend', this.handleTouchEnd, { passive: false });
  }

  private handleMouseDown = (e: MouseEvent) => {
    if (e.button !== 0) return;
    this.isDragging = true;
    this.dragMoved = false;
    this.dragStartX = e.clientX;
    this.dragStartY = e.clientY;
    this.renderer.domElement.style.cursor = 'grabbing';
  };

  private handleMouseMove = (e: MouseEvent) => {
    // Always update mouse position for hover raycasting
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    if (!this.isDragging) return;

    const dx = e.clientX - this.dragStartX;
    const dy = e.clientY - this.dragStartY;

    // Mark as a drag if moved enough
    if (!this.dragMoved && (Math.abs(dx) > 3 || Math.abs(dy) > 3)) {
      this.dragMoved = true;
    }

    // Only rotate camera once drag threshold is exceeded (keeps camera stable for clicks)
    if (this.dragMoved) {
      this.euler.setFromQuaternion(this.camera.quaternion);
      this.euler.y += (e.clientX - this.dragStartX) * this.mouseSensitivity;
      this.euler.x += (e.clientY - this.dragStartY) * this.mouseSensitivity;
      this.euler.x = Math.max(-Math.PI / 2 + 0.01, Math.min(Math.PI / 2 - 0.01, this.euler.x));
      this.camera.quaternion.setFromEuler(this.euler);
    }

    this.dragStartX = e.clientX;
    this.dragStartY = e.clientY;
  };

  private handleMouseUp = (e: MouseEvent) => {
    if (!this.isDragging) return;
    this.isDragging = false;
    this.renderer.domElement.style.cursor = 'grab';

    // If it was a click (not a drag), schedule hotspot check for next animation frame
    if (!this.dragMoved) {
      const rect = this.renderer.domElement.getBoundingClientRect();
      this.clickCoords.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.clickCoords.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      this.pendingClick = true;
    }
  };

  private handleMouseLeave = () => {
    if (!this.isDragging) return;
    this.isDragging = false;
    this.renderer.domElement.style.cursor = 'grab';
  };

  private handleKeyDown = (e: KeyboardEvent) => {
    switch (e.code) {
      case 'KeyW': case 'ArrowUp':    this.moveForward = true; break;
      case 'KeyS': case 'ArrowDown':  this.moveBackward = true; break;
      case 'KeyA': case 'ArrowLeft':  this.moveLeft = true; break;
      case 'KeyD': case 'ArrowRight': this.moveRight = true; break;
    }
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    switch (e.code) {
      case 'KeyW': case 'ArrowUp':    this.moveForward = false; break;
      case 'KeyS': case 'ArrowDown':  this.moveBackward = false; break;
      case 'KeyA': case 'ArrowLeft':  this.moveLeft = false; break;
      case 'KeyD': case 'ArrowRight': this.moveRight = false; break;
    }
  };

  private handleTouchStart = (e: TouchEvent) => {
    e.preventDefault();
    if (e.touches.length === 1) {
      const t = e.touches[0];
      this.touchStartX = t.clientX;
      this.touchStartY = t.clientY;
      this.prevTouchX = t.clientX;
      this.prevTouchY = t.clientY;
      this.touchStartTime = performance.now();
    }
  };

  private handleTouchMove = (e: TouchEvent) => {
    e.preventDefault();
    if (e.touches.length === 1) {
      const t = e.touches[0];

      // Only rotate camera once past tap threshold (keeps camera stable for taps)
      const totalDist = Math.hypot(t.clientX - this.touchStartX, t.clientY - this.touchStartY);
      if (totalDist > 15) {
        const dx = t.clientX - this.prevTouchX;
        const dy = t.clientY - this.prevTouchY;

        this.euler.setFromQuaternion(this.camera.quaternion);
        this.euler.y += dx * this.touchSensitivity;
        this.euler.x += dy * this.touchSensitivity;
        this.euler.x = Math.max(-Math.PI / 2 + 0.01, Math.min(Math.PI / 2 - 0.01, this.euler.x));
        this.camera.quaternion.setFromEuler(this.euler);
      }

      this.prevTouchX = t.clientX;
      this.prevTouchY = t.clientY;
    }
  };

  private handleTouchEnd = (e: TouchEvent) => {
    e.preventDefault();
    const elapsed = performance.now() - this.touchStartTime;
    const ct = e.changedTouches[0];
    const dist = Math.hypot(ct.clientX - this.touchStartX, ct.clientY - this.touchStartY);

    // Detect tap: short duration and minimal movement — schedule for next animation frame
    if (elapsed < 300 && dist < 15) {
      const rect = this.renderer.domElement.getBoundingClientRect();
      this.clickCoords.x = ((ct.clientX - rect.left) / rect.width) * 2 - 1;
      this.clickCoords.y = -((ct.clientY - rect.top) / rect.height) * 2 + 1;
      this.pendingClick = true;
    }
  };

  private handleResize = () => {
    this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
  };

  private animate = () => {
    const delta = Math.min(this.clock.getDelta(), 0.1);
    const elapsed = this.clock.getElapsedTime();

    // WASD movement (always available)
    const isMoving = this.moveForward || this.moveBackward || this.moveLeft || this.moveRight;
    if (isMoving) {
      // Friction
      this.velocity.x -= this.velocity.x * 8.0 * delta;
      this.velocity.z -= this.velocity.z * 8.0 * delta;

      const direction = new THREE.Vector3();
      direction.z = Number(this.moveForward) - Number(this.moveBackward);
      direction.x = Number(this.moveRight) - Number(this.moveLeft);
      direction.normalize();

      if (this.moveForward || this.moveBackward) {
        this.velocity.z -= direction.z * this.moveSpeed * delta;
      }
      if (this.moveLeft || this.moveRight) {
        this.velocity.x -= direction.x * this.moveSpeed * delta;
      }

      // Move in camera XZ direction
      const forward = new THREE.Vector3();
      this.camera.getWorldDirection(forward);
      forward.y = 0;
      forward.normalize();

      const right = new THREE.Vector3();
      right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

      const proposed = this.camera.position.clone();
      proposed.add(forward.clone().multiplyScalar(-this.velocity.z * delta));
      proposed.add(right.clone().multiplyScalar(-this.velocity.x * delta));

      // Collision: try full move, then axis-slide
      if (this.isPositionValid(proposed)) {
        this.camera.position.copy(proposed);
      } else {
        const posXOnly = this.camera.position.clone();
        posXOnly.x = proposed.x;
        if (this.isPositionValid(posXOnly)) {
          this.camera.position.x = proposed.x;
        }
        const posZOnly = this.camera.position.clone();
        posZOnly.z = proposed.z;
        if (this.isPositionValid(posZOnly)) {
          this.camera.position.z = proposed.z;
        }
      }

      this.camera.position.y = this.playerHeight;
    } else {
      // Decay velocity when not pressing keys
      this.velocity.x *= 0.9;
      this.velocity.z *= 0.9;
    }

    // Teleport animation
    if (this.teleportProgress >= 0) {
      this.teleportProgress += delta / this.teleportDuration;
      if (this.teleportProgress >= 1) {
        this.camera.position.set(this.teleportTarget.x, this.playerHeight, this.teleportTarget.z);
        this.teleportProgress = -1;
      } else {
        // Smooth ease-in-out
        const t = this.teleportProgress;
        const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        this.camera.position.x = this.teleportFrom.x + (this.teleportTarget.x - this.teleportFrom.x) * ease;
        this.camera.position.z = this.teleportFrom.z + (this.teleportTarget.z - this.teleportFrom.z) * ease;
        this.camera.position.y = this.playerHeight;
      }
    }

    // Hotspot hover (skip on touch)
    if (!this.isTouchDevice) {
      this.checkHotspotIntersection(false);
    }

    // Process pending click (deferred from event handler for reliable raycasting)
    if (this.pendingClick) {
      this.pendingClick = false;
      this.mouse.copy(this.clickCoords);
      this.checkHotspotIntersection(true);
    }

    // Animate hotspots
    this.hotspotMeshes.forEach((hm) => {
      const isNav = hm.hotspot.type === 'navigation';
      const baseScale = hm.hotspot.scale || 1;

      if (isNav) {
        const pulse = 1 + Math.sin(elapsed * 2.5 + hm.mesh.userData.phase) * 0.12;
        hm.sprite.scale.setScalar(0.5 * baseScale * pulse);
      } else {
        const baseY = hm.mesh.userData.baseY || hm.mesh.position.y;
        hm.mesh.position.y = baseY + Math.sin(elapsed * 1.5 + hm.mesh.userData.phase) * 0.05;
        const pulse = 1 + Math.sin(elapsed * 2 + hm.mesh.userData.phase) * 0.08;
        hm.sprite.scale.setScalar(0.35 * baseScale * pulse);
      }
    });

    // Transition fade
    if (this.isTransitioning) {
      this.transitionProgress += delta * 2;
      if (this.transitionProgress >= 1) {
        this.isTransitioning = false;
        this.transitionProgress = 1;
      }
      if (this.fadeOverlay) {
        (this.fadeOverlay.material as THREE.MeshBasicMaterial).opacity =
          1 - this.transitionProgress;
      }
    }

    this.renderer.render(this.scene, this.camera);
  };

  private isPositionValid(pos: THREE.Vector3): boolean {
    const shrunk = this.roomBounds.clone();
    shrunk.min.x += this.playerRadius;
    shrunk.min.z += this.playerRadius;
    shrunk.max.x -= this.playerRadius;
    shrunk.max.z -= this.playerRadius;

    if (!shrunk.containsPoint(new THREE.Vector3(pos.x, this.playerHeight, pos.z))) {
      return false;
    }

    const playerBox = new THREE.Box3().setFromCenterAndSize(
      new THREE.Vector3(pos.x, this.playerHeight / 2, pos.z),
      new THREE.Vector3(this.playerRadius * 2, this.playerHeight, this.playerRadius * 2)
    );

    for (const box of this.collisionBoxes) {
      if (playerBox.intersectsBox(box)) return false;
    }
    return true;
  }

  private checkHotspotIntersection(isClick: boolean) {
    this.raycaster.setFromCamera(this.mouse, this.camera);

    const sprites = this.hotspotMeshes.map(h => h.sprite);
    const intersects = this.raycaster.intersectObjects(sprites);

    if (intersects.length > 0) {
      const hit = this.hotspotMeshes.find(h => h.sprite === intersects[0].object);
      if (hit) {
        if (isClick) {
          // Handle teleport internally
          if (hit.hotspot.teleportTo && !hit.hotspot.targetScene) {
            this.teleportToPosition(hit.hotspot.teleportTo);
          } else if (this.onHotspotClick) {
            this.onHotspotClick(hit.hotspot);
          }
        } else if (this.onHotspotHover) {
          this.onHotspotHover(hit.hotspot);
        }
        return;
      }
    }

    if (!isClick && this.onHotspotHover) {
      this.onHotspotHover(null);
    }
  }

  // Room building

  private clearRoom() {
    this.roomMeshes.forEach(m => {
      this.scene.remove(m);
      if (m instanceof THREE.Mesh) {
        m.geometry.dispose();
        if (Array.isArray(m.material)) {
          m.material.forEach(mat => mat.dispose());
        } else {
          m.material.dispose();
        }
      }
    });
    this.roomMeshes = [];

    this.roomLights.forEach(l => this.scene.remove(l));
    this.roomLights = [];

    this.collisionBoxes = [];
  }

  private buildRoom(config: WalkableConfig) {
    const { roomWidth: w, roomDepth: d, roomHeight: h, wallColor, floorColor, ceilingColor } = config;

    // Floor
    const floorGeo = new THREE.PlaneGeometry(w, d);
    const floorMat = new THREE.MeshStandardMaterial({
      color: floorColor,
      roughness: 0.85,
      metalness: 0.05,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);
    this.roomMeshes.push(floor);

    // Ceiling
    const ceilGeo = new THREE.PlaneGeometry(w, d);
    const ceilMat = new THREE.MeshStandardMaterial({
      color: ceilingColor,
      roughness: 0.9,
      metalness: 0,
    });
    const ceil = new THREE.Mesh(ceilGeo, ceilMat);
    ceil.rotation.x = Math.PI / 2;
    ceil.position.y = h;
    this.scene.add(ceil);
    this.roomMeshes.push(ceil);

    // Walls
    const wallMat = new THREE.MeshStandardMaterial({
      color: wallColor,
      roughness: 0.7,
      metalness: 0.02,
    });

    // Front wall (-Z)
    const frontWall = new THREE.Mesh(new THREE.PlaneGeometry(w, h), wallMat);
    frontWall.position.set(0, h / 2, -d / 2);
    this.scene.add(frontWall);
    this.roomMeshes.push(frontWall);

    // Back wall (+Z)
    const backWall = new THREE.Mesh(new THREE.PlaneGeometry(w, h), wallMat.clone());
    backWall.position.set(0, h / 2, d / 2);
    backWall.rotation.y = Math.PI;
    this.scene.add(backWall);
    this.roomMeshes.push(backWall);

    // Left wall (-X)
    const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(d, h), wallMat.clone());
    leftWall.position.set(-w / 2, h / 2, 0);
    leftWall.rotation.y = Math.PI / 2;
    this.scene.add(leftWall);
    this.roomMeshes.push(leftWall);

    // Right wall (+X)
    const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(d, h), wallMat.clone());
    rightWall.position.set(w / 2, h / 2, 0);
    rightWall.rotation.y = -Math.PI / 2;
    this.scene.add(rightWall);
    this.roomMeshes.push(rightWall);
  }

  private buildFurniture(item: FurnitureItem) {
    let geometry: THREE.BufferGeometry;

    switch (item.type) {
      case 'box':
        geometry = new THREE.BoxGeometry(item.scale.x, item.scale.y, item.scale.z);
        break;
      case 'cylinder':
        geometry = new THREE.CylinderGeometry(
          item.scale.x / 2, item.scale.x / 2, item.scale.y, 16
        );
        break;
      case 'plane':
        geometry = new THREE.PlaneGeometry(item.scale.x, item.scale.y);
        break;
      default:
        geometry = new THREE.BoxGeometry(item.scale.x, item.scale.y, item.scale.z);
    }

    const material = new THREE.MeshStandardMaterial({
      color: item.color,
      emissive: item.emissive || '#000000',
      emissiveIntensity: item.emissive ? 0.3 : 0,
      roughness: 0.6,
      metalness: 0.1,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(item.position.x, item.position.y, item.position.z);
    if (item.rotation) {
      mesh.rotation.set(item.rotation.x, item.rotation.y, item.rotation.z);
    }
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this.scene.add(mesh);
    this.roomMeshes.push(mesh);

    if (item.collision !== false) {
      const box = new THREE.Box3().setFromObject(mesh);
      this.collisionBoxes.push(box);
    }
  }

  private buildLights(lights: LightConfig[]) {
    lights.forEach(cfg => {
      let light: THREE.Light;

      switch (cfg.type) {
        case 'ambient':
          light = new THREE.AmbientLight(cfg.color, cfg.intensity);
          break;
        case 'point': {
          const pl = new THREE.PointLight(cfg.color, cfg.intensity, cfg.distance || 0);
          if (cfg.position) pl.position.set(cfg.position.x, cfg.position.y, cfg.position.z);
          pl.castShadow = true;
          pl.shadow.mapSize.width = 512;
          pl.shadow.mapSize.height = 512;
          light = pl;
          break;
        }
        case 'spot': {
          const sl = new THREE.SpotLight(
            cfg.color, cfg.intensity, cfg.distance || 0,
            cfg.angle || Math.PI / 6, cfg.penumbra || 0
          );
          if (cfg.position) sl.position.set(cfg.position.x, cfg.position.y, cfg.position.z);
          if (cfg.target) {
            sl.target.position.set(cfg.target.x, cfg.target.y, cfg.target.z);
            this.scene.add(sl.target);
          }
          sl.castShadow = true;
          light = sl;
          break;
        }
        case 'directional': {
          const dl = new THREE.DirectionalLight(cfg.color, cfg.intensity);
          if (cfg.position) dl.position.set(cfg.position.x, cfg.position.y, cfg.position.z);
          if (cfg.target) {
            dl.target.position.set(cfg.target.x, cfg.target.y, cfg.target.z);
            this.scene.add(dl.target);
          }
          dl.castShadow = true;
          light = dl;
          break;
        }
        default:
          light = new THREE.AmbientLight(cfg.color, cfg.intensity);
      }

      this.scene.add(light);
      this.roomLights.push(light);
    });
  }

  private clearHotspots() {
    this.hotspotMeshes.forEach(hm => {
      this.scene.remove(hm.mesh);
      hm.sprite.material.dispose();
    });
    this.hotspotMeshes = [];
  }

  private createHotspots(hotspots: Hotspot[]) {
    hotspots.forEach((hotspot, index) => {
      const pos = hotspot.position3d;
      if (!pos) return;

      const group = new THREE.Group();
      const isNav = hotspot.type === 'navigation';

      group.position.set(pos.x, pos.y, pos.z);
      group.userData.baseY = pos.y;
      group.userData.phase = index * 1.3;
      group.userData.isNavigation = isNav;

      const canvasSize = isNav ? 256 : 128;
      const canvas = document.createElement('canvas');
      canvas.width = canvasSize;
      canvas.height = canvasSize;
      const ctx = canvas.getContext('2d')!;

      if (isNav) {
        drawNavigationFloorRing(ctx);
      } else {
        drawHotspotIcon(ctx, hotspot.type, hotspot.pulseColor);
      }

      const spriteTexture = new THREE.CanvasTexture(canvas);
      const spriteMaterial = new THREE.SpriteMaterial({
        map: spriteTexture,
        transparent: true,
        depthTest: true,
        sizeAttenuation: true,
      });

      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.renderOrder = 999;
      const baseScale = hotspot.scale || 1;
      const scale = isNav ? 0.5 * baseScale : 0.35 * baseScale;
      sprite.scale.set(scale, scale, 1);

      group.add(sprite);
      this.scene.add(group);
      this.hotspotMeshes.push({ mesh: group, hotspot, sprite });
    });
  }

  // Public API

  async loadScene(sceneData: Scene, transition: boolean = true) {
    if (transition) {
      this.isTransitioning = true;
      this.transitionProgress = 0;
      if (this.fadeOverlay) {
        (this.fadeOverlay.material as THREE.MeshBasicMaterial).opacity = 1;
      }
    }

    this.clearRoom();
    this.clearHotspots();

    const config = sceneData.walkableConfig;
    if (!config) return;

    this.buildRoom(config);
    config.furniture.forEach(item => this.buildFurniture(item));
    this.buildLights(config.lights);

    // Set room bounds
    this.roomBounds.set(
      new THREE.Vector3(-config.roomWidth / 2, 0, -config.roomDepth / 2),
      new THREE.Vector3(config.roomWidth / 2, config.roomHeight, config.roomDepth / 2)
    );

    // Position player
    this.camera.position.set(
      config.spawnPosition.x,
      this.playerHeight,
      config.spawnPosition.z
    );
    this.camera.lookAt(
      config.spawnLookAt.x,
      config.spawnLookAt.y,
      config.spawnLookAt.z
    );
    this.euler.setFromQuaternion(this.camera.quaternion);

    // Set grab cursor
    this.renderer.domElement.style.cursor = 'grab';

    this.createHotspots(sceneData.hotspots);
  }

  setCallbacks(callbacks: {
    onHotspotHover?: (hotspot: Hotspot | null) => void;
    onHotspotClick?: (hotspot: Hotspot) => void;
  }) {
    if (callbacks.onHotspotHover) this.onHotspotHover = callbacks.onHotspotHover;
    if (callbacks.onHotspotClick) this.onHotspotClick = callbacks.onHotspotClick;
  }

  teleportToPosition(pos: { x: number; y: number; z: number }) {
    const target = new THREE.Vector3(pos.x, this.playerHeight, pos.z);
    // Always teleport to developer-placed hotspot targets (skip collision check)
    this.teleportFrom.copy(this.camera.position);
    this.teleportTarget.copy(target);
    this.teleportProgress = 0;
  }

  getRenderer() {
    return this.renderer;
  }

  dispose() {
    this.renderer.setAnimationLoop(null);

    const el = this.renderer.domElement;
    el.removeEventListener('mousedown', this.handleMouseDown);
    el.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('mouseup', this.handleMouseUp);
    el.removeEventListener('mouseleave', this.handleMouseLeave);
    el.removeEventListener('touchstart', this.handleTouchStart);
    el.removeEventListener('touchmove', this.handleTouchMove);
    el.removeEventListener('touchend', this.handleTouchEnd);
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('resize', this.handleResize);

    this.clearHotspots();
    this.clearRoom();

    if (this.fadeOverlay) {
      this.fadeOverlay.geometry.dispose();
      (this.fadeOverlay.material as THREE.MeshBasicMaterial).dispose();
    }

    this.renderer.dispose();

    if (this.container.contains(this.renderer.domElement)) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
