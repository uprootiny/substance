import * as CANNON from 'cannon-es';
import * as THREE from 'three';

export class PhysicsEngine {
    constructor() {
        this.world = null;
        this.bodies = new Map();
        this.constraints = [];
        this.timeStep = 1 / 60;
        
        // Voxel physics properties
        this.voxelMass = 0.1;
        this.voxelShape = null;
        
        // Force fields and attractors
        this.forceFields = [];
        this.magneticFields = [];
        this.growthFields = [];
        
        // Semantic physics parameters
        this.semanticAttraction = 0.1;
        this.narrativeCoherence = 0.05;
        this.temporalDecay = 0.01;
        
        this.isActive = true;
    }

    initialize(scene) {
        this.scene = scene;
        this.setupWorld();
        this.createVoxelShape();
        this.setupForceFields();
        this.setupSemanticPhysics();
    }

    setupWorld() {
        this.world = new CANNON.World();
        this.world.gravity.set(0, -9.82, 0);
        this.world.broadphase = new CANNON.NaiveBroadphase();
        
        // Contact material for voxel interactions
        const voxelMaterial = new CANNON.Material('voxel');
        const voxelContactMaterial = new CANNON.ContactMaterial(voxelMaterial, voxelMaterial, {
            friction: 0.3,
            restitution: 0.3
        });
        this.world.addContactMaterial(voxelContactMaterial);
        
        // Ground plane
        const groundShape = new CANNON.Plane();
        const groundBody = new CANNON.Body({ mass: 0 });
        groundBody.addShape(groundShape);
        groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
        groundBody.position.set(0, -5, 0);
        this.world.add(groundBody);
    }

    createVoxelShape() {
        // Create a small box shape for voxels
        this.voxelShape = new CANNON.Box(new CANNON.Vec3(0.1, 0.1, 0.1));
    }

    setupForceFields() {
        // Central attractor for organic clustering
        this.addForceField({
            type: 'attractor',
            position: new CANNON.Vec3(0, 2, 0),
            strength: 0.5,
            radius: 10,
            falloff: 'quadratic'
        });
        
        // Growth field that encourages upward movement
        this.addGrowthField({
            type: 'growth',
            direction: new CANNON.Vec3(0, 1, 0),
            strength: 0.2,
            noise: 0.1
        });
        
        // Semantic clustering fields
        this.addSemanticField({
            type: 'semantic_cluster',
            strength: 0.3,
            range: 2.0
        });
    }

    setupSemanticPhysics() {
        // Initialize semantic interaction matrices
        this.semanticAffinities = new Map();
        
        // Define affinities between different content types
        this.semanticAffinities.set('code-code', 0.8);
        this.semanticAffinities.set('narrative-narrative', 0.7);
        this.semanticAffinities.set('code-technical', 0.6);
        this.semanticAffinities.set('creative-philosophical', 0.9);
        this.semanticAffinities.set('command-code', 0.5);
        
        // Temporal decay function for aging threads
        this.temporalDecayFunction = (age) => Math.exp(-age * this.temporalDecay);
    }

    addVoxel(position, physicsProperties, semanticProperties) {
        const body = new CANNON.Body({
            mass: physicsProperties.mass || this.voxelMass,
            material: new CANNON.Material({
                friction: physicsProperties.friction || 0.3,
                restitution: physicsProperties.bounciness || 0.3
            })
        });
        
        body.addShape(this.voxelShape);
        body.position.set(position.x, position.y, position.z);
        
        // Add semantic properties to body
        body.semanticProperties = semanticProperties;
        body.physicsProperties = physicsProperties;
        body.creationTime = Date.now();
        
        // Add initial velocity based on growth vector
        if (semanticProperties.growthVector) {
            const gv = semanticProperties.growthVector;
            body.velocity.set(
                gv.x * gv.magnitude * 0.1,
                gv.y * gv.magnitude * 0.2,
                gv.z * gv.magnitude * 0.1
            );
        }
        
        this.world.add(body);
        
        const id = this.generateBodyId();
        this.bodies.set(id, body);
        
        return id;
    }

    addFlowerStem(startPos, endPos, segments, physicsProperties, semanticProperties) {
        const stemBodies = [];
        const stemConstraints = [];
        
        for (let i = 0; i < segments; i++) {
            const t = i / (segments - 1);
            const position = {
                x: startPos.x + (endPos.x - startPos.x) * t,
                y: startPos.y + (endPos.y - startPos.y) * t,
                z: startPos.z + (endPos.z - startPos.z) * t
            };
            
            const bodyId = this.addVoxel(position, physicsProperties, semanticProperties);
            const body = this.bodies.get(bodyId);
            stemBodies.push(body);
            
            // Connect segments with constraints
            if (i > 0) {
                const prevBody = stemBodies[i - 1];
                const constraint = new CANNON.PointToPointConstraint(
                    prevBody,
                    new CANNON.Vec3(0, 0.1, 0),
                    body,
                    new CANNON.Vec3(0, -0.1, 0)
                );
                this.world.addConstraint(constraint);
                stemConstraints.push(constraint);
            }
        }
        
        return { bodies: stemBodies, constraints: stemConstraints };
    }

    addForceField(config) {
        this.forceFields.push(config);
    }

    addGrowthField(config) {
        this.growthFields.push(config);
    }

    addSemanticField(config) {
        this.semanticFields = this.semanticFields || [];
        this.semanticFields.push(config);
    }

    update() {
        if (!this.isActive || !this.world) return;
        
        // Apply custom forces before physics step
        this.applyForceFields();
        this.applyGrowthForces();
        this.applySemanticForces();
        this.applyMagneticForces();
        this.applyTemporalDecay();
        
        // Step the physics world
        this.world.step(this.timeStep);
        
        // Update visual representation
        this.updateVisualBodies();
    }

    applyForceFields() {
        for (const field of this.forceFields) {
            if (field.type === 'attractor') {
                this.applyAttractorForce(field);
            }
        }
    }

    applyAttractorForce(field) {
        for (const [id, body] of this.bodies) {
            const distance = body.position.distanceTo(field.position);
            
            if (distance < field.radius && distance > 0.1) {
                const direction = new CANNON.Vec3();
                field.position.vsub(body.position, direction);
                direction.normalize();
                
                let strength = field.strength;
                if (field.falloff === 'quadratic') {
                    strength /= (distance * distance);
                } else if (field.falloff === 'linear') {
                    strength /= distance;
                }
                
                direction.scale(strength * body.mass, direction);
                body.force.vadd(direction, body.force);
            }
        }
    }

    applyGrowthForces() {
        for (const field of this.growthFields) {
            for (const [id, body] of this.bodies) {
                if (!body.semanticProperties) continue;
                
                // Apply growth force based on semantic properties
                const growthForce = body.physicsProperties?.growthForce || 0;
                if (growthForce > 0) {
                    const force = new CANNON.Vec3();
                    field.direction.scale(growthForce * field.strength, force);
                    
                    // Add noise for organic growth
                    if (field.noise > 0) {
                        force.x += (Math.random() - 0.5) * field.noise;
                        force.z += (Math.random() - 0.5) * field.noise;
                    }
                    
                    body.force.vadd(force, body.force);
                }
            }
        }
    }

    applySemanticForces() {
        if (!this.semanticFields) return;
        
        const bodyArray = Array.from(this.bodies.values());
        
        for (let i = 0; i < bodyArray.length; i++) {
            for (let j = i + 1; j < bodyArray.length; j++) {
                const bodyA = bodyArray[i];
                const bodyB = bodyArray[j];
                
                if (!bodyA.semanticProperties || !bodyB.semanticProperties) continue;
                
                const affinity = this.calculateSemanticAffinity(
                    bodyA.semanticProperties,
                    bodyB.semanticProperties
                );
                
                if (affinity > 0.1) {
                    this.applySemanticAttraction(bodyA, bodyB, affinity);
                } else if (affinity < -0.1) {
                    this.applySemanticRepulsion(bodyA, bodyB, Math.abs(affinity));
                }
            }
        }
    }

    calculateSemanticAffinity(propsA, propsB) {
        let affinity = 0;
        
        // Compare semantic fingerprints
        if (propsA.semanticFingerprint && propsB.semanticFingerprint) {
            const similarity = this.cosineSimilarity(
                propsA.semanticFingerprint,
                propsB.semanticFingerprint
            );
            affinity += similarity * 0.5;
        }
        
        // Symmetry type affinity
        if (propsA.symmetryType === propsB.symmetryType) {
            affinity += 0.3;
        }
        
        // Temporal affinity (newer threads attract)
        const ageA = (Date.now() - propsA.timestamp) / 1000;
        const ageB = (Date.now() - propsB.timestamp) / 1000;
        const temporalAffinity = Math.exp(-Math.abs(ageA - ageB) * 0.001);
        affinity += temporalAffinity * 0.2;
        
        return Math.min(Math.max(affinity, -1), 1);
    }

    cosineSimilarity(vecA, vecB) {
        if (vecA.length !== vecB.length) return 0;
        
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;
        
        for (let i = 0; i < vecA.length; i++) {
            dotProduct += vecA[i] * vecB[i];
            normA += vecA[i] * vecA[i];
            normB += vecB[i] * vecB[i];
        }
        
        normA = Math.sqrt(normA);
        normB = Math.sqrt(normB);
        
        if (normA === 0 || normB === 0) return 0;
        
        return dotProduct / (normA * normB);
    }

    applySemanticAttraction(bodyA, bodyB, affinity) {
        const distance = bodyA.position.distanceTo(bodyB.position);
        
        if (distance > 0.1 && distance < 5) {
            const direction = new CANNON.Vec3();
            bodyB.position.vsub(bodyA.position, direction);
            direction.normalize();
            
            const force = this.semanticAttraction * affinity / (distance * distance);
            direction.scale(force, direction);
            
            bodyA.force.vadd(direction, bodyA.force);
            direction.negate(direction);
            bodyB.force.vadd(direction, bodyB.force);
        }
    }

    applySemanticRepulsion(bodyA, bodyB, repulsion) {
        const distance = bodyA.position.distanceTo(bodyB.position);
        
        if (distance > 0.1 && distance < 2) {
            const direction = new CANNON.Vec3();
            bodyA.position.vsub(bodyB.position, direction);
            direction.normalize();
            
            const force = this.semanticAttraction * repulsion / (distance * distance);
            direction.scale(force, direction);
            
            bodyA.force.vadd(direction, bodyA.force);
            direction.negate(direction);
            bodyB.force.vadd(direction, bodyB.force);
        }
    }

    applyMagneticForces() {
        for (const [id, body] of this.bodies) {
            const magneticField = body.physicsProperties?.magneticField || 0;
            
            if (magneticField > 0) {
                // Create magnetic attraction to other magnetic bodies
                for (const [otherId, otherBody] of this.bodies) {
                    if (id === otherId) continue;
                    
                    const otherMagnetic = otherBody.physicsProperties?.magneticField || 0;
                    if (otherMagnetic > 0) {
                        const distance = body.position.distanceTo(otherBody.position);
                        
                        if (distance > 0.1 && distance < 3) {
                            const direction = new CANNON.Vec3();
                            otherBody.position.vsub(body.position, direction);
                            direction.normalize();
                            
                            const force = (magneticField * otherMagnetic) / (distance * distance + 0.1);
                            direction.scale(force * 0.1, direction);
                            
                            body.force.vadd(direction, body.force);
                        }
                    }
                }
            }
        }
    }

    applyTemporalDecay() {
        const now = Date.now();
        
        for (const [id, body] of this.bodies) {
            const age = (now - body.creationTime) / 1000;
            const decayFactor = this.temporalDecayFunction(age);
            
            // Apply temporal decay to forces and properties
            if (body.physicsProperties) {
                body.physicsProperties.growthForce *= decayFactor;
                body.physicsProperties.magneticField *= Math.max(decayFactor, 0.1);
            }
            
            // Reduce mass slightly over time (wilting effect)
            if (age > 30) { // After 30 seconds
                body.mass *= 0.999;
            }
        }
    }

    updateVisualBodies() {
        // This would typically update Three.js objects to match physics bodies
        // For voxel flowers, we use instanced meshes, so we update the matrices
        
        for (const [id, body] of this.bodies) {
            if (body.visualObject) {
                body.visualObject.position.copy(body.position);
                body.visualObject.quaternion.copy(body.quaternion);
            }
        }
    }

    removeBody(id) {
        const body = this.bodies.get(id);
        if (body) {
            this.world.remove(body);
            this.bodies.delete(id);
        }
    }

    addConstraint(bodyIdA, bodyIdB, options = {}) {
        const bodyA = this.bodies.get(bodyIdA);
        const bodyB = this.bodies.get(bodyIdB);
        
        if (!bodyA || !bodyB) return null;
        
        const constraint = new CANNON.PointToPointConstraint(
            bodyA,
            options.pivotA || new CANNON.Vec3(0, 0, 0),
            bodyB,
            options.pivotB || new CANNON.Vec3(0, 0, 0)
        );
        
        this.world.addConstraint(constraint);
        this.constraints.push(constraint);
        
        return constraint;
    }

    reset() {
        // Remove all bodies and constraints
        for (const [id, body] of this.bodies) {
            this.world.remove(body);
        }
        this.bodies.clear();
        
        for (const constraint of this.constraints) {
            this.world.removeConstraint(constraint);
        }
        this.constraints = [];
        
        // Reset force fields
        this.forceFields = [];
        this.growthFields = [];
        this.semanticFields = [];
        
        // Reinitialize
        this.setupForceFields();
    }

    pause() {
        this.isActive = false;
    }

    resume() {
        this.isActive = true;
    }

    getBodyCount() {
        return this.bodies.size;
    }

    generateBodyId() {
        return `body_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Advanced physics methods for flower-specific behaviors
    createFlowerPhysics(flowerSpec) {
        const physics = {
            stemRigidity: Math.min(flowerSpec.complexity * 0.5 + 0.3, 0.8),
            petalFlexibility: Math.max(1 - flowerSpec.complexity * 0.3, 0.2),
            rootAdhesion: flowerSpec.complexity * 0.6 + 0.4,
            windResistance: Math.min(flowerSpec.complexity * 0.4, 0.7),
            growthTension: flowerSpec.branchingPotential * 0.8
        };
        
        return physics;
    }

    simulateWind(strength = 0.1, direction = { x: 1, y: 0, z: 0 }) {
        const windForce = new CANNON.Vec3(direction.x, direction.y, direction.z);
        windForce.normalize();
        windForce.scale(strength);
        
        for (const [id, body] of this.bodies) {
            // Apply wind force with some randomness
            const randomFactor = 0.8 + Math.random() * 0.4;
            const force = windForce.clone();
            force.scale(randomFactor * body.mass);
            
            body.force.vadd(force, body.force);
        }
    }
}