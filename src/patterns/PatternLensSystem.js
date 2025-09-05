/**
 * PatternLensSystem - Advanced filtering and pattern recognition for repository garden
 * Implements lens-based access patterns, hash morphing, and dynamic filtering
 */

export class PatternLensSystem {
    constructor(eventSystem) {
        this.eventSystem = eventSystem;
        this.lenses = new Map();
        this.filters = new Map();
        this.hashMorphers = new Map();
        this.patternIterators = new Map();
        
        // Pattern access history for learning
        this.accessHistory = [];
        this.patternFrequency = new Map();
        this.morphingRules = new Map();
        
        // Real-time pattern analysis
        this.activePatterns = new Set();
        this.patternTransitions = new Map();
        
        this.initializeCoreLenses();
        this.initializeHashMorphers();
        this.initializeFilters();
    }

    initializeCoreLenses() {
        // Repository Quality Lens - focus on code quality metrics
        this.registerLens('quality', {
            filter: (repos) => repos.filter(r => r.scorecard.quality >= 90),
            transform: (repo) => ({
                ...repo,
                emphasis: repo.scorecard.quality / 100,
                pattern: this.qualityToPattern(repo.scorecard.quality),
                luminosity: Math.max(0.3, repo.scorecard.quality / 100)
            })
        });
        
        // Temporal Activity Lens - focus on recent activity
        this.registerLens('temporal', {
            filter: (repos) => repos.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)),
            transform: (repo) => ({
                ...repo,
                recency: this.calculateRecency(repo.timestamp),
                urgency: this.calculateUrgency(repo.timestamp, repo.scorecard.issues),
                temporalPattern: this.timeToPattern(repo.timestamp)
            })
        });
        
        // Complexity Lens - focus on cognitive and technical complexity
        this.registerLens('complexity', {
            filter: (repos) => repos.filter(r => r.complexity > 0.8),
            transform: (repo) => ({
                ...repo,
                complexityRing: this.complexityToRingPattern(repo.complexity),
                cognitiveWeight: repo.scorecard.cognitiveLoad / 4.0,
                fractalDepth: Math.floor(repo.complexity * 7) + 3
            })
        });
        
        // Health Lens - focus on repository health and maintenance
        this.registerLens('health', {
            filter: (repos) => repos,
            transform: (repo) => ({
                ...repo,
                healthColor: this.healthToColor(repo.health),
                maintenance: this.calculateMaintenanceLevel(repo),
                vitality: Math.max(0.2, repo.health * (1 - repo.scorecard.issues / 10))
            })
        });
        
        // Innovation Lens - focus on cutting-edge and experimental repos
        this.registerLens('innovation', {
            filter: (repos) => repos.filter(r => 
                r.intention.includes('experimental') || 
                r.intention.includes('topological') ||
                r.intention.includes('AI') ||
                r.complexity > 0.9
            ),
            transform: (repo) => ({
                ...repo,
                innovationIndex: this.calculateInnovationIndex(repo),
                experimentalPattern: this.generateExperimentalPattern(repo),
                pioneering: repo.complexity * repo.health
            })
        });
    }

    initializeHashMorphers() {
        // Commit Hash Evolution - morph patterns over time
        this.registerHashMorpher('evolution', {
            morph: (hash, time) => {
                const baseChar = hash.charAt(0);
                const timeInfluence = Math.floor((time / 10000) % 16);
                const morphedChar = (parseInt(baseChar, 16) + timeInfluence) % 16;
                return morphedChar.toString(16);
            },
            pattern: 'temporal-drift'
        });
        
        // Repository Interaction Morpher - change based on user interaction
        this.registerHashMorpher('interaction', {
            morph: (hash, interactionCount) => {
                const chars = hash.split('');
                const morphIndex = interactionCount % chars.length;
                const currentChar = chars[morphIndex];
                const morphedChar = (parseInt(currentChar, 16) + 1) % 16;
                chars[morphIndex] = morphedChar.toString(16);
                return chars.join('');
            },
            pattern: 'user-responsive'
        });
        
        // Quality-based Morpher - evolve patterns based on repository health
        this.registerHashMorpher('quality', {
            morph: (hash, quality) => {
                const qualityFactor = Math.floor(quality / 10);
                return hash.split('').map(char => {
                    const val = parseInt(char, 16);
                    return ((val + qualityFactor) % 16).toString(16);
                }).join('');
            },
            pattern: 'health-evolution'
        });
    }

    initializeFilters() {
        // Language-based filtering
        this.registerFilter('language', {
            test: (repo, filterValue) => {
                return repo.language === filterValue || 
                       repo.content.toLowerCase().includes(filterValue.toLowerCase());
            }
        });
        
        // Commit frequency filtering
        this.registerFilter('activity', {
            test: (repo, threshold) => {
                const daysSinceUpdate = (Date.now() - repo.timestamp) / (1000 * 60 * 60 * 24);
                return daysSinceUpdate <= threshold;
            }
        });
        
        // Quality threshold filtering
        this.registerFilter('quality-threshold', {
            test: (repo, minQuality) => {
                return repo.scorecard.quality >= minQuality;
            }
        });
        
        // Issue count filtering
        this.registerFilter('issues', {
            test: (repo, maxIssues) => {
                return repo.scorecard.issues <= maxIssues;
            }
        });
        
        // Pattern type filtering
        this.registerFilter('pattern', {
            test: (repo, patternType) => {
                return repo.symmetryType === patternType;
            }
        });
    }

    // Apply lens to repository data
    applyLens(lensName, repositories) {
        if (!this.lenses.has(lensName)) {
            console.warn(`Lens '${lensName}' not found`);
            return repositories;
        }
        
        const lens = this.lenses.get(lensName);
        const filtered = lens.filter(repositories);
        const transformed = filtered.map(lens.transform);
        
        // Track lens usage
        this.recordLensUsage(lensName, transformed.length);
        
        return transformed;
    }

    // Apply multiple lenses in sequence
    applyLensStack(lensNames, repositories) {
        return lensNames.reduce((repos, lensName) => {
            return this.applyLens(lensName, repos);
        }, repositories);
    }

    // Apply hash morphing to repository
    morphHash(repository, morpherType, factor) {
        if (!this.hashMorphers.has(morpherType)) {
            return repository.commitHash;
        }
        
        const morpher = this.hashMorphers.get(morpherType);
        const morphedHash = morpher.morph(repository.commitHash, factor);
        
        // Update pattern based on morphed hash
        const newPattern = this.hashToPattern(morphedHash);
        
        return {
            ...repository,
            originalHash: repository.commitHash,
            commitHash: morphedHash,
            symmetryType: newPattern,
            morphType: morpherType,
            morphFactor: factor
        };
    }

    // Filter repositories by multiple criteria
    filterRepositories(repositories, filters) {
        return repositories.filter(repo => {
            return Object.entries(filters).every(([filterName, filterValue]) => {
                const filter = this.filters.get(filterName);
                return filter ? filter.test(repo, filterValue) : true;
            });
        });
    }

    // Create dynamic pattern iterator
    createPatternIterator(repositories, iterationSpeed = 1000) {
        const iteratorId = `iter_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const iterator = {
            repositories: [...repositories],
            currentIndex: 0,
            morphStates: new Map(),
            active: false,
            speed: iterationSpeed
        };
        
        this.patternIterators.set(iteratorId, iterator);
        
        return iteratorId;
    }

    // Start pattern iteration
    startPatternIteration(iteratorId) {
        const iterator = this.patternIterators.get(iteratorId);
        if (!iterator) return;
        
        iterator.active = true;
        
        const iterate = () => {
            if (!iterator.active) return;
            
            const currentRepo = iterator.repositories[iterator.currentIndex];
            
            // Apply time-based morphing
            const morphedRepo = this.morphHash(currentRepo, 'evolution', Date.now());
            
            // Emit pattern change event
            this.eventSystem.emit('pattern.iteration', {
                iteratorId,
                repository: morphedRepo,
                index: iterator.currentIndex,
                total: iterator.repositories.length
            });
            
            // Move to next repository
            iterator.currentIndex = (iterator.currentIndex + 1) % iterator.repositories.length;
            
            // Schedule next iteration
            setTimeout(iterate, iterator.speed);
        };
        
        iterate();
    }

    // Advanced pattern analysis
    analyzePatternDistribution(repositories) {
        const distribution = {};
        const transitionMatrix = {};
        
        repositories.forEach((repo, index) => {
            const pattern = repo.symmetryType;
            distribution[pattern] = (distribution[pattern] || 0) + 1;
            
            // Analyze transitions between patterns
            if (index > 0) {
                const prevPattern = repositories[index - 1].symmetryType;
                if (!transitionMatrix[prevPattern]) {
                    transitionMatrix[prevPattern] = {};
                }
                transitionMatrix[prevPattern][pattern] = 
                    (transitionMatrix[prevPattern][pattern] || 0) + 1;
            }
        });
        
        return {
            distribution,
            transitionMatrix,
            entropy: this.calculatePatternEntropy(distribution),
            diversity: Object.keys(distribution).length,
            mostFrequent: Object.entries(distribution)
                .sort(([,a], [,b]) => b - a)[0]
        };
    }

    // Helper methods
    registerLens(name, lens) {
        this.lenses.set(name, lens);
    }

    registerHashMorpher(name, morpher) {
        this.hashMorphers.set(name, morpher);
    }

    registerFilter(name, filter) {
        this.filters.set(name, filter);
    }

    hashToPattern(hash) {
        const patternMap = {
            '0': 'organic', '1': 'quadruple', '2': 'pentagonal', '3': 'rosaceae', '4': 'fractal',
            '5': 'organic', '6': 'quadruple', '7': 'pentagonal', '8': 'rosaceae', '9': 'fractal',
            'a': 'organic', 'b': 'quadruple', 'c': 'pentagonal', 'd': 'rosaceae', 'e': 'fractal', 'f': 'organic'
        };
        return patternMap[hash.charAt(0)] || 'organic';
    }

    qualityToPattern(quality) {
        if (quality >= 95) return 'fractal';
        if (quality >= 90) return 'rosaceae';
        if (quality >= 85) return 'pentagonal';
        if (quality >= 80) return 'quadruple';
        return 'organic';
    }

    complexityToRingPattern(complexity) {
        return Math.floor(complexity * 8) + 2; // 2-10 rings
    }

    healthToColor(health) {
        const hue = health * 120; // Green (120) to Red (0)
        return `hsl(${hue}, 70%, 60%)`;
    }

    calculateRecency(timestamp) {
        const now = Date.now();
        const age = now - timestamp;
        const dayInMs = 24 * 60 * 60 * 1000;
        return Math.max(0, 1 - (age / (30 * dayInMs))); // Decay over 30 days
    }

    calculateUrgency(timestamp, issues) {
        const recency = this.calculateRecency(timestamp);
        const issueWeight = Math.min(1, issues / 5);
        return recency * 0.7 + issueWeight * 0.3;
    }

    calculateInnovationIndex(repo) {
        let index = 0;
        
        // Complexity factor
        index += repo.complexity * 0.3;
        
        // Keywords in intention/content
        const innovativeKeywords = [
            'AI', 'ML', 'topological', 'fractal', 'quantum', 'neural',
            'experimental', 'research', 'cutting-edge', 'advanced'
        ];
        
        const keywordScore = innovativeKeywords.reduce((score, keyword) => {
            return score + (repo.intention.includes(keyword) ? 0.1 : 0);
        }, 0);
        
        index += keywordScore;
        
        // High quality with high complexity
        if (repo.scorecard.quality > 90 && repo.complexity > 0.9) {
            index += 0.2;
        }
        
        return Math.min(1, index);
    }

    calculateMaintenanceLevel(repo) {
        const qualityFactor = repo.scorecard.quality / 100;
        const coverageFactor = repo.scorecard.coverage / 100;
        const issueFactor = Math.max(0, 1 - repo.scorecard.issues / 10);
        const recencyFactor = this.calculateRecency(repo.timestamp);
        
        return (qualityFactor + coverageFactor + issueFactor + recencyFactor) / 4;
    }

    calculatePatternEntropy(distribution) {
        const total = Object.values(distribution).reduce((a, b) => a + b, 0);
        return Object.values(distribution).reduce((entropy, count) => {
            const p = count / total;
            return entropy - (p > 0 ? p * Math.log2(p) : 0);
        }, 0);
    }

    recordLensUsage(lensName, resultCount) {
        this.accessHistory.push({
            lens: lensName,
            timestamp: Date.now(),
            resultCount
        });
        
        // Keep last 1000 accesses
        if (this.accessHistory.length > 1000) {
            this.accessHistory.shift();
        }
        
        // Update frequency map
        this.patternFrequency.set(lensName, (this.patternFrequency.get(lensName) || 0) + 1);
    }

    // Get lens usage analytics
    getLensAnalytics() {
        const totalUsage = Array.from(this.patternFrequency.values()).reduce((a, b) => a + b, 0);
        const analytics = {
            totalAccesses: totalUsage,
            lensUsage: Array.from(this.patternFrequency.entries())
                .map(([lens, count]) => ({
                    lens,
                    count,
                    percentage: (count / totalUsage * 100).toFixed(1)
                }))
                .sort((a, b) => b.count - a.count),
            recentActivity: this.accessHistory.slice(-10)
        };
        
        return analytics;
    }
}