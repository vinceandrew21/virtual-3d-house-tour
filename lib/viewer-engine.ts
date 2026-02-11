import * as THREE from 'three';
import { Scene, Hotspot } from '@/types/tour';
import { generatePlaceholderEquirectangular } from './generate-placeholders';

export interface HotspotMesh {
  mesh: THREE.Group;
  hotspot: Hotspot;
  sprite: THREE.Sprite;
}

export class PanoramaViewer {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private sphere: THREE.Mesh;
  private container: HTMLElement;
  private hotspotMeshes: HotspotMesh[] = [];
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();
  private textureLoader = new THREE.TextureLoader();

  // Controls state
  private isUserInteracting = false;
  private lon = 0;
  private lat = 0;
  private targetLon = 0;
  private targetLat = 0;
  private onPointerDownLon = 0;
  private onPointerDownLat = 0;
  private onPointerDownX = 0;
  private onPointerDownY = 0;
  private fov = 75;
  private targetFov = 75;
  private autoRotate = false;
  private autoRotateSpeed = 0.15;
  private damping = 0.15;

  // Gyroscope
  private gyroEnabled = false;
  private deviceOrientationData: { alpha: number; beta: number; gamma: number } | null = null;

  // Pinch zoom
  private pinchStartDist = 0;
  private pinchStartFov = 75;
  private isPinching = false;

  // Dolly transition (Matterport-style fly-to)
  private isDollying = false;
  private dollyProgress = 0;
  private dollyDuration = 0.7;
  private dollyStartLon = 0;
  private dollyStartLat = 0;
  private dollyStartFov = 0;
  private dollyTargetLon = 0;
  private dollyTargetLat = 0;
  private dollyHotspot: Hotspot | null = null;

  // VR / WebXR
  private isVR = false;
  private reticle: THREE.Mesh | null = null;
  private gazeTarget: HotspotMesh | null = null;
  private gazeTimer = 0;
  private gazeDuration = 1.5;
  private reticleRing: THREE.Mesh | null = null;

  // Animation
  private animationId: number | null = null;
  private clock = new THREE.Clock();
  private isTransitioning = false;
  private transitionProgress = 0;

  // Callbacks
  private onHotspotHover: ((hotspot: Hotspot | null) => void) | null = null;
  private onHotspotClick: ((hotspot: Hotspot) => void) | null = null;
  private onViewChange: ((yaw: number, pitch: number, fov: number) => void) | null = null;

  // Cached textures
  private textureCache = new Map<string, THREE.Texture>();

  constructor(container: HTMLElement) {
    this.container = container;

    // Scene
    this.scene = new THREE.Scene();

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1100
    );
    this.camera.position.set(0, 0, 0.1);
    this.scene.add(this.camera); // Add to scene so child objects (VR reticle) render

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.domElement.style.touchAction = 'none';
    container.appendChild(this.renderer.domElement);

    // Panorama sphere
    const geometry = new THREE.SphereGeometry(500, 64, 40);
    geometry.scale(-1, 1, 1); // Invert for inside view

    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 1,
      depthWrite: false,
    });

    this.sphere = new THREE.Mesh(geometry, material);
    this.scene.add(this.sphere);

    // Ambient light for hotspot sprites
    this.scene.add(new THREE.AmbientLight(0xffffff, 1));

    // Events
    this.bindEvents();

    // Start render loop (setAnimationLoop works for both normal and XR rendering)
    this.renderer.setAnimationLoop(this.animate);
  }

  private bindEvents() {
    const el = this.renderer.domElement;

    // Mouse / Touch
    el.addEventListener('pointerdown', this.onPointerDown);
    el.addEventListener('pointermove', this.onPointerMove);
    el.addEventListener('pointerup', this.onPointerUp);
    el.addEventListener('wheel', this.onWheel, { passive: false });

    // Touch events for pinch-to-zoom (pointer events don't easily track multi-touch distance)
    el.addEventListener('touchstart', this.onTouchStart, { passive: false });
    el.addEventListener('touchmove', this.onTouchMove, { passive: false });
    el.addEventListener('touchend', this.onTouchEnd, { passive: false });

    // Resize — listen to both window and visualViewport (mobile address bar changes)
    window.addEventListener('resize', this.onResize);
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', this.onResize);
    }

    // Device orientation
    window.addEventListener('deviceorientation', this.onDeviceOrientation);
  }

  private onPointerDown = (e: PointerEvent) => {
    if (this.isPinching) return;
    this.isUserInteracting = true;
    this.onPointerDownX = e.clientX;
    this.onPointerDownY = e.clientY;
    this.onPointerDownLon = this.targetLon;
    this.onPointerDownLat = this.targetLat;
    this.renderer.domElement.style.cursor = 'grabbing';
  };

  private onPointerMove = (e: PointerEvent) => {
    if (this.isPinching) return;

    // Update mouse position for raycasting
    const rect = this.container.getBoundingClientRect();
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    if (this.isUserInteracting) {
      // Touch needs higher sensitivity since drag distances are shorter on small screens
      const isTouch = e.pointerType === 'touch';
      const divisor = isTouch ? 250 : 500;
      const sensitivity = this.fov / divisor;
      this.targetLon = (this.onPointerDownX - e.clientX) * sensitivity + this.onPointerDownLon;
      this.targetLat = (e.clientY - this.onPointerDownY) * sensitivity + this.onPointerDownLat;
    }

    // Check hotspot hover
    this.checkHotspotIntersection(false);
  };

  private onPointerUp = (e: PointerEvent) => {
    this.isUserInteracting = false;
    this.renderer.domElement.style.cursor = 'grab';

    // Check if it was a click (not a drag)
    const dx = Math.abs(e.clientX - this.onPointerDownX);
    const dy = Math.abs(e.clientY - this.onPointerDownY);
    if (dx < 5 && dy < 5) {
      this.checkHotspotIntersection(true);
    }
  };

  private onWheel = (e: WheelEvent) => {
    e.preventDefault();
    this.targetFov = Math.max(30, Math.min(100, this.targetFov + e.deltaY * 0.05));
  };

  private getTouchDistance(touches: TouchList): number {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private onTouchStart = (e: TouchEvent) => {
    e.preventDefault();
    if (e.touches.length === 2) {
      this.isPinching = true;
      this.pinchStartDist = this.getTouchDistance(e.touches);
      this.pinchStartFov = this.targetFov;
    }
  };

  private onTouchMove = (e: TouchEvent) => {
    e.preventDefault();
    if (e.touches.length === 2 && this.isPinching) {
      const dist = this.getTouchDistance(e.touches);
      const scale = this.pinchStartDist / dist;
      this.targetFov = Math.max(30, Math.min(100, this.pinchStartFov * scale));
    }
  };

  private onTouchEnd = (e: TouchEvent) => {
    if (e.touches.length < 2) {
      this.isPinching = false;
    }
  };

  private onResize = () => {
    this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
  };

  private onDeviceOrientation = (e: DeviceOrientationEvent) => {
    if (this.gyroEnabled && e.alpha !== null && e.beta !== null && e.gamma !== null) {
      this.deviceOrientationData = {
        alpha: e.alpha,
        beta: e.beta,
        gamma: e.gamma,
      };
    }
  };

  private checkHotspotIntersection(isClick: boolean) {
    this.raycaster.setFromCamera(this.mouse, this.camera);

    const sprites = this.hotspotMeshes.map(h => h.sprite);
    const intersects = this.raycaster.intersectObjects(sprites);

    if (intersects.length > 0) {
      const hit = this.hotspotMeshes.find(h => h.sprite === intersects[0].object);
      if (hit) {
        this.renderer.domElement.style.cursor = 'pointer';
        if (isClick && this.onHotspotClick) {
          if (hit.hotspot.type === 'navigation' && !this.isDollying) {
            this.startDolly(hit.hotspot);
          } else if (hit.hotspot.type !== 'navigation') {
            this.onHotspotClick(hit.hotspot);
          }
        } else if (!isClick && this.onHotspotHover) {
          this.onHotspotHover(hit.hotspot);
        }
        return;
      }
    }

    if (!isClick && this.onHotspotHover) {
      this.onHotspotHover(null);
    }
    if (!this.isUserInteracting) {
      this.renderer.domElement.style.cursor = 'grab';
    }
  }

  private startDolly(hotspot: Hotspot) {
    this.isDollying = true;
    this.dollyProgress = 0;
    this.dollyStartLon = this.lon;
    this.dollyStartLat = this.lat;
    this.dollyStartFov = this.fov;
    this.dollyTargetLon = hotspot.position.yaw;
    this.dollyTargetLat = hotspot.position.pitch;
    this.dollyHotspot = hotspot;
  }

  private animate = () => {
    const delta = this.clock.getDelta();
    const elapsed = this.clock.getElapsedTime();

    // In VR mode, head tracking handles the camera — skip manual controls
    if (!this.isVR) {
      // Auto-rotate
      if (this.autoRotate && !this.isUserInteracting && !this.gyroEnabled) {
        this.targetLon += this.autoRotateSpeed;
      }

      // Gyroscope
      if (this.gyroEnabled && this.deviceOrientationData && !this.isUserInteracting) {
        const { beta, gamma } = this.deviceOrientationData;
        this.targetLat = 90 - beta;
        this.targetLon += gamma * 0.1;
      }

      // Dolly animation (Matterport-style fly-to)
      if (this.isDollying) {
        this.dollyProgress += delta / this.dollyDuration;

        if (this.dollyProgress >= 1) {
          this.isDollying = false;
          this.dollyProgress = 1;
          if (this.dollyHotspot && this.onHotspotClick) {
            const hotspot = this.dollyHotspot;
            this.dollyHotspot = null;
            this.onHotspotClick(hotspot);
          }
        }

        const t = 1 - Math.pow(1 - this.dollyProgress, 3);

        let lonDiff = this.dollyTargetLon - this.dollyStartLon;
        if (lonDiff > 180) lonDiff -= 360;
        if (lonDiff < -180) lonDiff += 360;

        this.lon = this.dollyStartLon + lonDiff * t;
        this.lat = this.dollyStartLat + (this.dollyTargetLat - this.dollyStartLat) * t;
        this.targetLon = this.lon;
        this.targetLat = this.lat;

        this.fov = this.dollyStartFov + (30 - this.dollyStartFov) * t;
        this.targetFov = this.fov;

        const sphereMat = this.sphere.material as THREE.MeshBasicMaterial;
        sphereMat.opacity = 1 - t * 0.9;
      }

      // Normal damped interpolation (skip during dolly)
      if (!this.isDollying) {
        this.lon += (this.targetLon - this.lon) * this.damping;
        this.lat += (this.targetLat - this.lat) * this.damping;
        this.fov += (this.targetFov - this.fov) * this.damping;
      }
      this.lat = Math.max(-85, Math.min(85, this.lat));

      // Update camera
      this.camera.fov = this.fov;
      this.camera.updateProjectionMatrix();

      const phi = THREE.MathUtils.degToRad(90 - this.lat);
      const theta = THREE.MathUtils.degToRad(this.lon);

      const target = new THREE.Vector3(
        500 * Math.sin(phi) * Math.cos(theta),
        500 * Math.cos(phi),
        500 * Math.sin(phi) * Math.sin(theta)
      );

      this.camera.lookAt(target);
    } else {
      // VR gaze-based hotspot detection
      this.updateVRGaze(delta);
    }

    // Animate hotspots
    this.hotspotMeshes.forEach((hm) => {
      const isNav = hm.mesh.userData.isNavigation;
      const baseScale = hm.hotspot.scale || 1;

      if (isNav) {
        // Navigation floor hotspots: no floating, ring pulse
        const pulse = 1 + Math.sin(elapsed * 2.5 + hm.mesh.userData.phase) * 0.12;
        hm.sprite.scale.setScalar(32 * baseScale * pulse);
      } else {
        // Info/image/etc: gentle floating + subtle pulse
        const baseY = hm.mesh.userData.baseY || hm.mesh.position.y;
        hm.mesh.position.y = baseY + Math.sin(elapsed * 1.5 + hm.mesh.userData.phase) * 1.5;
        const pulse = 1 + Math.sin(elapsed * 2 + hm.mesh.userData.phase) * 0.08;
        hm.sprite.scale.setScalar(18 * baseScale * pulse);
      }
    });

    // Transition fade (scene load)
    if (this.isTransitioning) {
      this.transitionProgress += delta * 2;
      if (this.transitionProgress >= 1) {
        this.isTransitioning = false;
        this.transitionProgress = 1;
      }
      const material = this.sphere.material as THREE.MeshBasicMaterial;
      material.opacity = this.transitionProgress;
    }

    // Notify view change
    if (this.onViewChange) {
      this.onViewChange(this.lon, this.lat, this.fov);
    }

    this.renderer.render(this.scene, this.camera);
  };

  // --- VR Methods ---

  private updateVRGaze(delta: number) {
    // Raycast from camera center forward direction
    const xrCamera = this.renderer.xr.isPresenting
      ? this.renderer.xr.getCamera()
      : this.camera;

    const forward = new THREE.Vector3(0, 0, -1);
    forward.applyQuaternion(xrCamera.quaternion);

    this.raycaster.set(xrCamera.position, forward);

    const sprites = this.hotspotMeshes.map(h => h.sprite);
    const intersects = this.raycaster.intersectObjects(sprites);

    if (intersects.length > 0) {
      const hit = this.hotspotMeshes.find(h => h.sprite === intersects[0].object);
      if (hit) {
        if (this.gazeTarget === hit) {
          this.gazeTimer += delta;
          // Update reticle progress ring
          this.updateReticleProgress(this.gazeTimer / this.gazeDuration);

          if (this.gazeTimer >= this.gazeDuration) {
            // Activate hotspot via gaze
            if (this.onHotspotClick) {
              if (hit.hotspot.type === 'navigation') {
                this.onHotspotClick(hit.hotspot); // No dolly in VR
              } else {
                this.onHotspotClick(hit.hotspot);
              }
            }
            this.gazeTimer = 0;
            this.gazeTarget = null;
            this.updateReticleProgress(0);
          }
        } else {
          this.gazeTarget = hit;
          this.gazeTimer = 0;
          this.updateReticleProgress(0);
        }
        if (this.onHotspotHover) this.onHotspotHover(hit.hotspot);
        return;
      }
    }

    if (this.gazeTarget) {
      this.gazeTarget = null;
      this.gazeTimer = 0;
      this.updateReticleProgress(0);
    }
    if (this.onHotspotHover) this.onHotspotHover(null);
  }

  private createReticle() {
    // Center dot
    const dotGeo = new THREE.RingGeometry(0.003, 0.008, 32);
    const dotMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide,
      depthTest: false,
    });
    this.reticle = new THREE.Mesh(dotGeo, dotMat);
    this.reticle.position.set(0, 0, -2);
    this.reticle.renderOrder = 9999;
    this.camera.add(this.reticle);

    // Progress ring (initially invisible)
    const ringGeo = new THREE.RingGeometry(0.015, 0.02, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthTest: false,
    });
    this.reticleRing = new THREE.Mesh(ringGeo, ringMat);
    this.reticleRing.position.set(0, 0, -2);
    this.reticleRing.renderOrder = 9999;
    this.camera.add(this.reticleRing);
  }

  private removeReticle() {
    if (this.reticle) {
      this.camera.remove(this.reticle);
      this.reticle.geometry.dispose();
      (this.reticle.material as THREE.MeshBasicMaterial).dispose();
      this.reticle = null;
    }
    if (this.reticleRing) {
      this.camera.remove(this.reticleRing);
      this.reticleRing.geometry.dispose();
      (this.reticleRing.material as THREE.MeshBasicMaterial).dispose();
      this.reticleRing = null;
    }
  }

  private updateReticleProgress(progress: number) {
    if (!this.reticleRing) return;
    const mat = this.reticleRing.material as THREE.MeshBasicMaterial;
    mat.opacity = progress > 0 ? 0.9 : 0;
    this.reticleRing.scale.setScalar(1 + progress * 0.5);
  }

  private setupXRControllers() {
    for (let i = 0; i < 2; i++) {
      const controller = this.renderer.xr.getController(i);
      controller.addEventListener('selectstart', () => {
        // Raycast from controller direction
        const tempMatrix = new THREE.Matrix4();
        tempMatrix.identity().extractRotation(controller.matrixWorld);
        const direction = new THREE.Vector3(0, 0, -1).applyMatrix4(tempMatrix);
        const pos = new THREE.Vector3();
        controller.getWorldPosition(pos);

        this.raycaster.set(pos, direction);
        const sprites = this.hotspotMeshes.map(h => h.sprite);
        const intersects = this.raycaster.intersectObjects(sprites);

        if (intersects.length > 0) {
          const hit = this.hotspotMeshes.find(h => h.sprite === intersects[0].object);
          if (hit && this.onHotspotClick) {
            this.onHotspotClick(hit.hotspot);
          }
        }
      });
      this.scene.add(controller);
    }
  }

  static async isVRSupported(): Promise<boolean> {
    if (!navigator.xr) return false;
    try {
      return await navigator.xr.isSessionSupported('immersive-vr');
    } catch {
      return false;
    }
  }

  async enterVR(): Promise<boolean> {
    if (!navigator.xr) return false;
    try {
      const session = await navigator.xr.requestSession('immersive-vr', {
        optionalFeatures: ['local-floor', 'bounded-floor'],
      });

      this.renderer.xr.enabled = true;
      await this.renderer.xr.setSession(session);
      this.isVR = true;
      this.createReticle();
      this.setupXRControllers();

      session.addEventListener('end', () => {
        this.isVR = false;
        this.renderer.xr.enabled = false;
        this.removeReticle();
        this.gazeTarget = null;
        this.gazeTimer = 0;
      });

      return true;
    } catch {
      return false;
    }
  }

  exitVR() {
    const session = this.renderer.xr.getSession();
    if (session) session.end();
  }

  getIsVR() {
    return this.isVR;
  }

  // Public API

  async loadScene(sceneData: Scene, transition: boolean = true) {
    if (transition) {
      this.isTransitioning = true;
      this.transitionProgress = 0;
      const material = this.sphere.material as THREE.MeshBasicMaterial;
      material.opacity = 0;
    }

    // Load texture
    let texture: THREE.Texture;

    if (this.textureCache.has(sceneData.imageUrl)) {
      texture = this.textureCache.get(sceneData.imageUrl)!;
    } else {
      try {
        texture = await this.loadTexture(sceneData.imageUrl);
        this.textureCache.set(sceneData.imageUrl, texture);
      } catch {
        // Generate placeholder
        const placeholderUrl = generatePlaceholderEquirectangular(sceneData.id);
        if (placeholderUrl) {
          texture = await this.loadTexture(placeholderUrl);
        } else {
          // Fallback solid color
          texture = new THREE.Texture();
        }
      }
    }

    texture.colorSpace = THREE.SRGBColorSpace;
    const material = this.sphere.material as THREE.MeshBasicMaterial;
    material.map = texture;
    material.needsUpdate = true;

    // Set initial view
    if (sceneData.initialView) {
      this.targetLon = this.lon = sceneData.initialView.yaw;
      this.targetLat = this.lat = sceneData.initialView.pitch;
      this.targetFov = this.fov = sceneData.initialView.fov;
    }

    // Load hotspots
    this.clearHotspots();
    this.createHotspots(sceneData.hotspots);
  }

  private loadTexture(url: string): Promise<THREE.Texture> {
    return new Promise((resolve, reject) => {
      this.textureLoader.load(
        url,
        (texture) => resolve(texture),
        undefined,
        () => reject(new Error(`Failed to load: ${url}`))
      );
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
    console.log('[VirtualTour] Creating hotspots:', hotspots.length);
    hotspots.forEach((hotspot, index) => {
      const group = new THREE.Group();
      const isNav = hotspot.type === 'navigation';

      // Convert yaw/pitch to 3D position on sphere
      const phi = THREE.MathUtils.degToRad(90 - hotspot.position.pitch);
      const theta = THREE.MathUtils.degToRad(hotspot.position.yaw);
      const radius = 450;

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.cos(phi);
      const z = radius * Math.sin(phi) * Math.sin(theta);

      group.position.set(x, y, z);
      group.userData.baseY = y;
      group.userData.phase = index * 1.3;
      group.userData.isNavigation = isNav;

      // Create sprite — navigation gets larger canvas for floor ring
      const canvasSize = isNav ? 256 : 128;
      const canvas = document.createElement('canvas');
      canvas.width = canvasSize;
      canvas.height = canvasSize;
      const ctx = canvas.getContext('2d')!;

      if (isNav) {
        this.drawNavigationFloorRing(ctx);
      } else {
        this.drawHotspotIcon(ctx, hotspot.type, hotspot.pulseColor);
      }

      const spriteTexture = new THREE.CanvasTexture(canvas);
      const spriteMaterial = new THREE.SpriteMaterial({
        map: spriteTexture,
        transparent: true,
        depthTest: false,
        sizeAttenuation: true,
      });

      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.renderOrder = 999;
      const baseScale = hotspot.scale || 1;
      const scale = isNav ? 32 * baseScale : 18 * baseScale;
      sprite.scale.set(scale, scale, 1);
      sprite.center.set(0.5, 0.5);

      group.add(sprite);
      group.renderOrder = 999;
      this.scene.add(group);

      this.hotspotMeshes.push({ mesh: group, hotspot, sprite });
    });
  }

  private drawNavigationFloorRing(ctx: CanvasRenderingContext2D) {
    const cx = 128, cy = 128;

    // Outer glow — large soft halo
    const glowGrad = ctx.createRadialGradient(cx, cy, 20, cx, cy, 120);
    glowGrad.addColorStop(0, 'rgba(255,255,255,0.45)');
    glowGrad.addColorStop(0.35, 'rgba(255,255,255,0.15)');
    glowGrad.addColorStop(0.7, 'rgba(255,255,255,0.05)');
    glowGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, 120, 0, Math.PI * 2);
    ctx.fill();

    // Translucent filled disc
    const discGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 50);
    discGrad.addColorStop(0, 'rgba(255,255,255,0.4)');
    discGrad.addColorStop(1, 'rgba(255,255,255,0.12)');
    ctx.fillStyle = discGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, 50, 0, Math.PI * 2);
    ctx.fill();

    // Outer ring border
    ctx.strokeStyle = 'rgba(255,255,255,0.95)';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(cx, cy, 50, 0, Math.PI * 2);
    ctx.stroke();

    // Inner ring
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, 34, 0, Math.PI * 2);
    ctx.stroke();

    // Center chevron (downward arrow — "walk here")
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(cx, cy + 12);
    ctx.lineTo(cx - 10, cy - 4);
    ctx.lineTo(cx - 4, cy - 4);
    ctx.lineTo(cx - 4, cy - 14);
    ctx.lineTo(cx + 4, cy - 14);
    ctx.lineTo(cx + 4, cy - 4);
    ctx.lineTo(cx + 10, cy - 4);
    ctx.closePath();
    ctx.fill();
  }

  private drawHotspotIcon(ctx: CanvasRenderingContext2D, type: string, _customColor?: string) {
    const cx = 64, cy = 64, r = 48;

    // Outer glow — soft white
    const grad = ctx.createRadialGradient(cx, cy, r * 0.2, cx, cy, r);
    grad.addColorStop(0, 'rgba(255,255,255,0.6)');
    grad.addColorStop(0.35, 'rgba(255,255,255,0.2)');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    // Inner circle
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.beginPath();
    ctx.arc(cx, cy, 16, 0, Math.PI * 2);
    ctx.fill();

    // Outline ring for extra visibility
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, 24, 0, Math.PI * 2);
    ctx.stroke();

    // Center icon — black on white
    ctx.fillStyle = '#000000';
    ctx.beginPath();

    switch (type) {
      case 'navigation':
        // Arrow
        ctx.moveTo(cx - 6, cy + 4);
        ctx.lineTo(cx, cy - 8);
        ctx.lineTo(cx + 6, cy + 4);
        ctx.closePath();
        break;
      case 'image':
        // Small square
        ctx.rect(cx - 6, cy - 5, 12, 10);
        break;
      case 'video':
        // Play triangle
        ctx.moveTo(cx - 4, cy - 6);
        ctx.lineTo(cx + 6, cy);
        ctx.lineTo(cx - 4, cy + 6);
        ctx.closePath();
        break;
      case 'link':
        // External link arrow
        ctx.moveTo(cx - 5, cy + 5);
        ctx.lineTo(cx + 5, cy - 5);
        ctx.lineTo(cx + 5, cy);
        ctx.moveTo(cx + 5, cy - 5);
        ctx.lineTo(cx, cy - 5);
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#000000';
        ctx.stroke();
        return;
      default:
        // Info dot
        ctx.arc(cx, cy, 4, 0, Math.PI * 2);
    }
    ctx.fill();
  }

  // Preload textures for adjacent scenes
  preloadTexture(url: string) {
    if (!this.textureCache.has(url)) {
      this.textureLoader.load(
        url,
        (texture) => {
          texture.colorSpace = THREE.SRGBColorSpace;
          this.textureCache.set(url, texture);
        },
        undefined,
        () => {} // silently fail preloads
      );
    }
  }

  setAutoRotate(enabled: boolean) {
    this.autoRotate = enabled;
  }

  setGyroEnabled(enabled: boolean) {
    this.gyroEnabled = enabled;
    if (enabled && typeof DeviceOrientationEvent !== 'undefined') {
      // Request permission on iOS 13+
      const doe = DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> };
      if (doe.requestPermission) {
        doe.requestPermission().then((state: string) => {
          if (state !== 'granted') {
            this.gyroEnabled = false;
          }
        });
      }
    }
  }

  setView(yaw: number, pitch: number, fov?: number) {
    this.targetLon = yaw;
    this.targetLat = pitch;
    if (fov) this.targetFov = fov;
  }

  setCallbacks(callbacks: {
    onHotspotHover?: (hotspot: Hotspot | null) => void;
    onHotspotClick?: (hotspot: Hotspot) => void;
    onViewChange?: (yaw: number, pitch: number, fov: number) => void;
  }) {
    if (callbacks.onHotspotHover) this.onHotspotHover = callbacks.onHotspotHover;
    if (callbacks.onHotspotClick) this.onHotspotClick = callbacks.onHotspotClick;
    if (callbacks.onViewChange) this.onViewChange = callbacks.onViewChange;
  }

  getRenderer() {
    return this.renderer;
  }

  dispose() {
    this.renderer.setAnimationLoop(null);
    this.exitVR();
    this.removeReticle();

    const el = this.renderer.domElement;
    el.removeEventListener('pointerdown', this.onPointerDown);
    el.removeEventListener('pointermove', this.onPointerMove);
    el.removeEventListener('pointerup', this.onPointerUp);
    el.removeEventListener('wheel', this.onWheel);
    el.removeEventListener('touchstart', this.onTouchStart);
    el.removeEventListener('touchmove', this.onTouchMove);
    el.removeEventListener('touchend', this.onTouchEnd);
    window.removeEventListener('resize', this.onResize);
    if (window.visualViewport) {
      window.visualViewport.removeEventListener('resize', this.onResize);
    }
    window.removeEventListener('deviceorientation', this.onDeviceOrientation);

    this.clearHotspots();
    this.textureCache.forEach(t => t.dispose());
    this.textureCache.clear();
    (this.sphere.material as THREE.MeshBasicMaterial).dispose();
    this.sphere.geometry.dispose();
    this.renderer.dispose();

    if (this.container.contains(this.renderer.domElement)) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
