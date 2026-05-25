/**
 * InstructionTemplate.js
 * A data-driven configuration system for workshop instructions based on garment types.
 * Maps itemType to specific tailoring rules, fold types, grainline rules, and seam allowances.
 * 
 * This eliminates hard-coded if/else logic in the UI and makes the system easily extensible.
 * New garment types can be added by extending the INSTRUCTION_TEMPLATES object.
 */

/**
 * Comprehensive instruction templates for different garment types
 * Each garment type includes workshop rules that guide the cutting and tailoring process
 */
const INSTRUCTION_TEMPLATES = {
  shirt: {
    id: 'shirt',
    displayName: 'Shirt / Top',
    category: 'casual',
    fabricFoldType: 'single fold (left over right)',
    grainlineRules: 'lengthwise grain runs parallel to center front placket',
    seamAllowance: '5/8" (1.5 cm) standard',
    cuttingPattern: {
      pieces: [
        { name: 'Front Panel (x2)', grainline: 'parallel to CF', notes: 'Cut with grain' },
        { name: 'Back Panel (x1)', grainline: 'parallel to CF', notes: 'Fold on centerline' },
        { name: 'Sleeve (x2)', grainline: 'parallel to length', notes: 'Underarm seam perpendicular' },
        { name: 'Collar Stand (x2)', grainline: 'along length', notes: 'Interfaced' },
        { name: 'Cuff (x2)', grainline: 'along length', notes: 'Interfaced' }
      ]
    },
    constructionSteps: [
      'Prepare fabric: Pre-wash if required, press to remove wrinkles',
      'Lay pattern: Position front/back patterns on folded fabric',
      'Check grain: Ensure lengthwise grain is parallel to center front',
      'Cut precisely: Use sharp shears, cut with grain direction',
      'Mark construction details: Transfer dart marks, pocket positions',
      'Assemble collar: Interface, sew, press (understitch optional)',
      'Attach collar to neckline: Sandwich between body and facing',
      'Sew shoulder seams: Pin, sew, press open',
      'Attach sleeves: Set in armhole, sew facing seam first',
      'Sew side seams: Pin along entire length, sew from sleeve to hem',
      'Hem sleeves: Fold and stitch cuff attachment',
      'Hem body: Fold, press, and blind-stitch or machine hem'
    ],
    qualityCheckpoints: [
      '✓ Grain alignment on all main pieces',
      '✓ Seam allowances consistent (5/8")',
      '✓ Collar sits flat, not puckering',
      '✓ Sleeve cap smooth (no puckering)',
      '✓ Side seams perfectly aligned',
      '✓ Hems are level and evenly folded',
      '✓ All topstitching is straight and even'
    ],
    specialNotes: 'For knit fabrics, use 1/4" seam allowance. For lightweight fabrics, consider french seams.',
    estimatedTime: '120-180 minutes',
    difficulty: 'beginner-intermediate'
  },

  trouser: {
    id: 'trouser',
    displayName: 'Trouser / Pants',
    category: 'formal',
    fabricFoldType: 'double fold (lengthwise)',
    grainlineRules: 'lengthwise grain runs parallel to inseam/outseam',
    seamAllowance: '5/8" (1.5 cm) standard, 1" (2.5 cm) at inseam for letting out',
    cuttingPattern: {
      pieces: [
        { name: 'Front Panel (x2)', grainline: 'parallel to inseam', notes: 'Fold on grain, match grain' },
        { name: 'Back Panel (x2)', grainline: 'parallel to inseam', notes: 'Match grain for symmetry' },
        { name: 'Waistband', grainline: 'along length', notes: 'Interfaced, usually cut on bias' },
        { name: 'Pocket Bags (x4)', grainline: 'any direction', notes: 'Use lightweight cotton' },
        { name: 'Fly Facing', grainline: 'along length', notes: 'Usually self-fabric' }
      ]
    },
    constructionSteps: [
      'Prepare fabric: Pre-wash woven fabrics, press thoroughly',
      'Lay pattern: Position panels on double-folded fabric',
      'Check grain: Verify lengthwise grain runs parallel to inseam',
      'Cut precisely: Use sharp shears, follow grain carefully',
      'Transfer markings: Mark darts, pocket placement, fly opening',
      'Sew front darts: Sew from waistline to point, backstitch',
      'Sew back darts: Press downward for comfort',
      'Attach pockets: Construct pocket bags, attach to side seams',
      'Sew crotch seam: Front to back, use a gentle curve',
      'Install fly: Sew zipper using underlap/overlap method',
      'Sew inseams: Pin to ensure grain alignment, sew straight',
      'Sew outseams: Continue grain-aligned seams from inseam',
      'Attach waistband: Interface, sew to waistline with even tension',
      'Install hook/bar closure at waistband',
      'Hem length: Try on, mark length, hem with blind-stitch',
      'Final press: Press all seams, particularly inseams and crotch'
    ],
    qualityCheckpoints: [
      '✓ Grain perfectly parallel on inseams/outseams',
      '✓ Crotch seam smooth with no puckering',
      '✓ Both legs identical in length and width',
      '✓ Zipper functional and hidden',
      '✓ Waistband sits level, not twisting',
      '✓ Hem is even all around',
      '✓ All stitching is strong with no skipped stitches',
      '✓ Thigh and knee measurements match customer specs'
    ],
    specialNotes: 'For tailored trousers, consider a 2" hem allowance. Add 1" extra at inseam for future alterations.',
    estimatedTime: '240-300 minutes',
    difficulty: 'intermediate'
  },

  coat: {
    id: 'coat',
    displayName: 'Coat / Jacket / Suit',
    category: 'formal',
    fabricFoldType: 'single fold (for layout precision)',
    grainlineRules: 'lengthwise grain runs parallel to center front and along sleeve',
    seamAllowance: '3/4" (2 cm) standard, 1" (2.5 cm) at side seams and underarms',
    cuttingPattern: {
      pieces: [
        { name: 'Front Panel (x2)', grainline: 'parallel to CF', notes: 'Nap fabric: cut both same direction' },
        { name: 'Back Panel (x1)', grainline: 'parallel to CF', notes: 'Fold on centerline for symmetry' },
        { name: 'Side Panel (x2)', grainline: 'parallel to CF', notes: 'May be separate for fit' },
        { name: 'Sleeve (x2)', grainline: 'parallel to length', notes: 'Underarm seam perpendicular' },
        { name: 'Back Neck Facing (x1)', grainline: 'along length', notes: 'Stabilized with interfacing' },
        { name: 'Front Facing (x2)', grainline: 'along length', notes: 'Usually cut-on-bias on hems' },
        { name: 'Interfacing', grainline: 'varies', notes: 'Canvas/hair canvas for structure' }
      ]
    },
    constructionSteps: [
      'Prepare fabric: Press thoroughly, check for flaws',
      'Layout pattern: Single fold for precise grain alignment, especially for nap fabrics',
      'Cut with precision: Use sharp shears, follow grain exactly',
      'Transfer all markings: Darts, button positions, notches',
      'Interface front: Apply canvas to front pieces (full front or partial)',
      'Sew front darts: Sew from shoulder point to apex of bust',
      'Construct side seams: Sew side panels to front and back with precision',
      'Sew shoulder seams: Pin, sew, and press open',
      'Attach back neck facing: Stabilize neckline',
      'Insert sleeves: Try on, adjust armhole if needed, sew in smoothly',
      'Sew sleeve seams: Underarm seam should follow grain',
      'Attach front facing: Hand-stitch for a couture finish',
      'Install buttons and buttonholes: Precise placement',
      'Hem jacket: Usually 1.5" finished, blind-stitched',
      'Final pressing: Steam with appropriate pressure, use press cloth'
    ],
    qualityCheckpoints: [
      '✓ Grain perfectly aligned on all major pieces',
      '✓ Armhole smooth without puckering',
      '✓ Collar sits flat and notch is crisp',
      '✓ Front facings are perfectly hidden',
      '✓ Sleeves hang straight with no twists',
      '✓ Buttons are aligned and secure',
      '✓ All hand-stitching is nearly invisible',
      '✓ Hem is level and invisible from outside',
      '✓ Shoulder seams sit at correct position'
    ],
    specialNotes: 'Canvas interfacing should be applied to fronts for structure. For tailored coats, consider a 1.5" hem allowance.',
    estimatedTime: '360-480 minutes',
    difficulty: 'advanced'
  },

  dress: {
    id: 'dress',
    displayName: 'Dress / Gown / Frock',
    category: 'formal',
    fabricFoldType: 'single fold (for pattern matching if required)',
    grainlineRules: 'lengthwise grain runs parallel to center front and center back',
    seamAllowance: '5/8" (1.5 cm) standard, 1.5" (3.8 cm) at hem for adjustments',
    cuttingPattern: {
      pieces: [
        { name: 'Front Bodice (x1)', grainline: 'parallel to CF', notes: 'Fold on centerline' },
        { name: 'Back Bodice (x1)', grainline: 'parallel to CB', notes: 'Fold on centerline' },
        { name: 'Front Skirt Panel (x2)', grainline: 'parallel to length', notes: 'For flared skirts' },
        { name: 'Back Skirt Panel (x2)', grainline: 'parallel to length', notes: 'For flared skirts' },
        { name: 'Sleeve (x2)', grainline: 'parallel to length', notes: 'If applicable' },
        { name: 'Facing/Lining', grainline: 'matches main fabric', notes: 'For structured dresses' }
      ]
    },
    constructionSteps: [
      'Prepare fabric: Pre-wash, press to remove wrinkles and creases',
      'Lay pattern: Single fold for precise grain if pattern matching required',
      'Check grain: Ensure lengthwise grain runs vertical for drape',
      'Cut carefully: Sharp shears, follow all grain lines',
      'Transfer markings: Notches, darts, gathering points',
      'Sew bodice darts: Front and back darts for shaping',
      'Sew front/back bodice: Shoulder seams first, then side seams',
      'Attach skirt to bodice: Pin evenly, sew with balanced tension',
      'Gather/pleat skirt if applicable: Adjust fullness evenly',
      'Sew side seams: Continue from bodice through skirt',
      'Attach sleeves: Set in with smooth armhole',
      'Add collar or neckline finish: Bias binding or facing',
      'Sew sleeve seams: Underarm seams, install cuffs if any',
      'Hem dress: 1-1.5" double-folded hem, blind-stitched',
      'Final press: Use press cloth on delicate fabrics'
    ],
    qualityCheckpoints: [
      '✓ Grain runs vertically on bodice and skirt',
      '✓ Bodice darts create smooth shaping',
      '✓ Waistline seam is level all around',
      '✓ Skirt hangs evenly with good drape',
      '✓ Sleeve cap is smooth and set correctly',
      '✓ Neckline finish is professional',
      '✓ Hem is level and invisible',
      '✓ Side seams are perfectly straight',
      '✓ Dress is balanced (not pulling to one side)'
    ],
    specialNotes: 'For evening wear, consider 1.5-2" hem allowance. For delicate fabrics, use french seams or pinking to prevent fraying.',
    estimatedTime: '180-240 minutes',
    difficulty: 'intermediate'
  }
};

/**
 * Get all instruction templates
 */
export const getAllTemplates = () => INSTRUCTION_TEMPLATES;

/**
 * Get instruction template for a specific garment type
 * Matches template by exact ID or by similar name matching
 * 
 * @param {string} itemType - The garment type (e.g., 'shirt', 'trouser', 'coat', 'dress')
 * @returns {object} The instruction template for the garment type
 */
export const getInstructionTemplate = (itemType = '') => {
  const searchTerm = (itemType || '').toLowerCase().trim();
  
  // Try exact match first
  if (INSTRUCTION_TEMPLATES[searchTerm]) {
    return INSTRUCTION_TEMPLATES[searchTerm];
  }
  
  // Try fuzzy matching
  for (const [key, template] of Object.entries(INSTRUCTION_TEMPLATES)) {
    if (template.displayName.toLowerCase().includes(searchTerm) ||
        searchTerm.includes(key) ||
        key.includes(searchTerm)) {
      return template;
    }
  }
  
  // Default to shirt template
  return INSTRUCTION_TEMPLATES.shirt;
};

/**
 * Get specific instruction section for a garment
 * @param {string} itemType - The garment type
 * @param {string} section - The section name ('fabricFoldType', 'grainlineRules', 'seamAllowance', 'constructionSteps', etc.)
 * @returns {any} The requested section or null if not found
 */
export const getInstructionSection = (itemType, section) => {
  const template = getInstructionTemplate(itemType);
  return template[section] || null;
};

/**
 * Get all available garment types with their display names
 * Useful for UI dropdowns and selectors
 */
export const getAvailableGarmentTypes = () => {
  return Object.entries(INSTRUCTION_TEMPLATES).map(([id, template]) => ({
    id,
    displayName: template.displayName,
    category: template.category,
    difficulty: template.difficulty,
    estimatedTime: template.estimatedTime
  }));
};

/**
 * Generate a printable instruction sheet for a garment
 * Formats the instructions for workshop or customer reference
 */
export const generateInstructionSheet = (itemType, customerName = 'Customer') => {
  const template = getInstructionTemplate(itemType);
  
  return {
    header: {
      garmentType: template.displayName,
      customer: customerName,
      generatedDate: new Date().toLocaleDateString(),
      difficulty: template.difficulty,
      estimatedTime: template.estimatedTime
    },
    overview: {
      fabricFold: template.fabricFoldType,
      grainline: template.grainlineRules,
      seamAllowance: template.seamAllowance,
      specialNotes: template.specialNotes
    },
    cuttingPattern: template.cuttingPattern,
    constructionSteps: template.constructionSteps,
    qualityCheckpoints: template.qualityCheckpoints
  };
};

/**
 * Add a new custom instruction template (for extensibility)
 * This allows tailors to add their own custom garment types
 * 
 * @param {string} id - Unique identifier
 * @param {object} template - Template object with required properties
 */
export const addCustomTemplate = (id, template) => {
  if (!template.displayName || !template.fabricFoldType) {
    throw new Error('Template must include displayName and fabricFoldType');
  }
  
  INSTRUCTION_TEMPLATES[id] = {
    ...template,
    id,
    category: template.category || 'custom',
    difficulty: template.difficulty || 'intermediate'
  };
  
  return INSTRUCTION_TEMPLATES[id];
};

/**
 * Update an existing instruction template
 */
export const updateTemplate = (id, updatedData) => {
  if (!INSTRUCTION_TEMPLATES[id]) {
    throw new Error(`Template with id "${id}" not found`);
  }
  
  INSTRUCTION_TEMPLATES[id] = {
    ...INSTRUCTION_TEMPLATES[id],
    ...updatedData,
    id // Keep ID immutable
  };
  
  return INSTRUCTION_TEMPLATES[id];
};

export default INSTRUCTION_TEMPLATES;
