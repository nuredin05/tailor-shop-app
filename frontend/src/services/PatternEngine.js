/**
 * PatternEngine.js
 * A professional, scalable utility service for generating CAD blueprints for garment patterns.
 * Exports pure data functions that return paths, dimensions, and labels for a given itemType and measurements.
 *
 * Architecture:  Pure functions with no side effects - all calculations are deterministic.
 * Extensibility: New garment types can be added by extending the pattern generators.
 *
 * Formula Source: "Patternmaking for Fashion Design" 5th Edition – Helen Joseph-Armstrong
 *   Chapter 21 – Shirts (Men's Dress Shirt Foundation)
 *   Chapter 22 – Women's Jackets & Coats (Basic Jacket / Coat Foundation)
 *   Chapter 23 – Men's Wear (Jacket, Vest/Waistcoat, Trouser)
 */

// ─────────────────────────────────────────────
// CORE CONFIGURATION
// ─────────────────────────────────────────────

/**
 * Core configuration for pattern generation
 * Each garment type has specific rules for calculations
 */
const PATTERN_CONFIG = {
  scale: 7, // Screen scaling factor: 1 cm = 7 pixels (internal use)
  defaultMeasurements: {
    // Shared — defaults now in cm
    chest: 102,        // cm (mature male ~40")
    waist: 86,         // cm
    hip: 107,          // cm (seat)
    length: 76,        // cm – shirt / jacket body length
    shoulder: 46,      // cm – full across shoulder (both sides)
    neck: 38,          // cm – neck circumference
    armhole: 24,       // cm – armhole depth
    sleeves: 61,       // cm – sleeve length
    // Trouser-specific
    pantLength: 107,   // cm – full outseam / pant length
    crotchDepth: 28,   // cm – rise (crotch depth + 2cm)
    hipDepth: 20,      // cm – hip depth below waist
    backHipArc: 27,    // cm – back hip arc
    frontHipArc: 25,   // cm – front hip arc
    backWaistArc: 22,  // cm – back waist arc
    frontWaistArc: 20, // cm – front waist arc
    bottomWidth: 20,   // cm – trouser hem width per leg
    // Vest-specific
    vestLength: 56,    // cm – vest body length
    centerLength: 46   // cm – center length (nape to waist)
  }
};

// ─────────────────────────────────────────────
// MEASUREMENT UTILITIES
// ─────────────────────────────────────────────

/**
 * Utility function to safely parse measurements.
 * Handles multiple naming conventions and returns default values.
 * All stored values are expected in cm.
 */
const parseMeasurements = (measurements = {}) => {
  const parseValue = (v, fallback) => {
    const n = parseFloat(v);
    return (isNaN(n) || n === 0) ? fallback : n;
  };

  const d = PATTERN_CONFIG.defaultMeasurements;
  return {
    chest:         parseValue(measurements?.chest        ?? measurements?.chest_width,    d.chest),
    waist:         parseValue(measurements?.waist        ?? measurements?.waist_line,      d.waist),
    hip:           parseValue(measurements?.hip          ?? measurements?.seat ?? measurements?.hips, d.hip),
    length:        parseValue(measurements?.length       ?? measurements?.total_length,    d.length),
    shoulder:      parseValue(measurements?.shoulder     ?? measurements?.shoulder_width,  d.shoulder),
    neck:          parseValue(measurements?.neck         ?? measurements?.collar,          d.neck),
    armhole:       parseValue(measurements?.armhole      ?? measurements?.armhole_depth,   d.armhole),
    sleeves:       parseValue(measurements?.sleeves      ?? measurements?.sleeve_length,   d.sleeves),
    // Trouser extras
    pantLength:    parseValue(measurements?.pantLength   ?? measurements?.pant_length,     d.pantLength),
    crotchDepth:   parseValue(measurements?.crotchDepth  ?? measurements?.rise,            d.crotchDepth),
    hipDepth:      parseValue(measurements?.hipDepth     ?? measurements?.hip_depth,       d.hipDepth),
    backHipArc:    parseValue(measurements?.backHipArc   ?? measurements?.back_hip,        d.backHipArc),
    frontHipArc:   parseValue(measurements?.frontHipArc  ?? measurements?.front_hip,       d.frontHipArc),
    backWaistArc:  parseValue(measurements?.backWaistArc ?? measurements?.back_waist,      d.backWaistArc),
    frontWaistArc: parseValue(measurements?.frontWaistArc?? measurements?.front_waist,     d.frontWaistArc),
    bottomWidth:   parseValue(measurements?.bottomWidth  ?? measurements?.hem_width,       d.bottomWidth),
    // Vest extras
    vestLength:    parseValue(measurements?.vestLength   ?? measurements?.vest_length,     d.vestLength),
    centerLength:  parseValue(measurements?.centerLength ?? measurements?.center_length,   d.centerLength)
  };
};

// ─────────────────────────────────────────────
// GARMENT 1 – MEN'S DRESS SHIRT  (Ch. 23)
// Armstrong formulas: Back Foundation → Front Foundation → Sleeve
// ─────────────────────────────────────────────

/**
 * Pattern Generator for Men's Dress Shirt
 *
 * Key Armstrong formulas implemented:
 *   BACK
 *     A–B  = full length (to waist); continue to shirt length C
 *     A–D  = across shoulder (square down ~4")
 *     B–E  = center length
 *     B–F  = ½(B–A) − 1¼" (YM) / 1½" (MM)
 *     F–G  = chest¼ + 1¼"
 *     F–J  = across back + ½"
 *     A–L  = back neck + ⅛"
 *     L–N  = shoulder length + ½"  (through shoulder slope M)
 *     Armhole: 1¼" diagonal from J; curve through N, K, angle, G
 *
 *   FRONT
 *     B–H  = full length; H–I = across shoulder + ½"
 *     H–K  = back neck measurement (A–L)
 *     K–L  = shoulder length + ½"
 *     B–M  = center front length − ⅜"
 *     F–N  = across chest + ¼" (square up 4" to O)
 *     Armhole: 1⅛" diagonal from N; ¾" extension parallel to CF
 *     Front left: mirror + 1¼" overlap, fold line, notch ¾" from center
 *
 *   SLEEVE  (Basic Shirt Sleeve – simplified Armstrong)
 *     Biceps extended ¾" each end; cap lowered ½"
 */
const generateShirtPattern = (measurements, showSeams = true) => {
  const m   = measurements;
  const sc  = PATTERN_CONFIG.scale;

  // ── Armstrong derived values (all in inches → ×sc = pixels) ──────────────
  const isYM         = true;           // Young Male variant (set false for Mature Male)
  const halfReduction = isYM ? 3.175 : 3.81; // B–F reduction in cm

  // BACK measurements
  const fullLenBack  = m.length;                          // A–B (waist), C = shirt length
  const shirtLen     = m.length + 17.78;                  // typical 7" below waist in cm
  const acrossShldr  = m.shoulder;                        // A–D
  const centerLenB   = m.centerLength ?? (m.length - 2.54);  // B–E
  const chestQuarter = m.chest / 4;                       // used in F–G
  const acrossBack   = m.chest * 0.23 + 1.27;             // approx across back in cm
  const backNeck     = m.neck / 5 + 0.3175;               // A–L = neck/5 + ⅛"
  const shldrSlope   = m.shoulder * 0.285;                // shoulder slope B–M
  const shldrLen     = m.shoulder / 2 + 1.27;             // L–N = shoulder length + ½"

  // FRONT additional
  const acrossChest  = m.chest * 0.22 + 0.635;            // F–N = across chest + ¼"
  const armDepth     = m.armhole;                         // armhole depth

  // ── Pixel conversions ─────────────────────────────────────────────────────
  const shirtLenPx   = shirtLen     * sc;
  const fullLenBPx   = fullLenBack  * sc;
  const shldrWidPx   = acrossShldr  * sc;
  const centerLenBPx = centerLenB   * sc;
  const chestQPx     = (chestQuarter + 3.175) * sc;        // F–G = chest/4 + 1¼"
  const acrossBackPx = (acrossBack  + 1.27) * sc;          // F–J
  const backNeckPx   = backNeck     * sc;
  const shldrSlopePx = shldrSlope   * sc;
  const shldrLenPx   = shldrLen     * sc;
  const armDepthPx   = armDepth     * sc;
  const acrossChestPx= (acrossChest + 0.635) * sc;

  // ── Layout anchors ────────────────────────────────────────────────────────
  const xCB  = 60;       // center back x
  const yTop = 50;       // top of back neck

  // ── BACK key points (Armstrong letter references) ────────────────────────
  // A = top of center back = (xCB, yTop)
  const A  = { x: xCB,                  y: yTop };
  // B = waist on CB
  const B  = { x: xCB,                  y: yTop + fullLenBPx };
  // C = shirt hem on CB
  const C  = { x: xCB,                  y: yTop + shirtLenPx };
  // D = across shoulder guideline (square from A)
  const D  = { x: xCB + shldrWidPx,     y: yTop };
  // E = center length mark
  const E  = { x: xCB,                  y: yTop + centerLenBPx };
  // F = armhole depth mark on CB
  const F  = { x: xCB,                  y: B.y - (B.y - A.y) / 2 + halfReduction * sc };
  // G = chest line width from F
  const G  = { x: xCB + chestQPx,       y: F.y };
  // J = across back point (armhole construction)
  const J  = { x: xCB + acrossBackPx,   y: F.y };
  // K = square up ⅓ of J→D height from J
  const K  = { x: J.x,                  y: J.y - (D.y - J.y) / 3 };
  // L = back neck on shoulder
  const L  = { x: xCB + backNeckPx,     y: yTop };
  // M = shoulder slope (B–M = shoulder slope value from B going up)
  const M  = { x: D.x,                  y: yTop + shldrSlopePx };
  // N = shoulder tip (L–N = shoulder length + ½", through M)
  const N  = { x: L.x + shldrLenPx,     y: M.y };
  // Hem side point
  const Cside = { x: G.x, y: C.y };

  // Back armhole diagonal anchor (1¼" in from J)
  const armDiagB = 3.175 * sc; // 1.25" in cm
  const backArmCtrl = { x: J.x + armDiagB * 0.7, y: J.y - armDiagB * 0.7 };

  // Back path: CB neckline → shoulder → armhole → side seam → hem → CB
  const backPath = `
    M ${L.x},${L.y}
    L ${N.x},${N.y}
    Q ${backArmCtrl.x},${backArmCtrl.y + (K.y - backArmCtrl.y) * 0.4} ${K.x},${K.y}
    Q ${K.x + 4},${G.y - 6} ${G.x},${G.y}
    L ${Cside.x},${C.y}
    L ${C.x},${C.y}
    L ${A.x},${A.y}
    Q ${A.x + backNeckPx * 0.5},${A.y - 4} ${L.x},${L.y}
    Z`;

  // ── FRONT key points ──────────────────────────────────────────────────────
  const panelGap   = chestQPx + 100;
  const xCF        = xCB + panelGap;

  // H = top of center front (full length)
  const H  = { x: xCF, y: yTop + shirtLenPx };
  // Front full length top
  const Ft = { x: xCF, y: yTop };
  // I = across shoulder + ½" from H (shoulder guideline)
  const I  = { x: xCF + (acrossShldr + 1.27) * sc, y: yTop };
  // K_f = front neckline depth (= back neck A–L)
  const Kf = { x: xCF + backNeckPx, y: yTop };
  // L_f = shoulder tip (K–L = shldrLen)
  const Lf = { x: Kf.x + shldrLenPx, y: yTop + shldrSlopePx };
  // M_f = CF neckline depth (center front length − ⅜")
  const Mf = { x: xCF, y: yTop + (m.centerLength - 0.9525) * sc };
  // N_f = across chest + ¼" (square up 4" → O)
  const Nf = { x: xCF + acrossChestPx, y: F.y };  // same armhole depth as back
  const O  = { x: Nf.x, y: Nf.y - 10.16 * sc };
  // Chest guide on front
  const Gf = { x: xCF + chestQPx, y: F.y };
  // Front hem
  const Hhem  = { x: xCF + chestQPx, y: yTop + shirtLenPx };
  // Extension lines: ¾" parallel to CF for button stand
  const extW = 1.905 * sc; // 0.75" in cm
  const extFront = { x: xCF + chestQPx + extW, y: F.y };

  // Front armhole diagonal (1⅛")
  const armDiagF = 2.8575 * sc; // 1.125" in cm
  const frontArmCtrl = { x: Nf.x + armDiagF * 0.7, y: Nf.y - armDiagF * 0.7 };

  const frontPath = `
    M ${Kf.x},${Kf.y}
    L ${Lf.x},${Lf.y}
    Q ${frontArmCtrl.x},${frontArmCtrl.y + (Nf.y - frontArmCtrl.y) * 0.5} ${Nf.x},${Nf.y}
    L ${Gf.x},${F.y}
    L ${Hhem.x},${Hhem.y}
    L ${xCF},${yTop + shirtLenPx}
    L ${Mf.x},${Mf.y}
    Q ${xCF + backNeckPx * 0.3},${yTop + 4} ${Kf.x},${Kf.y}
    Z`;

  // Front left (mirror + 1¼" extension for overlap / buttonhole placket)
  const overlapPx = 3.175 * sc;
  const xCFL = xCF + chestQPx + 80;  // offset right for separate display

  const frontLeftPath = `
    M ${xCFL},${yTop}
    L ${xCFL - shldrLenPx},${yTop + shldrSlopePx}
    Q ${xCFL - acrossChestPx - armDiagF * 0.7},${F.y - armDiagF * 0.7} ${xCFL - acrossChestPx},${F.y}
    L ${xCFL - chestQPx},${F.y}
    L ${xCFL - chestQPx},${yTop + shirtLenPx}
    L ${xCFL + overlapPx},${yTop + shirtLenPx}
    L ${xCFL + overlapPx},${yTop + (m.centerLength - 0.9525) * sc}
    Q ${xCFL + backNeckPx * 0.3},${yTop + 4} ${xCFL},${yTop}
    Z`;

  // ── SLEEVE (simplified Armstrong shirt sleeve) ───────────────────────────
  const slvLen   = m.sleeves * sc;
  const bicepW   = (m.chest * 0.5 + 3.81) * sc;        // biceps extended ¾" each side = 3.81cm
  const capH     = (armDepth * 0.6 - 1.27) * sc;       // cap height − ½" = 1.27cm
  const slvXOff  = xCFL + chestQPx + 120;
  const slvY     = yTop + 10;

  const slvCapCtrl = { x: slvXOff + slvLen * 0.35, y: slvY - capH * 0.6 };
  // Sleeve path: cap (curved) → front edge → wrist → back edge
  const sleevePath = `
    M ${slvXOff},${slvY + bicepW / 2}
    Q ${slvXOff + slvLen * 0.15},${slvY - capH * 0.3} ${slvXOff + slvLen * 0.3},${slvY}
    Q ${slvXOff + slvLen * 0.55},${slvY - capH * 0.8} ${slvXOff + slvLen * 0.7},${slvY + bicepW * 0.15}
    L ${slvXOff + slvLen},${slvY + bicepW * 0.3}
    L ${slvXOff + slvLen},${slvY + bicepW}
    L ${slvXOff},${slvY + bicepW}
    Z`;

  const path = backPath + ' ' + frontPath + ' ' + frontLeftPath + ' ' + sleevePath;

  // ── Seam allowance paths (5/8" = 1.5875 cm) ───────────────────────────────
  const sa = 1.5875 * sc;
  const seamPath = showSeams ? `
    M ${L.x + sa},${L.y + sa}
    L ${N.x - sa},${N.y + sa}
    Q ${backArmCtrl.x + sa},${backArmCtrl.y + (K.y - backArmCtrl.y)*0.4 - sa} ${K.x - sa},${K.y + sa}
    Q ${K.x - sa + 4},${G.y - 6 + sa} ${G.x - sa},${G.y + sa}
    L ${Cside.x - sa},${C.y - sa}
    L ${C.x + sa},${C.y - sa}
    L ${A.x + sa},${A.y + sa}
    Z
    M ${Kf.x + sa},${Kf.y + sa}
    L ${Lf.x - sa},${Lf.y + sa}
    Q ${frontArmCtrl.x - sa},${frontArmCtrl.y + (Nf.y - frontArmCtrl.y)*0.5} ${Nf.x - sa},${Nf.y + sa}
    L ${Gf.x - sa},${F.y + sa}
    L ${Hhem.x - sa},${Hhem.y - sa}
    L ${xCF + sa},${yTop + shirtLenPx - sa}
    Z` : '';

  // ── Construction / guide lines ────────────────────────────────────────────
  const internalLines = [
    // Back: chest guideline (F–G)
    { d: `M ${A.x},${F.y} L ${G.x},${F.y}`, stroke: 'rgba(51,65,85,0.35)', strokeWidth: 1, dashArray: '3 3' },
    // Back: center line (grain)
    { d: `M ${A.x},${A.y} L ${C.x},${C.y}`, stroke: '#475569', strokeWidth: 1.2, dashArray: '5 4' },
    // Back: across-back line (F–J)
    { d: `M ${A.x},${J.y} L ${J.x},${J.y}`, stroke: 'rgba(51,65,85,0.25)', strokeWidth: 1, dashArray: '2 3' },
    // Front: armhole depth guideline
    { d: `M ${xCF},${F.y} L ${Gf.x},${F.y}`, stroke: 'rgba(51,65,85,0.35)', strokeWidth: 1, dashArray: '3 3' },
    // Front: CF grain line
    { d: `M ${xCF},${yTop} L ${xCF},${yTop + shirtLenPx}`, stroke: '#475569', strokeWidth: 1.2, dashArray: '5 4' },
    // Sleeve: bicep line
    { d: `M ${slvXOff},${slvY + bicepW / 2} L ${slvXOff + slvLen * sc},${slvY + bicepW / 2}`, stroke: 'rgba(51,65,85,0.3)', strokeWidth: 1, dashArray: '2 3' },
    // Sleeve: grain line
    { d: `M ${slvXOff},${slvY + bicepW * 0.75} L ${slvXOff + slvLen * sc},${slvY + bicepW * 0.75}`, stroke: '#475569', strokeWidth: 1.2, dashArray: '5 4' }
  ];

  const guideLabels = [
    { x: A.x - 35, y: A.y + shirtLenPx / 2, text: `Length: ${shirtLen.toFixed(1)}"`, key: 'length' },
    { x: G.x + 12, y: F.y - 8,              text: `Chest/4+1¼": ${(chestQuarter + 1.25).toFixed(2)}"`, key: 'chest' },
    { x: L.x + shldrLenPx / 2, y: L.y - 14, text: `Shoulder: ${(m.shoulder / 2).toFixed(1)}"`, key: 'shoulder' },
    { x: A.x + backNeckPx / 2, y: A.y - 14, text: `Back Neck: ${backNeck.toFixed(2)}"`, key: 'neck_back' },
    { x: J.x + 8, y: J.y,                   text: `Across Back + ½"`, key: 'across_back' },
    { x: Nf.x + 12, y: Nf.y,                text: `Across Chest + ¼"`, key: 'across_chest' },
    { x: slvXOff + slvLen * sc / 2, y: slvY + bicepW + 18, text: `Sleeve: ${m.sleeves}"`, key: 'sleeve' }
  ];

  const annotations = [
    { x1: A.x, y1: A.y, x2: L.x, y2: L.y, key: 'cb_neck', label: 'CB Neckline' },
    { x1: L.x, y1: L.y, x2: N.x, y2: N.y, key: 'shoulder_back', label: 'Back Shoulder Seam' },
    { x1: xCF, y1: yTop, x2: Kf.x, y2: Kf.y, key: 'cf_neck', label: 'CF Neckline' },
    { x1: Kf.x, y1: Kf.y, x2: Lf.x, y2: Lf.y, key: 'shoulder_front', label: 'Front Shoulder Seam' },
    { x1: xCF, y1: F.y, x2: Gf.x, y2: F.y, key: 'armhole_depth', label: 'Armhole Depth' }
  ];

  const viewBoxWidth  = slvXOff + slvLen * sc + 80;
  const viewBoxHeight = shirtLenPx + 100;

  return { path, seamPath, internalLines, guideLabels, annotations, viewBoxWidth, viewBoxHeight };
};

// ─────────────────────────────────────────────
// GARMENT 2 – MEN'S CLASSIC TROUSER  (Ch. 23)
// Armstrong formulas: Pant Foundation → Trouser Draft
// ─────────────────────────────────────────────

/**
 * Pattern Generator for Men's Classic Trouser
 *
 * Key Armstrong formulas implemented:
 *   A–B  = pant length
 *   A–C  = crotch depth + ¾"  (the "rise")
 *   C–D  = hip depth: ⅓ of C–A
 *   C–E  = knee depth: ½(C–B) − 1½" to 2"
 *   D–F  = back hip arc + ¼"
 *   D–J  = front hip arc + ¼"
 *   C–G / A–H = D–F  (back side width); G–X = ½(G–H)
 *   C–K / A–L = D–J  (front side width); K–X = ½(K–L)
 *   H–M  = 3/4" in & 3/4" up (back waist tilt)
 *   M–N  = back waist arc + 1" (1 dart + ¼" ease)
 *   L–O  = front waist arc + 1¼" (2 darts + ¼" ease)
 *   Back dart: H–P = ½(M–N) + ½", depth 3½"
 *   Front darts: L–Q = ⅓(L–O), 1¼" spacing, depth 3"
 *   G–R = ½(G–C); K–S = ¼(K–C)  → inseam curve anchors
 *   R–V = ½(R–C) − ⅛"  (back inseam knee)
 *   S–W = ½(S–C) − ⅛"  (front inseam knee)
 *   Creaseline: square from V and W through full length
 *   Back hem generally 1" > front hem (4¾" back, 4¼" front)
 */
const generateTrouserPattern = (measurements, showSeams = true) => {
  const m  = measurements;
  const sc = PATTERN_CONFIG.scale;
  const P = v => v * sc;

  // ── Metric Standard Drafting (cm) ─────────────────────────────────────────
  const pantLen    = m.pantLength;
  const rise       = m.crotchDepth + 2;
  const hipDepth   = rise / 3;
  const kneeDrop   = (pantLen - rise) / 2 - 5;
  
  const backHipPx    = P(m.backHipArc + 1);
  const frontHipPx   = P(m.frontHipArc + 1);
  const backWaistPx  = P(m.backWaistArc + 3);
  const frontWaistPx = P(m.frontWaistArc + 3);
  const hemBackPx    = P(m.bottomWidth + 2);
  const hemFrontPx   = P(m.bottomWidth);

  const pantLenPx    = P(pantLen);
  const risePx       = P(rise);
  const hipDepthPx   = P(hipDepth);
  const kneePx       = P(rise + kneeDrop);

  // ── Layout ────────────────────────────────────────────────────────────────
  const yTop    = 50;

  // ── FRONT PANEL (Crotch faces LEFT, Side seam on RIGHT) ───────────────────
  // The frame is drawn based on frontHipPx.
  // Center crease is exactly in the middle of the frame (or slightly shifted).
  // Let's use the standard where frame width = frontHipPx.
  const xLeftF = 80 + P(m.frontHipArc / 4); // Room for fork extension I
  const xRightF = xLeftF + frontHipPx;
  const creaseXF = xLeftF + frontHipPx / 2;

  // Frame Points (Front)
  const F_star = { x: xLeftF, y: yTop };
  const A = { x: xRightF, y: yTop };
  const G = { x: xLeftF, y: yTop + hipDepthPx };
  const B = { x: xRightF, y: yTop + hipDepthPx };
  const H = { x: xLeftF, y: yTop + risePx };
  const C = { x: xRightF, y: yTop + risePx };
  
  // Center Points (Front)
  const K = { x: creaseXF, y: yTop + risePx };
  const L = { x: creaseXF, y: yTop + kneePx };
  const M = { x: creaseXF, y: yTop + pantLenPx };

  // Drafting Points (Front)
  const I = { x: xLeftF - frontHipPx / 4, y: yTop + risePx }; // Crotch extension Left
  const N = { x: xRightF - (frontWaistPx - (F_star.x - xLeftF)), y: yTop }; // Side waist (approximated on right)
  const n1 = { x: xRightF - (frontHipPx - frontWaistPx), y: yTop - 1*sc }; // Raised side seam
  
  // Hem & Knee (Front)
  const R = { x: creaseXF - (hemFrontPx + 3*sc)/2, y: L.y }; // Knee Left (Inseam)
  const S = { x: creaseXF + (hemFrontPx + 3*sc)/2, y: L.y }; // Knee Right (Side)
  const T = { x: creaseXF - hemFrontPx/2, y: M.y }; // Hem Left
  const U = { x: creaseXF + hemFrontPx/2, y: M.y }; // Hem Right

  // Front Waist & Dart
  const J = { x: creaseXF, y: yTop };
  const o = { x: creaseXF - 1*sc, y: yTop };
  const p = { x: creaseXF + 1*sc, y: yTop };
  const dartDepF = 8 * sc;
  const Q = { x: creaseXF, y: yTop + dartDepF }; // Dart point

  const frontPath = `
    M ${F_star.x},${F_star.y}
    L ${n1.x},${n1.y}
    Q ${B.x},${B.y - 20} ${C.x},${C.y}
    L ${S.x},${S.y}
    L ${U.x},${U.y}
    L ${T.x},${T.y}
    L ${R.x},${R.y}
    Q ${I.x + 10},${H.y + 30} ${I.x},${I.y}
    Q ${G.x},${G.y} ${F_star.x},${F_star.y}
    Z`;

  // ── BACK PANEL (Crotch faces RIGHT, Side seam on LEFT) ────────────────────
  const xLeftB = A.x + 100;
  const xRightB = xLeftB + backHipPx;
  const creaseXB = xLeftB + backHipPx / 2;

  const tiltB = 2 * sc;
  
  // Drafting Points (Back)
  const pt5 = { x: xLeftB, y: yTop - tiltB }; // Side seam waist
  const pt4 = { x: xRightB - tiltB, y: yTop - tiltB*2 }; // CF waist
  const pt7 = { x: xLeftB, y: yTop + hipDepthPx };
  const pt6 = { x: xRightB, y: yTop + hipDepthPx };
  const pt1 = { x: xRightB, y: yTop + risePx };
  
  const forkExtB = backHipPx / 2;
  const pt2 = { x: xRightB + forkExtB, y: pt1.y }; // Crotch extension Right

  const pt8 = { x: creaseXB - (hemBackPx + 3*sc)/2, y: yTop + kneePx }; // Knee Left
  const pt9 = { x: creaseXB + (hemBackPx + 3*sc)/2, y: yTop + kneePx }; // Knee Right
  const pt10 = { x: creaseXB - hemBackPx/2, y: yTop + pantLenPx }; // Hem Left
  const pt11 = { x: creaseXB + hemBackPx/2, y: yTop + pantLenPx }; // Hem Right

  // Back Dart
  const pt12 = { x: pt5.x + (pt4.x - pt5.x)*0.5, y: pt5.y + (pt4.y - pt5.y)*0.5 };
  const pt14 = { x: pt12.x - 1.5*sc, y: pt12.y };
  const pt13 = { x: pt12.x + 1.5*sc, y: pt12.y };
  const dartDepB = 9 * sc;
  const pt15 = { x: pt12.x, y: pt12.y + dartDepB };

  const backPath = `
    M ${pt5.x},${pt5.y}
    L ${pt4.x},${pt4.y}
    L ${pt6.x},${pt6.y}
    Q ${pt1.x + forkExtB/2},${pt1.y} ${pt2.x},${pt2.y}
    Q ${pt9.x + 5},${pt2.y + 40} ${pt9.x},${pt9.y}
    L ${pt11.x},${pt11.y}
    L ${pt10.x},${pt10.y}
    L ${pt8.x},${pt8.y}
    Q ${pt7.x},${pt1.y + 30} ${pt7.x},${pt7.y}
    Q ${pt5.x - 5},${(pt5.y + pt7.y)/2} ${pt5.x},${pt5.y}
    Z`;

  const path = frontPath + ' ' + backPath;
  const seamPath = ''; // Disabled standard seams to focus on the exact replica lines

  // ── Internal Lines & Rectangles (To match image exactly) ────────────────
  const internalLines = [
    // Front Construction Frame (Grey)
    { d: `M ${F_star.x},${yTop} L ${A.x},${yTop} L ${A.x},${M.y} L ${F_star.x},${M.y} Z`, stroke: '#9ca3af', strokeWidth: 1 },
    // Front Hip Line
    { d: `M ${G.x},${G.y} L ${B.x},${B.y}`, stroke: '#9ca3af', strokeWidth: 1 },
    // Front Crotch Line
    { d: `M ${I.x},${H.y} L ${C.x},${C.y}`, stroke: '#9ca3af', strokeWidth: 1 },
    // Front Knee Line
    { d: `M ${R.x},${L.y} L ${S.x},${L.y}`, stroke: '#9ca3af', strokeWidth: 1 },
    // Front Crease
    { d: `M ${K.x},${yTop} L ${M.x},${M.y}`, stroke: '#9ca3af', strokeWidth: 1 },
    // Front Dart
    { d: `M ${o.x},${o.y} L ${Q.x},${Q.y} L ${p.x},${p.y}`, stroke: '#ef4444', strokeWidth: 1.5 },
    // Front Waist Line
    { d: `M ${F_star.x},${F_star.y} L ${n1.x},${n1.y}`, stroke: '#ef4444', strokeWidth: 1.5 },

    // Back Construction Frame (Dashed Grey)
    { d: `M ${xLeftB},${yTop} L ${xRightB},${yTop} L ${xRightB},${pt10.y} L ${xLeftB},${pt10.y} Z`, stroke: '#9ca3af', strokeWidth: 1, dashArray: '4 4' },
    // Back Crotch Line extension
    { d: `M ${xLeftB},${pt1.y} L ${pt2.x},${pt2.y}`, stroke: '#9ca3af', strokeWidth: 1, dashArray: '4 4' },
    // Back Crease
    { d: `M ${creaseXB},${yTop} L ${creaseXB},${pt11.y}`, stroke: '#9ca3af', strokeWidth: 1 },
    // Back Dart
    { d: `M ${pt14.x},${pt14.y} L ${pt15.x},${pt15.y} L ${pt13.x},${pt13.y}`, stroke: '#ef4444', strokeWidth: 1.5 },
  ];

  // ── Exact Measurements (In CM) for Cutter ───────────────────────────────
  const guideLabels = [
    // Front Measurements (Red text)
    { x: F_star.x + frontHipPx/2 + 30, y: yTop - 15, text: `${(m.frontWaistArc + 3).toFixed(1)} cm (Waist)`, key: 'f_waist', type: 'label_red' },
    { x: G.x + frontHipPx/2 + 30, y: G.y - 15, text: `${(m.frontHipArc + 1).toFixed(1)} cm (Hip)`, key: 'f_hip', type: 'label_red' },
    { x: I.x + (H.x - I.x)/2, y: I.y - 15, text: `${((m.frontHipArc + 1)/4).toFixed(1)} cm`, key: 'f_crotch_ext', type: 'label_red' },
    { x: R.x + (S.x - R.x)/2 + 30, y: R.y - 15, text: `${(m.bottomWidth + 3).toFixed(1)} cm (Knee)`, key: 'f_knee', type: 'label_red' },
    { x: T.x + (U.x - T.x)/2 + 30, y: T.y + 25, text: `${(m.bottomWidth).toFixed(1)} cm (Hem)`, key: 'f_hem', type: 'label_red' },
    { x: H.x - 20, y: H.y - risePx/2, text: `${rise.toFixed(1)} cm (Rise)`, key: 'f_rise', type: 'label_red', rotation: -90 },
    { x: R.x + 20, y: R.y + (T.y - R.y)/2, text: `${(pantLen - rise).toFixed(1)} cm (Inseam)`, key: 'f_inseam', type: 'label_red', rotation: -90 },
    
    // Front Dart 
    { x: J.x + 15, y: J.y + dartDepF + 15, text: `Depth: 8 cm`, key: 'f_dart_d', type: 'label_red' },
    { x: J.x + 15, y: J.y - 15, text: `2 cm`, key: 'f_dart_w', type: 'label_red' },

    // Back Measurements (Blue text)
    { x: pt5.x + (pt4.x - pt5.x)/2 + 30, y: pt4.y - 20, text: `${(m.backWaistArc + 3).toFixed(1)} cm (Waist)`, key: 'b_waist', type: 'label_blue' },
    { x: pt7.x + backHipPx/2 + 30, y: pt7.y - 15, text: `${(m.backHipArc + 1).toFixed(1)} cm (Hip)`, key: 'b_hip', type: 'label_blue' },
    { x: pt1.x + (pt2.x - pt1.x)/2, y: pt1.y - 15, text: `${((m.backHipArc + 1)/2).toFixed(1)} cm`, key: 'b_crotch_ext', type: 'label_blue' },
    { x: pt8.x + (pt9.x - pt8.x)/2 + 30, y: pt8.y - 15, text: `${(m.bottomWidth + 5).toFixed(1)} cm (Knee)`, key: 'b_knee', type: 'label_blue' },
    { x: pt10.x + (pt11.x - pt10.x)/2 + 30, y: pt10.y + 25, text: `${(m.bottomWidth + 2).toFixed(1)} cm (Hem)`, key: 'b_hem', type: 'label_blue' },
    { x: pt1.x + 20, y: pt1.y - risePx/2, text: `${rise.toFixed(1)} cm (Rise)`, key: 'b_rise', type: 'label_blue', rotation: -90 },
    { x: pt9.x - 20, y: pt9.y + (pt11.y - pt9.y)/2, text: `${(pantLen - rise).toFixed(1)} cm (Inseam)`, key: 'b_inseam', type: 'label_blue', rotation: -90 },

    // Back Dart
    { x: pt12.x, y: pt12.y + dartDepB + 15, text: `Depth: 9 cm`, key: 'b_dart_d', type: 'label_blue' },
    { x: pt12.x, y: pt12.y - 10, text: `3 cm`, key: 'b_dart_w', type: 'label_blue' },

    // Main Titles
    { x: creaseXF, y: yTop + pantLenPx * 0.4, text: `Front`, key: 'front_title', type: 'title_blue' },
    { x: creaseXB, y: yTop + pantLenPx * 0.4, text: `Back`, key: 'back_title', type: 'title_blue' }
  ];

  // Annotations mapped to standard measurement keys to highlight when clicked
  const annotations = [
    { x1: F_star.x, y1: yTop - 25, x2: A.x, y2: yTop - 25, key: 'waistArcFront', label: 'Front Waist' },
    { x1: F_star.x, y1: yTop - 25, x2: A.x, y2: yTop - 25, key: 'waist', label: 'Waist' },
    { x1: pt5.x, y1: pt4.y - 30, x2: pt4.x, y2: pt4.y - 30, key: 'waistArcBack', label: 'Back Waist' },
    
    { x1: G.x, y1: G.y, x2: B.x, y2: B.y, key: 'hipArcFront', label: 'Front Hip' },
    { x1: pt7.x, y1: pt7.y, x2: pt6.x, y2: pt6.y, key: 'hipArcBack', label: 'Back Hip' },
    { x1: G.x, y1: G.y, x2: B.x, y2: B.y, key: 'hips', label: 'Hips' },

    { x1: H.x - 40, y1: yTop, x2: H.x - 40, y2: H.y, key: 'crotchDepth', label: 'Crotch Depth / Rise' },
    { x1: G.x - 40, y1: yTop, x2: G.x - 40, y2: G.y, key: 'hipDepth', label: 'Hip Depth' },

    { x1: A.x + 20, y1: yTop, x2: A.x + 20, y2: M.y, key: 'pantLength', label: 'Pant Length' },
    { x1: A.x + 20, y1: yTop, x2: A.x + 20, y2: M.y, key: 'length', label: 'Length' },

    { x1: R.x + 40, y1: R.y, x2: T.x + 40, y2: T.y, key: 'inseam', label: 'Inseam' }
  ];  const viewBoxWidth  = pt2.x + 80;
  const viewBoxHeight = yTop + pantLenPx + 60;

  return { path, seamPath, internalLines, guideLabels, annotations, viewBoxWidth, viewBoxHeight };
};

// ─────────────────────────────────────────────
// GARMENT 3 – WOMEN'S JACKET / COAT  (Ch. 22)
// Armstrong formulas: Torso Foundation enlargement + Sleeve
// ─────────────────────────────────────────────

/**
 * Pattern Generator for Women's Jacket / Coat Foundation
 *
 * Key Armstrong formulas implemented:
 *   Enlarging the torso pattern (Fig 2 & 3, Ch. 22):
 *     Neckline:   +¼" front and back
 *     Shoulder:   +⅛" front and back (blend to mid-shoulder)
 *     Side seam:  +½" front and back  (doubled for coat)
 *     Armhole:    +¼" front and back; +⅛" at mid-armhole
 *     Hem:        +½" front and back  (doubled for coat)
 *   Dart excess from side dart redistributed to mid-neck & armhole
 *   Lapel: roll line, breakpoint, gorge, notch shapes
 *
 *   Sleeve (one-piece base Ch. 22 → two-piece for coat):
 *     Biceps +¾" each end (double for coat)
 *     Cap lowered ½"
 *     Cap ease = ½"–¾" more than armhole measurement
 */
const generateCoatPattern = (measurements, showSeams = true, isCoat = false) => {
  const m  = measurements;
  const sc = PATTERN_CONFIG.scale;
  const coatMulti = isCoat ? 2 : 1;  // double seam allowances for coat

  // ── Armstrong derived measurements ───────────────────────────────────────
  // Enlarge from basic torso by book-specified amounts
  const neckEase   = 0.635;                   // +¼" at neckline (0.635 cm)
  const shldrEase  = 0.3175;                  // +⅛" at shoulder (0.3175 cm)
  const sideEase   = 1.27 * coatMulti;        // +½" side seam (×2 for coat)
  const armEase    = 0.635;                   // +¼" armhole (0.635 cm)
  const hemEase    = 1.27 * coatMulti;        // +½" hem (×2 for coat)

  const shoulderW  = (m.shoulder / 2 + shldrEase) * sc;
  const chestW     = (m.chest / 4 + 6.35 + sideEase) * sc;   // enlarged chest quarter
  const waistW     = (m.waist / 4 + 5.08 + sideEase) * sc;
  const lenH       = (m.length + hemEase) * sc;
  const armDepth   = (m.armhole + armEase) * sc;
  const neckDepth  = (m.neck / 5 + neckEase) * sc;           // front neckline depth

  // Lapel geometry (classic notch lapel)
  const lapelW     = chestW * 0.36;
  const lapelLen   = lenH * 0.43;
  const breakPt    = armDepth + 25;            // breakpoint in px below top
  const gorgeY     = armDepth * 0.65;          // gorge line height

  const xFront = 70;
  const yFront = 50;
  const panelGap = chestW + 130;
  const xBack  = xFront + panelGap;
  const yBack  = yFront;

  // ── FRONT PANEL (with lapel/notch) ────────────────────────────────────────
  const frontPath = `
    M ${xFront},${yFront + neckDepth}
    Q ${xFront + neckDepth * 0.4},${yFront} ${xFront + neckDepth},${yFront}
    L ${xFront + shoulderW},${yFront + shoulderW * 0.15}
    Q ${xFront + shoulderW + 12},${yFront + armDepth * 0.55} ${xFront + chestW},${yFront + armDepth}
    L ${xFront + waistW},${yFront + lenH * 0.53}
    L ${xFront + chestW},${yFront + lenH}
    L ${xFront},${yFront + lenH}
    L ${xFront},${yFront + lapelLen}
    L ${xFront + lapelW},${yFront + lapelLen + 22}
    L ${xFront + lapelW},${yFront + neckDepth + 25}
    Q ${xFront + lapelW * 0.6},${yFront + neckDepth + 5} ${xFront + lapelW * 0.1},${yFront + neckDepth + 2}
    Z`;

  // ── BACK PANEL ────────────────────────────────────────────────────────────
  const backNeckH  = (m.neck / 5 + neckEase * 0.5) * sc;
  const backPath = `
    M ${xBack},${yBack}
    Q ${xBack + backNeckH * 0.5},${yBack - 4} ${xBack + backNeckH},${yBack}
    L ${xBack + shoulderW},${yBack - 10}
    Q ${xBack + shoulderW + 18},${yBack + armDepth * 0.42} ${xBack + chestW},${yBack + armDepth - 6}
    L ${xBack + waistW + 8},${yBack + lenH * 0.52}
    L ${xBack + chestW + 5},${yBack + lenH}
    L ${xBack - 5},${yBack + lenH}
    L ${xBack},${yBack + lenH * 0.66}
    Z`;

  const path = frontPath + ' ' + backPath;

  // ── Seam allowance (⅝" = 1.5875 cm) ───────────────────────────────────────────────────
  const sa = 1.5875 * sc;
  const frontSeam = showSeams ? `
    M ${xFront + sa},${yFront + neckDepth}
    Q ${xFront + neckDepth * 0.4 + sa},${yFront + sa} ${xFront + neckDepth + sa},${yFront + sa}
    L ${xFront + shoulderW - sa},${yFront + shoulderW * 0.15 + sa}
    Q ${xFront + shoulderW + 8},${yFront + armDepth * 0.55} ${xFront + chestW - sa},${yFront + armDepth + sa}
    L ${xFront + waistW - sa},${yFront + lenH * 0.53}
    L ${xFront + chestW - sa},${yFront + lenH - sa}
    L ${xFront + sa},${yFront + lenH - sa}
    Z` : '';
  const backSeam = showSeams ? `
    M ${xBack + sa},${yBack + sa}
    L ${xBack + shoulderW - sa},${yBack - 6 + sa}
    Q ${xBack + shoulderW + 14},${yBack + armDepth * 0.42} ${xBack + chestW - sa},${yBack + armDepth - 2}
    L ${xBack + waistW + 4},${yBack + lenH * 0.52}
    L ${xBack + chestW + 1},${yBack + lenH - sa}
    L ${xBack - 1},${yBack + lenH - sa}
    Z` : '';
  const seamPath = frontSeam + ' ' + backSeam;

  // ── Construction lines ────────────────────────────────────────────────────
  const internalLines = [
    // Front: armhole depth guideline
    { d: `M ${xFront},${yFront + armDepth} L ${xFront + chestW},${yFront + armDepth}`, stroke: 'rgba(51,65,85,0.4)', strokeWidth: 1.2 },
    // Front: waist guideline
    { d: `M ${xFront},${yFront + lenH * 0.53} L ${xFront + waistW},${yFront + lenH * 0.53}`, stroke: 'rgba(51,65,85,0.3)', strokeWidth: 1, dashArray: '3 3' },
    // Front: roll line (lapel)
    { d: `M ${xFront},${yFront + lapelLen} L ${xFront + lapelW},${yFront + lapelLen + 22}`, stroke: '#7c3aed', strokeWidth: 1.2, dashArray: '4 3' },
    // Front: gorge line
    { d: `M ${xFront + lapelW},${yFront + neckDepth + 25} L ${xFront + shoulderW * 0.6},${yFront + gorgeY}`, stroke: 'rgba(100,116,139,0.5)', strokeWidth: 1, dashArray: '3 2' },
    // Front: CF grain
    { d: `M ${xFront},${yFront + neckDepth} L ${xFront},${yFront + lenH}`, stroke: '#475569', strokeWidth: 1.2, dashArray: '5 4' },
    // Front: button positions (2 buttons)
    { d: `M ${xFront + lapelW * 0.5 - 4},${yFront + breakPt} L ${xFront + lapelW * 0.5 + 4},${yFront + breakPt}`, stroke: '#ef4444', strokeWidth: 2 },
    { d: `M ${xFront + lapelW * 0.5},${yFront + breakPt - 4} L ${xFront + lapelW * 0.5},${yFront + breakPt + 4}`, stroke: '#ef4444', strokeWidth: 2 },
    { d: `M ${xFront + lapelW * 0.5 - 4},${yFront + breakPt + 50} L ${xFront + lapelW * 0.5 + 4},${yFront + breakPt + 50}`, stroke: '#ef4444', strokeWidth: 2 },
    { d: `M ${xFront + lapelW * 0.5},${yFront + breakPt + 46} L ${xFront + lapelW * 0.5},${yFront + breakPt + 54}`, stroke: '#ef4444', strokeWidth: 2 },
    // Back: armhole depth guideline
    { d: `M ${xBack},${yBack + armDepth - 6} L ${xBack + chestW},${yBack + armDepth - 6}`, stroke: 'rgba(51,65,85,0.4)', strokeWidth: 1.2 },
    // Back: waist guideline
    { d: `M ${xBack},${yBack + lenH * 0.52} L ${xBack + waistW + 8},${yBack + lenH * 0.52}`, stroke: 'rgba(51,65,85,0.3)', strokeWidth: 1, dashArray: '3 3' },
    // Back: CB grain
    { d: `M ${xBack},${yBack} L ${xBack},${yBack + lenH}`, stroke: '#475569', strokeWidth: 1.2, dashArray: '5 4' },
    // Back: shoulder dart (short hash)
    { d: `M ${xBack + shoulderW * 0.5},${yBack - 6} L ${xBack + shoulderW * 0.5},${yBack + 18}`, stroke: 'rgba(100,116,139,0.55)', strokeWidth: 1, dashArray: '3 2' }
  ];

  const guideLabels = [
    { x: xFront + shoulderW / 2, y: yFront - 15, text: `Shoulder: ${(m.shoulder / 2 + shldrEase).toFixed(2)} cm`, key: 'shoulder' },
    { x: xFront + chestW + 14,   y: yFront + armDepth / 2, text: `Chest/4+6.35 cm: ${(m.chest / 4 + 6.35 + sideEase).toFixed(1)} cm`, key: 'chest' },
    { x: xFront - 30,            y: yFront + lenH / 2,     text: `Length: ${m.length} cm`, key: 'length' },
    { x: xFront + lapelW / 2,    y: yFront + lapelLen + 35, text: 'Lapel roll line', key: 'lapel' },
    { x: xBack + shoulderW / 2,  y: yBack - 15,            text: `Back Shoulder: ${(m.shoulder / 2 + shldrEase).toFixed(2)} cm`, key: 'back_shoulder' },
    { x: xBack + chestW + 14,    y: yBack + armDepth / 2,  text: `Back Chest: ${(m.chest / 4 + 6.35 + sideEase).toFixed(1)} cm`, key: 'back_chest' }
  ];

  const annotations = [
    { x1: xFront, y1: yFront + neckDepth, x2: xFront + neckDepth, y2: yFront, key: 'front_neckline', label: `Front Neckline +${neckEase}"` },
    { x1: xFront + neckDepth, y1: yFront, x2: xFront + shoulderW, y2: yFront + shoulderW * 0.15, key: 'shoulder_seam', label: 'Shoulder Seam' },
    { x1: xFront + shoulderW, y1: yFront + shoulderW * 0.15, x2: xFront + chestW, y2: yFront + armDepth, key: 'armhole', label: 'Armhole Arc (+¼" ease)' },
    { x1: xFront, y1: yFront + lapelLen, x2: xFront + lapelW, y2: yFront + lapelLen + 22, key: 'roll_line', label: 'Lapel Roll Line' },
    { x1: xBack, y1: yBack, x2: xBack + shoulderW, y2: yBack - 10, key: 'back_shoulder', label: 'Back Shoulder Slope' }
  ];

  const viewBoxWidth  = panelGap + chestW + 140;
  const viewBoxHeight = lenH + 100;

  return { path, seamPath, internalLines, guideLabels, annotations, viewBoxWidth, viewBoxHeight };
};

// ─────────────────────────────────────────────
// GARMENT 4 – MEN'S WAISTCOAT / VEST  (Ch. 23)
// Armstrong formulas: based on jacket foundation
// ─────────────────────────────────────────────

/**
 * Pattern Generator for Men's Waistcoat (Vest)
 *
 * Key Armstrong formulas implemented:
 *   Based on jacket foundation traced to 5" below waist
 *   X  = square up from hem; Y & Z = ½"–⅝" out from X
 *   A  = 1½" below X, Y, Z
 *   B  = ½" in from each side waist (Y, Z lines)
 *   C  = center back waist; D = 1" down from C
 *   E  = center between B and C; darts ⅜"–½" intake to chest line
 *   F  = 3¼" from neck; armhole from F touching 2" mark, ending at A
 *   G  = 1" down from D; H = 3–3½" down from D
 *   I  = 1½" in from H; J = 1⅝" from B  → curved hem I to J
 *   K  = center between I and J; L = mid between Y and CF + ½"
 *   Welt pocket: draw line K to L
 *   V-neckline: ¾" parallel to CF, passing chest line
 *   M  = 3¼" from neck; N = between Y and L → armhole A to N to M
 *   Back strap/buckle through slit in back dart (1" wide)
 *   Waist of vest = trouser waist + 1"
 */
const generateWaistcoatPattern = (measurements, showSeams = true) => {
  const m  = measurements;
  const sc = PATTERN_CONFIG.scale;

  // ── Jacket foundation base values (same scale-up as coat, Ch. 23 sizes) ──
  const shldrEase = 0.3175;
  const sideEase  = 0.635;

  const shoulderW = (m.shoulder / 2 + shldrEase) * sc;
  const chestW    = (m.chest / 4 + 6.35 + sideEase) * sc;
  const vestLenH  = (m.vestLength ?? (m.length + 12.7)) * sc;  // jacket length + 12.7 cm below waist (5")
  const armDepth  = (m.armhole + 0.635) * sc;

  // Armstrong vest key measurements (in px)
  const armholeF  = 8.255 * sc;                // F = 3¼" from neck (armhole start)
  const armhole2  = 5.08 * sc;                // touches 2" mark
  const dartIntak = 1.11125 * sc;             // ⅜"–½" dart intake (avg)
  const dartToChest = (armDepth - 1.27 * sc);  // dart legs run to chest line
  const aPoint    = 3.81 * sc;                 // A = 1½" below X
  const bPoint    = 1.27 * sc;                 // B = ½" in from side waist
  const dPoint    = 2.54 * sc;                // D = 1" down from C (CB waist)
  const gPoint    = 2.54 * sc;                // G = 1" down from D
  const hPoint    = 3.25 * sc;                // H = 3–3½" down from D
  const iPoint    = 3.81 * sc;                // I = 1½" in from H
  const jOffset   = 4.1275 * sc;              // J = 1⅝" down from B
  const vNeck     = 1.905 * sc;               // V-neckline: ¾" parallel to CF

  // ── Layout ────────────────────────────────────────────────────────────────
  const xFront = 60;
  const yTop   = 50;
  const panelGap = chestW + 120;
  const xBack  = xFront + panelGap;

  // ── Key point coordinates ─────────────────────────────────────────────────
  // Waist and hem reference levels (from jacket foundation)
  const yWaist  = yTop + armDepth + 30;                       // approximate waist level
  const yHem    = yTop + vestLenH;                             // vest hem (5" below waist)
  const yCBWaist= yWaist;                                      // C = CB waist

  // FRONT PANEL
  // X = bottom center of vest panel (hem midpoint, used for Y/Z)
  const X  = { x: xFront + chestW * 0.5, y: yHem };
  const Y  = { x: X.x - 1.42875 * sc, y: yHem };             // Y = ½"–⅝" out left
  const Z  = { x: X.x + 1.42875 * sc, y: yHem };             // Z = ½"–⅝" out right

  // A-points on Y/Z (1½" above hem)
  const Ay = { x: Y.x, y: yHem - aPoint };
  const Az = { x: Z.x, y: yHem - aPoint };

  // B-points: ½" in from side waist on Y/Z lines
  const By = { x: Y.x + bPoint, y: yWaist };
  const Bz = { x: Z.x - bPoint, y: yWaist };

  // C = CB waist (center back); D = 1" below C
  const C  = { x: xBack, y: yCBWaist };
  const D  = { x: xBack, y: yCBWaist + dPoint };

  // E = center between B and C (for dart center on front)
  const Ex = (By.x + xFront) / 2;
  const Efront = { x: Ex, y: yWaist };

  // F = 3¼" from neck (armhole notch)
  const F  = { x: xFront + armholeF, y: yTop };

  // G, H, I, J (hem shaping)
  const G  = { x: xFront + chestW * 0.4, y: yCBWaist + dPoint + gPoint };
  const H  = { x: xFront + chestW * 0.4, y: yCBWaist + dPoint + hPoint };
  const I  = { x: H.x - iPoint, y: H.y };
  const Jf = { x: By.x, y: yWaist + jOffset };

  // K = center between I and J (pocket line anchor)
  const K  = { x: (I.x + Jf.x) / 2, y: (I.y + Jf.y) / 2 };
  // L = mid between Y line and CF + ½"
  const L  = { x: (Y.x + xFront) / 2 + 1.27 * sc, y: K.y };

  // V-neck line points
  const vNeckX = xFront + vNeck;                              // ¾" from CF
  const vNeckBottom = yTop + armDepth;                        // where V passes chest line
  const M_vest = { x: xFront + armholeF, y: yTop };          // M = 3¼" from neck (same as F for vest)
  const N_vest = { x: (Y.x + xFront) / 2, y: Ay.y };        // N = between Y and L

  // ── FRONT PATH ────────────────────────────────────────────────────────────
  const frontPath = `
    M ${xFront},${yTop + armholeF}
    Q ${xFront + armholeF * 0.5},${yTop} ${xFront + armholeF},${yTop}
    L ${xFront + shoulderW},${yTop + shoulderW * 0.14}
    Q ${xFront + shoulderW + 12},${yTop + armDepth * 0.5} ${xFront + chestW},${yTop + armDepth}
    Q ${xFront + chestW},${yTop + armDepth + 12} ${Az.x},${Ay.y}
    Q ${Az.x},${yHem - 2} ${X.x},${yHem}
    Q ${Y.x},${yHem} ${Ay.x},${Ay.y}
    Q ${xFront + chestW * 0.3},${By.y + jOffset + 5} ${I.x},${I.y}
    Q ${I.x - 4},${I.y - 6} ${vNeckX},${vNeckBottom}
    L ${vNeckX},${yTop + armholeF}
    Q ${xFront + armholeF * 0.3},${yTop + armholeF + 5} ${xFront},${yTop + armholeF}
    Z`;

  // ── BACK PATH ─────────────────────────────────────────────────────────────
  const backNeckW = (m.neck / 5 + 0.3175) * sc;
  const backShldr = { x: xBack + shoulderW, y: yTop - 8 };
  const backArmX  = { x: xBack + chestW, y: yTop + armDepth - 6 };
  const backHemOut= { x: xBack + chestW * 0.5 + 1.42875 * sc, y: yHem };
  const backHemIn = { x: xBack - 1.27 * sc, y: yHem };
  const backSideWaist = { x: xBack + chestW * 0.45, y: yWaist };

  // Back strap (slit in back dart – 1" wide, controls excess)
  const strapCenterX = xBack + (m.waist / 4 + 1.0) * sc;
  const strapW = 1.27 * sc;  // half of 1" strap

  const backPath = `
    M ${xBack},${yTop}
    Q ${xBack + backNeckW * 0.5},${yTop - 4} ${xBack + backNeckW},${yTop}
    L ${backShldr.x},${backShldr.y}
    Q ${backShldr.x + 16},${yTop + armDepth * 0.4} ${backArmX.x},${backArmX.y}
    L ${backSideWaist.x},${yWaist}
    Q ${backSideWaist.x * 0.98},${yWaist + 12} ${backHemOut.x},${yHem}
    L ${backHemIn.x},${yHem}
    L ${xBack},${yCBWaist + dPoint + hPoint}
    Q ${xBack},${yCBWaist + 8} ${xBack},${yTop}
    Z`;

  const path = frontPath + ' ' + backPath;

  // ── Seam allowance ────────────────────────────────────────────────────────
  const sa = 0.625 * sc;
  const seamPath = showSeams ? `
    M ${xFront + sa},${yTop + armholeF}
    L ${xFront + shoulderW - sa},${yTop + shoulderW * 0.14 + sa}
    Q ${xFront + shoulderW + 8},${yTop + armDepth * 0.5} ${xFront + chestW - sa},${yTop + armDepth + sa}
    Q ${xFront + chestW - sa},${yTop + armDepth + 8} ${Az.x - sa},${Ay.y + sa}
    L ${X.x},${yHem - sa}
    Q ${Y.x + sa},${yHem - sa} ${Ay.x + sa},${Ay.y + sa}
    Z
    M ${xBack + sa},${yTop + sa}
    L ${backShldr.x - sa},${backShldr.y + sa}
    Q ${backShldr.x + 12},${yTop + armDepth * 0.4} ${backArmX.x - sa},${backArmX.y + sa}
    L ${backSideWaist.x - sa},${yWaist + sa}
    L ${backHemOut.x - sa},${yHem - sa}
    L ${backHemIn.x + sa},${yHem - sa}
    Z` : '';

  // ── Construction lines ────────────────────────────────────────────────────
  const internalLines = [
    // Front: armhole depth guideline
    { d: `M ${xFront},${yTop + armDepth} L ${xFront + chestW},${yTop + armDepth}`, stroke: 'rgba(51,65,85,0.4)', strokeWidth: 1.2 },
    // Front: waist level
    { d: `M ${xFront},${yWaist} L ${xFront + chestW * 0.6},${yWaist}`, stroke: 'rgba(51,65,85,0.3)', strokeWidth: 1, dashArray: '3 3' },
    // Front: V-neck line (¾" from CF)
    { d: `M ${vNeckX},${yTop + armholeF} L ${vNeckX},${vNeckBottom} L ${xFront + chestW * 0.28},${yHem - 20}`, stroke: '#7c3aed', strokeWidth: 1.2, dashArray: '4 3' },
    // Front: darts to chest
    { d: `M ${Efront.x - dartIntak},${yWaist} L ${Efront.x},${yTop + armDepth}`, stroke: 'rgba(100,116,139,0.55)', strokeWidth: 1, dashArray: '3 2' },
    { d: `M ${Efront.x + dartIntak},${yWaist} L ${Efront.x},${yTop + armDepth}`, stroke: 'rgba(100,116,139,0.55)', strokeWidth: 1, dashArray: '3 2' },
    // Front: pocket welt line (K to L)
    { d: `M ${K.x},${K.y} L ${L.x},${L.y}`, stroke: 'rgba(51,65,85,0.5)', strokeWidth: 1.4 },
    // Front: hem curve (I to J)
    { d: `M ${I.x},${I.y} Q ${K.x},${Jf.y - 8} ${Jf.x},${Jf.y}`, stroke: 'rgba(51,65,85,0.4)', strokeWidth: 1, dashArray: '2 3' },
    // Front: CF grain
    { d: `M ${xFront},${yTop + armholeF} L ${xFront},${yHem}`, stroke: '#475569', strokeWidth: 1.2, dashArray: '5 4' },
    // Back: waist guideline
    { d: `M ${xBack},${yWaist} L ${backSideWaist.x},${yWaist}`, stroke: 'rgba(51,65,85,0.3)', strokeWidth: 1, dashArray: '3 3' },
    // Back: armhole depth
    { d: `M ${xBack},${yTop + armDepth - 6} L ${backArmX.x},${yTop + armDepth - 6}`, stroke: 'rgba(51,65,85,0.35)', strokeWidth: 1, dashArray: '2 3' },
    // Back: CB grain
    { d: `M ${xBack},${yTop} L ${xBack},${yHem}`, stroke: '#475569', strokeWidth: 1.2, dashArray: '5 4' },
    // Back: strap/buckle slit (back dart)
    { d: `M ${strapCenterX - strapW},${yWaist} L ${strapCenterX - strapW},${yWaist + 18}`, stroke: '#ef4444', strokeWidth: 1, dashArray: '3 2' },
    { d: `M ${strapCenterX + strapW},${yWaist} L ${strapCenterX + strapW},${yWaist + 18}`, stroke: '#ef4444', strokeWidth: 1, dashArray: '3 2' }
  ];

  const guideLabels = [
    { x: xFront + shoulderW / 2, y: yTop - 15, text: `Shoulder: ${(m.shoulder / 2 + shldrEase).toFixed(2)} cm`, key: 'shoulder' },
    { x: xFront + chestW + 16,   y: yTop + armDepth / 2, text: `Chest/4+6.35 cm: ${(m.chest / 4 + 6.35 + sideEase).toFixed(1)} cm`, key: 'chest' },
    { x: xFront - 30,            y: yTop + vestLenH / 2, text: `Vest Length: ${(m.vestLength ?? m.length + 12.7).toFixed(1)} cm`, key: 'length' },
    { x: xFront + armholeF + 6,  y: yTop - 14,           text: 'F = 3¼" from neck', key: 'f_point' },
    { x: K.x - 12,               y: K.y - 10,            text: 'Welt pocket K→L', key: 'pocket' },
    { x: xBack + shoulderW / 2,  y: yTop - 15, text: `Back Shoulder`, key: 'back_shoulder' },
    { x: strapCenterX + 4,       y: yWaist + 22, text: '1" strap/buckle slit', key: 'strap' }
  ];

  const annotations = [
    { x1: xFront, y1: yTop + armholeF, x2: xFront + armholeF, y2: yTop, key: 'front_neck', label: `Neckline (F = 3¼" from neck)` },
    { x1: xFront + armholeF, y1: yTop, x2: xFront + shoulderW, y2: yTop + shoulderW * 0.14, key: 'shoulder', label: 'Shoulder Seam' },
    { x1: xFront + chestW, y1: yTop + armDepth, x2: Az.x, y2: Ay.y, key: 'armhole_arc', label: 'Armhole (F → 2" mark → A)' },
    { x1: I.x, y1: I.y, x2: Jf.x, y2: Jf.y, key: 'hem_curve', label: 'Curved Hem (I to J, 1⅝" offset)' },
    { x1: K.x, y1: K.y, x2: L.x, y2: L.y, key: 'welt', label: 'Welt Pocket Line (K to L)' }
  ];

  const viewBoxWidth  = panelGap + chestW + 130;
  const viewBoxHeight = vestLenH + 100;

  return { path, seamPath, internalLines, guideLabels, annotations, viewBoxWidth, viewBoxHeight };
};

// ─────────────────────────────────────────────
// DRESS PATTERN (unchanged from original)
// ─────────────────────────────────────────────

/**
 * Pattern Generator for Dress/Gown/Frock
 * Professional dress pattern with bodice darts, waist definition, and skirt flare
 */
const generateDressPattern = (measurements, showSeams = true) => {
  const m = measurements;
  const scale = PATTERN_CONFIG.scale;

  const shoulder = (m.shoulder / 2) * scale;
  const chest = (m.chest / 4 + 1.2) * scale;
  const waist = (m.waist / 4 + 0.8) * scale;
  const hip = (m.hip / 4 + 1.5) * scale;
  const length = m.length * scale;
  const armDepth = m.armhole ? m.armhole * scale : (m.chest / 4 - 0.5) * scale;

  const bodiceLength = length * 0.38;
  const waistPosition = bodiceLength;
  const flareWidth = hip * 2.2;
  const dartWidth = chest * 0.15;

  const xOff = 90;
  const yOff = 50;
  const panelGap = hip * 2.5 + 150;

  const xFront = xOff;
  const yFront = yOff;

  let frontPath = `M ${xFront},${yFront + 12}
                   L ${xFront + shoulder},${yFront}
                   Q ${xFront + shoulder + 12},${yFront + armDepth * 0.5} ${xFront + chest},${yFront + armDepth}
                   L ${xFront + waist},${yFront + waistPosition}
                   Q ${xFront + waist * 1.2},${yFront + waistPosition + 15} ${xFront + hip},${yFront + waistPosition + 40}
                   L ${xFront + flareWidth},${yFront + length}
                   L ${xFront},${yFront + length}
                   L ${xFront - 5},${yFront + waistPosition + 40}
                   Q ${xFront - 5},${yFront + waistPosition + 15} ${xFront + waist},${yFront + waistPosition}
                   L ${xFront},${yFront + armDepth}
                   Z`;

  const frontSeamPath = showSeams ? `M ${xFront + 4},${yFront + 12}
                        L ${xFront + shoulder - 4},${yFront + 4}
                        Q ${xFront + shoulder + 8},${yFront + armDepth * 0.5} ${xFront + chest - 4},${yFront + armDepth}
                        L ${xFront + waist - 2},${yFront + waistPosition}
                        Q ${xFront + waist * 1.2 - 2},${yFront + waistPosition + 15} ${xFront + hip - 4},${yFront + waistPosition + 40}
                        L ${xFront + flareWidth - 4},${yFront + length - 4}
                        L ${xFront + 4},${yFront + length - 4}
                        L ${xFront - 1},${yFront + waistPosition + 40}
                        Q ${xFront - 1},${yFront + waistPosition + 15} ${xFront + waist + 2},${yFront + waistPosition}
                        L ${xFront + 4},${yFront + armDepth}
                        Z` : '';

  const xBack = xFront + panelGap;
  const yBack = yOff;

  let backPath = `M ${xBack},${yBack}
                  L ${xBack + shoulder},${yBack - 8}
                  Q ${xBack + shoulder + 15},${yBack + armDepth * 0.4} ${xBack + chest},${yBack + armDepth - 5}
                  L ${xBack + waist + 5},${yBack + waistPosition}
                  Q ${xBack + waist * 1.3},${yBack + waistPosition + 15} ${xBack + hip + 5},${yBack + waistPosition + 40}
                  L ${xBack + flareWidth},${yBack + length}
                  L ${xBack},${yBack + length}
                  L ${xBack - 5},${yBack + waistPosition + 40}
                  Q ${xBack - 10},${yBack + waistPosition + 15} ${xBack + waist - 5},${yBack + waistPosition}
                  L ${xBack},${yBack + armDepth - 5}
                  Z`;

  const backSeamPath = showSeams ? `M ${xBack + 4},${yBack + 4}
                       L ${xBack + shoulder - 4},${yBack - 4}
                       Q ${xBack + shoulder + 11},${yBack + armDepth * 0.4} ${xBack + chest - 4},${yBack + armDepth - 1}
                       L ${xBack + waist + 1},${yBack + waistPosition}
                       Q ${xBack + waist * 1.3 - 2},${yBack + waistPosition + 15} ${xBack + hip + 1},${yBack + waistPosition + 40}
                       L ${xBack + flareWidth - 4},${yBack + length - 4}
                       L ${xBack + 4},${yBack + length - 4}
                       L ${xBack - 1},${yBack + waistPosition + 40}
                       Q ${xBack - 6},${yBack + waistPosition + 15} ${xBack + waist - 1},${yBack + waistPosition}
                       L ${xBack + 4},${yBack + armDepth - 1}
                       Z` : '';

  const path = frontPath + ` ` + backPath;
  const seamPath = frontSeamPath + ` ` + backSeamPath;

  const internalLines = [
    { d: `M ${xFront},${yFront + 12} Q ${xFront + shoulder / 2},${yFront - 5} ${xFront + shoulder},${yFront}`, stroke: 'rgba(51, 65, 85, 0.3)', strokeWidth: 1, dashArray: '2 2' },
    { d: `M ${xFront - 5},${yFront + waistPosition} L ${xFront + waist},${yFront + waistPosition}`, stroke: 'rgba(51, 65, 85, 0.4)', strokeWidth: 1.2 },
    { d: `M ${xFront},${yFront + armDepth} L ${xFront + chest},${yFront + armDepth}`, stroke: 'rgba(51, 65, 85, 0.3)', strokeWidth: 1, dashArray: '2 2' },
    { d: `M ${xFront + chest - dartWidth},${yFront + armDepth + 5} L ${xFront + chest + 10},${yFront + waistPosition - 5}`, stroke: 'rgba(100, 116, 139, 0.5)', strokeWidth: 1, dashArray: '3 2' },
    { d: `M ${xBack},${yBack + waistPosition} L ${xBack + waist + 5},${yBack + waistPosition}`, stroke: 'rgba(51, 65, 85, 0.4)', strokeWidth: 1.2 },
    { d: `M ${xBack},${yBack + armDepth - 5} L ${xBack + chest},${yBack + armDepth - 5}`, stroke: 'rgba(51, 65, 85, 0.3)', strokeWidth: 1, dashArray: '2 2' }
  ];

  const guideLabels = [
    { x: xFront + shoulder / 2, y: yFront - 15, text: `Shoulder: ${(m.shoulder / 2).toFixed(1)}"`, key: 'shoulder' },
    { x: xFront + chest + 20, y: yFront + armDepth / 2, text: `Bust: ${m.chest}"`, key: 'bust' },
    { x: xFront + waist + 15, y: yFront + waistPosition, text: `Waist: ${m.waist}"`, key: 'waist' },
    { x: xFront + hip + 20, y: yFront + waistPosition + 30, text: `Hip: ${m.hip}"`, key: 'hip' },
    { x: xFront + flareWidth / 2, y: yFront + length + 15, text: `Skirt Length: ${m.length}"`, key: 'length' },
    { x: xBack + shoulder / 2, y: yBack - 15, text: `Back Shoulder: ${(m.shoulder / 2).toFixed(1)}"`, key: 'back_shoulder' }
  ];

  const annotations = [
    { x1: xFront, y1: yFront + 12, x2: xFront + shoulder, y2: yFront, key: 'neckline', label: 'Front Neckline' },
    { x1: xFront, y1: yFront + waistPosition, x2: xFront + waist, y2: yFront + waistPosition, key: 'waist', label: 'Waist Seam' },
    { x1: xFront + waist, y1: yFront + waistPosition, x2: xFront + hip, y2: yFront + waistPosition + 40, key: 'flare', label: 'Skirt Flare' },
    { x1: xBack, y1: yBack, x2: xBack + shoulder, y2: yBack - 8, key: 'back_shoulder', label: 'Back Shoulder Line' }
  ];

  const viewBoxWidth = panelGap + hip * 2 + 160;
  const viewBoxHeight = length + 100;

  return { path, seamPath, internalLines, guideLabels, annotations, viewBoxWidth, viewBoxHeight };
};

// ─────────────────────────────────────────────
// PATTERN TYPE MATCHER
// ─────────────────────────────────────────────

/**
 * Pattern type matcher – identifies garment type from various naming conventions.
 * Now also resolves 'waistcoat' and 'vest' to the dedicated generator.
 */
const getPatternType = (itemType = '') => {
  const type = (itemType || '').toLowerCase();
  if (type.includes('trouser') || type.includes('pant') || type.includes('bottom')) return 'trouser';
  if (type.includes('waistcoat') || type.includes('vest'))                          return 'waistcoat';
  if (type.includes('coat') || type.includes('jacket') || type.includes('suit'))   return 'coat';
  if (type.includes('dress') || type.includes('gown') || type.includes('frock'))   return 'dress';
  return 'shirt'; // default
};

// ─────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────

/**
 * Main export function – generates complete CAD blueprint data.
 * Pure function with no side effects.
 *
 * @param {string}  itemType     The type of garment (shirt, trouser, coat, waistcoat, dress …)
 * @param {object}  measurements The customer's measurements object (inches or cm – auto-detected)
 * @param {boolean} showSeams    Whether to show seam allowances (default: true)
 * @returns {object} Complete CAD blueprint data with paths, labels, and annotations
 *
 * Formula source: "Patternmaking for Fashion Design" 5th Ed. – Helen Joseph-Armstrong
 *   Shirt     → Ch. 23 Men's Dress Shirt Foundation
 *   Trouser   → Ch. 23 Classic Pant Foundation + Trouser Draft
 *   Coat      → Ch. 22 Women's Jacket / Coat Foundation
 *   Waistcoat → Ch. 23 The Vest (based on jacket foundation)
 *   Dress     → Ch. 18/19 Dress / Torso Foundation (original logic retained)
 */
export const generateCADBlueprint = (itemType, measurements = {}, showSeams = true) => {
  const parsedMeasurements = parseMeasurements(measurements);
  const patternType        = getPatternType(itemType);

  let blueprintData;
  switch (patternType) {
    case 'trouser':
      blueprintData = generateTrouserPattern(parsedMeasurements, showSeams);
      break;
    case 'coat':
      blueprintData = generateCoatPattern(parsedMeasurements, showSeams, false);
      break;
    case 'waistcoat':
      blueprintData = generateWaistcoatPattern(parsedMeasurements, showSeams);
      break;
    case 'dress':
      blueprintData = generateDressPattern(parsedMeasurements, showSeams);
      break;
    case 'shirt':
    default:
      blueprintData = generateShirtPattern(parsedMeasurements, showSeams);
  }

  return blueprintData;
};

/**
 * Export for accessing configuration values
 */
export const PatternConfig = PATTERN_CONFIG;

/**
 * Utility to get all supported garment types
 */
export const getSupportedGarmentTypes = () => [
  'shirt',
  'trouser',
  'coat',
  'waistcoat',
  'dress'
];
