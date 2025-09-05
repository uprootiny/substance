/**
 * SonicResonance - Acoustic pattern analysis for voxel garden generation
 * Converts whirring sounds and acoustic signatures into flowering patterns
 */

export class SonicResonance {
    constructor(eventSystem) {
        this.eventSystem = eventSystem;
        this.audioContext = null;
        this.analyzer = null;
        this.microphone = null;
        this.isListening = false;
        
        // Acoustic analysis buffers
        this.frequencyData = null;
        this.timeData = null;
        this.resonanceHistory = [];
        this.whirringPatterns = new Map();
        
        // Whirring signature patterns
        this.whirrSignatures = {
            mechanical: {
                fundamentalFreq: [200, 800],
                harmonics: [2, 3, 5],
                amplitude: 0.6,
                stability: 0.8,
                flowerType: 'quadruple'
            },
            organic: {
                fundamentalFreq: [80, 300],
                harmonics: [1.618, 2.618, 4.236], // Golden ratio harmonics
                amplitude: 0.4,
                stability: 0.3,
                flowerType: 'organic'
            },
            digital: {
                fundamentalFreq: [1000, 4000],
                harmonics: [2, 4, 8, 16],
                amplitude: 0.8,
                stability: 0.95,
                flowerType: 'fractal'
            },
            wind: {
                fundamentalFreq: [50, 150],
                harmonics: [1.5, 2.3, 3.7],
                amplitude: 0.2,
                stability: 0.1,
                flowerType: 'rosaceae'
            },
            spinning: {
                fundamentalFreq: [300, 1200],
                harmonics: [5, 10, 15], // Pentagonal resonance
                amplitude: 0.7,
                stability: 0.6,
                flowerType: 'pentagonal'
            }
        };
        
        // Initialize audio processing
        this.initializeAudioContext();
        this.setupEventHandlers();
    }

    async initializeAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.analyzer = this.audioContext.createAnalyser();
            
            // Configure analyzer for whirring detection
            this.analyzer.fftSize = 2048;
            this.analyzer.smoothingTimeConstant = 0.8;
            
            this.frequencyData = new Uint8Array(this.analyzer.frequencyBinCount);
            this.timeData = new Uint8Array(this.analyzer.fftSize);
            
            console.log('🔊 Sonic resonance system initialized');
            
            this.eventSystem.emit('sonic.initialized', {
                sampleRate: this.audioContext.sampleRate,
                fftSize: this.analyzer.fftSize
            });
            
        } catch (error) {
            console.error('Failed to initialize audio context:', error);
            this.eventSystem.emit('sonic.error', { error: error.message });
        }
    }

    setupEventHandlers() {
        // Listen for user interaction events to start audio
        this.eventSystem.subscribe('user.interaction', () => {
            if (!this.isListening && this.audioContext?.state === 'suspended') {
                this.resumeAudioContext();
            }
        });

        // Listen for whirring activation events
        this.eventSystem.subscribe('whirr.activate', () => {
            this.startListening();
        });

        this.eventSystem.subscribe('whirr.deactivate', () => {
            this.stopListening();
        });
    }

    async resumeAudioContext() {
        try {
            await this.audioContext.resume();
            console.log('🔊 Audio context resumed');
        } catch (error) {
            console.error('Failed to resume audio context:', error);
        }
    }

    async startListening() {
        if (this.isListening) return;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: false,
                    noiseSuppression: false,
                    autoGainControl: false
                } 
            });
            
            this.microphone = this.audioContext.createMediaStreamSource(stream);
            this.microphone.connect(this.analyzer);
            
            this.isListening = true;
            this.startAnalysisLoop();
            
            console.log('🎤 Started listening for whirring sounds...');
            this.eventSystem.emit('sonic.listening.started', {
                timestamp: Date.now()
            });
            
        } catch (error) {
            console.error('Failed to access microphone:', error);
            this.eventSystem.emit('sonic.error', { 
                error: 'Microphone access denied',
                details: error.message 
            });
        }
    }

    stopListening() {
        if (!this.isListening) return;

        if (this.microphone) {
            this.microphone.disconnect();
            this.microphone = null;
        }

        this.isListening = false;
        
        console.log('🔇 Stopped listening for sounds');
        this.eventSystem.emit('sonic.listening.stopped', {
            timestamp: Date.now(),
            totalPatterns: this.whirringPatterns.size
        });
    }

    startAnalysisLoop() {
        const analyze = () => {
            if (!this.isListening) return;

            // Get frequency and time domain data
            this.analyzer.getByteFrequencyData(this.frequencyData);
            this.analyzer.getByteTimeDomainData(this.timeData);

            // Analyze for whirring patterns
            const whirrAnalysis = this.analyzeWhirringPattern();
            
            if (whirrAnalysis.detected) {
                this.processWhirringEvent(whirrAnalysis);
            }

            // Continue analysis loop
            requestAnimationFrame(analyze);
        };

        analyze();
    }

    analyzeWhirringPattern() {
        const analysis = {
            detected: false,
            type: null,
            confidence: 0,
            frequencies: [],
            harmonics: [],
            amplitude: 0,
            stability: 0,
            resonance: 0,
            timestamp: Date.now()
        };

        // Calculate RMS amplitude
        let sum = 0;
        for (let i = 0; i < this.timeData.length; i++) {
            const sample = (this.timeData[i] - 128) / 128;
            sum += sample * sample;
        }
        analysis.amplitude = Math.sqrt(sum / this.timeData.length);

        // Find dominant frequencies
        const frequencies = this.findDominantFrequencies();
        analysis.frequencies = frequencies;

        // Detect harmonic series
        if (frequencies.length >= 2) {
            analysis.harmonics = this.detectHarmonics(frequencies);
        }

        // Calculate frequency stability
        analysis.stability = this.calculateStability();

        // Match against whirring signatures
        const match = this.matchWhirringSignature(analysis);
        if (match.confidence > 0.4) {
            analysis.detected = true;
            analysis.type = match.type;
            analysis.confidence = match.confidence;
            analysis.resonance = this.calculateResonance(analysis);
        }

        // Store in history
        this.resonanceHistory.push(analysis);
        if (this.resonanceHistory.length > 100) {
            this.resonanceHistory.shift();
        }

        return analysis;
    }

    findDominantFrequencies() {
        const frequencies = [];
        const threshold = 100; // Minimum amplitude threshold
        const nyquist = this.audioContext.sampleRate / 2;
        const binWidth = nyquist / this.frequencyData.length;

        // Find peaks in frequency spectrum
        for (let i = 2; i < this.frequencyData.length - 2; i++) {
            const current = this.frequencyData[i];
            
            if (current > threshold &&
                current > this.frequencyData[i - 1] &&
                current > this.frequencyData[i + 1] &&
                current > this.frequencyData[i - 2] &&
                current > this.frequencyData[i + 2]) {
                
                frequencies.push({
                    frequency: i * binWidth,
                    amplitude: current / 255,
                    bin: i
                });
            }
        }

        // Sort by amplitude and return top frequencies
        return frequencies
            .sort((a, b) => b.amplitude - a.amplitude)
            .slice(0, 10);
    }

    detectHarmonics(frequencies) {
        if (frequencies.length < 2) return [];

        const fundamental = frequencies[0].frequency;
        const harmonics = [];

        for (let i = 1; i < frequencies.length; i++) {
            const freq = frequencies[i].frequency;
            const ratio = freq / fundamental;
            
            // Check if this frequency is a harmonic
            if (Math.abs(ratio - Math.round(ratio)) < 0.1) {
                harmonics.push({
                    frequency: freq,
                    ratio: ratio,
                    amplitude: frequencies[i].amplitude
                });
            }
        }

        return harmonics;
    }

    calculateStability() {
        if (this.resonanceHistory.length < 5) return 0;

        const recent = this.resonanceHistory.slice(-5);
        const avgAmplitude = recent.reduce((sum, r) => sum + r.amplitude, 0) / recent.length;
        
        // Calculate variance in amplitude
        const variance = recent.reduce((sum, r) => {
            return sum + Math.pow(r.amplitude - avgAmplitude, 2);
        }, 0) / recent.length;

        // Return inverse of variance (higher stability = lower variance)
        return Math.max(0, 1 - Math.sqrt(variance));
    }

    matchWhirringSignature(analysis) {
        let bestMatch = { type: null, confidence: 0 };

        for (const [type, signature] of Object.entries(this.whirrSignatures)) {
            let confidence = 0;

            // Check fundamental frequency range
            if (analysis.frequencies.length > 0) {
                const fundamental = analysis.frequencies[0].frequency;
                if (fundamental >= signature.fundamentalFreq[0] && 
                    fundamental <= signature.fundamentalFreq[1]) {
                    confidence += 0.3;
                }
            }

            // Check harmonic structure
            if (analysis.harmonics.length > 0) {
                const harmonicMatch = this.compareHarmonics(analysis.harmonics, signature.harmonics);
                confidence += harmonicMatch * 0.3;
            }

            // Check amplitude range
            const ampDiff = Math.abs(analysis.amplitude - signature.amplitude);
            confidence += Math.max(0, 0.2 - ampDiff);

            // Check stability
            const stabilityDiff = Math.abs(analysis.stability - signature.stability);
            confidence += Math.max(0, 0.2 - stabilityDiff);

            if (confidence > bestMatch.confidence) {
                bestMatch = { type, confidence };
            }
        }

        return bestMatch;
    }

    compareHarmonics(detectedHarmonics, expectedRatios) {
        let matches = 0;
        
        for (const expectedRatio of expectedRatios) {
            for (const harmonic of detectedHarmonics) {
                if (Math.abs(harmonic.ratio - expectedRatio) < 0.2) {
                    matches++;
                    break;
                }
            }
        }

        return matches / expectedRatios.length;
    }

    calculateResonance(analysis) {
        // Combine multiple factors into resonance metric
        const frequencyFactor = Math.min(1, analysis.frequencies.length / 5);
        const harmonicFactor = Math.min(1, analysis.harmonics.length / 3);
        const amplitudeFactor = Math.min(1, analysis.amplitude * 2);
        const stabilityFactor = analysis.stability;

        return (frequencyFactor + harmonicFactor + amplitudeFactor + stabilityFactor) / 4;
    }

    processWhirringEvent(analysis) {
        // Store whirring pattern
        const patternId = `whirr_${Date.now()}`;
        this.whirringPatterns.set(patternId, analysis);

        // Generate sonic-driven flower specification
        const sonicFlowerSpec = this.generateSonicFlowerSpec(analysis);

        // Emit whirring detection event
        this.eventSystem.emit('whirr.detected', {
            patternId,
            analysis,
            flowerSpec: sonicFlowerSpec,
            timestamp: Date.now()
        }, {
            urgency: 'high',
            semanticWeight: 0.9,
            correlation: 'acoustic-generation'
        });

        console.log(`🌀 Whirring detected: ${analysis.type} (confidence: ${analysis.confidence.toFixed(2)})`);
    }

    generateSonicFlowerSpec(analysis) {
        const signature = this.whirrSignatures[analysis.type];
        
        return {
            id: `sonic_flower_${Date.now()}`,
            type: signature.flowerType,
            complexity: Math.min(1, analysis.resonance + 0.2),
            
            // Acoustic-driven parameters
            acoustic: {
                fundamentalFreq: analysis.frequencies[0]?.frequency || 440,
                harmonics: analysis.harmonics.map(h => h.ratio),
                amplitude: analysis.amplitude,
                resonance: analysis.resonance,
                stability: analysis.stability
            },
            
            // Visual parameters derived from audio
            visual: {
                colorHue: this.frequencyToHue(analysis.frequencies[0]?.frequency || 440),
                opacity: Math.min(1, analysis.amplitude + 0.3),
                scale: 0.5 + analysis.resonance * 0.5,
                vibration: {
                    frequency: analysis.frequencies[0]?.frequency || 0,
                    amplitude: analysis.amplitude * 0.1
                }
            },
            
            // Physics parameters influenced by audio
            physics: {
                mass: 1 + analysis.stability,
                friction: 0.1 + (1 - analysis.resonance) * 0.4,
                restitution: Math.min(0.9, analysis.amplitude + 0.2),
                vibrationForce: analysis.amplitude * 10
            },
            
            // Growth pattern based on harmonics
            growth: {
                rate: analysis.resonance * 2,
                pattern: this.harmonicsToGrowthPattern(analysis.harmonics),
                symmetry: this.calculateAcousticSymmetry(analysis)
            }
        };
    }

    frequencyToHue(frequency) {
        // Map frequency to color hue (20Hz-20kHz -> 0-360°)
        const logFreq = Math.log(Math.max(20, Math.min(20000, frequency)));
        const logMin = Math.log(20);
        const logMax = Math.log(20000);
        
        return ((logFreq - logMin) / (logMax - logMin)) * 360;
    }

    harmonicsToGrowthPattern(harmonics) {
        if (harmonics.length === 0) return 'linear';
        
        const ratios = harmonics.map(h => h.ratio).sort();
        
        // Detect mathematical relationships
        if (ratios.some(r => Math.abs(r - 1.618) < 0.1)) return 'golden-spiral';
        if (ratios.every(r => r % 1 < 0.1)) return 'integer-spiral';
        if (ratios.length >= 3) return 'complex-harmonic';
        
        return 'organic';
    }

    calculateAcousticSymmetry(analysis) {
        // Determine symmetry based on harmonic structure
        const harmonicCount = analysis.harmonics.length;
        
        if (harmonicCount >= 5) return 5; // Pentagonal
        if (harmonicCount >= 4) return 4; // Quadruple
        if (harmonicCount >= 3) return 3; // Triangular
        
        return 1; // Asymmetric
    }

    // Public API methods
    toggleListening() {
        if (this.isListening) {
            this.stopListening();
        } else {
            this.startListening();
        }
    }

    getResonanceHistory(duration = 10000) {
        const cutoff = Date.now() - duration;
        return this.resonanceHistory.filter(r => r.timestamp > cutoff);
    }

    getWhirringPatterns() {
        return Array.from(this.whirringPatterns.entries()).map(([id, pattern]) => ({
            id,
            ...pattern
        }));
    }

    calibrateForEnvironment() {
        // Auto-calibrate thresholds based on ambient noise
        console.log('🎚️ Calibrating sonic resonance for current environment...');
        
        setTimeout(() => {
            const recent = this.getResonanceHistory(5000);
            const avgAmplitude = recent.reduce((sum, r) => sum + r.amplitude, 0) / recent.length;
            
            // Adjust thresholds based on ambient level
            const noiseFloor = avgAmplitude * 1.5;
            console.log(`📊 Calibrated noise floor: ${noiseFloor.toFixed(3)}`);
            
            this.eventSystem.emit('sonic.calibrated', {
                noiseFloor,
                sampleSize: recent.length
            });
        }, 5000);
    }

    getAcousticMetrics() {
        return {
            isListening: this.isListening,
            sampleRate: this.audioContext?.sampleRate,
            historySize: this.resonanceHistory.length,
            patternsDetected: this.whirringPatterns.size,
            currentAmplitude: this.resonanceHistory.length > 0 ? 
                this.resonanceHistory[this.resonanceHistory.length - 1].amplitude : 0
        };
    }
}