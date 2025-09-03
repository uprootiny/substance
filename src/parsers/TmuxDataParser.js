import { createNoise2D } from 'simplex-noise';

export class TmuxDataParser {
    constructor() {
        this.noise2D = createNoise2D();
        
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
}