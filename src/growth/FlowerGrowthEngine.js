import { createNoise3D, createNoise2D } from 'simplex-noise';

export class FlowerGrowthEngine {
    constructor() {
        this.noise3D = createNoise3D();
        this.noise2D = createNoise2D();
        
        // Commit hash to pattern mapping for repository-driven flowers
        this.hashToPatternMap = {
            '0': 'organic', '1': 'quadruple', '2': 'pentagonal', '3': 'rosaceae', '4': 'fractal',
            '5': 'organic', '6': 'quadruple', '7': 'pentagonal', '8': 'rosaceae', '9': 'fractal',
            'a': 'organic', 'b': 'quadruple', 'c': 'pentagonal', 'd': 'rosaceae', 'e': 'fractal', 'f': 'organic'
        };
        
        // Growth parameters for different symmetry types
        this.symmetryConfigs = {
            quadruple: {
                branches: 4,
                angleOffset: Math.PI / 2,
                layerMultiplier: 1.0,
                heightVariation: 0.2,
                petalDensity: 0.8,
                stemThickness: 1.2
            },
            pentagonal: {
                branches: 5,
                angleOffset: (Math.PI * 2) / 5,
                layerMultiplier: 1.618, // Golden ratio
                heightVariation: 0.3,
                petalDensity: 1.0,
                stemThickness: 1.0
            },
            rosaceae: {
                branches: 8,
                angleOffset: Math.PI / 4,
                layerMultiplier: 1.414, // √2
                heightVariation: 0.4,
                petalDensity: 1.2,
                stemThickness: 0.8,
                subLayers: 3
            },
            fractal: {
                branches: 3,
                angleOffset: (Math.PI * 2) / 3,
                layerMultiplier: 0.7,
                heightVariation: 0.5,
                petalDensity: 0.6,
                stemThickness: 1.5,
                recursionDepth: 4
            },
            organic: {
                branches: 0, // Variable
                angleOffset: 0, // Random
                layerMultiplier: Math.random() * 0.5 + 0.8,
                heightVariation: 0.6,
                petalDensity: 0.9,
                stemThickness: 1.1
            }
        };
        
        // Color evolution patterns
        this.colorEvolution = {
            stem: {
                base: { r: 0.2, g: 0.4, b: 0.1 },
                tip: { r: 0.3, g: 0.6, b: 0.2 }
            },
            petal: {
                center: { r: 1.0, g: 0.9, b: 0.3 },
                edge: { r: 1.0, g: 0.4, b: 0.6 }
            },
            semantic: true // Use semantic color mapping
        };
    }

    generateFlowerSpec(parsedData, growthMode = 'organic') {
        // If we have repository data with commit hash, use it for pattern generation
        if (parsedData.threads && parsedData.threads[0] && parsedData.threads[0].commitHash) {
            const firstHash = parsedData.threads[0].commitHash;
            const hashPattern = this.hashToPatternMap[firstHash.charAt(0)];
            if (hashPattern && this.symmetryConfigs[hashPattern]) {
                growthMode = hashPattern;
                console.log(`🌸 Repository flower: ${firstHash} → ${hashPattern} pattern`);
            }
        }
        
        const config = this.symmetryConfigs[growthMode] || this.symmetryConfigs.organic;
        
        // Extract key metrics from parsed data
        const complexity = parsedData.averageComplexity || 0.5;
        const semanticDensity = parsedData.semanticDensity || 0.3;
        const narrativeCoherence = parsedData.narrativeCoherence || 0.4;
        const branchingFactor = parsedData.branchingFactor || 1;
        
        const spec = {
            // Basic structure
            symmetryType: growthMode,
            complexity: complexity,
            semanticDensity: semanticDensity,
            narrativeCoherence: narrativeCoherence,
            branchingFactor: branchingFactor,
            
            // Dimensional properties
            baseHeight: this.calculateBaseHeight(complexity, config),
            stemThickness: config.stemThickness * (0.8 + complexity * 0.4),
            petalCount: this.calculatePetalCount(parsedData, config),
            layerCount: Math.floor(complexity * 5 + 2),
            
            // Growth characteristics
            growthSpeed: semanticDensity * 2 + 0.1,
            branchingProbability: Math.min(branchingFactor * 0.3, 0.8),
            leafDensity: narrativeCoherence * 1.5 + 0.5,
            
            // Physics properties
            stemRigidity: complexity * 0.6 + 0.3,
            petalFlexibility: Math.max(1 - complexity * 0.4, 0.2),
            windResponse: 0.3 + Math.sin(complexity * Math.PI) * 0.4,
            
            // Semantic mapping
            threadInfluences: this.mapThreadInfluences(parsedData.threads),
            colorPalette: this.generateColorPalette(parsedData),
            temporalFlow: parsedData.temporalFlow,
            dominantPatterns: parsedData.dominantPatterns,
            
            // Growth phases
            phases: this.generateGrowthPhases(parsedData, config),
            
            // Special properties for different symmetries
            ...this.generateSymmetrySpecificProps(growthMode, parsedData, config)
        };
        
        return spec;
    }

    calculateBaseHeight(complexity, config) {
        const baseHeight = 3 + complexity * 7;
        return baseHeight * (config.heightVariation > 0 ? 
            (1 + (Math.random() - 0.5) * config.heightVariation) : 1);
    }

    calculatePetalCount(parsedData, config) {
        if (config.branches > 0) {
            // Structured growth
            const layerVariation = Math.floor(parsedData.semanticDensity * 3);
            return config.branches + layerVariation;
        } else {
            // Organic growth
            const threadCount = parsedData.totalThreads || 1;
            const interactionDensity = parsedData.totalInteractions / Math.max(threadCount, 1);
            return Math.floor(interactionDensity * 0.1 + 5 + Math.random() * 10);
        }
    }

    mapThreadInfluences(threads) {
        if (!threads) return [];
        
        return threads.map((thread, index) => ({
            threadId: thread.id,
            position: this.calculateThreadPosition(thread, index, threads.length),
            influence: thread.complexity || 0.5,
            growthVector: thread.growthVector || { x: 0, y: 1, z: 0, magnitude: 1 },
            colorInfluence: thread.colorProfile,
            semanticWeight: thread.contentAnalysis?.semanticWeight || 0.5,
            symmetryContribution: this.calculateSymmetryContribution(thread),
            temporalWeight: thread.temporalWeight || 1.0
        }));
    }

    calculateThreadPosition(thread, index, totalThreads) {
        // Distribute threads in 3D space based on their semantic properties
        const angle = (index / totalThreads) * Math.PI * 2;
        const radius = 2 + (thread.complexity || 0.5) * 3;
        const height = (thread.contentAnalysis?.abstractionLevel || 0.5) * 2;
        
        return {
            x: Math.cos(angle) * radius,
            y: height,
            z: Math.sin(angle) * radius
        };
    }

    calculateSymmetryContribution(thread) {
        // How much this thread contributes to the overall symmetry
        const patterns = thread.contentAnalysis?.patternMatches || new Map();
        let symmetryScore = 0;
        
        // Code and technical content tends toward geometric symmetry
        symmetryScore += (patterns.get('code') || 0) * 0.3;
        symmetryScore += (patterns.get('technical') || 0) * 0.2;
        
        // Creative and philosophical content tends toward organic asymmetry
        symmetryScore -= (patterns.get('creative') || 0) * 0.2;
        symmetryScore -= (patterns.get('philosophical') || 0) * 0.1;
        
        return Math.max(-1, Math.min(1, symmetryScore));
    }

    generateColorPalette(parsedData) {
        const palette = {
            primary: [],
            secondary: [],
            accent: [],
            semantic: new Map()
        };
        
        // Generate colors based on dominant patterns
        if (parsedData.dominantPatterns) {
            for (const [pattern, frequency] of parsedData.dominantPatterns) {
                const color = this.patternToColor(pattern, frequency);
                palette.primary.push(color);
            }
        }
        
        // Add colors from thread color profiles
        if (parsedData.threads) {
            for (const thread of parsedData.threads) {
                if (thread.colorProfile) {
                    const hsl = thread.colorProfile;
                    const rgb = this.hslToRgb(hsl.hue / 360, hsl.saturation, hsl.lightness);
                    palette.secondary.push(rgb);
                    
                    // Map semantic patterns to colors
                    if (thread.contentAnalysis?.patternMatches) {
                        for (const [pattern, count] of thread.contentAnalysis.patternMatches) {
                            if (count > 0) {
                                palette.semantic.set(pattern, rgb);
                            }
                        }
                    }
                }
            }
        }
        
        // Ensure we have at least some colors
        if (palette.primary.length === 0) {
            palette.primary.push({ r: 1.0, g: 0.4, b: 0.6 });
            palette.primary.push({ r: 0.4, g: 0.8, b: 1.0 });
        }
        
        return palette;
    }

    patternToColor(pattern, frequency) {
        // Map semantic patterns to colors
        const colorMap = {
            'code': { r: 0.2, g: 0.8, b: 0.4 },
            'command': { r: 0.8, g: 0.6, b: 0.2 },
            'narrative': { r: 0.6, g: 0.4, b: 0.8 },
            'technical': { r: 0.4, g: 0.6, b: 0.8 },
            'philosophical': { r: 0.8, g: 0.2, b: 0.6 },
            'creative': { r: 1.0, g: 0.6, b: 0.8 }
        };
        
        const baseColor = colorMap[pattern] || { r: 0.5, g: 0.5, b: 0.5 };
        
        // Adjust intensity based on frequency
        const intensity = Math.min(frequency * 0.1, 1);
        return {
            r: baseColor.r * intensity + 0.2,
            g: baseColor.g * intensity + 0.2,
            b: baseColor.b * intensity + 0.2
        };
    }

    generateGrowthPhases(parsedData, config) {
        const phases = [];
        
        // Phase 1: Root establishment
        phases.push({
            name: 'root_establishment',
            duration: 0.2,
            focus: 'foundation',
            growthRate: 0.3,
            direction: { x: 0, y: -1, z: 0 },
            voxelType: 'stem'
        });
        
        // Phase 2: Stem growth
        phases.push({
            name: 'stem_growth',
            duration: 0.3,
            focus: 'vertical',
            growthRate: 0.8,
            direction: { x: 0, y: 1, z: 0 },
            voxelType: 'stem'
        });
        
        // Phase 3: Branching
        if (parsedData.branchingFactor > 1) {
            phases.push({
                name: 'branching',
                duration: 0.2,
                focus: 'horizontal',
                growthRate: 0.6,
                direction: { x: 1, y: 0.2, z: 1 },
                voxelType: 'stem'
            });
        }
        
        // Phase 4: Leaf development
        phases.push({
            name: 'leaf_development',
            duration: 0.15,
            focus: 'surface_area',
            growthRate: 0.4,
            direction: { x: 0.5, y: 0.1, z: 0.5 },
            voxelType: 'petal'
        });
        
        // Phase 5: Flowering
        phases.push({
            name: 'flowering',
            duration: 0.15,
            focus: 'expression',
            growthRate: 1.0,
            direction: { x: 0.8, y: 0.6, z: 0.8 },
            voxelType: 'petal'
        });
        
        return phases;
    }

    generateSymmetrySpecificProps(symmetryType, parsedData, config) {
        const props = {};
        
        switch (symmetryType) {
            case 'quadruple':
                props.helixParams = {
                    quadrants: 4,
                    helixTurns: parsedData.complexity * 2,
                    radiusVariation: 0.3,
                    phaseOffset: Math.PI / 4
                };
                props.emacsClaude = {
                    enabled: true,
                    interfaceNodes: 4,
                    gitChainDepth: parsedData.depth || 3
                };
                break;
                
            case 'pentagonal':
                props.goldenRatio = {
                    enabled: true,
                    spiralTightness: 1.618,
                    petalArrangement: 'fibonacci'
                };
                props.organicFlow = {
                    naturalBranching: true,
                    leafPhyllotaxis: 137.5 // Golden angle in degrees
                };
                break;
                
            case 'rosaceae':
                props.rosePattern = {
                    petalLayers: Math.floor(parsedData.complexity * 5 + 3),
                    layerRotation: 22.5, // Degrees between layers
                    petalOverlap: 0.6,
                    centerDensity: 2.0
                };
                props.intricateDetails = {
                    thornDensity: parsedData.semanticDensity * 0.3,
                    petalTexture: 'serrated',
                    aromatics: true
                };
                break;
                
            case 'fractal':
                props.fractalParams = {
                    recursionDepth: config.recursionDepth,
                    scalingFactor: 0.618,
                    branchAngle: 30,
                    selfSimilarity: true
                };
                props.mandelbrot = {
                    enabled: parsedData.complexity > 0.7,
                    iterations: Math.floor(parsedData.complexity * 50 + 10),
                    bailout: 2.0
                };
                break;
                
            case 'organic':
            default:
                props.organicVariation = {
                    asymmetry: 0.4,
                    naturalImperfections: true,
                    windResponse: 0.6,
                    seasonalChanges: false
                };
                props.biomimicry = {
                    speciesInspiration: 'wildflower',
                    adaptiveGrowth: true,
                    environmentalResponse: 0.8
                };
                break;
        }
        
        return props;
    }

    // Growth execution methods
    async executeGrowth(garden, flowerSpec) {
        const growthProcess = new FlowerGrowthProcess(garden, flowerSpec, this);
        return await growthProcess.execute();
    }

    // Utility methods
    hslToRgb(h, s, l) {
        let r, g, b;
        
        if (s === 0) {
            r = g = b = l; // Achromatic
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };
            
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }
        
        return { r, g, b };
    }

    calculateNoiseInfluence(x, y, z, scale = 0.1, octaves = 3) {
        let value = 0;
        let amplitude = 1;
        let frequency = scale;
        
        for (let i = 0; i < octaves; i++) {
            value += this.noise3D(x * frequency, y * frequency, z * frequency) * amplitude;
            amplitude *= 0.5;
            frequency *= 2;
        }
        
        return value;
    }

    interpolateColors(colorA, colorB, t) {
        return {
            r: colorA.r + (colorB.r - colorA.r) * t,
            g: colorA.g + (colorB.g - colorA.g) * t,
            b: colorA.b + (colorB.b - colorA.b) * t
        };
    }
}

class FlowerGrowthProcess {
    constructor(garden, spec, engine) {
        this.garden = garden;
        this.spec = spec;
        this.engine = engine;
        this.growthProgress = 0;
        this.currentPhase = 0;
        this.voxels = [];
        this.branches = [];
    }

    async execute() {
        // Execute each growth phase
        for (let phaseIndex = 0; phaseIndex < this.spec.phases.length; phaseIndex++) {
            this.currentPhase = phaseIndex;
            const phase = this.spec.phases[phaseIndex];
            
            await this.executePhase(phase);
            
            // Small delay between phases for visual effect
            await this.delay(100);
        }
        
        // Final touches and optimizations
        await this.finalizeGrowth();
        
        return {
            voxelCount: this.voxels.length,
            branchCount: this.branches.length,
            phases: this.spec.phases.length
        };
    }

    async executePhase(phase) {
        const voxelsToGrow = Math.floor(
            this.spec.complexity * 50 * phase.duration * phase.growthRate
        );
        
        switch (phase.focus) {
            case 'foundation':
                await this.growFoundation(voxelsToGrow, phase);
                break;
            case 'vertical':
                await this.growStem(voxelsToGrow, phase);
                break;
            case 'horizontal':
                await this.growBranches(voxelsToGrow, phase);
                break;
            case 'surface_area':
                await this.growLeaves(voxelsToGrow, phase);
                break;
            case 'expression':
                await this.growFlowers(voxelsToGrow, phase);
                break;
        }
    }

    async growFoundation(voxelCount, phase) {
        // Grow root system and base stem
        const centerX = 0;
        const centerZ = 0;
        
        for (let i = 0; i < voxelCount; i++) {
            const progress = i / voxelCount;
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * 1.5;
            const depth = -Math.random() * 2;
            
            const x = centerX + Math.cos(angle) * radius;
            const y = depth;
            const z = centerZ + Math.sin(angle) * radius;
            
            await this.addVoxel(x, y, z, 'stem', phase);
        }
    }

    async growStem(voxelCount, phase) {
        // Grow main vertical stem
        const stemHeight = this.spec.baseHeight;
        const stemThickness = this.spec.stemThickness;
        
        for (let i = 0; i < voxelCount; i++) {
            const progress = i / voxelCount;
            const y = progress * stemHeight;
            
            // Add some organic curve to the stem
            const curve = this.engine.calculateNoiseInfluence(0, y, 0, 0.1) * 0.5;
            const x = curve;
            const z = this.engine.calculateNoiseInfluence(0, 0, y, 0.1) * 0.3;
            
            await this.addVoxel(x, y, z, 'stem', phase);
            
            // Add thickness
            if (Math.random() < stemThickness * 0.5) {
                await this.addVoxel(x + 0.2, y, z, 'stem', phase);
                await this.addVoxel(x - 0.2, y, z, 'stem', phase);
            }
        }
    }

    async growBranches(voxelCount, phase) {
        // Grow horizontal branches
        const branchCount = Math.floor(this.spec.branchingFactor * 2 + 1);
        const voxelsPerBranch = Math.floor(voxelCount / branchCount);
        
        for (let b = 0; b < branchCount; b++) {
            const branchY = this.spec.baseHeight * (0.3 + Math.random() * 0.4);
            const branchAngle = (b / branchCount) * Math.PI * 2;
            const branchLength = this.spec.complexity * 3 + 1;
            
            for (let i = 0; i < voxelsPerBranch; i++) {
                const progress = i / voxelsPerBranch;
                const distance = progress * branchLength;
                
                const x = Math.cos(branchAngle) * distance;
                const y = branchY + Math.sin(progress * Math.PI * 0.5) * 0.5;
                const z = Math.sin(branchAngle) * distance;
                
                await this.addVoxel(x, y, z, 'stem', phase);
                
                this.branches.push({ x, y, z, angle: branchAngle, length: distance });
            }
        }
    }

    async growLeaves(voxelCount, phase) {
        // Add leaves/petals to branches
        for (const branch of this.branches) {
            if (Math.random() < this.spec.leafDensity) {
                const leafCount = Math.floor(Math.random() * 5 + 2);
                
                for (let l = 0; l < leafCount; l++) {
                    const leafAngle = branch.angle + (Math.random() - 0.5) * Math.PI * 0.5;
                    const leafDistance = 0.5 + Math.random() * 1;
                    
                    const x = branch.x + Math.cos(leafAngle) * leafDistance;
                    const y = branch.y + (Math.random() - 0.5) * 0.5;
                    const z = branch.z + Math.sin(leafAngle) * leafDistance;
                    
                    await this.addVoxel(x, y, z, 'petal', phase);
                }
            }
        }
    }

    async growFlowers(voxelCount, phase) {
        // Create the main flower head and any secondary blooms
        await this.createMainFlower(Math.floor(voxelCount * 0.7));
        
        // Add secondary flowers on branches
        const secondaryFlowers = Math.floor(this.branches.length * 0.3);
        for (let i = 0; i < secondaryFlowers; i++) {
            const branch = this.branches[Math.floor(Math.random() * this.branches.length)];
            await this.createSecondaryFlower(branch, Math.floor(voxelCount * 0.1));
        }
    }

    async createMainFlower(voxelCount) {
        const flowerCenter = {
            x: 0,
            y: this.spec.baseHeight,
            z: 0
        };
        
        // Use symmetry-specific flower creation
        switch (this.spec.symmetryType) {
            case 'quadruple':
                await this.createQuadrupleFlower(flowerCenter, voxelCount);
                break;
            case 'pentagonal':
                await this.createPentagonalFlower(flowerCenter, voxelCount);
                break;
            case 'rosaceae':
                await this.createRosaceaeFlower(flowerCenter, voxelCount);
                break;
            case 'fractal':
                await this.createFractalFlower(flowerCenter, voxelCount, 3);
                break;
            default:
                await this.createOrganicFlower(flowerCenter, voxelCount);
                break;
        }
    }

    async createQuadrupleFlower(center, voxelCount) {
        const layers = 3;
        const voxelsPerLayer = Math.floor(voxelCount / layers);
        
        for (let layer = 0; layer < layers; layer++) {
            const layerRadius = (layer + 1) * 0.8;
            const layerHeight = center.y + layer * 0.3;
            
            for (let i = 0; i < 4; i++) {
                const angle = (i * Math.PI * 2) / 4 + (layer * Math.PI / 8);
                
                for (let r = 0.2; r <= layerRadius; r += 0.2) {
                    const x = center.x + Math.cos(angle) * r;
                    const z = center.z + Math.sin(angle) * r;
                    const y = layerHeight + Math.sin(r * 2) * 0.2;
                    
                    await this.addVoxel(x, y, z, 'petal', { name: 'flowering' });
                }
            }
        }
    }

    async createPentagonalFlower(center, voxelCount) {
        const petalCount = 5;
        const layers = 4;
        
        for (let layer = 0; layer < layers; layer++) {
            const layerRadius = (layer + 1) * 0.618; // Golden ratio
            const layerHeight = center.y + layer * 0.2;
            
            for (let p = 0; p < petalCount; p++) {
                const angle = (p * Math.PI * 2) / petalCount + (layer * 0.2);
                
                // Create petal curve
                for (let t = 0; t <= 1; t += 0.1) {
                    const r = layerRadius * t;
                    const petalAngle = angle + Math.sin(t * Math.PI) * 0.3;
                    
                    const x = center.x + Math.cos(petalAngle) * r;
                    const z = center.z + Math.sin(petalAngle) * r;
                    const y = layerHeight + Math.sin(t * Math.PI) * 0.4;
                    
                    await this.addVoxel(x, y, z, 'petal', { name: 'flowering' });
                }
            }
        }
    }

    async createRosaceaeFlower(center, voxelCount) {
        const layers = this.spec.rosePattern?.petalLayers || 5;
        const layerRotation = (this.spec.rosePattern?.layerRotation || 22.5) * Math.PI / 180;
        
        for (let layer = 0; layer < layers; layer++) {
            const petalsInLayer = 8 + layer * 2;
            const layerRadius = this.spec.complexity * (1 + layer * 0.3);
            const layerHeight = center.y + layer * 0.15 - layer * 0.05;
            
            for (let p = 0; p < petalsInLayer; p++) {
                const angle = (p * Math.PI * 2) / petalsInLayer + layer * layerRotation;
                const petalRadius = layerRadius * (0.7 + Math.sin(p * 0.5) * 0.3);
                
                for (let t = 0; t <= 1; t += 0.15) {
                    const r = petalRadius * t;
                    const petalAngle = angle + Math.sin(t * Math.PI) * 0.2;
                    
                    const x = center.x + Math.cos(petalAngle) * r;
                    const z = center.z + Math.sin(petalAngle) * r;
                    const y = layerHeight + Math.sin(t * Math.PI) * 0.3 - layer * 0.1;
                    
                    await this.addVoxel(x, y, z, 'petal', { name: 'flowering' });
                }
            }
        }
    }

    async createSecondaryFlower(branch, voxelCount) {
        // Create smaller flowers on branches
        const smallFlowerRadius = 0.5;
        const petalCount = Math.floor(Math.random() * 6 + 4);
        
        for (let i = 0; i < petalCount; i++) {
            const angle = (i * Math.PI * 2) / petalCount;
            const x = branch.x + Math.cos(angle) * smallFlowerRadius;
            const y = branch.y + Math.random() * 0.3;
            const z = branch.z + Math.sin(angle) * smallFlowerRadius;
            
            await this.addVoxel(x, y, z, 'petal', { name: 'flowering' });
        }
    }

    async addVoxel(x, y, z, type, phase) {
        // Add physics properties based on thread influences
        const physicsProps = this.calculateVoxelPhysics(x, y, z, type);
        const semanticProps = this.calculateVoxelSemantics(x, y, z, type, phase);
        
        // Add to physics engine
        const bodyId = this.garden.physicsEngine.addVoxel(
            { x, y, z },
            physicsProps,
            semanticProps
        );
        
        // Add to visual representation
        if (type === 'stem') {
            this.garden.addStemVoxel(x, y, z);
        } else {
            const color = this.calculateVoxelColor(x, y, z, type, semanticProps);
            this.garden.addPetalVoxel(x, y, z, color);
        }
        
        this.voxels.push({
            position: { x, y, z },
            type,
            phase: phase.name,
            bodyId,
            semantics: semanticProps
        });
        
        // Small delay for animated growth
        if (Math.random() < 0.1) {
            await this.delay(10);
        }
    }

    calculateVoxelPhysics(x, y, z, type) {
        // Base physics properties
        const baseProps = {
            mass: type === 'stem' ? 0.2 : 0.05,
            friction: type === 'stem' ? 0.8 : 0.4,
            bounciness: type === 'stem' ? 0.1 : 0.6
        };
        
        // Find closest thread influence
        let closestInfluence = null;
        let minDistance = Infinity;
        
        for (const influence of this.spec.threadInfluences) {
            const distance = Math.sqrt(
                (x - influence.position.x) ** 2 +
                (y - influence.position.y) ** 2 +
                (z - influence.position.z) ** 2
            );
            
            if (distance < minDistance) {
                minDistance = distance;
                closestInfluence = influence;
            }
        }
        
        if (closestInfluence) {
            // Modify properties based on thread influence
            baseProps.mass *= closestInfluence.influence;
            baseProps.magneticField = closestInfluence.semanticWeight * 0.1;
            baseProps.growthForce = closestInfluence.temporalWeight * 0.05;
        }
        
        return baseProps;
    }

    calculateVoxelSemantics(x, y, z, type, phase) {
        // Find the most influential thread for this position
        let dominantThread = null;
        let maxInfluence = 0;
        
        for (const threadInfluence of this.spec.threadInfluences) {
            const distance = Math.sqrt(
                (x - threadInfluence.position.x) ** 2 +
                (y - threadInfluence.position.y) ** 2 +
                (z - threadInfluence.position.z) ** 2
            );
            
            const influence = threadInfluence.influence / (distance + 1);
            
            if (influence > maxInfluence) {
                maxInfluence = influence;
                dominantThread = threadInfluence;
            }
        }
        
        return {
            threadId: dominantThread?.threadId || 'default',
            semanticFingerprint: dominantThread?.semanticFingerprint || [],
            symmetryType: this.spec.symmetryType,
            growthVector: dominantThread?.growthVector || { x: 0, y: 1, z: 0, magnitude: 1 },
            timestamp: Date.now(),
            phase: phase.name,
            position: { x, y, z }
        };
    }

    calculateVoxelColor(x, y, z, type, semantics) {
        if (type === 'stem') {
            // Stem colors - green variations
            const intensity = 0.3 + Math.random() * 0.3;
            return `rgb(${Math.floor(intensity * 100)}, ${Math.floor(intensity * 200)}, ${Math.floor(intensity * 80)})`;
        } else {
            // Petal colors - use color palette
            const palette = this.spec.colorPalette;
            
            if (palette.primary.length > 0) {
                const colorIndex = Math.floor(Math.random() * palette.primary.length);
                const color = palette.primary[colorIndex];
                
                // Add some variation
                const variation = 0.8 + Math.random() * 0.4;
                return `rgb(${Math.floor(color.r * 255 * variation)}, ${Math.floor(color.g * 255 * variation)}, ${Math.floor(color.b * 255 * variation)})`;
            }
            
            // Default flower color
            return `rgb(${Math.floor(Math.random() * 100 + 155)}, ${Math.floor(Math.random() * 100 + 100)}, ${Math.floor(Math.random() * 100 + 155)})`;
        }
    }

    async finalizeGrowth() {
        // Apply final touches like connecting constraints between nearby voxels
        this.connectNearbyVoxels();
        
        // Update garden statistics
        this.garden.updateInstancedMeshes();
    }

    connectNearbyVoxels() {
        // Create physics constraints between nearby voxels for structural integrity
        const connectionRadius = 0.5;
        
        for (let i = 0; i < this.voxels.length; i++) {
            for (let j = i + 1; j < this.voxels.length; j++) {
                const voxelA = this.voxels[i];
                const voxelB = this.voxels[j];
                
                const distance = Math.sqrt(
                    (voxelA.position.x - voxelB.position.x) ** 2 +
                    (voxelA.position.y - voxelB.position.y) ** 2 +
                    (voxelA.position.z - voxelB.position.z) ** 2
                );
                
                if (distance < connectionRadius && distance > 0.1) {
                    // Create constraint between connected voxels
                    this.garden.physicsEngine.addConstraint(
                        voxelA.bodyId,
                        voxelB.bodyId,
                        { maxForce: 10 }
                    );
                }
            }
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}