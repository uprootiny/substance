import { createNoise2D } from 'simplex-noise';
import { FractionalFFT } from '../analysis/FractionalFFT.js';

export class TmuxDataParser {
    constructor() {
        this.noise2D = createNoise2D();
        this.fractionalFFT = new FractionalFFT();
        
        // Pattern recognition for different types of content
        this.contentPatterns = {
            code: /(?:function|class|def|const|let|var|import|export|return|\{|\}|\(|\)|;)/gi,
            command: /(?:cd|ls|git|npm|node|python|clojure|tmux|ssh|sudo|curl|wget)/gi,
            narrative: /(?:the|and|or|but|with|from|into|about|through|over|under|between)/gi,
            technical: /(?:server|client|api|database|framework|library|protocol|algorithm)/gi,
            philosophical: /(?:being|existence|meaning|truth|reality|consciousness|experience|understanding)/gi,
            creative: /(?:flower|garden|bloom|growth|branch|root|seed|blossom|petal|stem)/gi
        };
        
        // Semantic weight mappings
        this.semanticWeights = {
            code: 0.9,
            command: 0.8,
            technical: 0.7,
            narrative: 0.6,
            philosophical: 0.8,
            creative: 1.0
        };
        
        // Symmetry type associations based on content patterns
        this.symmetryMappings = {
            quadruple: ['emacs', 'claude', 'interface', 'quadrant', 'helix', 'four'],
            pentagonal: ['branch', 'growth', 'organic', 'natural', 'flow'],
            rosaceae: ['flower', 'petal', 'bloom', 'rose', 'beauty', 'intricate'],
            fractal: ['recursive', 'self', 'similar', 'pattern', 'infinite', 'scale']
        };
    }

    parse(sessionData) {
        if (!sessionData || !sessionData.threads) {
            throw new Error('Invalid session data: missing threads');
        }

        const parsed = {
            totalThreads: sessionData.threads.length,
            totalInteractions: 0,
            averageComplexity: 0,
            dominantPatterns: new Map(),
            temporalFlow: [],
            semanticDensity: 0,
            narrativeCoherence: 0,
            branchingFactor: sessionData.branches || 1,
            depth: sessionData.depth || 1,
            threads: []
        };

        // Parse each thread
        for (const thread of sessionData.threads) {
            const parsedThread = this.parseThread(thread);
            parsed.threads.push(parsedThread);
            parsed.totalInteractions += thread.interactions || 0;
        }

        // Calculate aggregate metrics
        parsed.averageComplexity = this.calculateAverageComplexity(parsed.threads);
        parsed.dominantPatterns = this.identifyDominantPatterns(parsed.threads);
        parsed.temporalFlow = this.analyzeTemporalFlow(sessionData.threads);
        parsed.semanticDensity = this.calculateSemanticDensity(parsed.threads);
        parsed.narrativeCoherence = this.calculateNarrativeCoherence(sessionData);

        // Add fractional Fourier transform analysis
        try {
            parsed.fractionalAnalysis = this.fractionalFFT.analyzeSessionData(parsed);
            parsed.fractionalReport = this.fractionalFFT.generateAnalysisReport(parsed.fractionalAnalysis);
            parsed.hyperstitiousPatterns = this.extractHyperstitiousPatterns(parsed.fractionalAnalysis);
        } catch (error) {
            console.warn('Fractional FFT analysis failed:', error.message);
            parsed.fractionalAnalysis = null;
            parsed.fractionalReport = null;
            parsed.hyperstitiousPatterns = null;
        }

        return parsed;
    }

    parseThread(thread) {
        const content = thread.content || '';
        const timestamp = thread.timestamp || Date.now();
        
        const parsed = {
            id: thread.id,
            originalContent: content,
            timestamp: timestamp,
            interactions: thread.interactions || 0,
            complexity: thread.complexity || this.calculateComplexity(content),
            symmetryType: thread.symmetryType || this.determineSymmetryType(content),
            contentAnalysis: this.analyzeContent(content),
            semanticFingerprint: this.generateSemanticFingerprint(content),
            temporalWeight: this.calculateTemporalWeight(timestamp),
            branchingPotential: this.calculateBranchingPotential(content),
            growthVector: this.calculateGrowthVector(content, thread.interactions || 0),
            colorProfile: this.generateColorProfile(content),
            physicsProperties: this.generatePhysicsProperties(content, thread.interactions || 0)
        };

        return parsed;
    }

    analyzeContent(content) {
        const analysis = {
            wordCount: content.split(/\s+/).length,
            sentenceCount: content.split(/[.!?]+/).length,
            patternMatches: new Map(),
            semanticWeight: 0,
            abstractionLevel: 0,
            emotionalTone: 0,
            technicalDensity: 0
        };

        // Analyze pattern matches
        for (const [patternName, pattern] of Object.entries(this.contentPatterns)) {
            const matches = content.match(pattern);
            const matchCount = matches ? matches.length : 0;
            analysis.patternMatches.set(patternName, matchCount);
            
            // Contribute to semantic weight
            analysis.semanticWeight += matchCount * (this.semanticWeights[patternName] || 0.5);
        }

        // Calculate abstraction level (higher for philosophical/creative content)
        analysis.abstractionLevel = (
            analysis.patternMatches.get('philosophical') * 0.4 +
            analysis.patternMatches.get('creative') * 0.3 +
            analysis.patternMatches.get('narrative') * 0.2
        ) / Math.max(1, analysis.wordCount * 0.01);

        // Calculate technical density
        analysis.technicalDensity = (
            analysis.patternMatches.get('code') * 0.4 +
            analysis.patternMatches.get('command') * 0.3 +
            analysis.patternMatches.get('technical') * 0.3
        ) / Math.max(1, analysis.wordCount * 0.01);

        // Emotional tone (simplified sentiment analysis)
        analysis.emotionalTone = this.calculateEmotionalTone(content);

        return analysis;
    }

    calculateComplexity(content) {
        const words = content.split(/\s+/);
        const uniqueWords = new Set(words);
        const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
        
        // Complexity based on vocabulary richness and word length
        const vocabularyRichness = uniqueWords.size / Math.max(words.length, 1);
        const lengthComplexity = Math.min(avgWordLength / 10, 1);
        
        return Math.min((vocabularyRichness + lengthComplexity) / 2, 1);
    }

    determineSymmetryType(content) {
        const lowerContent = content.toLowerCase();
        const scores = {};

        // Score each symmetry type based on keyword matches
        for (const [symmetryType, keywords] of Object.entries(this.symmetryMappings)) {
            scores[symmetryType] = 0;
            for (const keyword of keywords) {
                const regex = new RegExp(keyword, 'gi');
                const matches = lowerContent.match(regex);
                if (matches) {
                    scores[symmetryType] += matches.length;
                }
            }
        }

        // Return the symmetry type with highest score, or default to organic
        const maxScore = Math.max(...Object.values(scores));
        if (maxScore === 0) return 'organic';
        
        return Object.keys(scores).find(key => scores[key] === maxScore) || 'organic';
    }

    generateSemanticFingerprint(content) {
        // Create a unique semantic fingerprint for the content
        const words = content.toLowerCase().split(/\s+/);
        const fingerprint = new Array(32).fill(0);
        
        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            const hash = this.simpleHash(word);
            
            for (let j = 0; j < 32; j++) {
                if (hash & (1 << j)) {
                    fingerprint[j]++;
                }
            }
        }
        
        // Normalize fingerprint
        const maxValue = Math.max(...fingerprint);
        if (maxValue > 0) {
            for (let i = 0; i < fingerprint.length; i++) {
                fingerprint[i] /= maxValue;
            }
        }
        
        return fingerprint;
    }

    calculateTemporalWeight(timestamp) {
        const now = Date.now();
        const ageInHours = (now - timestamp) / (1000 * 60 * 60);
        
        // Exponential decay with half-life of 24 hours
        return Math.exp(-ageInHours * Math.log(2) / 24);
    }

    calculateBranchingPotential(content) {
        // Potential for creating branches based on content richness
        const analysis = this.analyzeContent(content);
        const patternDiversity = analysis.patternMatches.size;
        const semanticWeight = analysis.semanticWeight;
        
        return Math.min((patternDiversity * 0.3 + semanticWeight * 0.7) / 10, 1);
    }

    calculateGrowthVector(content, interactions) {
        // 3D vector indicating growth direction and magnitude
        const analysis = this.analyzeContent(content);
        const fingerprint = this.generateSemanticFingerprint(content);
        
        // Use semantic fingerprint to determine growth direction
        const x = (fingerprint[0] - fingerprint[1]) * 2;
        const y = Math.max(0.1, analysis.abstractionLevel + interactions * 0.01);
        const z = (fingerprint[2] - fingerprint[3]) * 2;
        
        const magnitude = Math.sqrt(x * x + y * y + z * z);
        
        return {
            x: x / magnitude,
            y: y / magnitude,
            z: z / magnitude,
            magnitude: Math.min(magnitude, 5)
        };
    }

    generateColorProfile(content) {
        const analysis = this.analyzeContent(content);
        const hue = this.calculateHue(content);
        const saturation = Math.min(analysis.semanticWeight * 0.1, 1);
        const lightness = 0.3 + analysis.abstractionLevel * 0.4;
        
        return {
            hue,
            saturation,
            lightness,
            alpha: Math.min(analysis.technicalDensity * 0.5 + 0.5, 1)
        };
    }

    calculateHue(content) {
        // Map content to hue based on semantic analysis
        const hash = this.simpleHash(content);
        return (hash % 360);
    }

    generatePhysicsProperties(content, interactions) {
        const analysis = this.analyzeContent(content);
        
        return {
            mass: Math.max(0.1, analysis.semanticWeight * 0.1),
            friction: Math.max(0.01, 1 - analysis.technicalDensity),
            bounciness: Math.min(analysis.abstractionLevel * 2, 1),
            magneticField: interactions * 0.001,
            growthForce: analysis.semanticWeight * 0.05,
            cohesion: this.calculateCohesion(content),
            viscosity: Math.max(0.1, analysis.emotionalTone * 0.5 + 0.5)
        };
    }

    calculateCohesion(content) {
        // How strongly voxels stick together in this thread
        const words = content.split(/\s+/);
        const repeatedWords = new Set();
        const wordCounts = new Map();
        
        for (const word of words) {
            const count = (wordCounts.get(word) || 0) + 1;
            wordCounts.set(word, count);
            if (count > 1) repeatedWords.add(word);
        }
        
        return Math.min(repeatedWords.size / Math.max(words.length * 0.1, 1), 1);
    }

    calculateEmotionalTone(content) {
        // Simplified emotional tone analysis
        const positiveWords = /(?:beautiful|amazing|wonderful|great|love|joy|happy|bloom|flower|growth)/gi;
        const negativeWords = /(?:error|fail|broken|wrong|bad|sad|anger|fear|death|decay)/gi;
        const neutralWords = /(?:system|process|function|data|information|analysis|structure)/gi;
        
        const positive = (content.match(positiveWords) || []).length;
        const negative = (content.match(negativeWords) || []).length;
        const neutral = (content.match(neutralWords) || []).length;
        
        const total = positive + negative + neutral + 1;
        return (positive - negative) / total;
    }

    calculateAverageComplexity(threads) {
        if (threads.length === 0) return 0;
        const sum = threads.reduce((acc, thread) => acc + thread.complexity, 0);
        return sum / threads.length;
    }

    identifyDominantPatterns(threads) {
        const aggregatePatterns = new Map();
        
        for (const thread of threads) {
            for (const [pattern, count] of thread.contentAnalysis.patternMatches) {
                const current = aggregatePatterns.get(pattern) || 0;
                aggregatePatterns.set(pattern, current + count);
            }
        }
        
        // Sort by frequency and return top patterns
        return new Map([...aggregatePatterns.entries()]
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
        );
    }

    analyzeTemporalFlow(threads) {
        const sortedThreads = [...threads].sort((a, b) => a.timestamp - b.timestamp);
        const flow = [];
        
        for (let i = 0; i < sortedThreads.length; i++) {
            const thread = sortedThreads[i];
            const prevThread = i > 0 ? sortedThreads[i - 1] : null;
            
            flow.push({
                timestamp: thread.timestamp,
                complexity: thread.complexity || this.calculateComplexity(thread.content || ''),
                delta: prevThread ? (thread.timestamp - prevThread.timestamp) : 0,
                momentum: this.calculateMomentum(thread, prevThread),
                phase: this.identifyPhase(thread.content || '')
            });
        }
        
        return flow;
    }

    calculateMomentum(currentThread, prevThread) {
        if (!prevThread) return 0;
        
        const complexityDelta = (currentThread.complexity || 0) - (prevThread.complexity || 0);
        const timeDelta = Math.max(currentThread.timestamp - prevThread.timestamp, 1);
        
        return complexityDelta / (timeDelta / 1000); // momentum per second
    }

    identifyPhase(content) {
        // Identify the phase of development/thought in the content
        if (/(?:init|start|begin|create|new)/gi.test(content)) return 'initiation';
        if (/(?:develop|build|implement|grow|extend)/gi.test(content)) return 'development';
        if (/(?:test|debug|fix|refine|polish)/gi.test(content)) return 'refinement';
        if (/(?:reflect|analyze|consider|understand|meaning)/gi.test(content)) return 'reflection';
        if (/(?:complete|finish|done|deploy|release)/gi.test(content)) return 'completion';
        
        return 'exploration';
    }

    calculateSemanticDensity(threads) {
        if (threads.length === 0) return 0;
        
        const totalWords = threads.reduce((acc, thread) => 
            acc + (thread.contentAnalysis?.wordCount || 0), 0);
        const totalSemanticWeight = threads.reduce((acc, thread) => 
            acc + (thread.contentAnalysis?.semanticWeight || 0), 0);
        
        return totalWords > 0 ? totalSemanticWeight / totalWords : 0;
    }

    calculateNarrativeCoherence(sessionData) {
        if (!sessionData.narrative || !sessionData.threads) return 0;
        
        const narrativeWords = sessionData.narrative.toLowerCase().split(/\s+/);
        let coherenceScore = 0;
        
        for (const thread of sessionData.threads) {
            const threadWords = (thread.content || '').toLowerCase().split(/\s+/);
            const commonWords = threadWords.filter(word => narrativeWords.includes(word));
            coherenceScore += commonWords.length / Math.max(threadWords.length, 1);
        }
        
        return sessionData.threads.length > 0 ? coherenceScore / sessionData.threads.length : 0;
    }

    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash);
    }

    // Utility method to extract tmux session data from actual tmux dump files
    static parseTmuxSessionDump(tmuxDumpContent) {
        const lines = tmuxDumpContent.split('\n');
        const threads = [];
        let currentThread = null;
        let threadId = 0;
        
        for (const line of lines) {
            const trimmedLine = line.trim();
            
            // Skip empty lines and tmux control sequences
            if (!trimmedLine || trimmedLine.startsWith('~') || trimmedLine.startsWith('%')) {
                continue;
            }
            
            // Detect session boundaries or significant command changes
            if (this.isSignificantLine(trimmedLine)) {
                if (currentThread) {
                    threads.push(currentThread);
                }
                
                currentThread = {
                    id: `thread-${threadId++}`,
                    content: trimmedLine,
                    timestamp: Date.now() - Math.random() * 86400000, // Random within last 24h
                    interactions: Math.floor(Math.random() * 100) + 1,
                    complexity: Math.random() * 0.8 + 0.2
                };
            } else if (currentThread) {
                // Append to current thread
                currentThread.content += ' ' + trimmedLine;
                currentThread.interactions += 1;
            }
        }
        
        if (currentThread) {
            threads.push(currentThread);
        }
        
        return {
            threads,
            branches: Math.floor(threads.length / 3) + 1,
            depth: Math.min(threads.length, 5),
            narrative: 'tmux-session-analysis'
        };
    }

    static isSignificantLine(line) {
        // Detect lines that indicate new threads/branches
        return /^(?:ssh|tmux|cd|git|npm|node|python|clojure|vim|emacs|claude|$)/.test(line) ||
               line.includes('➜') ||
               line.includes('$') ||
               line.includes('#');
    }

    /**
     * Extract hyperstitious patterns from fractional analysis
     * These are emergent patterns that seem to transcend normal cause-effect relationships
     */
    extractHyperstitiousPatterns(fractionalAnalysis) {
        if (!fractionalAnalysis || !fractionalAnalysis.hyperstiousSignatures) {
            return null;
        }

        const patterns = {
            emergentFrequencies: [],
            synchronicities: [],
            recursiveLoops: [],
            temporalAnomalies: [],
            semanticResonance: {},
            causalInversions: []
        };

        // Analyze hyperstitious signatures for anomalous patterns
        const signatures = fractionalAnalysis.hyperstiousSignatures;
        
        for (const [signalName, transform] of Object.entries(signatures)) {
            const magnitudes = transform.map(c => Math.sqrt(c.re * c.re + c.im * c.im));
            const phases = transform.map(c => Math.atan2(c.im, c.re));
            
            // Look for emergent frequencies (peaks in hyperstitious domain)
            const meanMagnitude = magnitudes.reduce((sum, mag) => sum + mag, 0) / magnitudes.length;
            const threshold = meanMagnitude + 2 * this.calculateStandardDeviation(magnitudes);
            
            magnitudes.forEach((mag, index) => {
                if (mag > threshold) {
                    patterns.emergentFrequencies.push({
                        signal: signalName,
                        frequency: index,
                        magnitude: mag,
                        phase: phases[index],
                        anomalyScore: (mag - meanMagnitude) / threshold
                    });
                }
            });

            // Detect synchronicities (phase alignments across different signals)
            patterns.semanticResonance[signalName] = {
                phaseCoherence: this.calculatePhaseCoherence(phases),
                magnitudeClusters: this.findMagnitudeClusters(magnitudes),
                temporalSignature: this.extractTemporalSignature(transform)
            };
        }

        // Look for recursive loops (self-similar patterns)
        patterns.recursiveLoops = this.detectRecursivePatterns(fractionalAnalysis);

        // Identify temporal anomalies (non-causal relationships)
        patterns.temporalAnomalies = this.detectTemporalAnomalies(fractionalAnalysis);

        // Find causal inversions (effect preceding cause)
        patterns.causalInversions = this.detectCausalInversions(fractionalAnalysis);

        return patterns;
    }

    calculateStandardDeviation(values) {
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
        return Math.sqrt(variance);
    }

    calculatePhaseCoherence(phases) {
        if (phases.length < 2) return 0;
        
        // Calculate circular variance of phases
        let sumCos = 0, sumSin = 0;
        for (const phase of phases) {
            sumCos += Math.cos(phase);
            sumSin += Math.sin(phase);
        }
        
        const r = Math.sqrt(sumCos * sumCos + sumSin * sumSin) / phases.length;
        return r; // High r indicates high phase coherence
    }

    findMagnitudeClusters(magnitudes) {
        // Simple clustering to find groups of similar magnitudes
        const sorted = [...magnitudes].sort((a, b) => a - b);
        const clusters = [];
        let currentCluster = [sorted[0]];
        
        for (let i = 1; i < sorted.length; i++) {
            if (sorted[i] - sorted[i-1] < 0.1 * sorted[i]) {
                currentCluster.push(sorted[i]);
            } else {
                if (currentCluster.length > 1) {
                    clusters.push({
                        center: currentCluster.reduce((sum, val) => sum + val, 0) / currentCluster.length,
                        size: currentCluster.length,
                        range: [Math.min(...currentCluster), Math.max(...currentCluster)]
                    });
                }
                currentCluster = [sorted[i]];
            }
        }
        
        if (currentCluster.length > 1) {
            clusters.push({
                center: currentCluster.reduce((sum, val) => sum + val, 0) / currentCluster.length,
                size: currentCluster.length,
                range: [Math.min(...currentCluster), Math.max(...currentCluster)]
            });
        }
        
        return clusters;
    }

    extractTemporalSignature(transform) {
        // Extract unique temporal characteristics from the transform
        const magnitudes = transform.map(c => Math.sqrt(c.re * c.re + c.im * c.im));
        const phases = transform.map(c => Math.atan2(c.im, c.re));
        
        return {
            entropy: this.calculateEntropy(magnitudes),
            symmetryIndex: this.calculateSymmetryIndex(magnitudes),
            fractalDimension: this.estimateFractalDimension(magnitudes),
            informationContent: this.calculateInformationContent(transform)
        };
    }

    calculateEntropy(values) {
        // Calculate Shannon entropy of the magnitude distribution
        const total = values.reduce((sum, val) => sum + val, 0);
        if (total === 0) return 0;
        
        const probabilities = values.map(val => val / total).filter(p => p > 0);
        return -probabilities.reduce((entropy, p) => entropy + p * Math.log2(p), 0);
    }

    calculateSymmetryIndex(values) {
        // Measure how symmetric the distribution is around its center
        const n = values.length;
        let symmetryScore = 0;
        
        for (let i = 0; i < Math.floor(n/2); i++) {
            const leftVal = values[i];
            const rightVal = values[n - 1 - i];
            symmetryScore += Math.abs(leftVal - rightVal);
        }
        
        const maxVal = Math.max(...values);
        return maxVal > 0 ? 1 - (symmetryScore / (Math.floor(n/2) * maxVal)) : 1;
    }

    estimateFractalDimension(values) {
        // Simplified box-counting approach to estimate fractal dimension
        if (values.length < 4) return 1;
        
        const scales = [2, 4, 8, Math.min(16, Math.floor(values.length/2))];
        const counts = scales.map(scale => this.boxCount(values, scale));
        
        // Linear regression on log-log plot
        const logScales = scales.map(s => Math.log(1/s));
        const logCounts = counts.map(c => Math.log(c));
        
        return this.linearRegression(logScales, logCounts).slope;
    }

    boxCount(values, boxSize) {
        const boxes = new Set();
        for (let i = 0; i < values.length - 1; i++) {
            const x = Math.floor(i / boxSize);
            const y = Math.floor(values[i] * 100 / boxSize); // Scale values for counting
            boxes.add(`${x},${y}`);
        }
        return boxes.size;
    }

    linearRegression(x, y) {
        const n = x.length;
        const sumX = x.reduce((sum, val) => sum + val, 0);
        const sumY = y.reduce((sum, val) => sum + val, 0);
        const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
        const sumXX = x.reduce((sum, val) => sum + val * val, 0);
        
        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;
        
        return { slope, intercept };
    }

    calculateInformationContent(transform) {
        // Calculate algorithmic information content (approximation)
        const magnitudes = transform.map(c => Math.sqrt(c.re * c.re + c.im * c.im));
        const quantized = magnitudes.map(mag => Math.floor(mag * 100) / 100);
        const unique = new Set(quantized);
        
        return Math.log2(unique.size) / Math.log2(magnitudes.length);
    }

    detectRecursivePatterns(fractionalAnalysis) {
        // Look for self-similar patterns across different scales and domains
        const patterns = [];
        const domains = Object.keys(fractionalAnalysis).filter(key => 
            key.endsWith('Patterns') || key.endsWith('Structures') || key.endsWith('Properties') || key.endsWith('Signatures')
        );

        for (const domain of domains) {
            const transforms = fractionalAnalysis[domain];
            for (const [signalName, transform] of Object.entries(transforms)) {
                const recursiveScore = this.calculateRecursiveness(transform);
                if (recursiveScore > 0.7) {
                    patterns.push({
                        domain,
                        signal: signalName,
                        recursiveness: recursiveScore,
                        selfSimilarityScale: this.findSelfSimilarScale(transform)
                    });
                }
            }
        }

        return patterns;
    }

    calculateRecursiveness(transform) {
        // Measure self-similarity at different scales
        const magnitudes = transform.map(c => Math.sqrt(c.re * c.re + c.im * c.im));
        let maxSimilarity = 0;
        
        // Check different scale relationships
        for (let scale = 2; scale <= 8; scale++) {
            const similarity = this.calculateScaleSimilarity(magnitudes, scale);
            maxSimilarity = Math.max(maxSimilarity, similarity);
        }
        
        return maxSimilarity;
    }

    calculateScaleSimilarity(values, scale) {
        if (values.length < scale * 2) return 0;
        
        const segmentLength = Math.floor(values.length / scale);
        const segments = [];
        
        for (let i = 0; i < scale; i++) {
            const start = i * segmentLength;
            const end = Math.min(start + segmentLength, values.length);
            segments.push(values.slice(start, end));
        }
        
        // Calculate average correlation between segments
        let totalCorrelation = 0;
        let comparisons = 0;
        
        for (let i = 0; i < segments.length; i++) {
            for (let j = i + 1; j < segments.length; j++) {
                totalCorrelation += this.calculateCorrelation(segments[i], segments[j]);
                comparisons++;
            }
        }
        
        return comparisons > 0 ? totalCorrelation / comparisons : 0;
    }

    calculateCorrelation(array1, array2) {
        const minLength = Math.min(array1.length, array2.length);
        if (minLength === 0) return 0;
        
        const a1 = array1.slice(0, minLength);
        const a2 = array2.slice(0, minLength);
        
        const mean1 = a1.reduce((sum, val) => sum + val, 0) / minLength;
        const mean2 = a2.reduce((sum, val) => sum + val, 0) / minLength;
        
        let numerator = 0;
        let sum1Sq = 0;
        let sum2Sq = 0;
        
        for (let i = 0; i < minLength; i++) {
            const diff1 = a1[i] - mean1;
            const diff2 = a2[i] - mean2;
            numerator += diff1 * diff2;
            sum1Sq += diff1 * diff1;
            sum2Sq += diff2 * diff2;
        }
        
        const denominator = Math.sqrt(sum1Sq * sum2Sq);
        return denominator > 0 ? numerator / denominator : 0;
    }

    findSelfSimilarScale(transform) {
        // Find the scale at which the pattern is most self-similar
        const magnitudes = transform.map(c => Math.sqrt(c.re * c.re + c.im * c.im));
        let bestScale = 2;
        let bestSimilarity = 0;
        
        for (let scale = 2; scale <= 8; scale++) {
            const similarity = this.calculateScaleSimilarity(magnitudes, scale);
            if (similarity > bestSimilarity) {
                bestSimilarity = similarity;
                bestScale = scale;
            }
        }
        
        return bestScale;
    }

    detectTemporalAnomalies(fractionalAnalysis) {
        // Look for patterns that suggest non-linear time relationships
        const anomalies = [];
        
        if (!fractionalAnalysis.temporalPatterns || !fractionalAnalysis.emergentProperties) {
            return anomalies;
        }
        
        // Compare temporal vs emergent domains for phase relationships
        const temporalSignals = Object.keys(fractionalAnalysis.temporalPatterns);
        const emergentSignals = Object.keys(fractionalAnalysis.emergentProperties);
        
        for (const signal of temporalSignals) {
            if (emergentSignals.includes(signal)) {
                const temporalPhases = fractionalAnalysis.temporalPatterns[signal]
                    .map(c => Math.atan2(c.im, c.re));
                const emergentPhases = fractionalAnalysis.emergentProperties[signal]
                    .map(c => Math.atan2(c.im, c.re));
                
                const phaseInversion = this.detectPhaseInversion(temporalPhases, emergentPhases);
                if (phaseInversion > 0.6) {
                    anomalies.push({
                        signal,
                        type: 'temporal_phase_inversion',
                        strength: phaseInversion,
                        description: 'Future states appear to influence past states'
                    });
                }
            }
        }
        
        return anomalies;
    }

    detectPhaseInversion(phases1, phases2) {
        // Detect if phase relationships are inverted (suggesting backward causality)
        const minLength = Math.min(phases1.length, phases2.length);
        if (minLength < 3) return 0;
        
        let inversionCount = 0;
        for (let i = 0; i < minLength - 1; i++) {
            const diff1 = phases1[i+1] - phases1[i];
            const diff2 = phases2[i+1] - phases2[i];
            
            // Normalize phase differences to [-π, π]
            const normDiff1 = Math.atan2(Math.sin(diff1), Math.cos(diff1));
            const normDiff2 = Math.atan2(Math.sin(diff2), Math.cos(diff2));
            
            // Check if phase changes are in opposite directions
            if (normDiff1 * normDiff2 < -0.5) {
                inversionCount++;
            }
        }
        
        return inversionCount / (minLength - 1);
    }

    detectCausalInversions(fractionalAnalysis) {
        // Look for patterns where effects seem to precede causes
        const inversions = [];
        
        if (!fractionalAnalysis.crossDomainCorrelations) {
            return inversions;
        }
        
        // Analyze cross-correlations for negative lag peaks (effect before cause)
        for (const [pairName, correlation] of Object.entries(fractionalAnalysis.crossDomainCorrelations)) {
            const magnitudes = correlation.map(c => Math.sqrt(c.re * c.re + c.im * c.im));
            const peakIndex = magnitudes.indexOf(Math.max(...magnitudes));
            const centerIndex = Math.floor(magnitudes.length / 2);
            
            if (peakIndex < centerIndex - 2) { // Significant negative lag
                const lag = peakIndex - centerIndex;
                const strength = magnitudes[peakIndex] / Math.max(...magnitudes);
                
                inversions.push({
                    signalPair: pairName,
                    lag,
                    strength,
                    type: 'causal_inversion',
                    description: `Effect appears ${Math.abs(lag)} steps before cause`
                });
            }
        }
        
        return inversions;
    }
}