import * as THREE from 'three';
import { createNoise3D } from 'simplex-noise';
import chroma from 'chroma-js';

export class VoxelGarden {
    constructor(container) {
        this.container = container;
        this.scene = new THREE.Scene();
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        
        this.voxels = new Map();
        this.flowers = [];
        this.instancedMeshes = new Map();
        
        this.noise3D = createNoise3D();
        
        // Voxel properties
        this.voxelSize = 0.2;
        this.maxVoxels = 10000;
        
        // Color palettes for different flower types
        this.colorPalettes = {
            quadruple: chroma.scale(['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4']).mode('lch'),
            pentagonal: chroma.scale(['#e17055', '#fdcb6e', '#6c5ce7', '#a29bfe', '#fd79a8']).mode('lch'),
            rosaceae: chroma.scale(['#ff7675', '#fd79a8', '#fdcb6e', '#55a3ff', '#00b894']).mode('lch'),
            fractal: chroma.scale(['#2d3436', '#636e72', '#b2bec3', '#ddd', '#fff']).mode('lch')
        };
        
        // Semantic soil - sample files as context for growth patterns
        this.semanticSoil = this.harvestSemanticSoil();
    }

    async initialize() {
        this.setupRenderer();
        this.setupCamera();
        this.setupLighting();
        this.setupInstancedGeometries();
        
        // Create the semantic soil foundation
        this.createSemanticSoilLayer();
    }

    harvestSemanticSoil() {
        // Extract semantic patterns from the environment as growth substrate
        return {
            filePatterns: [
                { type: 'clojure', pattern: /\.clj$|\.cljs$/, density: 0.8, color: '#96ceb4' },
                { type: 'javascript', pattern: /\.js$|\.jsx$/, density: 0.7, color: '#fdcb6e' },
                { type: 'markdown', pattern: /\.md$/, density: 0.6, color: '#a29bfe' },
                { type: 'python', pattern: /\.py$/, density: 0.75, color: '#55a3ff' },
                { type: 'shell', pattern: /\.sh$|\.bash$/, density: 0.65, color: '#fd79a8' },
                { type: 'config', pattern: /\.json$|\.yaml$|\.toml$/, density: 0.5, color: '#00b894' }
            ],
            narrativeSeeds: [
                'quadruple-helix-emacs-claude-interface',
                'tmux-branching-sessions-whispering-stones',
                'voxel-computational-physics-gardens',
                'substance-threads-traces-horticulture',
                'pentasymmetrical-rosaceae-flowering-algorithms'
            ],
            temporalLayers: {
                recent: { weight: 1.0, decay: 0.1 },
                medium: { weight: 0.7, decay: 0.05 },
                ancient: { weight: 0.4, decay: 0.02 }
            }
        };
    }

    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true,
            powerPreference: "high-performance"
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor(0x000000, 0.1);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        this.container.appendChild(this.renderer.domElement);
    }

    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(
            75, 
            window.innerWidth / window.innerHeight, 
            0.1, 
            1000
        );
        this.camera.position.set(10, 8, 10);
        this.camera.lookAt(0, 0, 0);
        
        // Add orbit controls
        import('./OrbitControls.js').then(({ OrbitControls }) => {
            this.controls = new OrbitControls(this.camera, this.renderer.domElement);
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.05;
            this.controls.maxDistance = 50;
            this.controls.minDistance = 2;
        });
    }

    setupLighting() {
        // Ambient light for overall illumination
        const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
        this.scene.add(ambientLight);
        
        // Main directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 20, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 50;
        directionalLight.shadow.camera.left = -20;
        directionalLight.shadow.camera.right = 20;
        directionalLight.shadow.camera.top = 20;
        directionalLight.shadow.camera.bottom = -20;
        this.scene.add(directionalLight);
        
        // Accent lights for flower illumination
        const accentLight1 = new THREE.PointLight(0xff6b6b, 0.5, 20);
        accentLight1.position.set(5, 5, 5);
        this.scene.add(accentLight1);
        
        const accentLight2 = new THREE.PointLight(0x4ecdc4, 0.5, 20);
        accentLight2.position.set(-5, 5, -5);
        this.scene.add(accentLight2);
        
        // Underground grow lights
        const growLight = new THREE.PointLight(0x00ff88, 0.3, 15);
        growLight.position.set(0, -2, 0);
        this.scene.add(growLight);
    }

    setupInstancedGeometries() {
        // Create instanced geometries for different voxel types
        const voxelGeometry = new THREE.BoxGeometry(this.voxelSize, this.voxelSize, this.voxelSize);
        
        // Stem voxels
        const stemMaterial = new THREE.MeshLambertMaterial({ color: 0x2d5a27 });
        const stemMesh = new THREE.InstancedMesh(voxelGeometry, stemMaterial, 1000);
        stemMesh.castShadow = true;
        stemMesh.receiveShadow = true;
        this.scene.add(stemMesh);
        this.instancedMeshes.set('stem', { mesh: stemMesh, count: 0 });
        
        // Petal voxels
        const petalMaterial = new THREE.MeshLambertMaterial({ color: 0xff6b6b });
        const petalMesh = new THREE.InstancedMesh(voxelGeometry, petalMaterial, 2000);
        petalMesh.castShadow = true;
        petalMesh.receiveShadow = true;
        this.scene.add(petalMesh);
        this.instancedMeshes.set('petal', { mesh: petalMesh, count: 0 });
        
        // Semantic soil voxels
        const soilMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x3e2723,
            transparent: true,
            opacity: 0.8
        });
        const soilMesh = new THREE.InstancedMesh(voxelGeometry, soilMaterial, 500);
        soilMesh.receiveShadow = true;
        this.scene.add(soilMesh);
        this.instancedMeshes.set('soil', { mesh: soilMesh, count: 0 });
    }

    createSemanticSoilLayer() {
        // Create a substrate of semantic soil from file patterns
        const soilLayer = this.instancedMeshes.get('soil');
        const matrix = new THREE.Matrix4();
        
        let soilIndex = 0;
        
        // Generate soil voxels based on semantic patterns
        for (let x = -10; x <= 10; x += this.voxelSize * 2) {
            for (let z = -10; z <= 10; z += this.voxelSize * 2) {
                const noiseValue = this.noise3D(x * 0.1, 0, z * 0.1);
                const depth = Math.max(1, Math.floor((noiseValue + 1) * 2));
                
                for (let d = 0; d < depth && soilIndex < 500; d++) {
                    const y = -d * this.voxelSize - this.voxelSize;
                    
                    matrix.setPosition(x, y, z);
                    soilLayer.mesh.setMatrixAt(soilIndex, matrix);
                    
                    // Add semantic nutrients to this soil voxel
                    this.addSemanticNutrients(x, y, z, noiseValue);
                    
                    soilIndex++;
                }
            }
        }
        
        soilLayer.count = soilIndex;
        soilLayer.mesh.count = soilIndex;
        soilLayer.mesh.instanceMatrix.needsUpdate = true;
    }

    addSemanticNutrients(x, y, z, noiseValue) {
        // Add semantic nutrients that will influence flower growth
        const nutrients = {
            position: { x, y, z },
            codeComplexity: Math.abs(noiseValue),
            narrativeDensity: (noiseValue + 1) * 0.5,
            temporalWeight: Math.random(),
            fileTypeInfluence: this.getFileTypeInfluence(x, z),
            growthPotential: Math.random() * 0.8 + 0.2
        };
        
        // Store nutrients in a spatial hash for quick lookup during growth
        const key = `${Math.floor(x)}_${Math.floor(y)}_${Math.floor(z)}`;
        if (!this.semanticNutrients) {
            this.semanticNutrients = new Map();
        }
        this.semanticNutrients.set(key, nutrients);
    }

    getFileTypeInfluence(x, z) {
        // Simulate different file types having different influences on growth
        const angle = Math.atan2(z, x);
        const distance = Math.sqrt(x * x + z * z);
        
        // Map to different file types based on position
        if (distance < 3) return 'clojure'; // Core area - functional programming
        if (angle > Math.PI * 0.25 && angle < Math.PI * 0.75) return 'javascript';
        if (angle > -Math.PI * 0.25 && angle < Math.PI * 0.25) return 'python';
        if (angle > Math.PI * 0.75 || angle < -Math.PI * 0.75) return 'markdown';
        return 'config';
    }

    async growFlower(flowerSpec) {
        const flower = new VoxelFlower(this, flowerSpec);
        await flower.grow();
        this.flowers.push(flower);
        
        this.updateInstancedMeshes();
    }

    updateInstancedMeshes() {
        // Update all instanced meshes with current voxel data
        for (const [type, data] of this.instancedMeshes.entries()) {
            data.mesh.instanceMatrix.needsUpdate = true;
        }
    }

    update() {
        if (this.controls) {
            this.controls.update();
        }
        
        // Update growing flowers
        this.flowers.forEach(flower => flower.update());
        
        // Animate lighting
        const time = Date.now() * 0.001;
        this.scene.children.forEach(child => {
            if (child instanceof THREE.PointLight) {
                child.intensity = 0.5 + Math.sin(time + child.position.x) * 0.2;
            }
        });
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }

    handleResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    getVoxelCount() {
        let total = 0;
        for (const [type, data] of this.instancedMeshes.entries()) {
            total += data.count;
        }
        return total;
    }

    getFlowerCount() {
        return this.flowers.length;
    }

    clearAll() {
        this.flowers = [];
        
        // Reset all instanced meshes
        for (const [type, data] of this.instancedMeshes.entries()) {
            if (type !== 'soil') { // Keep the soil layer
                data.count = 0;
                data.mesh.count = 0;
                data.mesh.instanceMatrix.needsUpdate = true;
            }
        }
    }
}

class VoxelFlower {
    constructor(garden, spec) {
        this.garden = garden;
        this.spec = spec;
        this.voxels = [];
        this.growthProgress = 0;
        this.maxGrowthSteps = spec.complexity * 100;
        this.currentStep = 0;
    }

    async grow() {
        // Implement different symmetry patterns
        switch (this.spec.symmetryType) {
            case 'quadruple':
                await this.growQuadrupleSymmetry();
                break;
            case 'pentagonal':
                await this.growPentagonalSymmetry();
                break;
            case 'rosaceae':
                await this.growRosaceaePattern();
                break;
            case 'fractal':
                await this.growFractalPattern();
                break;
            default:
                await this.growOrganicPattern();
        }
    }

    async growQuadrupleSymmetry() {
        // Four-fold symmetry inspired by the quadruple helix concept
        const center = { x: 0, y: 0, z: 0 };
        const stemHeight = Math.floor(this.spec.complexity * 10);
        
        // Grow stem
        for (let y = 0; y < stemHeight; y++) {
            this.addStemVoxel(center.x, y * this.garden.voxelSize, center.z);
        }
        
        // Grow four main branches
        const branchHeight = stemHeight + Math.floor(this.spec.complexity * 5);
        for (let i = 0; i < 4; i++) {
            const angle = (i * Math.PI * 2) / 4;
            const radius = this.spec.complexity * 3;
            
            const branchX = center.x + Math.cos(angle) * radius;
            const branchZ = center.z + Math.sin(angle) * radius;
            
            // Create branch with petals
            for (let r = 1; r <= radius; r++) {
                const x = center.x + Math.cos(angle) * r;
                const z = center.z + Math.sin(angle) * r;
                const y = branchHeight + Math.sin(r * 0.5) * 2;
                
                this.addPetalVoxel(x, y, z, this.getQuadrupleColor(i));
            }
        }
    }

    async growPentagonalSymmetry() {
        // Five-fold symmetry for more refined patterns
        const center = { x: 0, y: 0, z: 0 };
        const stemHeight = Math.floor(this.spec.complexity * 8);
        
        // Grow stem
        for (let y = 0; y < stemHeight; y++) {
            this.addStemVoxel(center.x, y * this.garden.voxelSize, center.z);
        }
        
        // Create pentagonal flower head
        const petalCount = 5;
        const layers = Math.floor(this.spec.complexity * 3);
        
        for (let layer = 0; layer < layers; layer++) {
            const layerRadius = (layer + 1) * this.spec.complexity * 2;
            const layerHeight = stemHeight + layer * 0.5;
            
            for (let i = 0; i < petalCount; i++) {
                const angle = (i * Math.PI * 2) / petalCount + (layer * 0.2);
                
                // Create petal curve
                for (let r = 0.5; r <= layerRadius; r += 0.5) {
                    const x = Math.cos(angle) * r;
                    const z = Math.sin(angle) * r;
                    const y = layerHeight + Math.sin(r * 0.8) * 1.5;
                    
                    this.addPetalVoxel(x, y, z, this.getPentagonalColor(i, r));
                }
            }
        }
    }

    async growRosaceaePattern() {
        // Intricate rosaceae-inspired patterns
        const center = { x: 0, y: 0, z: 0 };
        const stemHeight = Math.floor(this.spec.complexity * 12);
        
        // Grow main stem
        for (let y = 0; y < stemHeight; y++) {
            this.addStemVoxel(center.x, y * this.garden.voxelSize, center.z);
        }
        
        // Create multiple layers with different petal arrangements
        const layers = Math.floor(this.spec.complexity * 5);
        
        for (let layer = 0; layer < layers; layer++) {
            const petalsInLayer = 8 + layer * 3;
            const layerRadius = this.spec.complexity * (2 + layer);
            const layerHeight = stemHeight + layer * 0.8;
            
            for (let i = 0; i < petalsInLayer; i++) {
                const angle = (i * Math.PI * 2) / petalsInLayer;
                const petalRadius = layerRadius * (0.7 + Math.sin(i * 0.5) * 0.3);
                
                // Create rose-like petal curve
                for (let t = 0; t <= 1; t += 0.1) {
                    const r = petalRadius * t;
                    const petalAngle = angle + Math.sin(t * Math.PI) * 0.3;
                    
                    const x = Math.cos(petalAngle) * r;
                    const z = Math.sin(petalAngle) * r;
                    const y = layerHeight + Math.sin(t * Math.PI) * 2 - layer * 0.3;
                    
                    this.addPetalVoxel(x, y, z, this.getRosaceaeColor(layer, t));
                }
            }
        }
    }

    async growFractalPattern() {
        // Self-similar fractal growth
        this.growFractalBranch({ x: 0, y: 0, z: 0 }, 0, Math.PI / 2, this.spec.complexity * 5, 3);
    }

    growFractalBranch(position, angle, elevation, length, depth) {
        if (depth <= 0 || length < 0.5) return;
        
        const endX = position.x + Math.cos(angle) * length;
        const endY = position.y + Math.sin(elevation) * length;
        const endZ = position.z + Math.sin(angle) * length;
        
        // Draw branch
        const steps = Math.floor(length / this.garden.voxelSize);
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const x = position.x + (endX - position.x) * t;
            const y = position.y + (endY - position.y) * t;
            const z = position.z + (endZ - position.z) * t;
            
            if (depth > 1) {
                this.addStemVoxel(x, y, z);
            } else {
                this.addPetalVoxel(x, y, z, this.getFractalColor(depth, t));
            }
        }
        
        // Recursive branches
        if (depth > 1) {
            const branchCount = 3;
            for (let i = 0; i < branchCount; i++) {
                const newAngle = angle + (Math.PI / 4) * (i - 1);
                const newLength = length * 0.7;
                this.growFractalBranch(
                    { x: endX, y: endY, z: endZ },
                    newAngle,
                    elevation + Math.PI / 8,
                    newLength,
                    depth - 1
                );
            }
        }
    }

    async growOrganicPattern() {
        // Natural, asymmetric growth
        const center = { x: 0, y: 0, z: 0 };
        const stemHeight = Math.floor(this.spec.complexity * 10);
        
        // Organic stem with slight curve
        for (let y = 0; y < stemHeight; y++) {
            const curve = Math.sin(y * 0.1) * 0.5;
            this.addStemVoxel(center.x + curve, y * this.garden.voxelSize, center.z);
        }
        
        // Organic petal distribution
        const petalCount = Math.floor(this.spec.complexity * 20 + 10);
        for (let i = 0; i < petalCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * this.spec.complexity * 4 + 1;
            const height = stemHeight + Math.random() * 3 - 1.5;
            
            const x = center.x + Math.cos(angle) * radius;
            const z = center.z + Math.sin(angle) * radius;
            
            this.addPetalVoxel(x, height, z, this.getOrganicColor(angle, radius));
        }
    }

    addStemVoxel(x, y, z) {
        const stemData = this.garden.instancedMeshes.get('stem');
        const matrix = new THREE.Matrix4();
        matrix.setPosition(x, y, z);
        
        stemData.mesh.setMatrixAt(stemData.count, matrix);
        stemData.count++;
        stemData.mesh.count = stemData.count;
    }

    addPetalVoxel(x, y, z, color) {
        const petalData = this.garden.instancedMeshes.get('petal');
        const matrix = new THREE.Matrix4();
        matrix.setPosition(x, y, z);
        
        petalData.mesh.setMatrixAt(petalData.count, matrix);
        
        // Set color if provided
        if (color && petalData.mesh.setColorAt) {
            petalData.mesh.setColorAt(petalData.count, new THREE.Color(color));
        }
        
        petalData.count++;
        petalData.mesh.count = petalData.count;
    }

    getQuadrupleColor(index) {
        return this.garden.colorPalettes.quadruple(index / 4).hex();
    }

    getPentagonalColor(index, radius) {
        return this.garden.colorPalettes.pentagonal((index + radius * 0.1) / 5).hex();
    }

    getRosaceaeColor(layer, t) {
        return this.garden.colorPalettes.rosaceae(layer * 0.2 + t * 0.8).hex();
    }

    getFractalColor(depth, t) {
        return this.garden.colorPalettes.fractal(depth * 0.3 + t * 0.7).hex();
    }

    getOrganicColor(angle, radius) {
        return this.garden.colorPalettes.pentagonal((angle + radius * 0.1) / (Math.PI * 2)).hex();
    }

    update() {
        // Animation and growth updates
        this.currentStep++;
        this.growthProgress = Math.min(1, this.currentStep / this.maxGrowthSteps);
    }
}