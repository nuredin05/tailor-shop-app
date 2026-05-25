# Pattern-Making Logic Refactoring - Architecture Documentation

## Overview

This document outlines the professional, scalable architecture refactoring for the tailor-shop-app pattern-making logic. The refactoring extracts complex drafting mathematics, SVG path generation, and tailoring specifications into dedicated, reusable service modules.

---

## Architecture Summary

The refactored system consists of three main components:

### 1. **PatternEngine.js** - Pure Utility Service
**Location:** `frontend/src/services/PatternEngine.js`

#### Purpose
Extracts all drafting mathematics, SVG path generation, and coordinate calculations into a single utility service.

#### Key Features
- **Pure Functions**: All functions are deterministic and have no side effects
- **Data-Driven**: Returns pure data structures (paths, dimensions, labels) rather than UI components
- **Extensible**: New garment types can be added by creating new pattern generator functions
- **Testable**: Pure functions are easy to unit test

#### Main Export Function
```javascript
generateCADBlueprint(itemType, measurements, showSeams = true)
```

**Parameters:**
- `itemType` (string): Type of garment ('shirt', 'trouser', 'coat', 'dress', etc.)
- `measurements` (object): Customer's measurements with flexible field naming
- `showSeams` (boolean): Whether to generate seam allowance paths

**Returns:** Object containing:
```javascript
{
  path: string,              // SVG path for main garment outline
  seamPath: string,          // SVG path for seam allowance (dashed)
  internalLines: array,      // Array of construction guide lines
  guideLabels: array,        // Measurement labels positioned on the pattern
  annotations: array,        // Construction notes indexed to specific points
  viewBoxWidth: number,      // SVG viewBox width
  viewBoxHeight: number      // SVG viewBox height
}
```

#### Supported Garment Types

| Type | Aliases | Pattern Logic |
|------|---------|---------------|
| Shirt | top, blouse | Body panel + separate sleeve workspace |
| Trouser | pant, bottom, pants | Waist + hip curve + inseam |
| Coat | jacket, suit, blazer | Shoulder seam + armhole + full length |
| Dress | gown, frock | Bodice + skirt flare expansion |

#### Measurement Handling
The service automatically handles multiple naming conventions:
- `chest` or `chest_width`
- `length` or `total_length`
- `shoulder` or `shoulder_width`
- And more...

Provides sensible defaults if measurements are missing.

---

### 2. **InstructionTemplate.js** - Data-Driven Configuration Engine
**Location:** `frontend/src/services/InstructionTemplate.js`

#### Purpose
Maps garment types to comprehensive workshop instructions, eliminating hard-coded if/else logic in the UI.

#### Key Features
- **Data-Driven**: All instructions stored in configuration objects
- **Extensible**: New garment types can be added via `addCustomTemplate()`
- **Comprehensive**: Includes cutting patterns, construction steps, and quality checkpoints
- **No UI Logic**: Pure data structure, UI-agnostic

#### Template Structure

Each template includes:
```javascript
{
  id: string,                    // Unique identifier
  displayName: string,           // User-friendly name
  category: string,              // 'casual', 'formal', 'custom'
  difficulty: string,            // 'beginner-intermediate', 'intermediate', 'advanced'
  fabricFoldType: string,        // e.g., "single fold (left over right)"
  grainlineRules: string,        // e.g., "lengthwise grain runs parallel to CF"
  seamAllowance: string,         // e.g., "5/8\" (1.5 cm) standard"
  estimatedTime: string,         // e.g., "120-180 minutes"
  specialNotes: string,          // Additional tailoring notes
  cuttingPattern: {
    pieces: array               // List of pattern pieces with grainline notes
  },
  constructionSteps: array,      // Ordered array of construction instructions
  qualityCheckpoints: array      // Quality assurance checklist items
}
```

#### Main Export Functions

**`getInstructionTemplate(itemType)`**
Returns the complete template for a garment type with fuzzy matching.

**`getAvailableGarmentTypes()`**
Returns list of all available garment types with metadata.

**`generateInstructionSheet(itemType, customerName)`**
Generates a formatted, printable instruction sheet.

**`addCustomTemplate(id, template)`**
Allows tailors to add custom garment types dynamically.

---

### 3. **CutterDashboard.jsx** - Refactored React Component
**Location:** `frontend/src/components/dashboard/CutterDashboard.jsx`

#### Changes Made

**Before:**
- Contained 500+ lines of inline pattern drafting logic
- SVG paths calculated directly in JSX
- No separation of concerns
- Difficult to extend with new garment types

**After:**
- Lightweight component (<300 lines of core logic)
- Uses `useEffect` hook to generate CAD data
- Uses `useMemo` hook for instruction template memoization
- Service calls are declarative and testable
- Clear separation between data generation and UI rendering

#### Key Hooks

**`useEffect` - CAD Blueprint Generation**
```javascript
useEffect(() => {
  if (selectedCustomer && selectedCustomer.items?.[activeItemIndex]) {
    const currentItem = selectedCustomer.items[activeItemIndex];
    const blueprintData = generateCADBlueprint(
      currentItem.itemType,
      selectedCustomer.measurements,
      showSeams
    );
    setCadBlueprintData(blueprintData);
  }
}, [selectedCustomer, activeItemIndex, showSeams]);
```

**`useMemo` - Instruction Template**
```javascript
const currentInstructions = useMemo(() => {
  if (selectedCustomer?.items?.[activeItemIndex]) {
    return getInstructionTemplate(
      selectedCustomer.items[activeItemIndex].itemType
    );
  }
  return null;
}, [selectedCustomer, activeItemIndex]);
```

#### New Features in UI

1. **Instruction Panel**: Displays fabric fold type, grainline rules, seam allowance, and difficulty level
2. **Specifications**: Shows estimated time and special notes for each garment type
3. **Workshop Guidelines**: Integrates cutting patterns and quality checkpoints (extensible)

---

## Design Principles

### 1. **Separation of Concerns**
- **PatternEngine**: Pure calculations and data generation
- **InstructionTemplate**: Configuration and metadata
- **CutterDashboard**: UI rendering and state management

### 2. **Pure Functions**
All service functions are deterministic and free of side effects, making them:
- Easy to test
- Predictable
- Reusable in other components

### 3. **Data-Driven Architecture**
Eliminates hard-coded conditionals and makes the system flexible:
- New garment types don't require code changes
- Configuration can be updated without modifying components
- Non-technical users can manage templates

### 4. **Extensibility**
Adding a new garment type is straightforward:

```javascript
// PatternEngine.js: Add new pattern generator
const generateSkirtPattern = (measurements, showSeams) => {
  // Implementation here
};

// Then add to the switch statement in generateCADBlueprint()
case 'skirt':
  blueprintData = generateSkirtPattern(parsedMeasurements, showSeams);
  break;
```

```javascript
// InstructionTemplate.js: Add new template
addCustomTemplate('skirt', {
  displayName: 'Skirt',
  fabricFoldType: 'double fold (lengthwise)',
  grainlineRules: 'lengthwise grain parallel to centerline',
  seamAllowance: '5/8" standard',
  constructionSteps: [...],
  // ... other properties
});
```

### 5. **Performance Optimization**
- `useMemo` prevents unnecessary template recalculation
- `useEffect` only regenerates CAD data when dependencies change
- Pure functions allow memoization and caching strategies

---

## Usage Examples

### Example 1: Displaying a Pattern

```javascript
// Component automatically displays the correct pattern
// when selectedCustomer changes
const [cadBlueprintData, setCadBlueprintData] = useState(null);

useEffect(() => {
  const blueprintData = generateCADBlueprint(
    'shirt',
    { chest: 40, length: 30, shoulder: 18 },
    true
  );
  setCadBlueprintData(blueprintData);
}, [selectedCustomer, activeItemIndex, showSeams]);
```

### Example 2: Getting Garment Instructions

```javascript
const instructions = getInstructionTemplate('trouser');
console.log(instructions.fabricFoldType);        // "double fold (lengthwise)"
console.log(instructions.constructionSteps[0]);  // First step
console.log(instructions.difficulty);            // "intermediate"
```

### Example 3: Generating a Printable Sheet

```javascript
const sheet = generateInstructionSheet('coat', 'John Doe');
// Returns formatted object with header, overview, cutting pattern, steps, checkpoints
// Can be formatted for printing via CSS media queries
```

### Example 4: Adding a Custom Garment Type

```javascript
addCustomTemplate('waistcoat', {
  displayName: 'Waistcoat / Vest',
  category: 'formal',
  fabricFoldType: 'single fold',
  grainlineRules: 'lengthwise grain parallel to CF',
  seamAllowance: '3/4" (2 cm)',
  difficulty: 'intermediate',
  estimatedTime: '180-240 minutes',
  constructionSteps: [
    'Prepare fabric: Press thoroughly',
    // ... more steps
  ],
  // ... other properties
});
```

---

## File Structure

```
frontend/src/
├── services/
│   ├── PatternEngine.js          (NEW - Pure utility functions)
│   ├── InstructionTemplate.js    (NEW - Configuration data)
│   └── authService.js            (existing)
├── components/
│   └── dashboard/
│       ├── CutterDashboard.jsx   (REFACTORED - lightweight component)
│       └── ...
└── ...
```

---

## Benefits of This Architecture

### For Developers
✅ **Easier to Test**: Pure functions in services are trivial to unit test
✅ **Easier to Debug**: Clear separation makes issues easier to isolate
✅ **Easier to Extend**: Add new garment types without touching the component
✅ **Better Performance**: Memoization and optimized dependencies
✅ **Reusable**: Services can be used in other components (e.g., print, export, preview)

### For Tailors/Users
✅ **More Professional**: Shows comprehensive workshop guidelines
✅ **Clearer Instructions**: Data-driven, consistent formatting
✅ **Extensible**: Can add custom garment types without code changes
✅ **Better Quality Control**: Built-in quality checkpoints for each garment type

### For Maintenance
✅ **Scalable**: System grows with new garment types without complexity explosion
✅ **Consistent**: All garments follow the same architectural pattern
✅ **Documented**: Configuration objects serve as documentation
✅ **Decoupled**: Changes to one garment type don't affect others

---

## Future Enhancements

### Planned Features
1. **Fabric Database**: Link fabric properties to grainline and fold requirements
2. **Multi-Size Grading**: Automatic pattern scaling for size grading
3. **Print Templates**: Export patterns as PDF with measurements
4. **Custom Measurements**: User-defined measurement categories
5. **Construction Videos**: Link video tutorials to specific steps
6. **Quality Scoring**: Track quality checkpoints and generate reports
7. **Time Tracking**: Log actual time vs. estimated time for improvements

### Potential Optimizations
1. **Memoized Pattern Generation**: Cache calculated patterns for repeated customers
2. **WebWorker Processing**: Offload heavy calculations to avoid UI blocking
3. **SVG Optimization**: Use WebGL for large pattern canvases
4. **Template Versioning**: Track template changes over time

---

## Migration Notes

If you had custom pattern logic elsewhere in the app:

1. Extract pattern generation logic to `PatternEngine.js`
2. Extract garment metadata to `InstructionTemplate.js`
3. Update component imports to use the new services
4. Test with multiple garment types and measurement combinations

---

## Testing Recommendations

### Unit Tests
- `generateCADBlueprint()` with various measurements
- Template retrieval and fuzzy matching
- Measurement parsing with missing fields

### Integration Tests
- CutterDashboard with multiple orders
- Tab switching between different garments
- Modal opening/closing

### Manual Testing
- Display patterns for all garment types
- Verify measurements display correctly
- Test with extreme measurements
- Print patterns to verify SVG scaling

---

## Questions & Support

For questions about this architecture, refer to:
- Inline comments in `PatternEngine.js` for calculation logic
- Inline comments in `InstructionTemplate.js` for template structure
- `CutterDashboard.jsx` for integration examples

---

**Refactoring Date:** May 2026
**Version:** 1.0.0 (Initial Release)
**Status:** Production Ready
