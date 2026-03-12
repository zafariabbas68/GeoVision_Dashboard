import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';

@Component({
  selector: 'app-globe-view',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="globe-container">
      <div #globeCanvas class="globe-canvas"></div>
      <div class="globe-overlay">
        <div class="globe-info">
          <h4>Earth Observation</h4>
          <p>34°N to 45°N | Kabul → Milan</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .globe-container {
      position: relative;
      width: 100%;
      height: 500px;
      background: #000;
      border-radius: 15px;
      overflow: hidden;
    }
    
    .globe-canvas {
      width: 100%;
      height: 100%;
    }
    
    .globe-overlay {
      position: absolute;
      bottom: 20px;
      left: 20px;
      color: white;
      background: rgba(0,0,0,0.6);
      padding: 10px 20px;
      border-radius: 8px;
      backdrop-filter: blur(5px);
    }
    
    .globe-overlay h4 {
      margin: 0;
      font-size: 1rem;
    }
    
    .globe-overlay p {
      margin: 5px 0 0;
      font-size: 0.8rem;
      opacity: 0.8;
    }
  `]
})
export class GlobeViewComponent implements AfterViewInit {
  @ViewChild('globeCanvas') private canvasRef!: ElementRef;
  
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private sphere!: THREE.Mesh;
  private satellites: THREE.Mesh[] = [];
  private kabulPosition: { lat: number; lng: number } = { lat: 34.5553, lng: 69.2075 };
  private milanPosition: { lat: number; lng: number } = { lat: 45.4642, lng: 9.1900 };

  ngAfterViewInit() {
    this.initThree();
    this.createGlobe();
    this.addAtmosphere();
    this.addStars();
    this.addSatellites();
    this.addPath();
    this.animate();
  }

  private initThree() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x050510);
    
    this.camera = new THREE.PerspectiveCamera(45, this.canvasRef.nativeElement.clientWidth / this.canvasRef.nativeElement.clientHeight, 0.1, 1000);
    this.camera.position.z = 15;
    
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setSize(this.canvasRef.nativeElement.clientWidth, this.canvasRef.nativeElement.clientHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.canvasRef.nativeElement.appendChild(this.renderer.domElement);
  }

  private createGlobe() {
    const geometry = new THREE.SphereGeometry(5, 64, 64);
    
    // Load earth texture
    const textureLoader = new THREE.TextureLoader();
    const earthTexture = textureLoader.load('https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg');
    
    const material = new THREE.MeshPhongMaterial({
      map: earthTexture,
      shininess: 5
    });
    
    this.sphere = new THREE.Mesh(geometry, material);
    this.scene.add(this.sphere);
    
    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0x404040);
    this.scene.add(ambientLight);
    
    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 3, 5);
    this.scene.add(directionalLight);
    
    // Add back light
    const backLight = new THREE.PointLight(0x4466aa, 0.5);
    backLight.position.set(-5, 0, -5);
    this.scene.add(backLight);
  }

  private addAtmosphere() {
    const atmosphereGeometry = new THREE.SphereGeometry(5.05, 64, 64);
    const atmosphereMaterial = new THREE.MeshPhongMaterial({
      color: 0x3399ff,
      transparent: true,
      opacity: 0.15,
      side: THREE.BackSide
    });
    
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    this.sphere.add(atmosphere);
  }

  private addStars() {
    const starsGeometry = new THREE.BufferGeometry();
    const starsCount = 2000;
    const starsPositions = new Float32Array(starsCount * 3);
    
    for (let i = 0; i < starsCount * 3; i += 3) {
      starsPositions[i] = (Math.random() - 0.5) * 200;
      starsPositions[i + 1] = (Math.random() - 0.5) * 200;
      starsPositions[i + 2] = (Math.random() - 0.5) * 200;
    }
    
    starsGeometry.setAttribute('position', new THREE.BufferAttribute(starsPositions, 3));
    
    const starsMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.1 });
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    this.scene.add(stars);
  }

  private addSatellites() {
    // Add some satellite markers in orbit
    for (let i = 0; i < 5; i++) {
      const satelliteGeometry = new THREE.SphereGeometry(0.1, 8, 8);
      const satelliteMaterial = new THREE.MeshPhongMaterial({ color: 0xffaa00, emissive: 0x442200 });
      const satellite = new THREE.Mesh(satelliteGeometry, satelliteMaterial);
      
      // Position satellites in a ring around the globe
      const angle = (i / 5) * Math.PI * 2;
      satellite.position.set(Math.sin(angle) * 7, Math.cos(angle) * 2, Math.cos(angle) * 6);
      
      this.scene.add(satellite);
      this.satellites.push(satellite);
    }
  }

  private addPath() {
    // Add a glowing path between Kabul and Milan
    const points = [];
    
    // Convert lat/lng to 3D coordinates
    const startPhi = (90 - this.kabulPosition.lat) * Math.PI / 180;
    const startTheta = this.kabulPosition.lng * Math.PI / 180;
    const startX = 5.1 * Math.sin(startPhi) * Math.cos(startTheta);
    const startY = 5.1 * Math.cos(startPhi);
    const startZ = 5.1 * Math.sin(startPhi) * Math.sin(startTheta);
    
    const endPhi = (90 - this.milanPosition.lat) * Math.PI / 180;
    const endTheta = this.milanPosition.lng * Math.PI / 180;
    const endX = 5.1 * Math.sin(endPhi) * Math.cos(endTheta);
    const endY = 5.1 * Math.cos(endPhi);
    const endZ = 5.1 * Math.sin(endPhi) * Math.sin(endTheta);
    
    // Create curve points
    for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      // Quadratic Bezier with midpoint raised
      const x = (1-t)*(1-t)*startX + 2*(1-t)*t*((startX+endX)/2) + t*t*endX;
      const y = (1-t)*(1-t)*startY + 2*(1-t)*t*((startY+endY)/2 + 2) + t*t*endY; // Raise the middle
      const z = (1-t)*(1-t)*startZ + 2*(1-t)*t*((startZ+endZ)/2) + t*t*endZ;
      points.push(new THREE.Vector3(x, y, z));
    }
    
    const curveGeometry = new THREE.BufferGeometry().setFromPoints(points);
    const curveMaterial = new THREE.LineBasicMaterial({ color: 0xffaa00 });
    const curveLine = new THREE.Line(curveGeometry, curveMaterial);
    this.scene.add(curveLine);
    
    // Add markers for cities
    const startMarker = new THREE.Mesh(
      new THREE.SphereGeometry(0.15, 16, 16),
      new THREE.MeshPhongMaterial({ color: 0xff3333, emissive: 0x330000 })
    );
    startMarker.position.set(startX, startY, startZ);
    this.scene.add(startMarker);
    
    const endMarker = new THREE.Mesh(
      new THREE.SphereGeometry(0.15, 16, 16),
      new THREE.MeshPhongMaterial({ color: 0x33ff33, emissive: 0x003300 })
    );
    endMarker.position.set(endX, endY, endZ);
    this.scene.add(endMarker);
  }

  private animate() {
    requestAnimationFrame(() => this.animate());
    
    // Rotate the globe slowly
    if (this.sphere) {
      this.sphere.rotation.y += 0.0005;
    }
    
    // Animate satellites
    this.satellites.forEach((sat, i) => {
      const time = Date.now() * 0.001;
      const angle = time * 0.1 + i;
      sat.position.x = Math.sin(angle) * 7;
      sat.position.z = Math.cos(angle) * 6;
      sat.position.y = Math.sin(angle * 2) * 2;
    });
    
    this.renderer.render(this.scene, this.camera);
  }
}
