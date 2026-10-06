import React, { useRef, useEffect } from 'react';
import { useGraphicSettings } from '../../utils/graphicSettingsSystem';

export interface PixelWavingFlagCanvasProps {
  languageCode: string;
  flagName?: string;
  isDisabled?: boolean;
  FlagComponent?: React.FC<{ className?: string }>;
  className?: string;
}

// -----------------------------------------------------------------------------
// INTERNAL CONSTANTS & DIMENSIONS
// -----------------------------------------------------------------------------
const CANVAS_W = 144;
const CANVAS_H = 90;

const POLE_X = 18;
const POLE_TOP_Y = 4;
const POLE_BOT_Y = 82;

const ATTACH_Y_TOP = 18;
const ATTACH_Y_BOT = 66;
const FLAG_BASE_H = ATTACH_Y_BOT - ATTACH_Y_TOP; // 48px
const FLAG_BASE_W = 86; // 86px un-deformed width

// -----------------------------------------------------------------------------
// 6 CONSECUTIVE KEYFRAME POSES DEFORMATION EVALUATION
// (Pose 1 -> Pose 2 -> Pose 3 -> Pose 4 -> Pose 5 -> Pose 6 -> Pose 1)
// -----------------------------------------------------------------------------
interface PoseDeformState {
  dy: number;            // Vertical shift (px)
  widthScale: number;    // Apparent width multiplier (foreshortening)
  heightScale: number;   // Slice height multiplier
  bunching: number;      // Horizontal compression shift (-1 to 1)
  shadow: number;        // Shading intensity: >0 = shadow in trough, <0 = highlight
  curlFlutter: number;   // Discrete flutter notch at free edge
}

function evaluatePoseDeform(poseIdx: number, u: number): PoseDeformState {
  // Hoist anchor: u=0 has strictly ZERO movement. Progression is exponential so
  // the area near the pole is firmly anchored, and free edge flutters vigorously.
  const anchor = Math.pow(u, 1.25);

  let dy = 0;
  let widthScale = 0.94;
  let heightScale = 1.0;
  let bunching = 0.0;
  let shadow = 0.0;
  let curlFlutter = 0.0;

  switch (poseIdx) {
    case 0: // POSE 1: Crest forming at hoist, mid trough, fly rising
      dy = (Math.sin(u * Math.PI * 2.2) * 3.8 - Math.sin(u * Math.PI * 1.0) * 1.5 + Math.pow(u, 1.4) * 6.0) * anchor;
      widthScale = 0.94;
      heightScale = 1.0 + Math.sin(u * Math.PI * 2.0) * 0.04;
      bunching = -Math.sin(u * Math.PI * 2.0) * 0.03;
      // Trough shadow around u=0.62, highlights on hoist crest (0.25) & fly (0.95)
      shadow = Math.exp(-Math.pow((u - 0.62) / 0.13, 2)) * 0.32
             - Math.exp(-Math.pow((u - 0.25) / 0.11, 2)) * 0.22
             - Math.exp(-Math.pow((u - 0.96) / 0.08, 2)) * 0.26;
      curlFlutter = u > 0.85 ? Math.sin(u * 22) * 0.8 : 0;
      break;

    case 1: // POSE 2: Crest rolls to center, rear deep trough, fly swooping down
      dy = (Math.sin(u * Math.PI * 2.2 - 0.8) * 8.2 - u * 3.0) * anchor;
      widthScale = 0.97;
      heightScale = 1.0 + Math.sin(u * Math.PI * 1.6) * 0.05;
      bunching = Math.sin(u * Math.PI * 1.8) * 0.02;
      // Broad highlight over central dome (0.45), deep shadow in trough (0.80)
      shadow = Math.exp(-Math.pow((u - 0.80) / 0.12, 2)) * 0.44
             - Math.exp(-Math.pow((u - 0.45) / 0.13, 2)) * 0.32;
      curlFlutter = u > 0.88 ? -Math.sin(u * 18) * 1.0 : 0;
      break;

    case 2: // POSE 3: Peak extension, crest at 0.65, fly drops to lowest trailing dip
      dy = (Math.sin(u * Math.PI * 1.7 - 0.3) * 7.5 - u * 9.5) * anchor;
      widthScale = 1.00; // Maximum extension! Flag stretched out in the wind
      heightScale = 0.98 - Math.sin(u * Math.PI) * 0.03;
      bunching = 0.0;
      // Highlight on secondary crest (0.65), diagonal shadow cutting rear (0.82)
      shadow = Math.exp(-Math.pow((u - 0.82) / 0.10, 2)) * 0.38
             - Math.exp(-Math.pow((u - 0.65) / 0.12, 2)) * 0.25;
      curlFlutter = u > 0.86 ? Math.sin(u * 26) * 1.2 : 0;
      break;

    case 3: // POSE 4: Counter-wave hoist trough, fly snaps & kicks upward
      dy = (-Math.sin(u * Math.PI * 2.0) * 5.8 + Math.pow(u, 1.3) * 5.0) * anchor;
      widthScale = 0.88; // Shortest width! Snapping cloth curls back
      heightScale = 1.0 + Math.pow(u, 2) * 0.07;
      bunching = -Math.sin(u * Math.PI * 1.5) * 0.05;
      // Shadow in new hoist trough (0.28), sharp highlight on snapping fly tip (0.90)
      shadow = Math.exp(-Math.pow((u - 0.28) / 0.12, 2)) * 0.38
             - Math.exp(-Math.pow((u - 0.90) / 0.10, 2)) * 0.34;
      curlFlutter = u > 0.82 ? -Math.sin(u * 28) * 1.5 : 0;
      break;

    case 4: // POSE 5: Deep mid trough, fly whips to MAXIMUM HIGH PEAK
      dy = (-Math.sin(u * Math.PI * 1.5) * 10.0 + Math.pow(u, 1.4) * 12.0) * anchor;
      widthScale = 0.91;
      heightScale = 0.95 + Math.pow(u, 2) * 0.13;
      bunching = Math.sin(u * Math.PI * 2.0) * 0.04;
      // Deep shadow in mid trough (0.45), radiant highlight over whipped fly crest (0.90)
      shadow = Math.exp(-Math.pow((u - 0.45) / 0.14, 2)) * 0.46
             - Math.exp(-Math.pow((u - 0.90) / 0.12, 2)) * 0.40;
      curlFlutter = u > 0.84 ? Math.sin(u * 30) * 1.8 : 0;
      break;

    case 5: // POSE 6: Dissipation toward Pose 1, fly descending, cycle completion
    default:
      dy = (Math.sin(u * Math.PI * 1.8 + 0.2) * 4.2 + Math.pow(u, 1.2) * 5.0) * anchor;
      widthScale = 0.94;
      heightScale = 1.0 + Math.sin(u * Math.PI * 1.4) * 0.03;
      bunching = 0.0;
      // Soft intermediate shadow (0.50), gentle hoist highlight (0.20)
      shadow = Math.exp(-Math.pow((u - 0.50) / 0.14, 2)) * 0.30
             - Math.exp(-Math.pow((u - 0.20) / 0.10, 2)) * 0.18;
      curlFlutter = u > 0.86 ? Math.sin(u * 20) * 0.6 : 0;
      break;
  }

  return { dy, widthScale, heightScale, bunching, shadow, curlFlutter };
}

// Interpolate between keyframe poses
function getInterpolatedDeform(progressFraction: number, u: number): PoseDeformState {
  // progressFraction is in [0, 6)
  const norm = ((progressFraction % 6) + 6) % 6;
  const p1 = Math.floor(norm);
  const p2 = (p1 + 1) % 6;
  const t = norm - p1;

  // Cosine smooth interpolation
  const smoothT = (1 - Math.cos(t * Math.PI)) / 2;

  const s1 = evaluatePoseDeform(p1, u);
  const s2 = evaluatePoseDeform(p2, u);

  return {
    dy: s1.dy * (1 - smoothT) + s2.dy * smoothT,
    widthScale: s1.widthScale * (1 - smoothT) + s2.widthScale * smoothT,
    heightScale: s1.heightScale * (1 - smoothT) + s2.heightScale * smoothT,
    bunching: s1.bunching * (1 - smoothT) + s2.bunching * smoothT,
    shadow: s1.shadow * (1 - smoothT) + s2.shadow * smoothT,
    curlFlutter: s1.curlFlutter * (1 - smoothT) + s2.curlFlutter * smoothT,
  };
}

// -----------------------------------------------------------------------------
// TEXTURE CACHE & DIRECT PIXEL-ART FLAG PAINTERS
// -----------------------------------------------------------------------------
const textureCache = new Map<string, HTMLCanvasElement>();

function renderFlagToCanvas(langCode: string): HTMLCanvasElement {
  const cached = textureCache.get(langCode);
  if (cached) return cached;

  const canvas = document.createElement('canvas');
  canvas.width = FLAG_BASE_W;
  canvas.height = FLAG_BASE_H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.imageSmoothingEnabled = false;
  const W = FLAG_BASE_W;
  const H = FLAG_BASE_H;

  const code = langCode.toLowerCase();

  if (code.includes('white')) {
    // 🏳️ WHITE FLAG
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, W, H);
    // Subtle satin weave grid lines
    ctx.fillStyle = '#F1F5F9';
    ctx.fillRect(0, Math.floor(H / 3), W, 1);
    ctx.fillRect(0, Math.floor((H * 2) / 3), W, 1);
    ctx.fillRect(Math.floor(W / 3), 0, 1, H);
    ctx.fillRect(Math.floor((W * 2) / 3), 0, 1, H);
  } else if (code.includes('en') || code.includes('gb') || code.includes('uk')) {
    // 🇬🇧 UK FLAG (Union Jack)
    ctx.fillStyle = '#012169'; // Deep Navy
    ctx.fillRect(0, 0, W, H);

    // White Diagonals
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(W, H);
    ctx.moveTo(W, 0);
    ctx.lineTo(0, H);
    ctx.stroke();

    // Red Diagonals (Counterchanged pinwheels)
    ctx.strokeStyle = '#C8102E';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(W / 2, H / 2);
    ctx.moveTo(W, 0);
    ctx.lineTo(W / 2, H / 2);
    ctx.moveTo(W, H);
    ctx.lineTo(W / 2, H / 2);
    ctx.moveTo(0, H);
    ctx.lineTo(W / 2, H / 2);
    ctx.stroke();

    // White Cross
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(Math.floor(W / 2) - 8, 0, 16, H);
    ctx.fillRect(0, Math.floor(H / 2) - 8, W, 16);

    // Red St. George Cross
    ctx.fillStyle = '#C8102E';
    ctx.fillRect(Math.floor(W / 2) - 5, 0, 10, H);
    ctx.fillRect(0, Math.floor(H / 2) - 5, W, 10);
  } else if (code.includes('es-es') || (code.includes('es') && !code.includes('ar'))) {
    // 🇪🇸 SPAIN FLAG (Rojigualda with Royal Crest)
    const topH = Math.floor(H * 0.25);
    const midH = Math.floor(H * 0.50);
    ctx.fillStyle = '#AA151B'; // Top Red
    ctx.fillRect(0, 0, W, topH);
    ctx.fillStyle = '#F1BF00'; // Center Yellow
    ctx.fillRect(0, topH, W, midH);
    ctx.fillStyle = '#AA151B'; // Bottom Red
    ctx.fillRect(0, topH + midH, W, H - (topH + midH));

    // Spanish Royal Crest
    const cx = Math.floor(W * 0.28);
    const cy = Math.floor(H * 0.5);

    // Crown
    ctx.fillStyle = '#D4AF37';
    ctx.fillRect(cx - 5, cy - 8, 10, 3);
    ctx.fillStyle = '#E60000';
    ctx.fillRect(cx - 4, cy - 7, 2, 2);
    ctx.fillRect(cx + 2, cy - 7, 2, 2);

    // Shield
    ctx.fillStyle = '#AA151B';
    ctx.fillRect(cx - 5, cy - 4, 10, 9);
    ctx.fillStyle = '#F1BF00';
    ctx.fillRect(cx - 4, cy - 3, 4, 3);
    ctx.fillRect(cx, cy, 4, 4);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(cx, cy - 3, 4, 3);

    // Center Bourbon oval
    ctx.fillStyle = '#012169';
    ctx.fillRect(cx - 1, cy - 1, 3, 3);

    // Pillars of Hercules
    ctx.fillStyle = '#E2E8F0';
    ctx.fillRect(cx - 8, cy - 5, 2, 10);
    ctx.fillRect(cx + 6, cy - 5, 2, 10);
  } else if (code.includes('ar') || code.includes('es-ar')) {
    // 🇦🇷 ARGENTINA FLAG (Celeste y Blanca con Sol de Mayo)
    const stripeH = Math.floor(H / 3);
    ctx.fillStyle = '#75AADB'; // Sky Blue Top
    ctx.fillRect(0, 0, W, stripeH);
    ctx.fillStyle = '#FFFFFF'; // White Center
    ctx.fillRect(0, stripeH, W, stripeH);
    ctx.fillStyle = '#75AADB'; // Sky Blue Bottom
    ctx.fillRect(0, stripeH * 2, W, H - stripeH * 2);

    // Sol de Mayo (Sun of May)
    const cx = Math.floor(W / 2);
    const cy = Math.floor(H / 2);

    // Radiating rays
    ctx.fillStyle = '#855B04';
    ctx.fillRect(cx - 7, cy - 7, 14, 14);

    // Golden Sun Core
    ctx.fillStyle = '#F6B40E';
    ctx.beginPath();
    ctx.arc(cx, cy, 5.5, 0, Math.PI * 2);
    ctx.fill();

    // Sun Face eyes & mouth
    ctx.fillStyle = '#855B04';
    ctx.fillRect(cx - 2, cy - 1, 1, 1);
    ctx.fillRect(cx + 1, cy - 1, 1, 1);
    ctx.fillRect(cx - 1, cy + 2, 3, 1);
  } else if (code.includes('pt') || code.includes('br')) {
    // 🇧🇷 BRAZIL FLAG (Verde e Amarela con Globo Celeste)
    ctx.fillStyle = '#009739'; // Green field
    ctx.fillRect(0, 0, W, H);

    // Yellow Rhombus (Diamond)
    ctx.fillStyle = '#FEDD00';
    ctx.beginPath();
    ctx.moveTo(Math.floor(W / 2), 5);
    ctx.lineTo(W - 8, Math.floor(H / 2));
    ctx.lineTo(Math.floor(W / 2), H - 5);
    ctx.lineTo(8, Math.floor(H / 2));
    ctx.closePath();
    ctx.fill();

    // Blue Celestial Globe
    const cx = Math.floor(W / 2);
    const cy = Math.floor(H / 2);
    ctx.fillStyle = '#012169';
    ctx.beginPath();
    ctx.arc(cx, cy, 11, 0, Math.PI * 2);
    ctx.fill();

    // White curved ribbon
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx - 2, cy + 5, 12, -Math.PI * 0.7, -Math.PI * 0.25);
    ctx.stroke();

    // Southern Cross stars
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(cx - 1, cy - 4, 1, 1);
    ctx.fillRect(cx - 1, cy + 4, 1, 1);
    ctx.fillRect(cx - 4, cy, 1, 1);
    ctx.fillRect(cx + 3, cy + 1, 1, 1);
  } else if (code.includes('fr')) {
    // 🇫🇷 FRANCE FLAG (Tricolore)
    const sw = Math.floor(W / 3);
    ctx.fillStyle = '#002654'; // Blue
    ctx.fillRect(0, 0, sw, H);
    ctx.fillStyle = '#FFFFFF'; // White
    ctx.fillRect(sw, 0, sw, H);
    ctx.fillStyle = '#ED2939'; // Red
    ctx.fillRect(sw * 2, 0, W - sw * 2, H);
  } else if (code.includes('de')) {
    // 🇩🇪 GERMANY FLAG (Schwarz-Rot-Gold)
    const sh = Math.floor(H / 3);
    ctx.fillStyle = '#1A1A1A'; // Black
    ctx.fillRect(0, 0, W, sh);
    ctx.fillStyle = '#DD0000'; // Red
    ctx.fillRect(0, sh, W, sh);
    ctx.fillStyle = '#FFCC00'; // Gold
    ctx.fillRect(0, sh * 2, W, H - sh * 2);
  } else if (code.includes('it')) {
    // 🇮🇹 ITALY FLAG (Tricolore)
    const sw = Math.floor(W / 3);
    ctx.fillStyle = '#009246'; // Green
    ctx.fillRect(0, 0, sw, H);
    ctx.fillStyle = '#FFFFFF'; // White
    ctx.fillRect(sw, 0, sw, H);
    ctx.fillStyle = '#CE2B37'; // Red
    ctx.fillRect(sw * 2, 0, W - sw * 2, H);
  } else if (code.includes('sa') || code.includes('ar-sa') || code.includes('arab')) {
    // 🇸🇦 SAUDI ARABIA FLAG (Green with Shahada & Sword)
    ctx.fillStyle = '#006C35'; // Forest Green
    ctx.fillRect(0, 0, W, H);

    // Stylized Arabic Calligraphy & Sword
    const cx = Math.floor(W * 0.48);
    const cy = Math.floor(H * 0.46);
    ctx.fillStyle = '#FFFFFF';
    // Calligraphy blocks
    ctx.fillRect(cx - 18, cy - 8, 36, 2);
    ctx.fillRect(cx - 16, cy - 4, 32, 2);
    ctx.fillRect(cx - 14, cy, 28, 2);
    // Sword
    ctx.fillRect(cx - 20, cy + 5, 38, 2);
    ctx.fillRect(cx - 22, cy + 3, 3, 5);
    ctx.fillRect(cx + 17, cy + 4, 2, 1);
  } else {
    // Default crisp white
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, W, H);
  }

  textureCache.set(langCode, canvas);
  return canvas;
}

// -----------------------------------------------------------------------------
// PIXEL WAVING FLAG CANVAS COMPONENT
// -----------------------------------------------------------------------------
export const PixelWavingFlagCanvas: React.FC<PixelWavingFlagCanvasProps> = ({
  languageCode,
  flagName,
  isDisabled = false,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const { graphicSettings } = useGraphicSettings();
  const disableAnimations = Boolean(
    graphicSettings.disableAnimations || graphicSettings.quality === 'performance'
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Crisp pixelated rendering settings
    ctx.imageSmoothingEnabled = false;

    // Retrieve or initialize the flag texture
    const flagTexture = renderFlagToCanvas(languageCode);

    // Animation cycle period: 1.35 seconds for full 6-pose cycle (seamless loop)
    const CYCLE_DURATION = 1350; // ms
    let startTime = performance.now();

    const renderFrame = (now: number) => {
      const elapsed = now - startTime;
      const progressFraction = ((elapsed % CYCLE_DURATION) / CYCLE_DURATION) * 6;

      // Clear stage
      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

      // -----------------------------------------------------------------------
      // 1. FIXED STATIONARY FLAGPOLE (LEFT ANCHOR)
      // -----------------------------------------------------------------------
      // Finial Ball (Golden Brass spearhead/sphere)
      ctx.fillStyle = '#F59E0B'; // Amber Core
      ctx.fillRect(POLE_X - 2, POLE_TOP_Y + 1, 5, 4);
      ctx.fillStyle = '#FEF08A'; // Top Highlight
      ctx.fillRect(POLE_X - 1, POLE_TOP_Y, 3, 2);
      ctx.fillStyle = '#78350F'; // Bottom Rim
      ctx.fillRect(POLE_X - 2, POLE_TOP_Y + 4, 5, 1);

      // Pole Cylindrical Shaft with 32-bit Brushed Shading
      // Dark Border:
      ctx.fillStyle = '#334155';
      ctx.fillRect(POLE_X - 1, POLE_TOP_Y + 5, 1, POLE_BOT_Y - (POLE_TOP_Y + 5));
      // Brushed Chrome Highlight:
      ctx.fillStyle = '#F8FAFC';
      ctx.fillRect(POLE_X, POLE_TOP_Y + 5, 1, POLE_BOT_Y - (POLE_TOP_Y + 5));
      // Shadow Shaft:
      ctx.fillStyle = '#64748B';
      ctx.fillRect(POLE_X + 1, POLE_TOP_Y + 5, 1, POLE_BOT_Y - (POLE_TOP_Y + 5));

      // Weighted Base Pedestal
      ctx.fillStyle = '#92400E';
      ctx.fillRect(POLE_X - 5, POLE_BOT_Y - 2, 11, 4);
      ctx.fillStyle = '#FBBF24';
      ctx.fillRect(POLE_X - 4, POLE_BOT_Y - 3, 9, 2);
      ctx.fillStyle = '#451A03';
      ctx.fillRect(POLE_X - 6, POLE_BOT_Y + 1, 13, 2);

      // -----------------------------------------------------------------------
      // 2. AUTHENTIC HOIST CONNECTOR STRIP & GROMMETS
      // -----------------------------------------------------------------------
      // Canvas Hoist Webbing (Fixed directly adjacent to pole)
      const hoistX = POLE_X + 2;
      ctx.fillStyle = '#CBD5E1';
      ctx.fillRect(hoistX, ATTACH_Y_TOP, 2, FLAG_BASE_H);
      ctx.fillStyle = '#F1F5F9';
      ctx.fillRect(hoistX, ATTACH_Y_TOP, 1, FLAG_BASE_H);

      // Upper Brass Grommet Ring (Anchors top hoist corner)
      ctx.fillStyle = '#F59E0B';
      ctx.fillRect(POLE_X - 1, ATTACH_Y_TOP, 4, 2);
      ctx.fillStyle = '#451A03';
      ctx.fillRect(POLE_X, ATTACH_Y_TOP + 1, 1, 1);

      // Lower Brass Grommet Ring (Anchors bottom hoist corner)
      ctx.fillStyle = '#F59E0B';
      ctx.fillRect(POLE_X - 1, ATTACH_Y_BOT - 2, 4, 2);
      ctx.fillStyle = '#451A03';
      ctx.fillRect(POLE_X, ATTACH_Y_BOT - 1, 1, 1);

      // -----------------------------------------------------------------------
      // 3. PHYSICAL CLOTH DEFORMATION ENGINE (DISCRETE PIXEL COLUMNS)
      // -----------------------------------------------------------------------
      const startX = hoistX + 2; // Exact point where cloth attaches to hoist
      const totalSlices = FLAG_BASE_W;

      // Global pose width scale for this frame
      const globalPoseDeform = getInterpolatedDeform(progressFraction, 0.5);
      const apparentTotalWidth = Math.round(FLAG_BASE_W * globalPoseDeform.widthScale);

      // Track silhouette boundaries for crisp pixel outline
      const topEdgeCoords: { x: number; y: number }[] = [];
      const botEdgeCoords: { x: number; y: number }[] = [];

      for (let i = 0; i < totalSlices; i++) {
        const u = i / (totalSlices - 1);
        const state = getInterpolatedDeform(progressFraction, u);

        // Calculate horizontal column position with foreshortening bunching
        const bunchShift = state.bunching * apparentTotalWidth;
        const colDstX = Math.round(startX + u * apparentTotalWidth + bunchShift);

        // Vertical wave displacement (strictly 0 at u=0 anchor)
        const waveY = Math.round(state.dy);
        const colDstY = ATTACH_Y_TOP + waveY;

        // Vertical height scaling (crest/trough thickness change)
        const colH = Math.max(8, Math.round(FLAG_BASE_H * state.heightScale));

        topEdgeCoords.push({ x: colDstX, y: colDstY });
        botEdgeCoords.push({ x: colDstX, y: colDstY + colH });

        // DRAW SLICE FROM SOURCE TEXTURE
        ctx.drawImage(
          flagTexture,
          i,
          0,
          1,
          FLAG_BASE_H,
          colDstX,
          colDstY,
          1,
          colH
        );

        // PIXEL-ART SHADOWS & HIGHLIGHTS ON FOLDS (NO ANTI-ALIASING)
        const s = state.shadow;
        if (s > 0.08) {
          // Discrete pixel clusters for shadows
          if (s > 0.35) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.44)';
          } else if (s > 0.20) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
          } else {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.14)';
          }
          ctx.fillRect(colDstX, colDstY, 1, colH);
        } else if (s < -0.08) {
          // Discrete pixel clusters for highlights
          if (s < -0.26) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.26)';
          } else {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.14)';
          }
          ctx.fillRect(colDstX, colDstY, 1, colH);
        }

        // Top fabric rim light (1px crisp edge)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.20)';
        ctx.fillRect(colDstX, colDstY, 1, 1);

        // Bottom fabric hem shadow (1px crisp edge)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.32)';
        ctx.fillRect(colDstX, colDstY + colH - 1, 1, 1);
      }

      // -----------------------------------------------------------------------
      // 4. CRISP FREE FLY EDGE (RIGHT SILHOUETTE NOTCHES & FLUTTER)
      // -----------------------------------------------------------------------
      if (topEdgeCoords.length > 0) {
        const lastIdx = topEdgeCoords.length - 1;
        const flyX = topEdgeCoords[lastIdx].x;
        const flyYTop = topEdgeCoords[lastIdx].y;
        const flyYBot = botEdgeCoords[lastIdx].y;
        const flyH = flyYBot - flyYTop;

        // Fly edge hem shadow line
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.fillRect(flyX, flyYTop, 1, flyH);

        // Free edge flutter pixel step notches (arcade cloth frayed hem)
        const flutterPose = getInterpolatedDeform(progressFraction, 1.0);
        const notchCount = 3;
        for (let n = 0; n < notchCount; n++) {
          const notchY = flyYTop + Math.floor((flyH / (notchCount + 1)) * (n + 1));
          const notchW = Math.max(1, Math.round(1 + Math.sin(progressFraction * 2 + n) * 1.2));
          ctx.fillStyle = 'rgba(0, 0, 0, 0.50)';
          ctx.fillRect(flyX - notchW, notchY, notchW, 2);
        }
      }

      // -----------------------------------------------------------------------
      // 5. SYNCHRONIZED GROUND SHADOW UNDERNEATH
      // -----------------------------------------------------------------------
      const shadowY = POLE_BOT_Y + 3;
      const shadowW = Math.round(apparentTotalWidth * 0.9);
      const shadowX = startX + Math.round((apparentTotalWidth - shadowW) / 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
      ctx.fillRect(shadowX, shadowY, shadowW, 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.16)';
      ctx.fillRect(shadowX + 4, shadowY - 1, shadowW - 8, 4);

      // Loop frame only if animations are active
      if (!disableAnimations) {
        animFrameIdRef.current = requestAnimationFrame(renderFrame);
      }
    };

    if (disableAnimations) {
      // Single crisp render in performance mode
      renderFrame(performance.now());
    } else {
      animFrameIdRef.current = requestAnimationFrame(renderFrame);
    }

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [languageCode, disableAnimations]);

  return (
    <div
      className={`relative select-none flex items-center justify-center ${className}`}
      style={{
        imageRendering: 'pixelated',
      }}
    >
      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        className={`w-full h-auto transition-opacity duration-200 ${
          isDisabled ? 'filter grayscale-[40%] contrast-[85%] brightness-[80%]' : ''
        }`}
        style={{
          imageRendering: 'pixelated',
          aspectRatio: `${CANVAS_W} / ${CANVAS_H}`,
        }}
        title={flagName || languageCode}
      />
    </div>
  );
};
