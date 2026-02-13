'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import * as THREE from 'three';
import { Hotspot } from '@/types/tour';

interface PanoramaHotspotEditorProps {
  imageUrl: string;
  hotspots: Hotspot[];
  onPlaceHotspot: (yaw: number, pitch: number) => void;
  pendingMarker?: { yaw: number; pitch: number } | null;
}

export default function PanoramaHotspotEditor({
  imageUrl,
  hotspots,
  onPlaceHotspot,
  pendingMarker,
}: PanoramaHotspotEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<EditorEngine | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const engine = new EditorEngine(containerRef.current, (yaw, pitch) => {
      onPlaceHotspot(yaw, pitch);
    });
    engineRef.current = engine;

    engine.loadImage(imageUrl).then(() => setReady(true));

    return () => {
      engine.dispose();
      engineRef.current = null;
    };
  }, [imageUrl]);

  // Update hotspot markers when hotspots change
  useEffect(() => {
    if (!engineRef.current || !ready) return;
    engineRef.current.updateMarkers(hotspots, pendingMarker || null);
  }, [hotspots, pendingMarker, ready]);

  // Keep onPlaceHotspot callback up to date
  useEffect(() => {
    if (!engineRef.current) return;
    engineRef.current.onPlace = onPlaceHotspot;
  }, [onPlaceHotspot]);

  return (
    <div className="admin-panorama-editor">
      <div ref={containerRef} className="admin-panorama-canvas" />
      <div className="admin-panorama-hint">
        Drag to look around. Click to place a hotspot.
      </div>
    </div>
  );
}

// ─── Lightweight Three.js Panorama Editor Engine ───

class EditorEngine {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private sphere: THREE.Mesh;
  private container: HTMLElement;
  private textureLoader = new THREE.TextureLoader();

  // Camera control
  private isInteracting = false;
  private lon = 0;
  private lat = 0;
  private targetLon = 0;
  private targetLat = 0;
  private downX = 0;
  private downY = 0;
  private downLon = 0;
  private downLat = 0;
  private fov = 75;
  private dragMoved = false;

  // Markers
  private markerGroup = new THREE.Group();

  // Callback
  onPlace: (yaw: number, pitch: number) => void;

  private disposed = false;

  constructor(container: HTMLElement, onPlace: (yaw: number, pitch: number) => void) {
    this.container = container;
    this.onPlace = onPlace;

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1100
    );
    this.camera.position.set(0, 0, 0.1);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.domElement.style.cursor = 'grab';
    container.appendChild(this.renderer.domElement);

    // Panorama sphere
    const geo = new THREE.SphereGeometry(500, 64, 40);
    geo.scale(-1, 1, 1);
    const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, depthWrite: false });
    this.sphere = new THREE.Mesh(geo, mat);
    this.scene.add(this.sphere);

    this.scene.add(this.markerGroup);

    this.bindEvents();
    this.renderer.setAnimationLoop(this.animate);
  }

  async loadImage(url: string) {
    const texture = await this.textureLoader.loadAsync(url);
    texture.colorSpace = THREE.SRGBColorSpace;
    (this.sphere.material as THREE.MeshBasicMaterial).map = texture;
    (this.sphere.material as THREE.MeshBasicMaterial).needsUpdate = true;
  }

  updateMarkers(hotspots: Hotspot[], pending: { yaw: number; pitch: number } | null) {
    // Clear old markers
    while (this.markerGroup.children.length > 0) {
      this.markerGroup.remove(this.markerGroup.children[0]);
    }

    // Add existing hotspot markers
    for (const h of hotspots) {
      const sprite = this.createMarkerSprite(h.tooltip || h.type, '#3b82f6');
      this.positionOnSphere(sprite, h.position.yaw, h.position.pitch, 490);
      this.markerGroup.add(sprite);
    }

    // Add pending marker
    if (pending) {
      const sprite = this.createMarkerSprite('New', '#ffffff');
      this.positionOnSphere(sprite, pending.yaw, pending.pitch, 490);
      this.markerGroup.add(sprite);
    }
  }

  private createMarkerSprite(label: string, color: string): THREE.Sprite {
    const canvas = document.createElement('canvas');
    const size = 128;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Outer ring
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, 28, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fill();

    // Inner dot
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, 16, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();

    // Border
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, 16, 0, Math.PI * 2);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.stroke();

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ map: texture, depthTest: false, sizeAttenuation: true });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(20, 20, 1);
    return sprite;
  }

  private positionOnSphere(obj: THREE.Object3D, yaw: number, pitch: number, radius: number) {
    const phi = THREE.MathUtils.degToRad(90 - pitch);
    const theta = THREE.MathUtils.degToRad(yaw);
    obj.position.set(
      radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    );
  }

  private bindEvents() {
    const el = this.renderer.domElement;
    el.addEventListener('pointerdown', this.onPointerDown);
    el.addEventListener('pointermove', this.onPointerMove);
    el.addEventListener('pointerup', this.onPointerUp);
    el.addEventListener('wheel', this.onWheel, { passive: false });
    window.addEventListener('resize', this.onResize);
  }

  private onPointerDown = (e: PointerEvent) => {
    this.isInteracting = true;
    this.dragMoved = false;
    this.downX = e.clientX;
    this.downY = e.clientY;
    this.downLon = this.targetLon;
    this.downLat = this.targetLat;
    this.renderer.domElement.style.cursor = 'grabbing';
  };

  private onPointerMove = (e: PointerEvent) => {
    if (!this.isInteracting) return;
    const dx = e.clientX - this.downX;
    const dy = e.clientY - this.downY;
    if (!this.dragMoved && (Math.abs(dx) > 3 || Math.abs(dy) > 3)) {
      this.dragMoved = true;
    }
    if (this.dragMoved) {
      const sensitivity = this.fov / 500;
      this.targetLon = (this.downX - e.clientX) * sensitivity + this.downLon;
      this.targetLat = (e.clientY - this.downY) * sensitivity + this.downLat;
    }
  };

  private onPointerUp = (e: PointerEvent) => {
    this.isInteracting = false;
    this.renderer.domElement.style.cursor = 'grab';

    // If user didn't drag, it's a click — calculate yaw/pitch from ray
    if (!this.dragMoved) {
      const rect = this.renderer.domElement.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, this.camera);
      const intersects = raycaster.intersectObject(this.sphere);

      if (intersects.length > 0) {
        const point = intersects[0].point;
        const r = Math.sqrt(point.x * point.x + point.y * point.y + point.z * point.z);
        const pitch = Math.round(THREE.MathUtils.radToDeg(Math.asin(point.y / r)));
        const yaw = Math.round(THREE.MathUtils.radToDeg(Math.atan2(point.z, point.x)));
        this.onPlace(yaw, pitch);
      }
    }
  };

  private onWheel = (e: WheelEvent) => {
    e.preventDefault();
    this.fov = Math.max(30, Math.min(90, this.fov + e.deltaY * 0.05));
    this.camera.fov = this.fov;
    this.camera.updateProjectionMatrix();
  };

  private onResize = () => {
    if (!this.container || this.disposed) return;
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  };

  private animate = () => {
    if (this.disposed) return;

    // Smooth damping
    this.lon += (this.targetLon - this.lon) * 0.15;
    this.lat += (this.targetLat - this.lat) * 0.15;
    this.lat = Math.max(-85, Math.min(85, this.lat));

    const phi = THREE.MathUtils.degToRad(90 - this.lat);
    const theta = THREE.MathUtils.degToRad(this.lon);

    const target = new THREE.Vector3(
      500 * Math.sin(phi) * Math.cos(theta),
      500 * Math.cos(phi),
      500 * Math.sin(phi) * Math.sin(theta)
    );
    this.camera.lookAt(target);

    this.renderer.render(this.scene, this.camera);
  };

  dispose() {
    this.disposed = true;
    this.renderer.setAnimationLoop(null);

    const el = this.renderer.domElement;
    el.removeEventListener('pointerdown', this.onPointerDown);
    el.removeEventListener('pointermove', this.onPointerMove);
    el.removeEventListener('pointerup', this.onPointerUp);
    el.removeEventListener('wheel', this.onWheel);
    window.removeEventListener('resize', this.onResize);

    this.renderer.dispose();
    if (this.container.contains(el)) {
      this.container.removeChild(el);
    }
  }
}
