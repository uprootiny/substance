/**
 * Test suite for reactive architecture components
 * Tests EventSystem and DataFlow integration
 */

import { EventSystem } from '../src/core/EventSystem.js';
import { DataFlow } from '../src/core/DataFlow.js';

class ReactiveTestRunner {
    constructor() {
        this.tests = [];
        this.passed = 0;
        this.failed = 0;
        this.eventSystem = null;
        this.dataFlow = null;
    }

    test(name, testFn) {
        console.log(`🧪 Running: ${name}`);
        
        try {
            testFn();
            console.log(`✅ ${name}`);
            this.passed++;
        } catch (error) {
            console.log(`❌ ${name}: ${error.message}`);
            console.error(error.stack);
            this.failed++;
        }
    }

    async asyncTest(name, testFn) {
        console.log(`🧪 Running async: ${name}`);
        
        try {
            await testFn();
            console.log(`✅ ${name}`);
            this.passed++;
        } catch (error) {
            console.log(`❌ ${name}: ${error.message}`);
            console.error(error.stack);
            this.failed++;
        }
    }

    assert(condition, message) {
        if (!condition) {
            throw new Error(message);
        }
    }

    assertEqual(actual, expected, message = 'Values should be equal') {
        if (actual !== expected) {
            throw new Error(`${message}: expected ${expected}, got ${actual}`);
        }
    }

    assertGreaterThan(value, threshold, message = 'Value should be greater than threshold') {
        if (value <= threshold) {
            throw new Error(`${message}: ${value} <= ${threshold}`);
        }
    }

    setup() {
        this.eventSystem = new EventSystem();
        this.dataFlow = new DataFlow(this.eventSystem);
    }

    teardown() {
        this.eventSystem = null;
        this.dataFlow = null;
    }

    summary() {
        console.log(`\n📊 Reactive Architecture Test Results: ${this.passed} passed, ${this.failed} failed`);
        return this.failed === 0;
    }
}

async function runReactiveTests() {
    const runner = new ReactiveTestRunner();

    // Test EventSystem core functionality
    runner.test('EventSystem initialization', () => {
        runner.setup();
        runner.assert(runner.eventSystem instanceof EventSystem, 'EventSystem should instantiate');
        runner.assert(typeof runner.eventSystem.subscribe === 'function', 'subscribe method should exist');
        runner.assert(typeof runner.eventSystem.emit === 'function', 'emit method should exist');
    });

    runner.test('Event subscription and emission', () => {
        let eventReceived = false;
        let eventData = null;

        const subscriptionId = runner.eventSystem.subscribe('test.event', (event) => {
            eventReceived = true;
            eventData = event.payload;
        });

        runner.eventSystem.emit('test.event', { message: 'hello' });
        
        // Process events synchronously for testing
        runner.eventSystem.processEventBuffer();
        
        runner.assert(eventReceived, 'Event should be received');
        runner.assertEqual(eventData.message, 'hello', 'Event payload should be correct');
    });

    runner.test('Semantic event routing', () => {
        let visualEventReceived = false;
        let narrativeEventReceived = false;

        runner.eventSystem.subscribe('voxel.created', () => {
            visualEventReceived = true;
        }, ['visual']);

        runner.eventSystem.subscribe('voxel.created', () => {
            narrativeEventReceived = true;
        }, ['narrative']);

        runner.eventSystem.emit('voxel.created', { position: { x: 0, y: 0, z: 0 } });
        runner.eventSystem.processEventBuffer();

        runner.assert(visualEventReceived, 'Visual domain listener should receive event');
        runner.assert(!narrativeEventReceived, 'Narrative domain listener should not receive event');
    });

    runner.test('Event priority handling', () => {
        const executionOrder = [];

        runner.eventSystem.subscribe('priority.test', () => {
            executionOrder.push('low');
        }, [], 1);

        runner.eventSystem.subscribe('priority.test', () => {
            executionOrder.push('high');
        }, [], 10);

        runner.eventSystem.subscribe('priority.test', () => {
            executionOrder.push('medium');
        }, [], 5);

        runner.eventSystem.emit('priority.test', {});
        runner.eventSystem.processEventBuffer();

        runner.assertEqual(executionOrder[0], 'high', 'High priority should execute first');
        runner.assertEqual(executionOrder[1], 'medium', 'Medium priority should execute second');
        runner.assertEqual(executionOrder[2], 'low', 'Low priority should execute last');
    });

    runner.asyncTest('Event chain processing', async () => {
        let chainComplete = false;
        let contextValue = 0;

        const chainId = runner.eventSystem.createEventChain({
            steps: [
                {
                    emit: { type: 'chain.step1', payload: { value: 10 } },
                    waitFor: 'chain.step1.complete',
                    updateContext: (context, event) => {
                        context.step1Result = event.payload.result;
                        return context;
                    }
                },
                {
                    emit: { type: 'chain.step2', payload: { value: 20 } },
                    waitFor: 'chain.step2.complete',
                    updateContext: (context, event) => {
                        context.step2Result = event.payload.result;
                        return context;
                    }
                }
            ],
            onComplete: (context) => {
                chainComplete = true;
                contextValue = context.step1Result + context.step2Result;
            }
        });

        // Simulate step completions
        setTimeout(() => {
            runner.eventSystem.emit('chain.step1.complete', { result: 100 });
        }, 10);

        setTimeout(() => {
            runner.eventSystem.emit('chain.step2.complete', { result: 200 });
        }, 20);

        // Wait for chain completion
        await new Promise(resolve => {
            const checkComplete = () => {
                if (chainComplete) {
                    resolve();
                } else {
                    setTimeout(checkComplete, 5);
                }
            };
            checkComplete();
        });

        runner.assert(chainComplete, 'Chain should complete');
        runner.assertEqual(contextValue, 300, 'Context should be accumulated correctly');
    });

    // Test DataFlow functionality
    runner.test('DataFlow initialization', () => {
        runner.assert(runner.dataFlow instanceof DataFlow, 'DataFlow should instantiate');
        runner.assert(typeof runner.dataFlow.createStream === 'function', 'createStream method should exist');
        runner.assert(typeof runner.dataFlow.applyTransformation === 'function', 'applyTransformation method should exist');
    });

    runner.asyncTest('Data transformation pipeline', async () => {
        const testData = {
            threads: [
                {
                    id: 'test-thread',
                    content: 'test function code implementation',
                    interactions: 5,
                    timestamp: Date.now()
                }
            ]
        };

        const parsedData = await runner.dataFlow.applyTransformation('tmux.parse', testData);
        
        runner.assert(parsedData.threads.length === 1, 'Should have one parsed thread');
        runner.assert(parsedData.threads[0].complexity > 0, 'Should calculate complexity');
        runner.assert(parsedData.threads[0].semanticWeight >= 0, 'Should calculate semantic weight');
    });

    runner.asyncTest('Semantic feature extraction', async () => {
        const parsedData = {
            threads: [
                {
                    id: 'code-thread',
                    content: 'function implementation with algorithm patterns',
                    complexity: 0.8,
                    semanticWeight: 0.6
                },
                {
                    id: 'doc-thread',
                    content: 'documentation about system architecture',
                    complexity: 0.4,
                    semanticWeight: 0.3
                }
            ]
        };

        const features = await runner.dataFlow.applyTransformation('semantic.extract', parsedData);
        
        runner.assert(features.keyTerms.size > 0, 'Should extract key terms');
        runner.assert(features.concepts.size > 0, 'Should identify concepts');
        runner.assert(features.technicalDensity >= 0, 'Should calculate technical density');
    });

    runner.asyncTest('Flower specification generation', async () => {
        const semanticFeatures = {
            keyTerms: new Map([
                ['function', 3],
                ['code', 2],
                ['algorithm', 1]
            ]),
            concepts: new Set(['code', 'ai']),
            technicalDensity: 0.7
        };

        const flowerSpec = await runner.dataFlow.applyTransformation('flower.spec', semanticFeatures);
        
        runner.assert(flowerSpec.id, 'Should have unique ID');
        runner.assert(['quadruple', 'pentagonal', 'rosaceae', 'fractal', 'organic'].includes(flowerSpec.type), 'Should have valid flower type');
        runner.assert(flowerSpec.complexity >= 0 && flowerSpec.complexity <= 1, 'Complexity should be normalized');
        runner.assert(flowerSpec.physics, 'Should have physics properties');
    });

    runner.asyncTest('Voxel position calculation', async () => {
        const flowerSpec = {
            type: 'quadruple',
            complexity: 0.5,
            center: { x: 0, y: 0, z: 0 }
        };

        const voxelPositions = await runner.dataFlow.applyTransformation('voxel.position', flowerSpec);
        
        runner.assert(voxelPositions.positions.length > 0, 'Should generate voxel positions');
        runner.assert(voxelPositions.metadata.voxelCount > 0, 'Should count voxels');
        runner.assert(voxelPositions.metadata.boundingBox, 'Should calculate bounding box');
    });

    // Test stream processing
    runner.asyncTest('Data stream processing', async () => {
        let processedData = null;
        
        const stream = runner.dataFlow.createStream('test-stream');
        stream
            .map(data => ({ ...data, processed: true }))
            .filter(data => data.value > 10)
            .subscribe(data => {
                processedData = data;
            });

        await stream.process({ value: 15, name: 'test' });
        
        runner.assert(processedData !== null, 'Data should be processed');
        runner.assert(processedData.processed === true, 'Data should be marked as processed');
        runner.assertEqual(processedData.value, 15, 'Original data should be preserved');
    });

    runner.test('Stream filtering', async () => {
        let filteredData = [];
        
        const stream = runner.dataFlow.createStream('filter-test');
        stream
            .filter(data => data.value % 2 === 0)
            .subscribe(data => {
                filteredData.push(data);
            });

        await stream.process({ value: 2 }); // Should pass
        await stream.process({ value: 3 }); // Should be filtered
        await stream.process({ value: 4 }); // Should pass
        
        runner.assertEqual(filteredData.length, 2, 'Should filter odd values');
        runner.assertEqual(filteredData[0].value, 2, 'First value should be 2');
        runner.assertEqual(filteredData[1].value, 4, 'Second value should be 4');
    });

    // Test performance metrics
    runner.test('Performance metrics collection', () => {
        // Generate some events
        for (let i = 0; i < 10; i++) {
            runner.eventSystem.emit('performance.test', { iteration: i });
        }
        
        runner.eventSystem.processEventBuffer();
        
        const metrics = runner.eventSystem.getMetrics();
        
        runner.assertGreaterThan(metrics.eventsProcessed, 0, 'Should track processed events');
        runner.assertGreaterThan(metrics.averageProcessingTime, 0, 'Should track processing time');
    });

    runner.test('Event correlation analysis', () => {
        // Emit correlated events
        for (let i = 0; i < 5; i++) {
            runner.eventSystem.emit('correlation.event1', {});
            setTimeout(() => {
                runner.eventSystem.emit('correlation.event2', {});
            }, 100);
        }
        
        runner.eventSystem.processEventBuffer();
        
        const correlations = runner.eventSystem.analyzeCorrelations(10000);
        
        runner.assert(Array.isArray(correlations), 'Should return correlation array');
    });

    // Cleanup
    runner.teardown();

    return runner.summary();
}

// Export for use in browser or Node.js
if (typeof window !== 'undefined') {
    window.runReactiveArchitectureTests = runReactiveTests;
} else if (typeof module !== 'undefined') {
    module.exports = { runReactiveTests };
}

// Run tests if this file is executed directly
if (typeof process !== 'undefined' && process.argv[1].endsWith('test_reactive_architecture.js')) {
    console.log('🔧 Running Reactive Architecture Test Suite...\n');
    runReactiveTests().then(success => {
        process.exit(success ? 0 : 1);
    });
}