/**
 * RepositoryScanner - Comprehensive scanner for git repositories across ecosystem
 * Maps repositories to voxel garden patterns based on commit hashes, health, and metadata
 */

export class RepositoryScanner {
    constructor(eventSystem) {
        this.eventSystem = eventSystem;
        this.repositories = new Map();
        this.scorecards = new Map();
        this.commitPatterns = new Map();
        
        // Repository health metrics
        this.healthMetrics = {
            commitFrequency: new Map(),
            lastActivity: new Map(),
            branchCount: new Map(),
            fileTypes: new Map(),
            contributors: new Map(),
            issues: new Map(),
            stars: new Map(),
            size: new Map()
        };
        
        // Commit hash to flower pattern mapping
        this.hashToPatternMap = {
            '0': 'organic',
            '1': 'quadruple', 
            '2': 'pentagonal',
            '3': 'rosaceae',
            '4': 'fractal',
            '5': 'organic',
            '6': 'quadruple',
            '7': 'pentagonal', 
            '8': 'rosaceae',
            '9': 'fractal',
            'a': 'organic',
            'b': 'quadruple',
            'c': 'pentagonal',
            'd': 'rosaceae',
            'e': 'fractal',
            'f': 'organic'
        };
        
        this.initializeScanner();
    }

    initializeScanner() {
        this.eventSystem.subscribe('ecosystem.scan.start', this.startFullScan.bind(this));
        this.eventSystem.subscribe('repo.analyze', this.analyzeRepository.bind(this));
    }

    async startFullScan() {
        console.log('🔍 Starting comprehensive ecosystem scan...');
        
        this.eventSystem.emit('ecosystem.status', { 
            phase: 'scanning',
            message: 'Discovering repositories...' 
        });

        // Scan local repositories
        const localRepos = await this.scanLocalRepositories();
        
        // Scan GitHub repositories
        const githubRepos = await this.scanGitHubRepositories();
        
        // Scan additional servers (placeholder for implementation)
        const serverRepos = await this.scanServerRepositories();
        
        const allRepos = [...localRepos, ...githubRepos, ...serverRepos];
        
        console.log(`📊 Found ${allRepos.length} repositories across ecosystem`);
        
        // Analyze each repository
        for (const repo of allRepos) {
            await this.analyzeRepository({ payload: repo });
        }
        
        // Generate ecosystem visualization
        this.generateEcosystemVisualization();
    }

    async scanLocalRepositories() {
        console.log('📁 Scanning local repositories...');
        const localRepos = [];
        
        try {
            // Use a simulated list of known local repos for demo
            const knownLocalPaths = [
                '/home/uprootiny/smolGPT',
                '/home/uprootiny/tattoy',
                '/home/uprootiny/flashcards',
                '/home/uprootiny/dashboard',
                '/home/uprootiny/numerai-uprootiny',
                '/home/uprootiny/numerai-shiveringtopoi',
                '/home/uprootiny/substance-project'
            ];
            
            for (const path of knownLocalPaths) {
                const repoData = await this.analyzeLocalRepository(path);
                if (repoData) {
                    localRepos.push(repoData);
                }
            }
        } catch (error) {
            console.warn('Local scan limited due to environment constraints:', error.message);
        }
        
        return localRepos;
    }

    async analyzeLocalRepository(path) {
        try {
            // Mock local repository analysis (in browser we can't actually read filesystem)
            const repoName = path.split('/').pop();
            
            return {
                name: repoName,
                path: path,
                type: 'local',
                lastCommit: this.generateMockCommitHash(),
                commitCount: Math.floor(Math.random() * 500) + 10,
                branches: Math.floor(Math.random() * 10) + 1,
                lastActivity: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
                size: Math.floor(Math.random() * 10000) + 100,
                languages: this.inferLanguages(repoName),
                health: this.calculateRepositoryHealth(repoName, 'local')
            };
        } catch (error) {
            return null;
        }
    }

    async scanGitHubRepositories() {
        console.log('🐙 Scanning GitHub repositories...');
        const githubRepos = [];
        
        try {
            // Mock GitHub API response (replace with actual GitHub API calls)
            const mockGithubRepos = [
                'Adventures', 'agenda', 'agenty-tui', 'ai-book', 'ai-chatgpt', 
                'aider', 'api-service-core', 'BespokeSynth', 'Bloomberries',
                'bridgehead', 'calibrationclojures', 'ceramics-studio', 
                'chatbot-ui', 'chatGPT-discord-bot', 'chedi', 'substance'
            ];
            
            for (const repoName of mockGithubRepos) {
                const repoData = await this.analyzeGitHubRepository(repoName);
                githubRepos.push(repoData);
            }
        } catch (error) {
            console.warn('GitHub scan error:', error.message);
        }
        
        return githubRepos;
    }

    async analyzeGitHubRepository(repoName) {
        // Mock GitHub repository data
        return {
            name: repoName,
            fullName: `uprootiny/${repoName}`,
            type: 'github',
            url: `https://github.com/uprootiny/${repoName}`,
            lastCommit: this.generateMockCommitHash(),
            commitCount: Math.floor(Math.random() * 1000) + 5,
            branches: Math.floor(Math.random() * 15) + 1,
            lastActivity: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000),
            stars: Math.floor(Math.random() * 50),
            forks: Math.floor(Math.random() * 20),
            issues: Math.floor(Math.random() * 30),
            size: Math.floor(Math.random() * 50000) + 500,
            languages: this.inferLanguages(repoName),
            health: this.calculateRepositoryHealth(repoName, 'github'),
            visibility: Math.random() > 0.3 ? 'public' : 'private'
        };
    }

    async scanServerRepositories() {
        console.log('🖥️ Scanning server repositories...');
        
        // Mock server repositories across mesh
        const serverRepos = [
            {
                name: 'production-api',
                server: '45.90.121.59',
                path: '/var/www/api',
                type: 'server',
                status: 'active',
                lastCommit: this.generateMockCommitHash(),
                health: 0.9
            },
            {
                name: 'numerai-pipeline',
                server: '173.212.203.211', 
                path: '/home/numerai/pipeline',
                type: 'server',
                status: 'active',
                lastCommit: this.generateMockCommitHash(),
                health: 0.85
            },
            {
                name: 'backup-storage',
                server: '149.102.137.139',
                path: '/backup/repos',
                type: 'server', 
                status: 'archived',
                lastCommit: this.generateMockCommitHash(),
                health: 0.6
            }
        ];
        
        return serverRepos;
    }

    inferLanguages(repoName) {
        const languagePatterns = {
            'clj': ['clojure'],
            'js': ['javascript'],
            'py': ['python'],
            'api': ['javascript', 'typescript'],
            'ui': ['javascript', 'html', 'css'],
            'bot': ['python', 'javascript'],
            'dashboard': ['javascript', 'vue', 'react'],
            'numerai': ['python'],
            'synth': ['c++', 'audio'],
            'store': ['javascript', 'vue']
        };
        
        const name = repoName.toLowerCase();
        for (const [pattern, langs] of Object.entries(languagePatterns)) {
            if (name.includes(pattern)) {
                return langs;
            }
        }
        
        // Default language inference
        return ['javascript'];
    }

    calculateRepositoryHealth(repoName, type) {
        // Multi-factor health calculation
        let health = 0.5; // Base health
        
        // Age factor (newer = healthier)
        const ageBonus = Math.random() * 0.2;
        health += ageBonus;
        
        // Activity factor
        const activityBonus = Math.random() * 0.2;
        health += activityBonus;
        
        // Type bonus
        if (type === 'github') health += 0.1;
        if (type === 'server') health += 0.05;
        
        // Name-based health modifiers
        if (repoName.includes('ai') || repoName.includes('numerai')) health += 0.1;
        if (repoName.includes('dashboard') || repoName.includes('api')) health += 0.05;
        
        return Math.min(1.0, Math.max(0.1, health));
    }

    generateMockCommitHash() {
        const chars = '0123456789abcdef';
        let hash = '';
        for (let i = 0; i < 40; i++) {
            hash += chars[Math.floor(Math.random() * chars.length)];
        }
        return hash;
    }

    async analyzeRepository(event) {
        const repo = event.payload;
        
        // Create repository scorecard
        const scorecard = this.generateRepositoryScorecard(repo);
        this.scorecards.set(repo.name, scorecard);
        
        // Analyze commit patterns
        const commitPattern = this.analyzeCommitPatterns(repo);
        this.commitPatterns.set(repo.name, commitPattern);
        
        // Store repository data
        this.repositories.set(repo.name, repo);
        
        // Emit analysis complete event
        this.eventSystem.emit('repo.analysis.complete', {
            repository: repo,
            scorecard: scorecard,
            commitPattern: commitPattern
        });
    }

    generateRepositoryScorecard(repo) {
        const scorecard = {
            name: repo.name,
            type: repo.type,
            overallHealth: repo.health || 0.5,
            
            metrics: {
                activity: this.calculateActivityScore(repo),
                codeQuality: this.calculateCodeQualityScore(repo),
                maintenance: this.calculateMaintenanceScore(repo),
                community: this.calculateCommunityScore(repo),
                security: this.calculateSecurityScore(repo)
            },
            
            intentions: this.inferRepositoryIntentions(repo),
            callToAction: this.generateCallToAction(repo),
            status: this.determineRepositoryStatus(repo),
            
            visualization: {
                flowerType: this.commitHashToFlowerType(repo.lastCommit),
                complexity: repo.health,
                color: this.healthToColor(repo.health),
                size: this.normalizeSize(repo.size || 1000)
            }
        };
        
        return scorecard;
    }

    calculateActivityScore(repo) {
        const daysSinceActivity = (Date.now() - new Date(repo.lastActivity)) / (1000 * 60 * 60 * 24);
        
        if (daysSinceActivity < 7) return 0.9 + Math.random() * 0.1;
        if (daysSinceActivity < 30) return 0.7 + Math.random() * 0.2;
        if (daysSinceActivity < 90) return 0.5 + Math.random() * 0.2;
        return Math.max(0.1, 0.3 + Math.random() * 0.2);
    }

    calculateCodeQualityScore(repo) {
        let score = 0.5;
        
        // Language-based quality assumptions
        const languages = repo.languages || [];
        if (languages.includes('typescript')) score += 0.1;
        if (languages.includes('clojure')) score += 0.15;
        if (languages.includes('python')) score += 0.05;
        
        // Size-based quality (medium repos tend to be better structured)
        const size = repo.size || 1000;
        if (size > 1000 && size < 100000) score += 0.1;
        
        return Math.min(1.0, score + Math.random() * 0.2);
    }

    calculateMaintenanceScore(repo) {
        let score = 0.5;
        
        // Branch count indicates active maintenance
        const branches = repo.branches || 1;
        if (branches > 3) score += 0.1;
        if (branches > 10) score += 0.1;
        
        // Recent activity
        const daysSinceActivity = (Date.now() - new Date(repo.lastActivity)) / (1000 * 60 * 60 * 24);
        if (daysSinceActivity < 30) score += 0.2;
        
        return Math.min(1.0, score + Math.random() * 0.15);
    }

    calculateCommunityScore(repo) {
        if (repo.type !== 'github') return 0.3; // Non-GitHub repos have limited community metrics
        
        let score = 0.3;
        
        // Stars and forks indicate community interest
        const stars = repo.stars || 0;
        const forks = repo.forks || 0;
        
        if (stars > 5) score += 0.2;
        if (stars > 20) score += 0.2;
        if (forks > 2) score += 0.1;
        if (forks > 10) score += 0.1;
        
        return Math.min(1.0, score + Math.random() * 0.1);
    }

    calculateSecurityScore(repo) {
        let score = 0.6; // Assume reasonable baseline security
        
        // Public repos have different security considerations
        if (repo.visibility === 'public') score -= 0.1;
        if (repo.type === 'server') score += 0.1; // Server repos likely more secure
        
        // Recent activity suggests security maintenance
        const daysSinceActivity = (Date.now() - new Date(repo.lastActivity)) / (1000 * 60 * 60 * 24);
        if (daysSinceActivity < 30) score += 0.1;
        
        return Math.min(1.0, Math.max(0.2, score + Math.random() * 0.15));
    }

    inferRepositoryIntentions(repo) {
        const name = repo.name.toLowerCase();
        
        if (name.includes('api') || name.includes('service')) {
            return 'Provide robust API services and data integration';
        }
        if (name.includes('ui') || name.includes('dashboard')) {
            return 'Create intuitive user interfaces and visualizations';
        }
        if (name.includes('ai') || name.includes('bot')) {
            return 'Develop intelligent systems and automation';
        }
        if (name.includes('numerai')) {
            return 'Build predictive models and trading algorithms';
        }
        if (name.includes('store') || name.includes('shop')) {
            return 'Enable e-commerce and online transactions';
        }
        if (name.includes('game') || name.includes('synth')) {
            return 'Create interactive experiences and multimedia';
        }
        
        return 'Support development workflow and tools';
    }

    generateCallToAction(repo) {
        const health = repo.health || 0.5;
        const daysSinceActivity = (Date.now() - new Date(repo.lastActivity)) / (1000 * 60 * 60 * 24);
        
        if (health < 0.3) {
            return '🚨 Needs immediate attention - consider archiving or refactoring';
        }
        if (daysSinceActivity > 180) {
            return '⏰ Long dormant - review relevance and update dependencies';
        }
        if (health > 0.8 && repo.type === 'github' && repo.visibility === 'public') {
            return '🌟 Excellent health - consider promoting or documenting';
        }
        if (repo.type === 'local' && health > 0.6) {
            return '📤 Ready for deployment - consider pushing to production';
        }
        
        return '📋 Maintain regular updates and monitoring';
    }

    determineRepositoryStatus(repo) {
        const health = repo.health || 0.5;
        const daysSinceActivity = (Date.now() - new Date(repo.lastActivity)) / (1000 * 60 * 60 * 24);
        
        if (repo.status) return repo.status; // Server repos have explicit status
        
        if (health > 0.8 && daysSinceActivity < 7) return 'thriving';
        if (health > 0.6 && daysSinceActivity < 30) return 'active';
        if (health > 0.4 && daysSinceActivity < 90) return 'stable';
        if (daysSinceActivity > 365) return 'dormant';
        if (health < 0.3) return 'needs-attention';
        
        return 'maintenance';
    }

    commitHashToFlowerType(commitHash) {
        if (!commitHash || commitHash.length === 0) return 'organic';
        
        const firstChar = commitHash[0].toLowerCase();
        return this.hashToPatternMap[firstChar] || 'organic';
    }

    healthToColor(health) {
        if (health > 0.8) return '#50c878'; // Emerald green
        if (health > 0.6) return '#4ecdc4'; // Teal  
        if (health > 0.4) return '#ffe66d'; // Yellow
        if (health > 0.2) return '#ff8c42'; // Orange
        return '#ff6b6b'; // Red
    }

    normalizeSize(size) {
        // Normalize repository size to 0-1 range for visualization
        return Math.min(1.0, Math.log(size + 1) / Math.log(100000));
    }

    analyzeCommitPatterns(repo) {
        const hash = repo.lastCommit || '';
        
        return {
            hash: hash,
            pattern: this.extractHashPattern(hash),
            rhythm: this.inferCommitRhythm(repo),
            signature: this.generateCommitSignature(hash)
        };
    }

    extractHashPattern(hash) {
        if (!hash || hash.length < 8) return 'random';
        
        const first8 = hash.substring(0, 8);
        const uniqueChars = new Set(first8).size;
        
        if (uniqueChars <= 2) return 'repetitive';
        if (uniqueChars <= 4) return 'structured';  
        if (uniqueChars >= 7) return 'chaotic';
        return 'balanced';
    }

    inferCommitRhythm(repo) {
        const commitCount = repo.commitCount || 10;
        const daysSinceActivity = (Date.now() - new Date(repo.lastActivity)) / (1000 * 60 * 60 * 24);
        
        const avgCommitsPerDay = commitCount / Math.max(daysSinceActivity, 1);
        
        if (avgCommitsPerDay > 2) return 'intense';
        if (avgCommitsPerDay > 0.5) return 'steady';  
        if (avgCommitsPerDay > 0.1) return 'sporadic';
        return 'rare';
    }

    generateCommitSignature(hash) {
        if (!hash || hash.length < 16) return 'minimal';
        
        const hex = hash.substring(0, 16);
        const sum = hex.split('').reduce((acc, char) => acc + parseInt(char, 16), 0);
        
        const signatures = ['harmonic', 'rhythmic', 'melodic', 'percussive', 'ambient'];
        return signatures[sum % signatures.length];
    }

    generateEcosystemVisualization() {
        const ecosystemData = {
            repositories: Array.from(this.repositories.values()),
            scorecards: Array.from(this.scorecards.values()),
            commitPatterns: Array.from(this.commitPatterns.values()),
            
            summary: {
                totalRepos: this.repositories.size,
                healthyRepos: Array.from(this.scorecards.values()).filter(s => s.overallHealth > 0.6).length,
                activeRepos: Array.from(this.scorecards.values()).filter(s => s.status === 'active' || s.status === 'thriving').length,
                languageDistribution: this.calculateLanguageDistribution(),
                typeDistribution: this.calculateTypeDistribution()
            }
        };
        
        this.eventSystem.emit('ecosystem.visualization.ready', {
            data: ecosystemData,
            timestamp: Date.now()
        });
        
        console.log('🌻 Ecosystem visualization generated:', ecosystemData.summary);
    }

    calculateLanguageDistribution() {
        const langCounts = {};
        
        for (const repo of this.repositories.values()) {
            const languages = repo.languages || [];
            for (const lang of languages) {
                langCounts[lang] = (langCounts[lang] || 0) + 1;
            }
        }
        
        return langCounts;
    }

    calculateTypeDistribution() {
        const typeCounts = {};
        
        for (const repo of this.repositories.values()) {
            const type = repo.type || 'unknown';
            typeCounts[type] = (typeCounts[type] || 0) + 1;
        }
        
        return typeCounts;
    }

    // Public API methods
    getRepositoryScorecard(repoName) {
        return this.scorecards.get(repoName);
    }

    getEcosystemSummary() {
        return {
            totalRepositories: this.repositories.size,
            healthyRepositories: Array.from(this.scorecards.values()).filter(s => s.overallHealth > 0.6).length,
            languages: this.calculateLanguageDistribution(),
            types: this.calculateTypeDistribution()
        };
    }

    exportEcosystemData() {
        return {
            repositories: Object.fromEntries(this.repositories),
            scorecards: Object.fromEntries(this.scorecards),
            commitPatterns: Object.fromEntries(this.commitPatterns),
            exported: new Date().toISOString()
        };
    }
}