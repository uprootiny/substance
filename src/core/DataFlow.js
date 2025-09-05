/**
 * DataFlow - Reactive data pipeline with semantic transformations
 * Implements functional reactive programming patterns for voxel garden
 */

export class DataFlow {
    constructor(eventSystem) {
        this.eventSystem = eventSystem;
        this.streams = new Map();
        this.transformations = new Map();
        this.sinks = new Map();
        this.sources = new Map();
        
        // Performance monitoring
        this.metrics = {
            streamsProcessed: 0,
            transformationTime: 0,
            dataVolume: 0,
            bottlenecks: []
        };
        
        this.initializeCore();
    }

    initializeCore() {
        // Register core data transformation functions
        this.registerTransformation('tmux.parse', this.parseTmuxData.bind(this));
        this.registerTransformation('semantic.extract', this.extractSemanticFeatures.bind(this));
        this.registerTransformation('voxel.position', this.calculateVoxelPositions.bind(this));
        this.registerTransformation('flower.spec', this.generateFlowerSpecification.bind(this));
        this.registerTransformation('physics.sync', this.syncPhysicsData.bind(this));
        this.registerTransformation('fractal.analyze', this.analyzeFractalPatterns.bind(this));
    }

    // Create data stream with reactive operators
    createStream(sourceId, config = {}) {
        const stream = new DataStream(sourceId, config, this);
        this.streams.set(sourceId, stream);
        
        // Emit stream creation event
        this.eventSystem.emit('stream.created', {
            streamId: sourceId,
            config,
            timestamp: Date.now()
        });
        
        return stream;
    }

    // Register data source
    registerSource(sourceId, source) {
        this.sources.set(sourceId, source);
        
        // Connect source to event system
        if (source.onData) {
            source.onData((data) => {
                this.eventSystem.emit('data.received', {
                    sourceId,
                    data,
                    size: this.estimateDataSize(data)
                });
            });
        }
    }

    // Register data sink
    registerSink(sinkId, sink) {
        this.sinks.set(sinkId, sink);
    }

    // Register transformation function
    registerTransformation(transformId, transformFn) {
        this.transformations.set(transformId, {
            fn: transformFn,
            callCount: 0,
            totalTime: 0,
            errors: 0
        });
    }

    // Apply transformation with performance tracking
    async applyTransformation(transformId, data, context = {}) {
        const transformation = this.transformations.get(transformId);
        if (!transformation) {
            throw new Error(`Unknown transformation: ${transformId}`);
        }

        const startTime = performance.now();
        
        try {
            const result = await transformation.fn(data, context);
            
            const endTime = performance.now();
            const duration = endTime - startTime;
            
            // Update metrics
            transformation.callCount++;
            transformation.totalTime += duration;
            
            // Emit transformation complete event
            this.eventSystem.emit('transformation.complete', {
                transformId,
                duration,
                inputSize: this.estimateDataSize(data),
                outputSize: this.estimateDataSize(result)
            });
            
            return result;
        } catch (error) {
            transformation.errors++;
            
            this.eventSystem.emit('transformation.error', {
                transformId,
                error: error.message,
                data
            });
            
            throw error;
        }
    }

    // Core transformation functions

    parseTmuxData(rawData, context) {
        return {
            threads: rawData.threads?.map(thread => ({
                id: thread.id,
                content: thread.content,
                timestamp: thread.timestamp || Date.now(),
                interactions: thread.interactions || 0,
                complexity: this.calculateComplexity(thread.content),
                semanticWeight: this.calculateSemanticWeight(thread.content),
                symmetryType: this.detectSymmetryType(thread)
            })) || [],
            metadata: {
                totalThreads: rawData.threads?.length || 0,
                parseTime: Date.now(),
                narrative: rawData.narrative || 'unknown'
            }
        };
    }

    extractSemanticFeatures(parsedData, context) {
        const features = {
            keyTerms: new Map(),
            concepts: new Set(),
            relationships: [],
            abstractionLevels: new Map(),
            technicalDensity: 0
        };

        for (const thread of parsedData.threads) {
            // Extract key terms using simple pattern matching
            const terms = thread.content.toLowerCase()
                .match(/\b[a-z]{3,}\b/g) || [];
            
            for (const term of terms) {
                features.keyTerms.set(term, (features.keyTerms.get(term) || 0) + 1);
            }

            // Detect technical concepts
            if (thread.content.match(/\.(js|py|clj|md|sh)$/)) {
                features.concepts.add('code');
            }
            if (thread.content.includes('tmux')) {
                features.concepts.add('terminal');
            }
            if (thread.content.includes('claude') || thread.content.includes('ai')) {
                features.concepts.add('ai');
            }

            // Calculate abstraction level
            const abstractionScore = this.calculateAbstractionLevel(thread.content);
            features.abstractionLevels.set(thread.id, abstractionScore);
        }

        // Calculate overall technical density
        const technicalTerms = ['function', 'class', 'server', 'api', 'data', 'system'];
        const technicalCount = Array.from(features.keyTerms.entries())
            .filter(([term]) => technicalTerms.includes(term))
            .reduce((sum, [, count]) => sum + count, 0);
        
        features.technicalDensity = technicalCount / Math.max(1, features.keyTerms.size);

        return features;
    }

    calculateVoxelPositions(flowerSpec, context) {
        const positions = [];
        const { type, complexity, center = { x: 0, y: 0, z: 0 } } = flowerSpec;
        
        switch (type) {
            case 'quadruple':
                positions.push(...this.generateQuadruplePositions(complexity, center));
                break;
            case 'pentagonal':
                positions.push(...this.generatePentagonalPositions(complexity, center));
                break;
            case 'rosaceae':
                positions.push(...this.generateRosaceaePositions(complexity, center));
                break;
            case 'fractal':
                positions.push(...this.generateFractalPositions(complexity, center));
                break;
            default:
                positions.push(...this.generateOrganicPositions(complexity, center));
        }

        return {
            positions,
            metadata: {
                voxelCount: positions.length,
                boundingBox: this.calculateBoundingBox(positions),
                density: this.calculateDensity(positions)
            }
        };
    }

    generateFlowerSpecification(semanticFeatures, context) {
        const spec = {
            id: `flower_${Date.now()}`,
            type: this.selectFlowerType(semanticFeatures),
            complexity: this.calculateFlowerComplexity(semanticFeatures),
            colorPalette: this.selectColorPalette(semanticFeatures),
            growthRate: this.calculateGrowthRate(semanticFeatures),
            semanticBinding: {
                primaryConcepts: Array.from(semanticFeatures.concepts).slice(0, 3),
                keyTerms: Array.from(semanticFeatures.keyTerms.entries())
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5),
                technicalDensity: semanticFeatures.technicalDensity
            }
        };

        // Add physics properties based on semantic features
        spec.physics = {
            mass: 1 + semanticFeatures.technicalDensity,
            friction: 0.3 + (1 - semanticFeatures.technicalDensity) * 0.4,
            restitution: Math.min(0.9, semanticFeatures.technicalDensity * 1.2),
            attraction: this.calculateSemanticAttraction(semanticFeatures)
        };

        return spec;
    }

    syncPhysicsData(voxelPositions, context) {
        return voxelPositions.positions.map((pos, index) => ({
            id: `voxel_${index}`,
            position: pos,
            velocity: { x: 0, y: 0, z: 0 },
            forces: [],
            constraints: context.constraints || [],
            lastUpdate: Date.now()
        }));
    }

    analyzeFractalPatterns(data, context) {
        // Implement fractal analysis using box-counting method
        const dimensions = [];
        const scales = [1, 2, 4, 8, 16];
        
        for (const scale of scales) {
            const boxCount = this.countBoxesAtScale(data, scale);
            dimensions.push({
                scale,
                boxCount,
                dimension: Math.log(boxCount) / Math.log(1/scale)
            });
        }

        return {
            dimensions,
            averageDimension: dimensions.reduce((sum, d) => sum + d.dimension, 0) / dimensions.length,
            selfSimilarity: this.calculateSelfSimilarity(data),
            complexity: this.calculateFractalComplexity(dimensions)
        };
    }

    // Helper methods

    calculateComplexity(content) {
        // Simple complexity heuristic based on content analysis
        const length = content.length;
        const uniqueChars = new Set(content).size;
        const words = content.split(/\s+/).length;
        
        return Math.min(1, (uniqueChars / length) * Math.log(words + 1) / 10);
    }

    calculateSemanticWeight(content) {
        // Weight based on semantic richness
        const semanticTerms = ['function', 'class', 'algorithm', 'pattern', 'structure'];
        const weight = semanticTerms.reduce((sum, term) => {
            return sum + (content.toLowerCase().includes(term) ? 1 : 0);
        }, 0);
        
        return weight / semanticTerms.length;
    }

    detectSymmetryType(thread) {
        const content = thread.content.toLowerCase();
        
        if (content.includes('quadru') || content.includes('four')) return 'quadruple';
        if (content.includes('penta') || content.includes('five')) return 'pentagonal';
        if (content.includes('rose') || content.includes('flower')) return 'rosaceae';
        if (content.includes('fractal') || content.includes('recursive')) return 'fractal';
        
        return 'organic';
    }

    calculateAbstractionLevel(content) {
        const abstractTerms = ['concept', 'theory', 'philosophy', 'abstract', 'meta'];
        const concreteTerms = ['file', 'server', 'function', 'data', 'code'];
        
        const abstractCount = abstractTerms.reduce((sum, term) => 
            sum + (content.toLowerCase().includes(term) ? 1 : 0), 0);
        const concreteCount = concreteTerms.reduce((sum, term) => 
            sum + (content.toLowerCase().includes(term) ? 1 : 0), 0);
        
        return abstractCount / Math.max(1, abstractCount + concreteCount);
    }

    selectFlowerType(features) {
        const concepts = Array.from(features.concepts);
        
        if (concepts.includes('ai') && concepts.includes('code')) return 'fractal';
        if (concepts.includes('terminal')) return 'quadruple';
        if (features.technicalDensity > 0.7) return 'pentagonal';
        if (concepts.includes('code')) return 'rosaceae';
        
        return 'organic';
    }

    calculateFlowerComplexity(features) {
        return Math.min(1, features.technicalDensity + 
                          features.keyTerms.size / 100 + 
                          features.concepts.size / 10);
    }

    selectColorPalette(features) {
        const primaryConcept = Array.from(features.concepts)[0] || 'default';
        
        const palettes = {
            'ai': 'fractal',
            'code': 'quadruple', 
            'terminal': 'pentagonal',
            'default': 'rosaceae'
        };
        
        return palettes[primaryConcept] || 'rosaceae';
    }

    calculateGrowthRate(features) {
        // Higher technical density = slower, more deliberate growth
        return Math.max(0.1, 1 - features.technicalDensity * 0.5);
    }

    calculateSemanticAttraction(features) {
        // Create attraction forces between semantically related voxels
        const attractions = [];
        const concepts = Array.from(features.concepts);
        
        for (let i = 0; i < concepts.length - 1; i++) {
            for (let j = i + 1; j < concepts.length; j++) {
                attractions.push({
                    concept1: concepts[i],
                    concept2: concepts[j],
                    strength: this.calculateConceptSimilarity(concepts[i], concepts[j])
                });
            }
        }
        
        return attractions;
    }

    calculateConceptSimilarity(concept1, concept2) {
        // Simple concept similarity based on predefined relationships
        const similarities = {
            'ai:code': 0.8,
            'terminal:code': 0.6,
            'ai:terminal': 0.4
        };
        
        const key = `${concept1}:${concept2}`;
        const reverseKey = `${concept2}:${concept1}`;
        
        return similarities[key] || similarities[reverseKey] || 0.2;
    }

    generateQuadruplePositions(complexity, center) {
        const positions = [];
        const voxelCount = Math.floor(complexity * 50 + 20);
        
        for (let i = 0; i < voxelCount; i++) {
            const t = i / voxelCount;
            const angle = t * Math.PI * 8; // 4 symmetrical branches
            const radius = complexity * 5 * t;
            const height = t * complexity * 10;
            
            positions.push({
                x: center.x + Math.cos(angle) * radius,
                y: center.y + height,
                z: center.z + Math.sin(angle) * radius,
                type: i < voxelCount * 0.3 ? 'stem' : 'petal'
            });
        }
        
        return positions;
    }

    generatePentagonalPositions(complexity, center) {
        const positions = [];
        const voxelCount = Math.floor(complexity * 60 + 25);
        
        for (let i = 0; i < voxelCount; i++) {
            const t = i / voxelCount;
            const angle = t * Math.PI * 10; // 5-fold symmetry
            const radius = complexity * 4 * Math.sin(t * Math.PI);
            const height = t * complexity * 8;
            
            positions.push({
                x: center.x + Math.cos(angle) * radius,
                y: center.y + height,
                z: center.z + Math.sin(angle) * radius,
                type: i < voxelCount * 0.4 ? 'stem' : 'petal'
            });
        }
        
        return positions;
    }

    generateRosaceaePositions(complexity, center) {
        const positions = [];
        const voxelCount = Math.floor(complexity * 80 + 30);
        
        for (let i = 0; i < voxelCount; i++) {
            const t = i / voxelCount;
            const angle = t * Math.PI * 12;
            const radius = complexity * 3 * (1 + Math.sin(t * Math.PI * 6) * 0.3);
            const height = center.y + t * complexity * 6 + Math.sin(t * Math.PI * 4) * 2;
            
            positions.push({
                x: center.x + Math.cos(angle) * radius,
                y: height,
                z: center.z + Math.sin(angle) * radius,
                type: 'petal'
            });
        }
        
        return positions;
    }

    generateFractalPositions(complexity, center) {
        const positions = [];
        this.generateFractalBranch(positions, center, 0, Math.PI/2, complexity * 5, 3);
        return positions;
    }

    generateFractalBranch(positions, position, angle, elevation, length, depth) {
        if (depth <= 0 || length < 0.5) return;
        
        const steps = Math.floor(length);
        const endX = position.x + Math.cos(angle) * length;
        const endY = position.y + Math.sin(elevation) * length;
        const endZ = position.z + Math.sin(angle) * length;
        
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            positions.push({
                x: position.x + (endX - position.x) * t,
                y: position.y + (endY - position.y) * t,
                z: position.z + (endZ - position.z) * t,
                type: depth > 1 ? 'stem' : 'petal'
            });
        }
        
        // Recursive branches
        if (depth > 1) {
            for (let i = 0; i < 3; i++) {
                const newAngle = angle + (Math.PI / 4) * (i - 1);
                this.generateFractalBranch(
                    positions,
                    { x: endX, y: endY, z: endZ },
                    newAngle,
                    elevation + Math.PI / 8,
                    length * 0.7,
                    depth - 1
                );
            }
        }
    }

    generateOrganicPositions(complexity, center) {
        const positions = [];
        const voxelCount = Math.floor(complexity * 70 + 20);
        
        for (let i = 0; i < voxelCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * complexity * 6 + 1;
            const height = center.y + Math.random() * complexity * 8;
            
            positions.push({
                x: center.x + Math.cos(angle) * radius,
                y: height,
                z: center.z + Math.sin(angle) * radius,
                type: Math.random() < 0.3 ? 'stem' : 'petal'
            });
        }
        
        return positions;
    }

    calculateBoundingBox(positions) {
        const min = { x: Infinity, y: Infinity, z: Infinity };
        const max = { x: -Infinity, y: -Infinity, z: -Infinity };
        
        for (const pos of positions) {
            min.x = Math.min(min.x, pos.x);
            min.y = Math.min(min.y, pos.y);
            min.z = Math.min(min.z, pos.z);
            max.x = Math.max(max.x, pos.x);
            max.y = Math.max(max.y, pos.y);
            max.z = Math.max(max.z, pos.z);
        }
        
        return { min, max };
    }

    calculateDensity(positions) {
        if (positions.length === 0) return 0;
        
        const bbox = this.calculateBoundingBox(positions);
        const volume = (bbox.max.x - bbox.min.x) * 
                      (bbox.max.y - bbox.min.y) * 
                      (bbox.max.z - bbox.min.z);
        
        return positions.length / Math.max(1, volume);
    }

    countBoxesAtScale(data, scale) {
        // Simplified box-counting for fractal dimension analysis
        const boxes = new Set();
        
        if (data.positions) {
            for (const pos of data.positions) {
                const boxX = Math.floor(pos.x / scale);
                const boxY = Math.floor(pos.y / scale);
                const boxZ = Math.floor(pos.z / scale);
                boxes.add(`${boxX},${boxY},${boxZ}`);
            }
        }
        
        return boxes.size;
    }

    calculateSelfSimilarity(data) {
        // Measure how similar parts are to the whole
        return Math.random() * 0.5 + 0.3; // Placeholder
    }

    calculateFractalComplexity(dimensions) {
        const variance = dimensions.reduce((sum, d, i, arr) => {
            const mean = arr.reduce((s, dim) => s + dim.dimension, 0) / arr.length;
            return sum + Math.pow(d.dimension - mean, 2);
        }, 0) / dimensions.length;
        
        return Math.sqrt(variance);
    }

    estimateDataSize(data) {
        return JSON.stringify(data).length;
    }

    getMetrics() {
        return {
            ...this.metrics,
            streamCount: this.streams.size,
            sourceCount: this.sources.size,
            sinkCount: this.sinks.size,
            transformationStats: Array.from(this.transformations.entries()).map(([id, stats]) => ({
                id,
                callCount: stats.callCount,
                averageTime: stats.callCount > 0 ? stats.totalTime / stats.callCount : 0,
                errors: stats.errors
            }))
        };
    }
}

// Reactive data stream implementation
class DataStream {
    constructor(id, config, dataFlow) {
        this.id = id;
        this.config = config;
        this.dataFlow = dataFlow;
        this.operators = [];
        this.subscribers = [];
        this.isActive = true;
        this.buffer = [];
        this.bufferSize = config.bufferSize || 100;
    }

    // Transformation operators
    map(transformFn) {
        this.operators.push({ type: 'map', fn: transformFn });
        return this;
    }

    filter(predicateFn) {
        this.operators.push({ type: 'filter', fn: predicateFn });
        return this;
    }

    reduce(reduceFn, initialValue) {
        this.operators.push({ type: 'reduce', fn: reduceFn, initial: initialValue });
        return this;
    }

    batch(size) {
        this.operators.push({ type: 'batch', size });
        return this;
    }

    throttle(intervalMs) {
        this.operators.push({ type: 'throttle', interval: intervalMs });
        return this;
    }

    // Subscribe to processed data
    subscribe(callback) {
        const subscriptionId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.subscribers.push({ id: subscriptionId, callback });
        return subscriptionId;
    }

    // Process incoming data through operator chain
    async process(data) {
        if (!this.isActive) return;

        let result = data;
        
        for (const operator of this.operators) {
            result = await this.applyOperator(operator, result);
            if (result === null) return; // Filtered out
        }

        // Emit to subscribers
        for (const subscriber of this.subscribers) {
            try {
                await subscriber.callback(result);
            } catch (error) {
                console.error(`Stream ${this.id} subscriber error:`, error);
            }
        }
    }

    async applyOperator(operator, data) {
        switch (operator.type) {
            case 'map':
                return await operator.fn(data);
                
            case 'filter':
                return (await operator.fn(data)) ? data : null;
                
            case 'reduce':
                this.buffer.push(data);
                if (this.buffer.length >= this.bufferSize) {
                    const result = this.buffer.reduce(operator.fn, operator.initial);
                    this.buffer = [];
                    return result;
                }
                return null;
                
            case 'batch':
                this.buffer.push(data);
                if (this.buffer.length >= operator.size) {
                    const batch = [...this.buffer];
                    this.buffer = [];
                    return batch;
                }
                return null;
                
            case 'throttle':
                const now = Date.now();
                if (!this.lastEmit || now - this.lastEmit >= operator.interval) {
                    this.lastEmit = now;
                    return data;
                }
                return null;
                
            default:
                return data;
        }
    }

    stop() {
        this.isActive = false;
    }

    resume() {
        this.isActive = true;
    }
}