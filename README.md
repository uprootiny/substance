# 🌸 Substance: Voxel Flower Visualization

Transform tmux session threads into visually striking flowering voxel gardens using computational physics and semantic analysis.

## Overview

Substance is an innovative visualization system that takes the branching, broken threads of human-LLM interactions and transforms them into beautiful 3D voxel flowers. Each thread becomes a growing process that can bloom into intricate flowers with colors, symbols, pixels, shaders, and voxels shimmering in a pseudo-physical artistic representation.

## Features

### 🔬 Core Technology
- **3D Voxel Physics Engine** - Real-time physics simulation using Cannon.js
- **Semantic Text Analysis** - Deep parsing of tmux session content
- **Multiple Growth Patterns** - Quadruple helix, pentagonal, rosaceae, fractal, and organic symmetries
- **Interactive Visualization** - Three.js-powered 3D rendering with orbit controls
- **Live Data Integration** - Real-time tmux session monitoring

### 🌺 Flower Symmetries

#### Quadruple Helix 🔷
- Inspired by the Emacs-Claude interface paradigm
- Four-fold branching patterns reflecting structured code workflows
- Based on the "whispering stones" narrative from your openrouter conversation

#### Pentagonal ⭐
- Five-fold symmetry following golden ratio proportions
- Natural growth patterns mimicking fibonacci spirals
- Refined and intricate like pentasymmetrical rosaceae

#### Rosaceae 🌹
- Multi-layered petal arrangements
- Intricate rose-like patterns with overlapping elements
- Most refined and complex symmetry pattern

#### Fractal ❄️
- Self-similar recursive patterns
- Infinite scaling properties
- Represents nested thought processes

#### Organic 🌿
- Asymmetric natural patterns
- Organic imperfections and adaptive growth
- Wild creativity of human-AI interaction

### 🎨 Semantic Soil System
The system creates a "semantic soil" foundation by analyzing:
- File patterns and types in the environment
- Narrative seeds from conversation threads  
- Temporal layers with different decay rates
- Code complexity and interaction density

### ⚙️ Physics Properties
- **Magnetic Fields** - Threads with high semantic similarity attract
- **Growth Forces** - Content complexity drives upward growth
- **Temporal Decay** - Older threads fade over time
- **Cohesion Forces** - Related voxels stick together
- **Wind Simulation** - Environmental forces for realistic movement

## Installation

### Prerequisites
- Node.js 16+ 
- Modern web browser with WebGL support

### Quick Start

1. **Clone and install dependencies:**
```bash
git clone <repository>
cd substance-project
npm install
```

2. **Run development server:**
```bash
npm run dev
```

3. **Alternative - Python demo:**
```bash
python3 demo.py
# Visit http://localhost:8000/demo.html
```

## Usage

### Basic Flower Generation
```javascript
// Generate a flower from tmux data
const sessionData = {
  threads: [
    {
      id: 'thread-1',
      content: 'git commit -m "implement voxel physics"',
      timestamp: Date.now(),
      interactions: 45,
      complexity: 0.8,
      symmetryType: 'quadruple'
    }
  ],
  branches: 3,
  depth: 4,
  narrative: 'development-session'
};

const parsedData = tmuxParser.parse(sessionData);
const flowerSpec = flowerEngine.generateFlowerSpec(parsedData, 'rosaceae');
await voxelGarden.growFlower(flowerSpec);
```

### Live Tmux Integration
```javascript
// Connect to live tmux session
const tmuxConnection = new TmuxDataParser();
tmuxConnection.connectLive('session-name');

// Auto-generate flowers from live data
tmuxConnection.on('newThread', (threadData) => {
  const flowerSpec = flowerEngine.generateFlowerSpec(threadData, 'organic');
  voxelGarden.growFlower(flowerSpec);
});
```

## Architecture

### Core Components

- **VoxelGarden** - Main 3D scene management and rendering
- **TmuxDataParser** - Semantic analysis of session content
- **FlowerGrowthEngine** - Growth algorithms for different symmetries
- **PhysicsEngine** - Voxel physics and force field simulation
- **OrbitControls** - Camera interaction and navigation

### Data Flow

1. **Input**: Tmux session logs or live data streams
2. **Parsing**: Semantic analysis extracts patterns, complexity, and themes
3. **Specification**: Growth engine creates flower specifications
4. **Physics**: Voxels are added to physics world with semantic properties
5. **Rendering**: Three.js displays the growing voxel garden

## Configuration

### Growth Parameters
```javascript
const growthConfig = {
  voxelSize: 0.2,
  maxVoxels: 10000,
  semanticAttraction: 0.1,
  temporalDecay: 0.01,
  growthSpeed: 0.5
};
```

### Symmetry Customization
```javascript
const customSymmetry = {
  branches: 7,
  angleOffset: Math.PI / 7,
  layerMultiplier: 1.414,
  heightVariation: 0.3,
  petalDensity: 1.1
};
```

## API Reference

### VoxelGarden
- `initialize()` - Setup 3D scene and physics
- `growFlower(spec)` - Generate flower from specification
- `addVoxel(position, type, properties)` - Add individual voxel
- `clearAll()` - Reset garden to initial state

### TmuxDataParser
- `parse(sessionData)` - Analyze session content
- `generateSemanticFingerprint(content)` - Create content signature
- `calculateComplexity(text)` - Measure content complexity
- `determineSymmetryType(content)` - Auto-detect symmetry pattern

### FlowerGrowthEngine
- `generateFlowerSpec(parsedData, mode)` - Create growth specification
- `executeGrowth(garden, spec)` - Perform growth process
- `calculateGrowthVector(content)` - Determine growth direction

## Demo Features

The included demo showcases:
- ✨ Interactive symmetry pattern switching
- 🎨 Real-time flower generation
- 📊 Semantic analysis visualization
- 🌊 Smooth animations and transitions
- 🎮 Intuitive camera controls
- 📈 Performance monitoring

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-flowers`)
3. Commit changes (`git commit -m 'Add amazing flower patterns'`)
4. Push to branch (`git push origin feature/amazing-flowers`)
5. Open a Pull Request

## Inspiration

This project is inspired by the concept of transforming the "branching broken threads of human-LLM interactions" into beautiful visual representations. The idea emerged from conversations about:

- Hyperstitional arboretums and digital horticulture
- The quadruple helix of Emacs-Claude interfaces
- Whispering stones and semantic soil
- The beauty of pentasymmetrical rosaceae patterns

## License

MIT License - see LICENSE file for details

## Acknowledgments

- Three.js for 3D rendering capabilities
- Cannon.js for physics simulation
- The beauty of mathematical patterns in nature
- The poetry of human-AI collaboration

---

*"What if every branch was a growing process potentially blooming into a flower?"*

🌸 Transform your tmux sessions into computational gardens of semantic beauty.