# Quick Reference: Adding New Garment Types

## Step-by-Step Guide

### Step 1: Add Pattern Generator to PatternEngine.js

Create a new pattern generator function following this template:

```javascript
/**
 * Pattern Generator for [Garment Type]
 * Calculates: [key measurements and dimensions]
 */
const generate[GarmentType]Pattern = (measurements, showSeams = true) => {
  const m = measurements;
  const scale = PATTERN_CONFIG.scale;
  
  // Extract needed measurements
  const width = m.chest * scale;
  const height = m.length * scale;
  
  // Define positioning offsets
  const xOff = 50;
  const yOff = 50;
  
  // Calculate viewBox dimensions
  const viewBoxWidth = width + 150;
  const viewBoxHeight = height + 100;

  // Generate main outline path
  const path = `M ${xOff},${yOff}
                L ${xOff + width},${yOff}
                L ${xOff + width},${yOff + height}
                L ${xOff},${yOff + height}
                Z`;

  // Generate seam allowance path (offset inward by ~8 units)
  const seamPath = showSeams ? `M ${xOff + 8},${yOff + 8}
                    L ${xOff + width - 8},${yOff + 8}
                    L ${xOff + width - 8},${yOff + height - 8}
                    L ${xOff + 8},${yOff + height - 8}
                    Z` : '';

  // Define internal construction lines
  const internalLines = [
    {
      d: `M ${xOff},${yOff + height * 0.5} L ${xOff + width},${yOff + height * 0.5}`,
      stroke: 'rgba(51, 65, 85, 0.4)',
      strokeWidth: 1
    }
  ];

  // Label key measurement points on the pattern
  const guideLabels = [
    { x: xOff + width / 2, y: yOff - 12, text: `Width: ${m.chest}"`, key: 'chest' },
    { x: xOff - 25, y: yOff + height / 2, text: `Length: ${m.length}"`, key: 'length' }
  ];

  // Annotate construction details with helper lines
  const annotations = [
    { x1: xOff, y1: yOff, x2: xOff + width, y2: yOff, key: 'width', label: 'Top Edge Construction Line' },
    { x1: xOff, y1: yOff + height, x2: xOff + width, y2: yOff + height, key: 'length', label: 'Bottom Hem Line' }
  ];

  return { path, seamPath, internalLines, guideLabels, annotations, viewBoxWidth, viewBoxHeight };
};
```

### Step 2: Register Pattern in generateCADBlueprint()

Add a case to the switch statement:

```javascript
export const generateCADBlueprint = (itemType, measurements = {}, showSeams = true) => {
  const parsedMeasurements = parseMeasurements(measurements);
  const patternType = getPatternType(itemType);

  let blueprintData;

  switch (patternType) {
    case 'shirt':
      blueprintData = generateShirtPattern(parsedMeasurements, showSeams);
      break;
    case 'trouser':
      blueprintData = generateTrouserPattern(parsedMeasurements, showSeams);
      break;
    case 'coat':
      blueprintData = generateCoatPattern(parsedMeasurements, showSeams);
      break;
    case 'dress':
      blueprintData = generateDressPattern(parsedMeasurements, showSeams);
      break;
    case 'skirt':  // NEW ENTRY
      blueprintData = generateSkirtPattern(parsedMeasurements, showSeams);
      break;
    case 'shirt':
    default:
      blueprintData = generateShirtPattern(parsedMeasurements, showSeams);
  }

  return blueprintData;
};
```

### Step 3: Update Pattern Type Matcher

Update the `getPatternType()` function:

```javascript
const getPatternType = (itemType = '') => {
  const type = (itemType || '').toLowerCase();
  
  if (type.includes('trouser') || type.includes('pant') || type.includes('bottom')) return 'trouser';
  if (type.includes('coat') || type.includes('jacket') || type.includes('suit')) return 'coat';
  if (type.includes('dress') || type.includes('gown') || type.includes('frock')) return 'dress';
  if (type.includes('skirt') || type.includes('a-line')) return 'skirt';  // NEW
  return 'shirt'; // Default pattern
};
```

### Step 4: Add Instructions to InstructionTemplate.js

Add a new template object to `INSTRUCTION_TEMPLATES`:

```javascript
const INSTRUCTION_TEMPLATES = {
  // ... existing templates ...
  
  skirt: {
    id: 'skirt',
    displayName: 'Skirt',
    category: 'casual',
    fabricFoldType: 'double fold (lengthwise)',
    grainlineRules: 'lengthwise grain runs parallel to centerline',
    seamAllowance: '5/8" (1.5 cm) standard, 1.5" (3.8 cm) at hem',
    cuttingPattern: {
      pieces: [
        { name: 'Front Panel (x1)', grainline: 'parallel to center', notes: 'Fold on centerline' },
        { name: 'Back Panel (x1)', grainline: 'parallel to center', notes: 'Fold on centerline' },
        { name: 'Side Panel (x2)', grainline: 'parallel to length', notes: 'Optional for A-line' },
        { name: 'Waistband', grainline: 'along length', notes: 'Interfaced' }
      ]
    },
    constructionSteps: [
      'Prepare fabric: Pre-wash woven fabrics, press thoroughly',
      'Lay pattern: Position panels on double-folded fabric',
      'Check grain: Verify lengthwise grain runs parallel to centerline',
      'Cut precisely: Use sharp shears, follow grain carefully',
      'Transfer markings: Mark darts, gathering points, zipper placement',
      'Sew front darts: From waistline to point, backstitch and knot',
      'Sew back darts: If applicable, press downward',
      'Install zipper: Centered or side placement depending on design',
      'Sew side seams: Pin, sew, and press open',
      'Attach waistband: Interface if needed, sew with even tension',
      'Hem length: Try on, mark appropriate length, hem with blind-stitch',
      'Final press: Press all seams and hem carefully'
    ],
    qualityCheckpoints: [
      '✓ Grain perfectly parallel on all panels',
      '✓ Waistband sits level',
      '✓ Zipper hidden and functional',
      '✓ Side seams are perfectly straight',
      '✓ Hem is level and invisible',
      '✓ All stitching is strong and even'
    ],
    specialNotes: 'For A-line skirts, increase the hem allowance to 1.5-2" for future adjustments.',
    estimatedTime: '120-150 minutes',
    difficulty: 'beginner-intermediate'
  }
};
```

### Step 5: Testing Your New Garment Type

```javascript
// Test PatternEngine
import { generateCADBlueprint } from '../../services/PatternEngine';

const blueprint = generateCADBlueprint('skirt', {
  chest: 34,
  waist: 28,
  hip: 38,
  length: 24
}, true);

console.log(blueprint); // Verify path, labels, annotations are generated

// Test InstructionTemplate
import { getInstructionTemplate } from '../../services/InstructionTemplate';

const instructions = getInstructionTemplate('skirt');
console.log(instructions.fabricFoldType);      // "double fold (lengthwise)"
console.log(instructions.constructionSteps);  // Array of steps
```

---

## Common Measurement-to-Coordinate Mappings

| Measurement | Use | Calculation |
|-------------|-----|-------------|
| `chest` | Body width | `(chest / 4 + offset) * scale` |
| `waist` | Narrower width | `(waist / 4 + offset) * scale` |
| `hip` | Widest width | `(hip / 4 + offset) * scale` |
| `length` | Total height | `length * scale` |
| `shoulder` | Shoulder width | `(shoulder / 2) * scale` |
| `armhole` | Armhole depth | `armhole * scale` |
| `neck` | Neck opening | `(neck / 5) * scale` |
| `sleeves` | Sleeve length | `sleeves * scale` |

---

## SVG Path Tips

### Basic Path Commands
- `M x,y` - Move to point
- `L x,y` - Line to point
- `Q cx,cy x,y` - Quadratic curve (control point, end point)
- `Z` - Close path

### Example: Creating a Smooth Curve
```javascript
// Quadratic curve from (100,100) to (200,150)
// with control point at (150,50)
const curvePath = `M 100,100
                   Q 150,50 200,150`;
```

### Example: Creating Seam Allowance (Offset Path)
```javascript
// Original path simplified
const mainPath = `M 50,50 L 150,50 L 150,200 L 50,200 Z`;

// Seam allowance path (8px inset)
const seamPath = `M 58,58 L 142,58 L 142,192 L 58,192 Z`;
```

---

## Debugging Tips

### Visual Debugging
Add temporary path overlays to verify calculations:

```javascript
// Temporarily add grid and reference lines
const debugLines = [
  { d: `M 0,${midHeight} L ${width},${midHeight}`, stroke: 'red' },  // Horizontal midline
  { d: `M ${midWidth},0 L ${midWidth},${height}`, stroke: 'red' }   // Vertical midline
];
```

### Console Debugging
Log intermediate calculations:

```javascript
console.log('Measurements:', m);
console.log('Scaled width:', scaledWidth);
console.log('Scaled height:', scaledHeight);
console.log('Path:', path);
```

---

## Examples: Real Garment Types

### Simple Rectangular Garment (Scarf)
```javascript
const path = `M ${xOff},${yOff}
              L ${xOff + width},${yOff}
              L ${xOff + width},${yOff + height}
              L ${xOff},${yOff + height}
              Z`;
```

### Garment with Curves (Sleeve)
```javascript
const path = `M ${xOff},${yTop}
              Q ${xOff + width * 0.25},${yTop - 10} ${xOff + width * 0.5},${yTop}
              L ${xOff + width},${yTop + height * 0.4}
              L ${xOff + width},${yTop + height}
              L ${xOff},${yTop + height}
              Z`;
```

### Garment with Multiple Components (Jacket)
```javascript
// Front panel
let path = `M ${xFront},${yTop}...Z`;

// Sleeve (separate area)
path += ` M ${xSleeve},${yTop}...Z`;

// Collar (separate area)
path += ` M ${xCollar},${yCollar}...Z`;
```

---

## Troubleshooting Common Issues

### Pattern Not Showing
- Check that `path` variable is not empty
- Verify SVG viewBox width/height are reasonable
- Ensure coordinates are calculated correctly

### Pattern Looks Wrong
- Verify scale factor (default: 7px per inch)
- Check that offset values (xOff, yOff) are consistent
- Print path to console and trace through manually

### Seam Path Misaligned
- Seam path should be offset by approximately 8px inward
- Verify both main path and seam path use same coordinate system
- Check that showSeams parameter is being respected

### Labels in Wrong Position
- GuideLabels x,y should align with key points on the path
- Consider text anchor and baseline for proper centering
- Test with multiple measurement values to ensure scalability

---

## Best Practices

✅ **DO:**
- Keep pattern functions focused on a single garment type
- Use consistent coordinate system and offset values
- Document all measurements and calculations
- Test with min, max, and typical measurements
- Use meaningful variable names (not `w1`, `h2`, etc.)

❌ **DON'T:**
- Mix multiple garment types in one function
- Use hardcoded values (use scale factor instead)
- Create overly complex SVG paths (simplify if possible)
- Forget to handle missing measurements
- Ignore seam allowance representations

---

**Last Updated:** May 2026
**Examples:** See PatternEngine.js for shirt, trouser, coat, dress implementations
