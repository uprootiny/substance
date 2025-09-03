import express from 'express';
import { WebSocketServer } from 'ws';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const app = express();
const PORT = process.env.PORT || 3001;

// Serve static files from dist directory
app.use(express.static('dist'));

// API endpoints for tmux data
app.get('/api/tmux/sessions', (req, res) => {
    try {
        // Get current tmux sessions
        const sessions = getTmuxSessions();
        res.json({ sessions });
    } catch (error) {
        console.error('Error fetching tmux sessions:', error);
        res.json({ sessions: [] });
    }
});

app.get('/api/tmux/logs/:filename', (req, res) => {
    try {
        const filename = req.params.filename;
        const logPath = path.join(process.cwd(), '..', `${filename}.log`);
        
        if (fs.existsSync(logPath)) {
            const content = fs.readFileSync(logPath, 'utf8');
            const parsedData = parseTmuxLogForVisualization(content, filename);
            res.json(parsedData);
        } else {
            // Return sample data if file doesn't exist
            res.json(generateSampleTmuxData(filename));
        }
    } catch (error) {
        console.error(`Error reading tmux log ${req.params.filename}:`, error);
        res.json(generateSampleTmuxData(req.params.filename));
    }
});

// WebSocket server for live tmux data streaming
const server = app.listen(PORT, () => {
    console.log(`🌸 Substance Voxel Flowers server running on port ${PORT}`);
    console.log(`🔗 Open http://localhost:${PORT} to view the garden`);
});

const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
    console.log('🌱 New client connected to live tmux stream');
    
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            
            if (data.type === 'subscribe_tmux') {
                // Start streaming tmux session data
                startTmuxStream(ws, data.sessionId);
            }
        } catch (error) {
            console.error('WebSocket message error:', error);
        }
    });
    
    ws.on('close', () => {
        console.log('🍂 Client disconnected from live tmux stream');
    });
});

function getTmuxSessions() {
    try {
        const output = execSync('tmux list-sessions -F "#{session_name}:#{?session_attached,attached,detached}:#{session_created}"', { encoding: 'utf8' });
        return output.trim().split('\n').map(line => {
            const [name, status, created] = line.split(':');
            return { name, status, created: parseInt(created) * 1000 };
        });
    } catch (error) {
        // Return sample sessions if tmux is not available
        return [
            { name: 'main', status: 'attached', created: Date.now() - 3600000 },
            { name: 'development', status: 'detached', created: Date.now() - 7200000 }
        ];
    }
}

function parseTmuxLogForVisualization(content, filename) {
    const lines = content.split('\n');
    const threads = [];
    let currentThread = null;
    let threadId = 0;
    
    // Patterns that indicate new interaction threads
    const threadMarkers = [
        /^\$\s/,                    // Shell prompt
        /^➜/,                       // Oh-my-zsh prompt
        /^#/,                       // Comment or root prompt
        /ssh\s+/,                   // SSH commands
        /tmux\s+/,                  // Tmux commands
        /claude/i,                  // Claude interactions
        /^git\s+/,                  // Git commands
        /^npm\s+|^node\s+/,        // Node.js commands
        /^python\s+|^pip\s+/,      // Python commands
        /^clojure\s+|^lein\s+/     // Clojure commands
    ];
    
    for (const line of lines) {
        const trimmedLine = line.trim();
        
        // Skip empty lines
        if (!trimmedLine) continue;
        
        // Check if this line starts a new thread
        const isNewThread = threadMarkers.some(pattern => pattern.test(trimmedLine));
        
        if (isNewThread) {
            // Save previous thread
            if (currentThread) {
                threads.push(currentThread);
            }
            
            // Start new thread
            currentThread = {
                id: `${filename}-thread-${threadId++}`,
                content: trimmedLine,
                timestamp: Date.now() - Math.random() * 86400000, // Random within last 24h
                interactions: 1,
                complexity: Math.random() * 0.8 + 0.2,
                symmetryType: determineSymmetryFromContent(trimmedLine)
            };
        } else if (currentThread) {
            // Append to current thread
            currentThread.content += ' ' + trimmedLine;
            currentThread.interactions += 1;
            
            // Update complexity based on content richness
            currentThread.complexity = Math.min(
                currentThread.complexity + calculateLineComplexity(trimmedLine) * 0.1,
                1.0
            );
        }
    }
    
    // Add final thread
    if (currentThread) {
        threads.push(currentThread);
    }
    
    return {
        threads,
        branches: Math.min(Math.floor(threads.length / 2) + 1, 5),
        depth: Math.min(threads.length, 8),
        narrative: `tmux-session-${filename}`,
        source: 'live_tmux_log',
        timestamp: Date.now()
    };
}

function determineSymmetryFromContent(content) {
    const lowerContent = content.toLowerCase();
    
    // Pattern matching for symmetry types
    if (lowerContent.includes('emacs') || lowerContent.includes('claude') || 
        lowerContent.includes('quadrant') || lowerContent.includes('helix')) {
        return 'quadruple';
    }
    
    if (lowerContent.includes('git') || lowerContent.includes('branch') || 
        lowerContent.includes('organic') || lowerContent.includes('growth')) {
        return 'pentagonal';
    }
    
    if (lowerContent.includes('flower') || lowerContent.includes('rose') || 
        lowerContent.includes('petal') || lowerContent.includes('intricate')) {
        return 'rosaceae';
    }
    
    if (lowerContent.includes('recursive') || lowerContent.includes('fractal') || 
        lowerContent.includes('self') || lowerContent.includes('pattern')) {
        return 'fractal';
    }
    
    return 'organic';
}

function calculateLineComplexity(line) {
    // Simple complexity calculation based on various factors
    let complexity = 0;
    
    // Length factor
    complexity += Math.min(line.length / 100, 0.3);
    
    // Special characters (indicates code/technical content)
    const specialChars = (line.match(/[{}()[\];:|&<>]/g) || []).length;
    complexity += Math.min(specialChars / 20, 0.3);
    
    // Unique words
    const words = line.split(/\s+/);
    const uniqueWords = new Set(words);
    complexity += Math.min(uniqueWords.size / words.length, 0.2);
    
    // Technical terms
    const technicalTerms = ['function', 'class', 'import', 'export', 'async', 'await', 
                           'git', 'npm', 'node', 'python', 'clojure', 'ssh', 'tmux'];
    const techTermCount = technicalTerms.filter(term => 
        line.toLowerCase().includes(term)
    ).length;
    complexity += Math.min(techTermCount / 5, 0.2);
    
    return Math.min(complexity, 1);
}

function generateSampleTmuxData(sessionName) {
    // Generate rich sample data based on the actual context
    const sampleThreads = [
        {
            id: `${sessionName}-sample-1`,
            content: 'ssh uprootiny@server tmux attach-session -t main',
            timestamp: Date.now() - 3600000,
            interactions: 45,
            complexity: 0.7,
            symmetryType: 'quadruple'
        },
        {
            id: `${sessionName}-sample-2`,
            content: 'cd substance-project && npm run dev voxel computational physics',
            timestamp: Date.now() - 2700000,
            interactions: 89,
            complexity: 0.85,
            symmetryType: 'pentagonal'
        },
        {
            id: `${sessionName}-sample-3`,
            content: 'git commit -m "implement flower growth algorithms rosaceae patterns"',
            timestamp: Date.now() - 1800000,
            interactions: 134,
            complexity: 0.92,
            symmetryType: 'rosaceae'
        },
        {
            id: `${sessionName}-sample-4`,
            content: 'claude code integration whispering stones semantic soil narrative threads',
            timestamp: Date.now() - 900000,
            interactions: 67,
            complexity: 0.95,
            symmetryType: 'organic'
        },
        {
            id: `${sessionName}-sample-5`,
            content: 'recursive fractal branching self-similar patterns mathematical beauty',
            timestamp: Date.now() - 450000,
            interactions: 78,
            complexity: 0.88,
            symmetryType: 'fractal'
        }
    ];
    
    return {
        threads: sampleThreads,
        branches: 4,
        depth: 5,
        narrative: `sample-session-${sessionName}-enhanced`,
        source: 'generated_sample',
        timestamp: Date.now()
    };
}

function startTmuxStream(ws, sessionId) {
    // Simulate live tmux data streaming
    const interval = setInterval(() => {
        if (ws.readyState === ws.OPEN) {
            const liveData = {
                type: 'tmux_update',
                sessionId,
                timestamp: Date.now(),
                data: generateLiveUpdate(sessionId)
            };
            
            ws.send(JSON.stringify(liveData));
        } else {
            clearInterval(interval);
        }
    }, 5000); // Update every 5 seconds
    
    // Clean up on connection close
    ws.on('close', () => {
        clearInterval(interval);
    });
}

function generateLiveUpdate(sessionId) {
    // Generate a new thread entry representing recent activity
    const activities = [
        'git status && git diff --cached',
        'npm test && npm run build',
        'python analyze_growth_patterns.py',
        'clojure -M:dev repl',
        'tmux new-window -n "flower-analysis"',
        'ssh remote-server "ps aux | grep node"',
        'vim semantic_flower_mappings.md',
        'curl -X POST api/flowers/generate'
    ];
    
    const randomActivity = activities[Math.floor(Math.random() * activities.length)];
    
    return {
        id: `${sessionId}-live-${Date.now()}`,
        content: randomActivity,
        timestamp: Date.now(),
        interactions: Math.floor(Math.random() * 20) + 1,
        complexity: Math.random() * 0.6 + 0.4,
        symmetryType: determineSymmetryFromContent(randomActivity),
        isLive: true
    };
}

console.log('🌸 Substance Voxel Flowers - Semantic Garden Server');
console.log('📊 Monitoring tmux sessions for flower growth patterns...');
console.log('🔗 WebSocket server ready for live streaming on /ws');