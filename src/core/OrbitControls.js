// OrbitControls implementation for smooth camera interaction
import * as THREE from 'three';

export class OrbitControls {
    constructor(camera, domElement) {
        this.object = camera;
        this.domElement = domElement;
        
        // API
        this.enabled = true;
        this.target = new THREE.Vector3();
        
        this.minDistance = 0;
        this.maxDistance = Infinity;
        this.minPolarAngle = 0; // radians
        this.maxPolarAngle = Math.PI; // radians
        this.minAzimuthAngle = -Infinity; // radians
        this.maxAzimuthAngle = Infinity; // radians
        
        this.enableDamping = false;
        this.dampingFactor = 0.05;
        
        this.enableZoom = true;
        this.zoomSpeed = 1.0;
        
        this.enableRotate = true;
        this.rotateSpeed = 1.0;
        
        this.enablePan = true;
        this.panSpeed = 1.0;
        this.screenSpacePanning = true;
        
        this.autoRotate = false;
        this.autoRotateSpeed = 2.0; // 30 seconds per round
        
        this.enableKeys = true;
        
        // Internals
        this.scope = this;
        this.changeEvent = { type: 'change' };
        this.startEvent = { type: 'start' };
        this.endEvent = { type: 'end' };
        
        this.state = {
            NONE: -1,
            ROTATE: 0,
            DOLLY: 1,
            PAN: 2,
            TOUCH_ROTATE: 3,
            TOUCH_PAN: 4,
            TOUCH_DOLLY_PAN: 5,
            TOUCH_DOLLY_ROTATE: 6
        };
        
        this.currentState = this.state.NONE;
        
        this.EPS = 0.000001;
        
        // Current position in spherical coordinates
        this.spherical = new THREE.Spherical();
        this.sphericalDelta = new THREE.Spherical();
        
        this.scale = 1;
        this.panOffset = new THREE.Vector3();
        this.zoomChanged = false;
        
        this.rotateStart = new THREE.Vector2();
        this.rotateEnd = new THREE.Vector2();
        this.rotateDelta = new THREE.Vector2();
        
        this.panStart = new THREE.Vector2();
        this.panEnd = new THREE.Vector2();
        this.panDelta = new THREE.Vector2();
        
        this.dollyStart = new THREE.Vector2();
        this.dollyEnd = new THREE.Vector2();
        this.dollyDelta = new THREE.Vector2();
        
        this.setupEventListeners();
        this.update();
    }
    
    setupEventListeners() {
        this.onContextMenu = (event) => {
            if (this.enabled === false) return;
            event.preventDefault();
        };
        
        this.onMouseDown = (event) => {
            if (this.enabled === false) return;
            
            event.preventDefault();
            
            switch (event.button) {
                case 0: // Left mouse button
                    if (event.ctrlKey || event.metaKey || event.shiftKey) {
                        if (this.enablePan === false) return;
                        this.handleMouseDownPan(event);
                        this.currentState = this.state.PAN;
                    } else {
                        if (this.enableRotate === false) return;
                        this.handleMouseDownRotate(event);
                        this.currentState = this.state.ROTATE;
                    }
                    break;
                    
                case 1: // Middle mouse button
                    if (this.enableZoom === false) return;
                    this.handleMouseDownDolly(event);
                    this.currentState = this.state.DOLLY;
                    break;
                    
                case 2: // Right mouse button
                    if (this.enablePan === false) return;
                    this.handleMouseDownPan(event);
                    this.currentState = this.state.PAN;
                    break;
            }
            
            if (this.currentState !== this.state.NONE) {
                this.domElement.addEventListener('mousemove', this.onMouseMove, false);
                this.domElement.addEventListener('mouseup', this.onMouseUp, false);
                this.dispatchEvent(this.startEvent);
            }
        };
        
        this.onMouseMove = (event) => {
            if (this.enabled === false) return;
            
            event.preventDefault();
            
            switch (this.currentState) {
                case this.state.ROTATE:
                    if (this.enableRotate === false) return;
                    this.handleMouseMoveRotate(event);
                    break;
                    
                case this.state.DOLLY:
                    if (this.enableZoom === false) return;
                    this.handleMouseMoveDolly(event);
                    break;
                    
                case this.state.PAN:
                    if (this.enablePan === false) return;
                    this.handleMouseMovePan(event);
                    break;
            }
        };
        
        this.onMouseUp = (event) => {
            if (this.enabled === false) return;
            
            this.handleMouseUp(event);
            
            this.domElement.removeEventListener('mousemove', this.onMouseMove, false);
            this.domElement.removeEventListener('mouseup', this.onMouseUp, false);
            
            this.dispatchEvent(this.endEvent);
            this.currentState = this.state.NONE;
        };
        
        this.onMouseWheel = (event) => {
            if (this.enabled === false || this.enableZoom === false || 
                (this.currentState !== this.state.NONE && this.currentState !== this.state.ROTATE)) return;
            
            event.preventDefault();
            event.stopPropagation();
            
            this.dispatchEvent(this.startEvent);
            this.handleMouseWheel(event);
            this.dispatchEvent(this.endEvent);
        };
        
        // Add event listeners
        this.domElement.addEventListener('contextmenu', this.onContextMenu, false);
        this.domElement.addEventListener('mousedown', this.onMouseDown, false);
        this.domElement.addEventListener('wheel', this.onMouseWheel, false);
    }
    
    handleMouseDownRotate(event) {
        this.rotateStart.set(event.clientX, event.clientY);
    }
    
    handleMouseDownDolly(event) {
        this.dollyStart.set(event.clientX, event.clientY);
    }
    
    handleMouseDownPan(event) {
        this.panStart.set(event.clientX, event.clientY);
    }
    
    handleMouseMoveRotate(event) {
        this.rotateEnd.set(event.clientX, event.clientY);
        
        this.rotateDelta.subVectors(this.rotateEnd, this.rotateStart).multiplyScalar(this.rotateSpeed);
        
        const element = this.domElement;
        
        this.rotateLeft(2 * Math.PI * this.rotateDelta.x / element.clientHeight);
        this.rotateUp(2 * Math.PI * this.rotateDelta.y / element.clientHeight);
        
        this.rotateStart.copy(this.rotateEnd);
        
        this.update();
    }
    
    handleMouseMoveDolly(event) {
        this.dollyEnd.set(event.clientX, event.clientY);
        this.dollyDelta.subVectors(this.dollyEnd, this.dollyStart);
        
        if (this.dollyDelta.y > 0) {
            this.dollyOut(this.getZoomScale());
        } else if (this.dollyDelta.y < 0) {
            this.dollyIn(this.getZoomScale());
        }
        
        this.dollyStart.copy(this.dollyEnd);
        this.update();
    }
    
    handleMouseMovePan(event) {
        this.panEnd.set(event.clientX, event.clientY);
        this.panDelta.subVectors(this.panEnd, this.panStart).multiplyScalar(this.panSpeed);
        this.pan(this.panDelta.x, this.panDelta.y);
        this.panStart.copy(this.panEnd);
        this.update();
    }
    
    handleMouseUp(event) {
        // Empty
    }
    
    handleMouseWheel(event) {
        if (event.deltaY < 0) {
            this.dollyIn(this.getZoomScale());
        } else if (event.deltaY > 0) {
            this.dollyOut(this.getZoomScale());
        }
        
        this.update();
    }
    
    rotateLeft(angle) {
        this.sphericalDelta.theta -= angle;
    }
    
    rotateUp(angle) {
        this.sphericalDelta.phi -= angle;
    }
    
    panLeft(distance, objectMatrix) {
        const v = new THREE.Vector3();
        v.setFromMatrixColumn(objectMatrix, 0); // get X column of objectMatrix
        v.multiplyScalar(-distance);
        this.panOffset.add(v);
    }
    
    panUp(distance, objectMatrix) {
        const v = new THREE.Vector3();
        
        if (this.screenSpacePanning === true) {
            v.setFromMatrixColumn(objectMatrix, 1);
        } else {
            v.setFromMatrixColumn(objectMatrix, 0);
            v.crossVectors(this.object.up, v);
        }
        
        v.multiplyScalar(distance);
        this.panOffset.add(v);
    }
    
    pan(deltaX, deltaY) {
        const element = this.domElement;
        
        if (this.object.isPerspectiveCamera) {
            const position = this.object.position;
            const offset = position.clone().sub(this.target);
            let targetDistance = offset.length();
            
            targetDistance *= Math.tan((this.object.fov / 2) * Math.PI / 180.0);
            
            this.panLeft(2 * deltaX * targetDistance / element.clientHeight, this.object.matrix);
            this.panUp(2 * deltaY * targetDistance / element.clientHeight, this.object.matrix);
        } else if (this.object.isOrthographicCamera) {
            this.panLeft(deltaX * (this.object.right - this.object.left) / this.object.zoom / element.clientWidth, this.object.matrix);
            this.panUp(deltaY * (this.object.top - this.object.bottom) / this.object.zoom / element.clientHeight, this.object.matrix);
        }
    }
    
    dollyOut(dollyScale) {
        if (this.object.isPerspectiveCamera) {
            this.scale /= dollyScale;
        } else if (this.object.isOrthographicCamera) {
            this.object.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.object.zoom * dollyScale));
            this.object.updateProjectionMatrix();
            this.zoomChanged = true;
        }
    }
    
    dollyIn(dollyScale) {
        if (this.object.isPerspectiveCamera) {
            this.scale *= dollyScale;
        } else if (this.object.isOrthographicCamera) {
            this.object.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.object.zoom / dollyScale));
            this.object.updateProjectionMatrix();
            this.zoomChanged = true;
        }
    }
    
    getZoomScale() {
        return Math.pow(0.95, this.zoomSpeed);
    }
    
    update() {
        const offset = new THREE.Vector3();
        const quat = new THREE.Quaternion().setFromUnitVectors(this.object.up, new THREE.Vector3(0, 1, 0));
        const quatInverse = quat.clone().invert();
        
        const lastPosition = new THREE.Vector3();
        const lastQuaternion = new THREE.Quaternion();
        
        const twoPI = 2 * Math.PI;
        
        return () => {
            const position = this.object.position;
            
            offset.copy(position).sub(this.target);
            
            // Rotate offset to "y-axis-is-up" space
            offset.applyQuaternion(quat);
            
            // Angle from z-axis around y-axis
            this.spherical.setFromVector3(offset);
            
            if (this.autoRotate && this.currentState === this.state.NONE) {
                this.rotateLeft(this.getAutoRotationAngle());
            }
            
            if (this.enableDamping) {
                this.spherical.theta += this.sphericalDelta.theta * this.dampingFactor;
                this.spherical.phi += this.sphericalDelta.phi * this.dampingFactor;
            } else {
                this.spherical.theta += this.sphericalDelta.theta;
                this.spherical.phi += this.sphericalDelta.phi;
            }
            
            // Restrict theta to be between desired limits
            let min = this.minAzimuthAngle;
            let max = this.maxAzimuthAngle;
            
            if (isFinite(min) && isFinite(max)) {
                if (min < -Math.PI) min += twoPI;
                else if (min > Math.PI) min -= twoPI;
                
                if (max < -Math.PI) max += twoPI;
                else if (max > Math.PI) max -= twoPI;
                
                if (min <= max) {
                    this.spherical.theta = Math.max(min, Math.min(max, this.spherical.theta));
                } else {
                    this.spherical.theta = (this.spherical.theta > (min + max) / 2) ?
                        Math.max(min, this.spherical.theta) :
                        Math.min(max, this.spherical.theta);
                }
            }
            
            // Restrict phi to be between desired limits
            this.spherical.phi = Math.max(this.minPolarAngle, Math.min(this.maxPolarAngle, this.spherical.phi));
            
            this.spherical.makeSafe();
            
            this.spherical.radius *= this.scale;
            
            // Restrict radius to be between desired limits
            this.spherical.radius = Math.max(this.minDistance, Math.min(this.maxDistance, this.spherical.radius));
            
            // Move target to panned location
            
            if (this.enableDamping === true) {
                this.target.addScaledVector(this.panOffset, this.dampingFactor);
            } else {
                this.target.add(this.panOffset);
            }
            
            offset.setFromSpherical(this.spherical);
            
            // Rotate offset back to "camera-up-vector-is-up" space
            offset.applyQuaternion(quatInverse);
            
            position.copy(this.target).add(offset);
            
            this.object.lookAt(this.target);
            
            if (this.enableDamping === true) {
                this.sphericalDelta.theta *= (1 - this.dampingFactor);
                this.sphericalDelta.phi *= (1 - this.dampingFactor);
                
                this.panOffset.multiplyScalar(1 - this.dampingFactor);
            } else {
                this.sphericalDelta.set(0, 0, 0);
                this.panOffset.set(0, 0, 0);
            }
            
            this.scale = 1;
            
            // Update condition is:
            // min(camera displacement, camera rotation in radians)^2 > EPS
            // using small-angle approximation cos(x/2) = 1 - x^2 / 8
            
            if (this.zoomChanged ||
                lastPosition.distanceToSquared(this.object.position) > this.EPS ||
                8 * (1 - lastQuaternion.dot(this.object.quaternion)) > this.EPS) {
                
                this.dispatchEvent(this.changeEvent);
                
                lastPosition.copy(this.object.position);
                lastQuaternion.copy(this.object.quaternion);
                this.zoomChanged = false;
                
                return true;
            }
            
            return false;
        };
    }()
    
    getAutoRotationAngle() {
        return 2 * Math.PI / 60 / 60 * this.autoRotateSpeed;
    }
    
    dispose() {
        this.domElement.removeEventListener('contextmenu', this.onContextMenu, false);
        this.domElement.removeEventListener('mousedown', this.onMouseDown, false);
        this.domElement.removeEventListener('wheel', this.onMouseWheel, false);
        
        this.domElement.removeEventListener('mousemove', this.onMouseMove, false);
        this.domElement.removeEventListener('mouseup', this.onMouseUp, false);
    }
    
    // Event dispatcher functionality
    dispatchEvent(event) {
        // Simple event dispatching
        if (this.listeners) {
            const array = this.listeners[event.type];
            if (array !== undefined) {
                const target = this;
                event.target = target;
                
                for (let i = 0, l = array.length; i < l; i++) {
                    array[i].call(target, event);
                }
            }
        }
    }
    
    addEventListener(type, listener) {
        if (this.listeners === undefined) this.listeners = {};
        
        const listeners = this.listeners;
        
        if (listeners[type] === undefined) {
            listeners[type] = [];
        }
        
        if (listeners[type].indexOf(listener) === -1) {
            listeners[type].push(listener);
        }
    }
    
    removeEventListener(type, listener) {
        if (this.listeners === undefined) return;
        
        const listeners = this.listeners;
        const listenerArray = listeners[type];
        
        if (listenerArray !== undefined) {
            const index = listenerArray.indexOf(listener);
            
            if (index !== -1) {
                listenerArray.splice(index, 1);
            }
        }
    }
}