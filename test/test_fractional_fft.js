/**
 * Test suite for FractionalFFT implementation
 * Validates mathematical correctness and integration with TmuxDataParser
 */

import { FractionalFFT } from '../src/analysis/FractionalFFT.js';

class TestRunner {
    constructor() {
        this.tests = [];
        this.passed = 0;
        this.failed = 0;
    }

    test(name, testFn) {
        try {
            testFn();
            console.log(`✅ ${name}`);
            this.passed++;
        } catch (error) {
            console.log(`❌ ${name}: ${error.message}`);
            this.failed++;
        }
    }

    assert(condition, message) {
        if (!condition) {
            throw new Error(message);
        }
    }

    assertAlmostEqual(a, b, tolerance = 1e-10, message = 'Values should be almost equal') {
        if (Math.abs(a - b) > tolerance) {
            throw new Error(`${message}: ${a} != ${b} (tolerance: ${tolerance})`);
        }
    }

    summary() {
        console.log(`\n📊 Test Results: ${this.passed} passed, ${this.failed} failed`);
        return this.failed === 0;
    }
}

function runTests() {
    const runner = new TestRunner();
    const fft = new FractionalFFT();

    // Test 1: Basic FFT functionality
    runner.test('Basic FFT initialization', () => {
        runner.assert(fft instanceof FractionalFFT, 'FractionalFFT should instantiate');
        runner.assert(typeof fft.transform === 'function', 'transform method should exist');
        runner.assert(typeof fft.inverse === 'function', 'inverse method should exist');
    });

    // Test 2: Identity transform (alpha = 0)
    runner.test('Identity transform (alpha = 0)', () => {
        const signal = [
            { re: 1, im: 0 },
            { re: 2, im: 1 },
            { re: 0, im: -1 },
            { re: 1, im: 1 }
        ];
        
        const result = fft.transform(signal, 0);
        
        for (let i = 0; i < signal.length; i++) {
            runner.assertAlmostEqual(result[i].re, signal[i].re, 1e-10);
            runner.assertAlmostEqual(result[i].im, signal[i].im, 1e-10);
        }
    });

    // Test 3: Standard FFT (alpha = 1)
    runner.test('Standard FFT (alpha = 1)', () => {
        const signal = [
            { re: 1, im: 0 },
            { re: 0, im: 0 },
            { re: 0, im: 0 },
            { re: 0, im: 0 }
        ];
        
        const result = fft.transform(signal, 1);
        
        // DC component should be 1
        runner.assertAlmostEqual(result[0].re, 1, 1e-10);
        runner.assertAlmostEqual(result[0].im, 0, 1e-10);
    });

    // Test 4: Inverse transform property
    runner.test('Inverse transform property', () => {
        const signal = [
            { re: 1, im: 0.5 },
            { re: 0.5, im: -0.3 },
            { re: -0.2, im: 0.8 },
            { re: 0.3, im: -0.1 }
        ];
        
        const alpha = 0.5;
        const transformed = fft.transform(signal, alpha);
        const reconstructed = fft.inverse(transformed, alpha);
        
        for (let i = 0; i < signal.length; i++) {
            runner.assertAlmostEqual(reconstructed[i].re, signal[i].re, 1e-8);
            runner.assertAlmostEqual(reconstructed[i].im, signal[i].im, 1e-8);
        }
    });

    // Test 5: Complex multiplication utility
    runner.test('Complex multiplication utility', () => {
        const a = { re: 2, im: 3 };
        const b = { re: 1, im: -1 };
        const result = fft.complexMultiply(a, b);
        
        // (2 + 3i) * (1 - i) = 2 - 2i + 3i + 3 = 5 + i
        runner.assertAlmostEqual(result.re, 5, 1e-10);
        runner.assertAlmostEqual(result.im, 1, 1e-10);
    });

    // Test 6: Signal extraction from session data
    runner.test('Signal extraction from session data', () => {
        const mockSessionData = {
            threads: [
                {
                    complexity: 0.8,
                    interactions: 15,
                    contentAnalysis: {
                        semanticWeight: 12.5,
                        abstractionLevel: 0.6,
                        technicalDensity: 0.9
                    }
                },
                {
                    complexity: 0.6,
                    interactions: 8,
                    contentAnalysis: {
                        semanticWeight: 7.2,
                        abstractionLevel: 0.4,
                        technicalDensity: 0.5
                    }
                }
            ]
        };
        
        const signals = fft.extractSignals(mockSessionData);
        
        runner.assert(signals.complexity, 'complexity signal should exist');
        runner.assert(signals.interactions, 'interactions signal should exist');
        runner.assert(signals.semanticDensity, 'semanticDensity signal should exist');
        runner.assertAlmostEqual(signals.complexity[0].re, 0.8, 1e-10);
        runner.assertAlmostEqual(signals.interactions[1].re, 8, 1e-10);
    });

    // Test 7: Fractional analysis orders
    runner.test('Analysis orders configuration', () => {
        runner.assert(fft.analysisOrders.temporal === 0.25, 'temporal order should be 0.25');
        runner.assert(fft.analysisOrders.semantic === 0.5, 'semantic order should be 0.5');
        runner.assert(fft.analysisOrders.hyperstitious === 1.5, 'hyperstitious order should be 1.5');
    });

    // Test 8: Energy distribution calculation
    runner.test('Energy distribution calculation', () => {
        const magnitudes = [1, 2, 3, 4, 3, 2, 1, 0.5];
        const bands = fft.computeEnergyBands(magnitudes, 4);
        
        runner.assert(bands.length === 4, 'should have 4 energy bands');
        runner.assert(bands.every(band => band >= 0), 'all energy bands should be non-negative');
    });

    // Test 9: Cross-correlation
    runner.test('Cross-correlation calculation', () => {
        const signal1 = [{ re: 1, im: 0 }, { re: 0, im: 0 }, { re: 1, im: 0 }];
        const signal2 = [{ re: 0, im: 0 }, { re: 1, im: 0 }, { re: 0, im: 0 }];
        
        const correlation = fft.crossCorrelation(signal1, signal2);
        
        runner.assert(correlation.length === signal1.length, 'correlation should have same length as input');
        runner.assert(correlation.every(c => typeof c.re === 'number'), 'correlation should have real parts');
    });

    // Test 10: Spectral centroid calculation
    runner.test('Spectral centroid calculation', () => {
        const magnitudes = [0, 1, 2, 1, 0]; // Peak at index 2
        const centroid = fft.calculateSpectralCentroid(magnitudes);
        
        runner.assertAlmostEqual(centroid, 2, 0.1, 'centroid should be near peak location');
    });

    // Test 11: Entropy calculation
    runner.test('Entropy calculation', () => {
        // Uniform distribution should have high entropy
        const uniform = [1, 1, 1, 1];
        const uniformEntropy = fft.calculateEntropy(uniform);
        
        // Peaked distribution should have low entropy
        const peaked = [0, 0, 4, 0];
        const peakedEntropy = fft.calculateEntropy(peaked);
        
        runner.assert(uniformEntropy > peakedEntropy, 'uniform distribution should have higher entropy');
        runner.assert(peakedEntropy >= 0, 'entropy should be non-negative');
    });

    // Test 12: Fractal dimension estimation
    runner.test('Fractal dimension estimation', () => {
        // Simple test with known structure
        const values = [1, 0.5, 0.25, 0.125, 0.0625]; // Geometric sequence
        const dimension = fft.estimateFractalDimension(values);
        
        runner.assert(dimension > 0 && dimension < 3, 'fractal dimension should be reasonable');
    });

    // Test 13: Phase coherence calculation
    runner.test('Phase coherence calculation', () => {
        // Aligned phases should have high coherence
        const alignedPhases = [0, 0, 0, 0];
        const alignedCoherence = fft.calculatePhaseCoherence(alignedPhases);
        
        // Random phases should have low coherence
        const randomPhases = [0, Math.PI/2, Math.PI, 3*Math.PI/2];
        const randomCoherence = fft.calculatePhaseCoherence(randomPhases);
        
        runner.assert(alignedCoherence > randomCoherence, 'aligned phases should have higher coherence');
        runner.assert(alignedCoherence >= 0 && alignedCoherence <= 1, 'coherence should be normalized');
    });

    // Test 14: Error handling
    runner.test('Error handling for invalid inputs', () => {
        try {
            fft.transform(null);
            runner.assert(false, 'should throw error for null input');
        } catch (error) {
            runner.assert(error.message.includes('Invalid signal input'), 'should throw appropriate error');
        }
        
        try {
            fft.transform([]);
            runner.assert(false, 'should throw error for empty input');
        } catch (error) {
            runner.assert(error.message.includes('Invalid signal input'), 'should throw appropriate error');
        }
    });

    // Test 15: Analysis report generation
    runner.test('Analysis report generation', () => {
        const mockAnalysis = {
            temporalPatterns: {
                test_signal: [{ re: 1, im: 0 }, { re: 0, im: 1 }]
            },
            semanticStructures: {
                test_signal: [{ re: 0.5, im: 0.5 }, { re: 0.3, im: 0.7 }]
            },
            emergentProperties: {
                test_signal: [{ re: 0.8, im: 0.2 }, { re: 0.4, im: 0.6 }]
            },
            hyperstiousSignatures: {
                test_signal: [{ re: 0.9, im: 0.1 }, { re: 0.2, im: 0.8 }]
            },
            crossDomainCorrelations: {},
            features: {
                dominantFrequencies: {
                    temporalPatterns: { test_signal: [] }
                },
                energyDistribution: {
                    temporalPatterns: { test_signal: [] }
                }
            }
        };
        
        const report = fft.generateAnalysisReport(mockAnalysis);
        
        runner.assert(report.summary, 'report should have summary');
        runner.assert(report.patterns, 'report should have patterns');
        runner.assert(report.recommendations, 'report should have recommendations');
        runner.assert(Array.isArray(report.recommendations), 'recommendations should be array');
    });

    return runner.summary();
}

// Export for use in browser or Node.js
if (typeof window !== 'undefined') {
    window.runFractionalFFTTests = runTests;
} else if (typeof module !== 'undefined') {
    module.exports = { runTests };
}

// Run tests if this file is executed directly
if (typeof process !== 'undefined' && process.argv[1].endsWith('test_fractional_fft.js')) {
    console.log('🔬 Running Fractional FFT Test Suite...\n');
    const success = runTests();
    process.exit(success ? 0 : 1);
}