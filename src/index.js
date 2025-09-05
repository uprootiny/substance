import { VoxelGarden } from './core/VoxelGarden.js';
import { TmuxDataParser } from './parsers/TmuxDataParser.js';
import { FlowerGrowthEngine } from './growth/FlowerGrowthEngine.js';
import { PhysicsEngine } from './physics/PhysicsEngine.js';
import { EventSystem } from './core/EventSystem.js';
import { DataFlow } from './core/DataFlow.js';
import { SonicResonance } from './audio/SonicResonance.js';

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
        
        // Initialize reactive architecture
        this.eventSystem = new EventSystem();
        this.dataFlow = new DataFlow(this.eventSystem);
        this.sonicResonance = new SonicResonance(this.eventSystem);
        
        // Initialize components with event system integration
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
        
        this.setupReactiveDataFlow();
        this.init();
    }

    setupReactiveDataFlow() {
        // Create data streams for different data sources
        const tmuxStream = this.dataFlow.createStream('tmux-data', {
            bufferSize: 10,
            semanticDomains: ['narrative', 'temporal']
        });

        const flowerStream = this.dataFlow.createStream('flower-generation', {
            bufferSize: 5,
            semanticDomains: ['visual', 'growth']
        });

        // Set up tmux data processing pipeline
        tmuxStream
            .map(data => this.dataFlow.applyTransformation('tmux.parse', data))
            .map(parsed => this.dataFlow.applyTransformation('semantic.extract', parsed))
            .map(features => this.dataFlow.applyTransformation('flower.spec', features))
            .subscribe(spec => this.processFlowerSpec(spec));

        // Set up flower generation pipeline
        flowerStream
            .map(spec => this.dataFlow.applyTransformation('voxel.position', spec))
            .map(positions => this.dataFlow.applyTransformation('physics.sync', positions))
            .subscribe(physicsData => this.createVoxelFlower(physicsData));

        // Register event handlers for reactive updates
        this.eventSystem.subscribe('tmux.data.received', data => tmuxStream.process(data));
        this.eventSystem.subscribe('flower.spec.ready', spec => flowerStream.process(spec));
        this.eventSystem.subscribe('voxel.created', this.updateStatsReactive.bind(this));
        this.eventSystem.subscribe('physics.step', this.syncPhysicsReactive.bind(this));
        
        // Register sonic event handlers
        this.eventSystem.subscribe('whirr.detected', this.handleWhirringDetected.bind(this));
        this.eventSystem.subscribe('sonic.listening.started', this.handleSonicListening.bind(this));
    }

    async init() {
        try {
            await this.initializeVoxelGarden();
            this.setupEventListeners();
            this.startReactiveRenderLoop();
            this.hideLoading();
            
            // Generate initial sample flower using reactive pipeline
            this.generateFlowerFromSampleReactive();
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
        this.ui.generateBtn.addEventListener('click', () => {
            this.generateFlower();
            // Emit user interaction event for audio context
            this.eventSystem.emit('user.interaction', { type: 'button_click' });
        });
        
        this.ui.resetBtn.addEventListener('click', () => this.resetGarden());
        this.ui.pauseBtn.addEventListener('click', () => this.togglePhysics());
        
        this.ui.sessionSelect.addEventListener('change', (e) => {
            if (e.target.value === 'live') {
                this.connectToLiveTmux();
            }
        });
        
        // Add sonic listening controls
        this.addSonicControls();
        
        // Handle window resize
        window.addEventListener('resize', () => this.voxelGarden.handleResize());
    }

    addSonicControls() {
        // Add whirr listening button
        const whirrBtn = document.createElement('button');
        whirrBtn.textContent = '🌀 Listen for Whirring';
        whirrBtn.id = 'whirrBtn';
        whirrBtn.addEventListener('click', () => {
            this.toggleSonicListening();
            this.eventSystem.emit('user.interaction', { type: 'whirr_button' });
        });

        // Add to controls
        const controlsParent = this.ui.generateBtn.parentNode;
        controlsParent.appendChild(whirrBtn);

        this.ui.whirrBtn = whirrBtn;
    }

    toggleSonicListening() {
        if (this.sonicResonance.isListening) {
            this.eventSystem.emit('whirr.deactivate');
            this.ui.whirrBtn.textContent = '🌀 Listen for Whirring';
        } else {
            this.eventSystem.emit('whirr.activate');
            this.ui.whirrBtn.textContent = '🔇 Stop Listening';
        }
    }

    handleWhirringDetected(event) {
        const { analysis, flowerSpec } = event.payload;
        
        console.log(`🌸 Whirring flower generated: ${analysis.type}`);
        
        // Create sonic-driven flower
        this.createSonicFlower(flowerSpec);
        
        // Update voxel garden with acoustic vibrations
        if (this.voxelGarden) {
            const vibrations = [{
                frequency: analysis.frequencies[0]?.frequency || 440,
                amplitude: analysis.amplitude,
                harmonics: analysis.harmonics
            }];
            this.voxelGarden.setAcousticVibrations(vibrations);
        }
    }

    handleSonicListening(event) {
        console.log('🎤 Started listening for acoustic patterns...');
        
        // Start calibration after a brief delay
        setTimeout(() => {
            this.sonicResonance.calibrateForEnvironment();
        }, 1000);
    }

    async createSonicFlower(sonicFlowerSpec) {
        // Convert sonic flower spec to standard flower spec
        const standardSpec = {
            type: sonicFlowerSpec.type,
            complexity: sonicFlowerSpec.complexity,
            center: { x: 0, y: 0, z: 0 },
            
            // Add sonic-specific properties
            sonic: sonicFlowerSpec.acoustic,
            visual: sonicFlowerSpec.visual,
            physics: sonicFlowerSpec.physics
        };

        // Generate through existing flower system
        await this.voxelGarden.growFlower(standardSpec);
        
        // Apply sonic visual effects
        this.applySonicVisualEffects(sonicFlowerSpec);
        
        this.updateStats();
    }

    applySonicVisualEffects(sonicSpec) {
        // Apply frequency-based coloring and vibration effects
        const { visual, acoustic } = sonicSpec;
        
        // This would modify the most recently created flower
        // with sonic-specific visual properties
        console.log(`🎨 Applying sonic effects: hue=${visual.colorHue.toFixed(1)}°, vibration=${acoustic.fundamentalFreq.toFixed(1)}Hz`);
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

    generateFlowerFromSampleReactive() {
        // Emit tmux data through reactive pipeline
        const sampleData = this.getQuadrupleHelixData();
        this.eventSystem.emit('tmux.data.received', sampleData, {
            semanticWeight: 0.9,
            urgency: 'normal'
        });
    }

    processFlowerSpec(spec) {
        // Bridge between reactive pipeline and existing flower generation
        this.eventSystem.emit('flower.spec.ready', spec);
    }

    async createVoxelFlower(physicsData) {
        // Create voxel flower with physics integration
        for (const voxelData of physicsData) {
            await this.voxelGarden.createVoxel(voxelData);
            this.eventSystem.emit('voxel.created', voxelData);
        }
    }

    updateStatsReactive(event) {
        // Reactive stats update based on events
        this.stats.voxels++;
        this.updateStatsDisplay();
    }

    syncPhysicsReactive(event) {
        // Reactive physics synchronization
        if (!this.isPhysicsPaused) {
            this.physicsEngine.processPhysicsStep(event.payload);
        }
    }

    generateFlowerFromSample() {
        // Legacy method - kept for compatibility
        this.generateFlowerFromSampleReactive();
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

    startReactiveRenderLoop() {
        let frameId = 0;
        
        const animate = () => {
            frameId++;
            requestAnimationFrame(animate);
            
            // Emit physics step event for reactive updates
            if (!this.isPhysicsPaused) {
                this.eventSystem.emit('physics.step', {
                    frameId,
                    timestamp: Date.now(),
                    deltaTime: this.calculateDelta()
                });
                this.physicsEngine.update();
            }
            
            // Update voxel garden
            this.voxelGarden.update();
            
            // Emit render frame event
            this.eventSystem.emit('render.frame', {
                frameId,
                fps: this.calculateFPS()
            });
            
            // Render scene
            this.voxelGarden.render();
            
            // Emit performance metrics periodically
            if (frameId % 60 === 0) {
                this.emitPerformanceMetrics();
            }
        };
        
        animate();
    }

    calculateDelta() {
        const now = performance.now();
        const delta = this.lastFrameTime ? now - this.lastFrameTime : 16;
        this.lastFrameTime = now;
        return delta / 1000; // Convert to seconds
    }

    emitPerformanceMetrics() {
        const metrics = {
            eventSystem: this.eventSystem.getMetrics(),
            dataFlow: this.dataFlow.getMetrics(),
            garden: {
                voxels: this.stats.voxels,
                flowers: this.stats.flowers,
                fps: this.stats.fps
            }
        };

        this.eventSystem.emit('performance.metrics', metrics, {
            urgency: 'low',
            semanticWeight: 0.3
        });
    }

    startRenderLoop() {
        // Legacy method - redirect to reactive version
        this.startReactiveRenderLoop();
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
        
        this.updateStatsDisplay();
    }

    updateStatsDisplay() {
        this.ui.stats.voxelCount.textContent = this.stats.voxels;
        this.ui.stats.physicsCount.textContent = this.stats.physicsBodies;
        this.ui.stats.flowerCount.textContent = this.stats.flowers;
        
        // Emit stats update event
        this.eventSystem.emit('stats.updated', this.stats, {
            urgency: 'low'
        });
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