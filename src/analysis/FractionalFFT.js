/**
 * Fractional Fourier Transform (FrFT) Implementation
 * For analyzing semantic and temporal patterns in tmux session data
 * 
 * The FrFT provides a generalized view of the Fourier transform where the
 * transform angle can be any real number, not just multiples of π/2.
 * This is particularly useful for analyzing non-stationary signals and
 * finding time-frequency relationships in human-computer interaction patterns.
 */

export class FractionalFFT {
    constructor() {
        this.epsilon = 1e-10;
        this.maxSamples = 2048; // Power of 2 for efficiency
        
        // Pre-computed chirp kernels for common fractional orders
        this.chirpKernels = new Map();
        
        // Common fractional orders for different analysis types
        this.analysisOrders = {
            temporal: 0.25,      // π/8 rotation - good for time-based patterns
            semantic: 0.5,       // π/4 rotation - balanced time-frequency
            structural: 0.75,    // 3π/8 rotation - emphasizes frequency structure
            emergent: 1.0,       // π/2 rotation - standard FFT
            hyperstitious: 1.5   // 3π/4 rotation - beyond standard transform
        };
    }

    /**
     * Compute fractional Fourier transform of a signal
     * @param {Array} signal - Input signal (complex numbers as {re, im} objects)
     * @param {number} alpha - Fractional order (0 to 2, where 1 = standard FFT)
     * @returns {Array} Transformed signal in fractional domain
     */
    transform(signal, alpha = 0.5) {
        if (!signal || signal.length === 0) {
            throw new Error('Invalid signal input');
        }

        // Normalize alpha to [0, 2) range
        alpha = this.normalizeAlpha(alpha);

        // Handle special cases
        if (Math.abs(alpha) < this.epsilon) {
            return [...signal]; // Identity transform
        }
        if (Math.abs(alpha - 1) < this.epsilon) {
            return this.standardFFT(signal); // Standard FFT
        }
        if (Math.abs(alpha - 2) < this.epsilon) {
            return this.reverseSignal(signal); // Time reversal
        }

        return this.computeFractionalFFT(signal, alpha);
    }

    /**
     * Inverse fractional Fourier transform
     */
    inverse(transformedSignal, alpha = 0.5) {
        return this.transform(transformedSignal, -alpha);
    }

    /**
     * Analyze tmux session data using multiple fractional orders
     * @param {Object} parsedSessionData - Output from TmuxDataParser
     * @returns {Object} Multi-scale fractional analysis
     */
    analyzeSessionData(parsedSessionData) {
        const analysis = {
            temporalPatterns: {},
            semanticStructures: {},
            emergentProperties: {},
            crossDomainCorrelations: {},
            hyperstiousSignatures: {}
        };

        // Extract signals from different aspects of the session
        const signals = this.extractSignals(parsedSessionData);

        // Analyze each signal with different fractional orders
        for (const [signalName, signal] of Object.entries(signals)) {
            analysis.temporalPatterns[signalName] = this.transform(signal, this.analysisOrders.temporal);
            analysis.semanticStructures[signalName] = this.transform(signal, this.analysisOrders.semantic);
            analysis.emergentProperties[signalName] = this.transform(signal, this.analysisOrders.emergent);
            analysis.hyperstiousSignatures[signalName] = this.transform(signal, this.analysisOrders.hyperstitious);
        }

        // Compute cross-domain correlations
        analysis.crossDomainCorrelations = this.computeCorrelations(signals);

        // Extract meaningful features
        analysis.features = this.extractFeatures(analysis);

        return analysis;
    }

    /**
     * Extract various signals from parsed session data
     */
    extractSignals(parsedData) {
        const signals = {};

        // Complexity evolution over time
        signals.complexity = parsedData.threads.map(thread => ({
            re: thread.complexity || 0,
            im: 0
        }));

        // Semantic density evolution
        signals.semanticDensity = parsedData.threads.map(thread => ({
            re: thread.contentAnalysis?.semanticWeight || 0,
            im: 0
        }));

        // Interaction intensity
        signals.interactions = parsedData.threads.map(thread => ({
            re: thread.interactions || 0,
            im: 0
        }));

        // Abstract thinking levels
        signals.abstraction = parsedData.threads.map(thread => ({
            re: thread.contentAnalysis?.abstractionLevel || 0,
            im: 0
        }));

        // Technical vs creative balance (as complex signal)
        signals.technicalCreative = parsedData.threads.map(thread => ({
            re: thread.contentAnalysis?.technicalDensity || 0,
            im: (thread.contentAnalysis?.patternMatches?.get('creative') || 0) * 0.1
        }));

        // Temporal momentum
        if (parsedData.temporalFlow) {
            signals.momentum = parsedData.temporalFlow.map(flow => ({
                re: flow.momentum || 0,
                im: 0
            }));
        }

        // Pad or truncate signals to consistent length
        const maxLength = Math.min(this.maxSamples, 
            Math.max(...Object.values(signals).map(s => s.length)));
        
        for (const [name, signal] of Object.entries(signals)) {
            signals[name] = this.normalizeSignalLength(signal, maxLength);
        }

        return signals;
    }

    /**
     * Core fractional FFT computation using chirp decomposition
     */
    computeFractionalFFT(signal, alpha) {
        const N = signal.length;
        const result = new Array(N);
        
        // Fractional transform angle
        const phi = alpha * Math.PI / 2;
        const cosPhi = Math.cos(phi);
        const sinPhi = Math.sin(phi);
        const cotPhi = cosPhi / (sinPhi + this.epsilon);
        const cscPhi = 1 / (sinPhi + this.epsilon);

        // Precompute chirp multiplication factors
        const chirpPre = new Array(N);
        const chirpPost = new Array(N);
        
        for (let n = 0; n < N; n++) {
            const n2 = n * n;
            const expArg = -Math.PI * n2 * cotPhi / N;
            chirpPre[n] = { re: Math.cos(expArg), im: Math.sin(expArg) };
            
            const postExpArg = Math.PI * n2 * cotPhi / N;
            chirpPost[n] = { re: Math.cos(postExpArg), im: Math.sin(postExpArg) };
        }

        // Apply pre-chirp multiplication
        const preChirped = new Array(N);
        for (let n = 0; n < N; n++) {
            preChirped[n] = this.complexMultiply(signal[n], chirpPre[n]);
        }

        // Apply chirp convolution (via FFT for efficiency)
        const convolved = this.chirpConvolution(preChirped, phi, N);

        // Apply post-chirp multiplication and normalization
        const normFactor = Math.sqrt(Math.abs(cscPhi) / N);
        for (let n = 0; n < N; n++) {
            const multiplied = this.complexMultiply(convolved[n], chirpPost[n]);
            result[n] = {
                re: multiplied.re * normFactor,
                im: multiplied.im * normFactor
            };
        }

        return result;
    }

    /**
     * Chirp convolution using FFT-based fast convolution
     */
    chirpConvolution(signal, phi, N) {
        const cotPhi = Math.cos(phi) / Math.sin(phi);
        
        // Create chirp kernel
        const kernel = new Array(N);
        for (let k = 0; k < N; k++) {
            const k2 = k * k;
            const expArg = Math.PI * k2 * cotPhi / N;
            kernel[k] = { re: Math.cos(expArg), im: Math.sin(expArg) };
        }

        // Fast convolution via FFT
        return this.fastConvolution(signal, kernel);
    }

    /**
     * Fast convolution using FFT
     */
    fastConvolution(signal1, signal2) {
        const N = signal1.length;
        const paddedLength = this.nextPowerOfTwo(2 * N - 1);
        
        // Zero-pad signals
        const padded1 = [...signal1, ...new Array(paddedLength - N).fill({re: 0, im: 0})];
        const padded2 = [...signal2, ...new Array(paddedLength - N).fill({re: 0, im: 0})];
        
        // Transform both signals
        const fft1 = this.standardFFT(padded1);
        const fft2 = this.standardFFT(padded2);
        
        // Multiply in frequency domain
        const product = fft1.map((f1, i) => this.complexMultiply(f1, fft2[i]));
        
        // Inverse transform
        const result = this.standardIFFT(product);
        
        // Return original length
        return result.slice(0, N);
    }

    /**
     * Standard FFT implementation (Cooley-Tukey algorithm)
     */
    standardFFT(signal) {
        const N = signal.length;
        if (N <= 1) return [...signal];

        // Ensure N is power of 2
        const paddedSignal = this.padToPowerOfTwo(signal);
        return this.cooleyTukeyFFT(paddedSignal);
    }

    /**
     * Cooley-Tukey FFT recursive implementation
     */
    cooleyTukeyFFT(signal) {
        const N = signal.length;
        if (N <= 1) return [...signal];

        // Divide
        const even = signal.filter((_, i) => i % 2 === 0);
        const odd = signal.filter((_, i) => i % 2 === 1);

        // Conquer
        const evenFFT = this.cooleyTukeyFFT(even);
        const oddFFT = this.cooleyTukeyFFT(odd);

        // Combine
        const result = new Array(N);
        for (let k = 0; k < N / 2; k++) {
            const twiddle = {
                re: Math.cos(-2 * Math.PI * k / N),
                im: Math.sin(-2 * Math.PI * k / N)
            };
            const oddTerm = this.complexMultiply(twiddle, oddFFT[k]);
            
            result[k] = this.complexAdd(evenFFT[k], oddTerm);
            result[k + N / 2] = this.complexSubtract(evenFFT[k], oddTerm);
        }

        return result;
    }

    /**
     * Standard IFFT
     */
    standardIFFT(signal) {
        // Conjugate input
        const conjugated = signal.map(s => ({re: s.re, im: -s.im}));
        
        // Apply FFT
        const fftResult = this.standardFFT(conjugated);
        
        // Conjugate and normalize
        return fftResult.map(s => ({
            re: s.re / signal.length,
            im: -s.im / signal.length
        }));
    }

    /**
     * Compute cross-correlations between different signals
     */
    computeCorrelations(signals) {
        const correlations = {};
        const signalNames = Object.keys(signals);

        for (let i = 0; i < signalNames.length; i++) {
            for (let j = i + 1; j < signalNames.length; j++) {
                const name1 = signalNames[i];
                const name2 = signalNames[j];
                
                correlations[`${name1}_${name2}`] = this.crossCorrelation(
                    signals[name1], 
                    signals[name2]
                );
            }
        }

        return correlations;
    }

    /**
     * Extract meaningful features from fractional analysis
     */
    extractFeatures(analysis) {
        const features = {
            dominantFrequencies: {},
            energyDistribution: {},
            phaseCoherence: {},
            temporalLocalization: {},
            semanticResonance: {}
        };

        // Analyze each transform domain
        for (const [domain, transforms] of Object.entries(analysis)) {
            if (domain === 'features' || domain === 'crossDomainCorrelations') continue;

            features.dominantFrequencies[domain] = {};
            features.energyDistribution[domain] = {};

            for (const [signalName, transform] of Object.entries(transforms)) {
                // Find dominant frequencies
                const magnitudes = transform.map(c => Math.sqrt(c.re * c.re + c.im * c.im));
                const maxMagnitude = Math.max(...magnitudes);
                const dominantBins = magnitudes
                    .map((mag, i) => ({index: i, magnitude: mag}))
                    .filter(item => item.magnitude > maxMagnitude * 0.5)
                    .sort((a, b) => b.magnitude - a.magnitude)
                    .slice(0, 5);

                features.dominantFrequencies[domain][signalName] = dominantBins;

                // Energy distribution
                const totalEnergy = magnitudes.reduce((sum, mag) => sum + mag * mag, 0);
                const energyBands = this.computeEnergyBands(magnitudes, 8);
                features.energyDistribution[domain][signalName] = energyBands.map(e => e / totalEnergy);
            }
        }

        return features;
    }

    /**
     * Utility functions
     */
    normalizeAlpha(alpha) {
        return ((alpha % 4) + 4) % 4; // Normalize to [0, 4) then to [0, 2)
    }

    complexMultiply(a, b) {
        return {
            re: a.re * b.re - a.im * b.im,
            im: a.re * b.im + a.im * b.re
        };
    }

    complexAdd(a, b) {
        return { re: a.re + b.re, im: a.im + b.im };
    }

    complexSubtract(a, b) {
        return { re: a.re - b.re, im: a.im - b.im };
    }

    normalizeSignalLength(signal, targetLength) {
        if (signal.length === targetLength) return signal;
        
        if (signal.length > targetLength) {
            return signal.slice(0, targetLength);
        } else {
            const padded = [...signal];
            while (padded.length < targetLength) {
                padded.push({re: 0, im: 0});
            }
            return padded;
        }
    }

    padToPowerOfTwo(signal) {
        const nextPow2 = this.nextPowerOfTwo(signal.length);
        if (signal.length === nextPow2) return signal;
        
        const padded = [...signal];
        while (padded.length < nextPow2) {
            padded.push({re: 0, im: 0});
        }
        return padded;
    }

    nextPowerOfTwo(n) {
        return Math.pow(2, Math.ceil(Math.log2(n)));
    }

    reverseSignal(signal) {
        return [...signal].reverse();
    }

    crossCorrelation(signal1, signal2) {
        const N = Math.min(signal1.length, signal2.length);
        const correlation = new Array(N);
        
        for (let lag = 0; lag < N; lag++) {
            let sum = {re: 0, im: 0};
            for (let n = 0; n < N - lag; n++) {
                const conjugate = {re: signal2[n + lag].re, im: -signal2[n + lag].im};
                const product = this.complexMultiply(signal1[n], conjugate);
                sum = this.complexAdd(sum, product);
            }
            correlation[lag] = sum;
        }
        
        return correlation;
    }

    computeEnergyBands(magnitudes, numBands) {
        const bandSize = Math.floor(magnitudes.length / numBands);
        const bands = new Array(numBands).fill(0);
        
        for (let i = 0; i < magnitudes.length; i++) {
            const bandIndex = Math.min(Math.floor(i / bandSize), numBands - 1);
            bands[bandIndex] += magnitudes[i] * magnitudes[i];
        }
        
        return bands;
    }

    /**
     * Generate analysis report for visualization
     */
    generateAnalysisReport(fractionalAnalysis) {
        return {
            summary: {
                totalSignals: Object.keys(fractionalAnalysis.temporalPatterns).length,
                dominantOrder: this.findDominantOrder(fractionalAnalysis),
                complexity: this.calculateComplexity(fractionalAnalysis),
                coherence: this.calculateCoherence(fractionalAnalysis)
            },
            patterns: {
                temporal: this.extractPatternSummary(fractionalAnalysis.temporalPatterns),
                semantic: this.extractPatternSummary(fractionalAnalysis.semanticStructures),
                emergent: this.extractPatternSummary(fractionalAnalysis.emergentProperties),
                hyperstitious: this.extractPatternSummary(fractionalAnalysis.hyperstiousSignatures)
            },
            recommendations: this.generateRecommendations(fractionalAnalysis)
        };
    }

    findDominantOrder(analysis) {
        // Determine which fractional order reveals the most structure
        const orders = ['temporal', 'semantic', 'emergent', 'hyperstitious'];
        const energies = orders.map(order => this.calculateTotalEnergy(analysis[order + (order.endsWith('s') ? '' : 'Patterns')]));
        const maxEnergyIndex = energies.indexOf(Math.max(...energies));
        return orders[maxEnergyIndex];
    }

    calculateTotalEnergy(transforms) {
        let totalEnergy = 0;
        for (const transform of Object.values(transforms)) {
            totalEnergy += transform.reduce((sum, c) => sum + (c.re * c.re + c.im * c.im), 0);
        }
        return totalEnergy;
    }

    calculateComplexity(analysis) {
        // Measure structural complexity across different domains
        const features = analysis.features;
        let complexity = 0;
        
        for (const domain of Object.keys(features.dominantFrequencies)) {
            for (const signal of Object.values(features.dominantFrequencies[domain])) {
                complexity += signal.length; // More dominant frequencies = higher complexity
            }
        }
        
        return Math.min(complexity / 100, 1); // Normalize to [0, 1]
    }

    calculateCoherence(analysis) {
        // Measure phase coherence across different signals and domains
        const correlations = analysis.crossDomainCorrelations;
        const coherenceScores = [];
        
        for (const correlation of Object.values(correlations)) {
            const magnitudes = correlation.map(c => Math.sqrt(c.re * c.re + c.im * c.im));
            const maxCoherence = Math.max(...magnitudes) / Math.sqrt(correlation.length);
            coherenceScores.push(maxCoherence);
        }
        
        return coherenceScores.length > 0 ? 
            coherenceScores.reduce((sum, score) => sum + score, 0) / coherenceScores.length : 0;
    }

    extractPatternSummary(transforms) {
        const summary = {};
        for (const [signalName, transform] of Object.entries(transforms)) {
            const magnitudes = transform.map(c => Math.sqrt(c.re * c.re + c.im * c.im));
            summary[signalName] = {
                peakFrequency: magnitudes.indexOf(Math.max(...magnitudes)),
                meanMagnitude: magnitudes.reduce((sum, mag) => sum + mag, 0) / magnitudes.length,
                bandwidth: this.calculateBandwidth(magnitudes),
                spectralCentroid: this.calculateSpectralCentroid(magnitudes)
            };
        }
        return summary;
    }

    calculateBandwidth(magnitudes) {
        const totalEnergy = magnitudes.reduce((sum, mag) => sum + mag * mag, 0);
        const threshold = totalEnergy * 0.05; // 5% threshold
        
        let start = 0, end = magnitudes.length - 1;
        let cumulativeEnergy = 0;
        
        for (let i = 0; i < magnitudes.length; i++) {
            cumulativeEnergy += magnitudes[i] * magnitudes[i];
            if (cumulativeEnergy > threshold) {
                start = i;
                break;
            }
        }
        
        cumulativeEnergy = 0;
        for (let i = magnitudes.length - 1; i >= 0; i--) {
            cumulativeEnergy += magnitudes[i] * magnitudes[i];
            if (cumulativeEnergy > threshold) {
                end = i;
                break;
            }
        }
        
        return end - start + 1;
    }

    calculateSpectralCentroid(magnitudes) {
        let numerator = 0, denominator = 0;
        
        for (let i = 0; i < magnitudes.length; i++) {
            const weight = magnitudes[i] * magnitudes[i];
            numerator += i * weight;
            denominator += weight;
        }
        
        return denominator > 0 ? numerator / denominator : 0;
    }

    generateRecommendations(analysis) {
        const recommendations = [];
        const summary = this.generateAnalysisReport(analysis).summary;
        
        if (summary.complexity < 0.3) {
            recommendations.push("Consider increasing interaction diversity for richer semantic patterns");
        }
        
        if (summary.coherence > 0.8) {
            recommendations.push("High coherence detected - good for focused development");
        } else if (summary.coherence < 0.3) {
            recommendations.push("Low coherence suggests scattered attention - consider consolidation");
        }
        
        if (summary.dominantOrder === 'hyperstitious') {
            recommendations.push("Strong hyperstitious signatures detected - emergence patterns active");
        }
        
        return recommendations;
    }
}