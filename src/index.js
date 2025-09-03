import { VoxelGarden } from './core/VoxelGarden.js';
import { TmuxDataParser } from './parsers/TmuxDataParser.js';
import { FlowerGrowthEngine } from './growth/FlowerGrowthEngine.js';
import { PhysicsEngine } from './physics/PhysicsEngine.js';

class SubstanceVoxelFlowers {
    constructor() {
        this.container = document.getElementById('canvas-container');
        this.ui = {
            loading: document.getElementById('loading'),
            sessionSelect: document.getElementById('sessionSelect'),
            growthMode: document.getElementById('growthMode'),
            generateBtn: document.getElementById('generateBtn'),
            resetBtn: document.getElementById('resetBtn'),
            pauseBtn: document.getElementById('pauseBtn'),
            stats: {
                voxelCount: document.getElementById('voxelCount'),
                physicsCount: document.getElementById('physicsCount'),
                fps: document.getElementById('fps'),
                flowerCount: document.getElementById('flowerCount')
            }
        };
        
        this.voxelGarden = null;
        this.tmuxParser = new TmuxDataParser();
        this.flowerEngine = new FlowerGrowthEngine();
        this.physicsEngine = new PhysicsEngine();
        
        this.isPhysicsPaused = false;
        this.stats = {
            voxels: 0,
            physicsBodies: 0,
            fps: 0,
            flowers: 0
        };
        
        this.init();
    }

    async init() {
        try {
            await this.initializeVoxelGarden();
            this.setupEventListeners();
            this.startRenderLoop();
            this.hideLoading();
            
            // Generate initial sample flower from tmux data
            this.generateFlowerFromSample();
        } catch (error) {
            console.error('Failed to initialize Substance Voxel Flowers:', error);
            this.showError(error.message);
        }
    }

    async initializeVoxelGarden() {
        this.voxelGarden = new VoxelGarden(this.container);
        await this.voxelGarden.initialize();
        
        // Set up camera for optimal flower viewing
        this.voxelGarden.setupCamera();
        
        // Initialize physics world
        this.physicsEngine.initialize(this.voxelGarden.scene);
    }

    setupEventListeners() {
        this.ui.generateBtn.addEventListener('click', () => this.generateFlower());
        this.ui.resetBtn.addEventListener('click', () => this.resetGarden());
        this.ui.pauseBtn.addEventListener('click', () => this.togglePhysics());
        
        this.ui.sessionSelect.addEventListener('change', (e) => {
            if (e.target.value === 'live') {
                this.connectToLiveTmux();
            }
        });
        
        // Handle window resize
        window.addEventListener('resize', () => this.voxelGarden.handleResize());
    }

    async generateFlower() {
        const sessionType = this.ui.sessionSelect.value;
        const growthMode = this.ui.growthMode.value;
        
        let sessionData;
        if (sessionType === 'live') {
            sessionData = await this.getLiveTmuxData();
        } else {
            sessionData = this.getSampleTmuxData();
        }
        
        const parsedData = this.tmuxParser.parse(sessionData);
        const flowerSpec = this.flowerEngine.generateFlowerSpec(parsedData, growthMode);
        
        await this.voxelGarden.growFlower(flowerSpec);
        this.updateStats();
    }

    generateFlowerFromSample() {
        // Use the openrouter conversation as inspiration for initial flower
        const sampleData = this.getQuadrupleHelixData();
        const parsedData = this.tmuxParser.parse(sampleData);
        const flowerSpec = this.flowerEngine.generateFlowerSpec(parsedData, 'organic');
        
        this.voxelGarden.growFlower(flowerSpec);
        this.updateStats();
    }

    getQuadrupleHelixData() {
        // Inspired by the openrouter conversation about quadruple helix
        return {
            threads: [
                {
                    id: 'emacs-quadrant',
                    content: 'quadrant-1-emacs.el - elisp script with defensive mise-en-place',
                    timestamp: Date.now() - 3600000,
                    interactions: 45,
                    complexity: 0.8,
                    symmetryType: 'quadruple'
                },
                {
                    id: 'prompt-quadrant',
                    content: 'quadrant-2-prompt.txt - self-tidying coherent directions',
                    timestamp: Date.now() - 2700000,
                    interactions: 32,
                    complexity: 0.9,
                    symmetryType: 'pentagonal'
                },
                {
                    id: 'terminal-quadrant',
                    content: 'quadrant-3-terminal.sh - ssh tmux branching over servers',
                    timestamp: Date.now() - 1800000,
                    interactions: 67,
                    complexity: 0.7,
                    symmetryType: 'rosaceae'
                },
                {
                    id: 'reflection-quadrant',
                    content: 'quadrant-4-reflection.md - whispering at stones, self-knowledge',
                    timestamp: Date.now() - 900000,
                    interactions: 89,
                    complexity: 1.0,
                    symmetryType: 'fractal'
                }
            ],
            branches: 4,
            depth: 3,
            narrative: 'emacs-claude-interface-quadruple-helix-whispering-stones'
        };
    }

    getSampleTmuxData() {
        // Sample tmux session data representing branching conversations
        return {
            threads: [
                {
                    id: 'main-session',
                    content: 'ssh uprootiny@server tmux session with claude code integration',
                    timestamp: Date.now() - 7200000,
                    interactions: 156,
                    complexity: 0.85,
                    symmetryType: 'pentagonal'
                },
                {
                    id: 'branch-voxels',
                    content: 'voxel computational physics graphical libraries implementation',
                    timestamp: Date.now() - 5400000,
                    interactions: 89,
                    complexity: 0.92,
                    symmetryType: 'rosaceae'
                },
                {
                    id: 'branch-substance',
                    content: 'substance branching threads traces representations horticulture',
                    timestamp: Date.now() - 3600000,
                    interactions: 134,
                    complexity: 0.78,
                    symmetryType: 'quadruple'
                }
            ],
            branches: 3,
            depth: 5,
            narrative: 'tmux-branching-flower-visualization'
        };
    }

    async getLiveTmuxData() {
        // This would connect to actual tmux sessions
        // For now, return enhanced sample data
        return {
            ...this.getSampleTmuxData(),
            isLive: true,
            lastUpdate: Date.now()
        };
    }

    connectToLiveTmux() {
        // TODO: Implement WebSocket connection to tmux data
        console.log('Connecting to live tmux sessions...');
    }

    resetGarden() {
        this.voxelGarden.clearAll();
        this.physicsEngine.reset();
        this.updateStats();
    }

    togglePhysics() {
        this.isPhysicsPaused = !this.isPhysicsPaused;
        this.ui.pauseBtn.textContent = this.isPhysicsPaused ? '▶ Resume Physics' : '⏸ Pause Physics';
    }

    startRenderLoop() {
        const animate = () => {
            requestAnimationFrame(animate);
            
            // Update physics
            if (!this.isPhysicsPaused) {
                this.physicsEngine.update();
            }
            
            // Update voxel garden
            this.voxelGarden.update();
            
            // Calculate and display FPS
            this.calculateFPS();
            
            // Render scene
            this.voxelGarden.render();
        };
        
        animate();
    }

    calculateFPS() {
        if (!this.lastFrameTime) {
            this.lastFrameTime = performance.now();
            return;
        }
        
        const now = performance.now();
        const delta = now - this.lastFrameTime;
        this.stats.fps = Math.round(1000 / delta);
        this.lastFrameTime = now;
        
        this.ui.stats.fps.textContent = this.stats.fps;
    }

    updateStats() {
        this.stats.voxels = this.voxelGarden.getVoxelCount();
        this.stats.physicsBodies = this.physicsEngine.getBodyCount();
        this.stats.flowers = this.voxelGarden.getFlowerCount();
        
        this.ui.stats.voxelCount.textContent = this.stats.voxels;
        this.ui.stats.physicsCount.textContent = this.stats.physicsBodies;
        this.ui.stats.flowerCount.textContent = this.stats.flowers;
    }

    hideLoading() {
        this.ui.loading.classList.add('hidden');
    }

    showError(message) {
        this.ui.loading.innerHTML = `
            <div style="color: #ff6b6b;">
                <h3>Error Initializing Garden</h3>
                <p>${message}</p>
                <button onclick="window.location.reload()">Reload</button>
            </div>
        `;
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SubstanceVoxelFlowers();
});