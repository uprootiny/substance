/**
 * EventSystem - Reactive event-driven architecture for substance voxel garden
 * Implements observer pattern with semantic event routing and temporal buffering
 */

export class EventSystem {
    constructor() {
        this.listeners = new Map();
        this.eventBuffer = [];
        this.semanticRouting = new Map();
        this.temporalFilters = new Map();
        this.eventHistory = new CircularBuffer(1000);
        this.isProcessing = false;
        
        // Performance metrics
        this.metrics = {
            eventsProcessed: 0,
            averageProcessingTime: 0,
            bufferOverflows: 0,
            routingMisses: 0
        };
        
        this.initializeSemanticRoutes();
    }

    initializeSemanticRoutes() {
        // Map event types to semantic domains
        this.semanticRouting.set('voxel.created', ['growth', 'visual', 'physics']);
        this.semanticRouting.set('flower.grown', ['narrative', 'visual', 'semantic']);
        this.semanticRouting.set('tmux.parsed', ['narrative', 'data', 'temporal']);
        this.semanticRouting.set('physics.collision', ['physics', 'interaction', 'feedback']);
        this.semanticRouting.set('analysis.complete', ['semantic', 'hyperstitious', 'temporal']);
        this.semanticRouting.set('user.interaction', ['interface', 'control', 'narrative']);
    }

    // Subscribe to events with semantic filtering
    subscribe(eventType, handler, semanticDomains = [], priority = 0) {
        if (!this.listeners.has(eventType)) {
            this.listeners.set(eventType, []);
        }

        const subscription = {
            id: this.generateSubscriptionId(),
            handler,
            semanticDomains,
            priority,
            created: Date.now(),
            callCount: 0,
            totalProcessingTime: 0
        };

        // Insert by priority (higher first)
        const listeners = this.listeners.get(eventType);
        const insertIndex = listeners.findIndex(sub => sub.priority < priority);
        if (insertIndex === -1) {
            listeners.push(subscription);
        } else {
            listeners.splice(insertIndex, 0, subscription);
        }

        return subscription.id;
    }

    // Unsubscribe from events
    unsubscribe(eventType, subscriptionId) {
        const listeners = this.listeners.get(eventType);
        if (!listeners) return false;

        const index = listeners.findIndex(sub => sub.id === subscriptionId);
        if (index !== -1) {
            listeners.splice(index, 1);
            return true;
        }
        return false;
    }

    // Emit events with semantic payload
    emit(eventType, payload = {}, options = {}) {
        const event = {
            type: eventType,
            payload,
            timestamp: Date.now(),
            id: this.generateEventId(),
            semantic: {
                domains: this.semanticRouting.get(eventType) || [],
                weight: options.semanticWeight || 1.0,
                urgency: options.urgency || 'normal',
                correlation: options.correlation || null
            },
            temporal: {
                delay: options.delay || 0,
                ttl: options.ttl || 30000, // 30 second default TTL
                scheduled: options.scheduled || null
            }
        };

        // Add to event history
        this.eventHistory.add(event);

        // Handle immediate vs buffered processing
        if (options.immediate || event.semantic.urgency === 'critical') {
            this.processEvent(event);
        } else {
            this.bufferEvent(event);
        }

        return event.id;
    }

    // Buffer events for batch processing
    bufferEvent(event) {
        // Apply temporal delay if specified
        if (event.temporal.delay > 0) {
            setTimeout(() => {
                this.eventBuffer.push(event);
                this.scheduleProcessing();
            }, event.temporal.delay);
        } else {
            this.eventBuffer.push(event);
            this.scheduleProcessing();
        }
    }

    // Schedule event processing using requestAnimationFrame
    scheduleProcessing() {
        if (!this.isProcessing) {
            this.isProcessing = true;
            requestAnimationFrame(() => this.processEventBuffer());
        }
    }

    // Process buffered events
    processEventBuffer() {
        const startTime = performance.now();
        const events = [...this.eventBuffer];
        this.eventBuffer = [];

        // Group events by type for efficient processing
        const eventGroups = this.groupEventsByType(events);

        for (const [eventType, eventGroup] of eventGroups.entries()) {
            this.processEventGroup(eventType, eventGroup);
        }

        const processingTime = performance.now() - startTime;
        this.updateMetrics(events.length, processingTime);
        
        this.isProcessing = false;

        // Continue processing if more events arrived
        if (this.eventBuffer.length > 0) {
            this.scheduleProcessing();
        }
    }

    // Group events by type for batch processing
    groupEventsByType(events) {
        const groups = new Map();
        
        for (const event of events) {
            if (!groups.has(event.type)) {
                groups.set(event.type, []);
            }
            groups.get(event.type).push(event);
        }
        
        return groups;
    }

    // Process a group of events of the same type
    processEventGroup(eventType, events) {
        const listeners = this.listeners.get(eventType) || [];
        
        for (const listener of listeners) {
            // Check semantic domain compatibility
            if (this.shouldProcessForListener(events[0], listener)) {
                const startTime = performance.now();
                
                try {
                    // Pass all events of this type to the listener
                    listener.handler(events.length === 1 ? events[0] : events);
                    listener.callCount++;
                } catch (error) {
                    console.error(`Event handler error for ${eventType}:`, error);
                }
                
                const handlerTime = performance.now() - startTime;
                listener.totalProcessingTime += handlerTime;
            }
        }
    }

    // Process single event immediately
    processEvent(event) {
        const listeners = this.listeners.get(event.type) || [];
        
        for (const listener of listeners) {
            if (this.shouldProcessForListener(event, listener)) {
                const startTime = performance.now();
                
                try {
                    listener.handler(event);
                    listener.callCount++;
                } catch (error) {
                    console.error(`Event handler error for ${event.type}:`, error);
                }
                
                const handlerTime = performance.now() - startTime;
                listener.totalProcessingTime += handlerTime;
            }
        }
    }

    // Check if listener should process this event based on semantic domains
    shouldProcessForListener(event, listener) {
        // If listener has no semantic domains specified, process all events
        if (listener.semanticDomains.length === 0) {
            return true;
        }

        // Check if event's semantic domains overlap with listener's domains
        const eventDomains = event.semantic.domains;
        return listener.semanticDomains.some(domain => eventDomains.includes(domain));
    }

    // Create event chains for complex workflows
    createEventChain(chainSpec) {
        const chain = {
            id: this.generateChainId(),
            steps: chainSpec.steps,
            currentStep: 0,
            context: chainSpec.initialContext || {},
            onComplete: chainSpec.onComplete,
            onError: chainSpec.onError
        };

        // Start the chain
        this.processChainStep(chain);
        
        return chain.id;
    }

    processChainStep(chain) {
        if (chain.currentStep >= chain.steps.length) {
            if (chain.onComplete) {
                chain.onComplete(chain.context);
            }
            return;
        }

        const step = chain.steps[chain.currentStep];
        
        // Subscribe to step completion event
        const subscriptionId = this.subscribe(step.waitFor, (event) => {
            // Update context with event data
            if (step.updateContext) {
                chain.context = step.updateContext(chain.context, event);
            }

            // Unsubscribe from this step
            this.unsubscribe(step.waitFor, subscriptionId);

            // Move to next step
            chain.currentStep++;
            this.processChainStep(chain);
        });

        // Emit the step's trigger event
        if (step.emit) {
            this.emit(step.emit.type, {
                ...step.emit.payload,
                chainId: chain.id,
                stepIndex: chain.currentStep
            });
        }
    }

    // Temporal event queries
    queryEvents(query) {
        const events = this.eventHistory.getAll();
        let filteredEvents = events;

        // Filter by time range
        if (query.timeRange) {
            const now = Date.now();
            const startTime = now - query.timeRange.duration;
            filteredEvents = filteredEvents.filter(e => 
                e.timestamp >= startTime && e.timestamp <= now
            );
        }

        // Filter by event type
        if (query.type) {
            const types = Array.isArray(query.type) ? query.type : [query.type];
            filteredEvents = filteredEvents.filter(e => types.includes(e.type));
        }

        // Filter by semantic domains
        if (query.semanticDomains) {
            filteredEvents = filteredEvents.filter(e =>
                query.semanticDomains.some(domain => 
                    e.semantic.domains.includes(domain)
                )
            );
        }

        // Apply custom filters
        if (query.filter) {
            filteredEvents = filteredEvents.filter(query.filter);
        }

        return filteredEvents;
    }

    // Generate correlation analysis between events
    analyzeCorrelations(timeWindow = 5000) {
        const recentEvents = this.queryEvents({
            timeRange: { duration: timeWindow }
        });

        const correlations = new Map();
        
        // Find events that frequently occur together
        for (let i = 0; i < recentEvents.length - 1; i++) {
            for (let j = i + 1; j < recentEvents.length; j++) {
                const event1 = recentEvents[i];
                const event2 = recentEvents[j];
                const timeDiff = Math.abs(event1.timestamp - event2.timestamp);
                
                if (timeDiff < 1000) { // Within 1 second
                    const pair = `${event1.type}:${event2.type}`;
                    correlations.set(pair, (correlations.get(pair) || 0) + 1);
                }
            }
        }

        return Array.from(correlations.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10); // Top 10 correlations
    }

    // Performance monitoring
    updateMetrics(eventCount, processingTime) {
        this.metrics.eventsProcessed += eventCount;
        
        // Update average processing time
        const totalTime = this.metrics.averageProcessingTime * 
                         (this.metrics.eventsProcessed - eventCount) + processingTime;
        this.metrics.averageProcessingTime = totalTime / this.metrics.eventsProcessed;
    }

    getMetrics() {
        return {
            ...this.metrics,
            bufferSize: this.eventBuffer.length,
            listenerCount: Array.from(this.listeners.values())
                .reduce((sum, listeners) => sum + listeners.length, 0),
            eventHistorySize: this.eventHistory.size()
        };
    }

    // Utility methods
    generateEventId() {
        return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    generateSubscriptionId() {
        return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    generateChainId() {
        return `chain_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}

// Circular buffer for event history
class CircularBuffer {
    constructor(size) {
        this.buffer = new Array(size);
        this.size = size;
        this.head = 0;
        this.count = 0;
    }

    add(item) {
        this.buffer[this.head] = item;
        this.head = (this.head + 1) % this.size;
        if (this.count < this.size) {
            this.count++;
        }
    }

    getAll() {
        if (this.count === 0) return [];
        
        const result = [];
        let index = this.count < this.size ? 0 : this.head;
        
        for (let i = 0; i < this.count; i++) {
            result.push(this.buffer[index]);
            index = (index + 1) % this.size;
        }
        
        return result;
    }

    size() {
        return this.count;
    }
}