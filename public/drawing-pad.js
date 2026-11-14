// Drawing pad for worksheet answers.
// Plain browser script (no build step): exposes window.MathsDrawingPad.create().
//
// The drawing uses a fixed logical coordinate system: W units wide and
// (height in cm x CM) units tall, where CM units = 1 grid centimetre. Saved
// drawings and measured lengths therefore do not depend on the screen size.
// Drawings are stored as vector items, not images, to keep localStorage small
// and so that drawing-check.js can mark them.
//
// A question's `drawing` spec may contain:
//   background: "grid" (default) | "number-line" | "blank"
//   start:      first number on the number line (number-line only)
//   height:     drawing height in cm (default 12)
//   given:      locked items in cm, drawn for the pupil and not saved:
//               { type: "segment", a, b } | { type: "polygon", points }
//               { type: "axis", a, b, label } | { type: "point", p, label }
(() => {
  const W = 800;
  const CM = 40; // must match UNITS_PER_CM in drawing-check.js
  const DEFAULT_HEIGHT_CM = 12;
  const NUMBER_LINE = { y: 6, x0: 1 }; // cm, must match drawing-check.js
  const GRID_STEP = CM / 2; // points snap to every 0.5 cm
  const ANGLE_STEP = 15; // degrees, used while Shift is held
  const FINE_ANGLE_STEP = 1; // degrees, default step for the end of a line
  const FINE_LENGTH_STEP = CM / 10; // 0.1 cm, default step for the end of a line
  const GRID_SNAP_PX = 5; // a line end only jumps to a grid corner this close
  const MAGNET_PX = 8; // 0.5 cm lengths and 15° angles attract a line end
  const SNAP_PX = 10; // snapping distance in CSS pixels
  const HIT_PX = 8; // eraser and point-click distance in CSS pixels
  const MAX_HISTORY = 100;
  const MAX_ITEMS = 500;
  const MAX_CSS_HEIGHT = 560;
  const ZOOM_LEVELS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4];
  const AXIS_REACH = 400 * 40; // given axes are drawn this far (units) each way
  const MIN_ZOOM = ZOOM_LEVELS[0];
  const MAX_ZOOM = ZOOM_LEVELS[ZOOM_LEVELS.length - 1];
  const MIN_STROKE_PX = 1.2; // thinnest drawn line on screen, in CSS px
  const MAX_BACKING = 4096; // largest canvas side in device pixels
  const FONT = '"DM Sans", "Segoe UI", sans-serif';
  const GIVEN_COLOR = "#1f8fc9";
  const HIGHLIGHT_COLOR = "#d03b2a";
  const SELECT_COLOR = "#2d8a4e";

  const COLORS = [
    { name: "Black", value: "#25342d" },
    { name: "Blue", value: "#2563c9" },
    { name: "Red", value: "#c2412d" },
    { name: "Green", value: "#2d8a4e" },
  ];
  const COLOR_VALUES = COLORS.map((color) => color.value);

  const TOOLBOX_WIDTH = 116; // px: toolbox column, gap, board padding and border

  // 20x20 line icons drawn with currentColor (static markup, no user data).
  const svg = (body) =>
    `<svg viewBox="0 0 20 20" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${body}</svg>`;
  const ICONS = {
    select: svg('<path d="M5 3l10.5 6.2-4.6 1.3-2.2 4.7z" fill="currentColor" stroke-width="1.2"/>'),
    hand: svg('<path d="M7 10.5V5a1.2 1.2 0 0 1 2.4 0v4.5M9.4 9V3.9a1.2 1.2 0 0 1 2.4 0V9.5M11.8 9.5V5a1.2 1.2 0 0 1 2.4 0v6.5c0 3-2.1 5-5 5-2.1 0-3.4-.9-4.5-2.6l-1.8-2.8a1.2 1.2 0 0 1 2-1.3L7 12.4"/>'),
    segment: svg('<path d="M4.5 15.5l11-11"/><circle cx="4.5" cy="15.5" r="1.8" fill="currentColor" stroke="none"/><circle cx="15.5" cy="4.5" r="1.8" fill="currentColor" stroke="none"/>'),
    circle: svg('<circle cx="10" cy="10" r="6.5"/><path d="M10 10l6.5 0" stroke-dasharray="1.6 1.8"/><circle cx="10" cy="10" r="1.3" fill="currentColor" stroke="none"/>'),
    point: svg('<circle cx="7" cy="13" r="2.4" fill="currentColor" stroke="none"/><path d="M11 9.5l2.2-6 2.2 6M11.8 7.5h2.8" stroke-width="1.4"/>'),
    pen: svg('<path d="M4 16l.9-3.6 8.6-8.6a1.8 1.8 0 0 1 2.6 2.6l-8.6 8.6z"/><path d="M12.3 5l2.6 2.6"/>'),
    text: svg('<path d="M5 5h10M10 5v11M8 16h4"/>'),
    eraser: svg('<path d="M8.5 16H16M3.8 11.7l7-7a1.6 1.6 0 0 1 2.3 0l3.2 3.2a1.6 1.6 0 0 1 0 2.3L10.5 16H7.6l-3.8-3.8a.4.4 0 0 1 0-.5z"/><path d="M7 8.5l4.5 4.5"/>'),
    undo: svg('<path d="M7.5 4.5L4.5 7.5l3 3"/><path d="M4.5 7.5h7a4 4 0 0 1 0 8H8"/>'),
    redo: svg('<path d="M12.5 4.5l3 3-3 3"/><path d="M15.5 7.5h-7a4 4 0 0 0 0 8H12"/>'),
    clear: svg('<path d="M4.5 6h11M8 6V4.2h4V6M6 6l.8 10h6.4L14 6M8.7 9v4.5M11.3 9v4.5"/>'),
    download: svg('<path d="M10 3.5v9M6.3 9l3.7 3.7L13.7 9M4.5 16h11"/>'),
    zoomIn: svg('<circle cx="8.5" cy="8.5" r="5"/><path d="M12.2 12.2l4.3 4.3M6.3 8.5h4.4M8.5 6.3v4.4"/>'),
    zoomOut: svg('<circle cx="8.5" cy="8.5" r="5"/><path d="M12.2 12.2l4.3 4.3M6.3 8.5h4.4"/>'),
    fullscreen: svg('<path d="M3.5 7.5v-4h4M12.5 3.5h4v4M16.5 12.5v4h-4M7.5 16.5h-4v-4"/>'),
    exitFullscreen: svg('<path d="M7.5 3.5v4h-4M16.5 7.5h-4v-4M12.5 16.5v-4h4M3.5 12.5h4v4"/>'),
  };

  const TOOLS = [
    { id: "select", key: "v", label: "Select", hint: "Click something you drew to select it. Drag it to move it, drag a round handle to change it, or type exact values below. Delete removes it." },
    { id: "hand", key: "h", label: "Hand", hint: "Drag to move around the board. You can also hold Space and drag. Ctrl + mouse wheel zooms." },
    { id: "segment", key: "l", label: "Line", hint: "Drag to draw a line and watch its length and angle. The end sticks to points, half centimetres and 15° angles. Alt: no snapping." },
    { id: "circle", key: "c", label: "Circle", hint: "Compass: drag from the centre to set the radius (snaps to 0.5 cm or to a point). Hold Alt to turn snapping off." },
    { id: "point", key: "p", label: "Point", hint: "Click to place a labelled point. Click an existing point to rename it." },
    { id: "pen", key: "d", label: "Pen", hint: "Drag to draw freehand." },
    { id: "text", key: "t", label: "Text", hint: "Click where you want to add text, type, then press Enter." },
    { id: "eraser", key: "e", label: "Eraser", hint: "Click or drag over your drawing to remove it. The given figure cannot be erased." },
  ];

  // ---------- geometry helpers ----------

  const round = (n, digits) => {
    const f = 10 ** digits;
    return Math.round(n * f) / f;
  };
  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
  const midpoint = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];

  function distToSegment(p, a, b) {
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const lengthSq = dx * dx + dy * dy;
    if (lengthSq === 0) return dist(p, a);
    const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / lengthSq));
    return dist(p, [a[0] + t * dx, a[1] + t * dy]);
  }

  function intersectSegments(p1, p2, p3, p4) {
    const rx = p2[0] - p1[0];
    const ry = p2[1] - p1[1];
    const sx = p4[0] - p3[0];
    const sy = p4[1] - p3[1];
    const denominator = rx * sy - ry * sx;
    if (Math.abs(denominator) < 1e-9) return [];
    const qx = p3[0] - p1[0];
    const qy = p3[1] - p1[1];
    const t = (qx * sy - qy * sx) / denominator;
    const u = (qx * ry - qy * rx) / denominator;
    const eps = 1e-6;
    if (t < -eps || t > 1 + eps || u < -eps || u > 1 + eps) return [];
    return [[p1[0] + t * rx, p1[1] + t * ry]];
  }

  function intersectSegmentCircle(a, b, c, r) {
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const fx = a[0] - c[0];
    const fy = a[1] - c[1];
    const A = dx * dx + dy * dy;
    if (A === 0) return [];
    const B = 2 * (fx * dx + fy * dy);
    const C = fx * fx + fy * fy - r * r;
    const discriminant = B * B - 4 * A * C;
    if (discriminant < 0) return [];
    const root = Math.sqrt(discriminant);
    return [(-B - root) / (2 * A), (-B + root) / (2 * A)]
      .filter((t) => t >= -1e-6 && t <= 1 + 1e-6)
      .map((t) => [a[0] + t * dx, a[1] + t * dy]);
  }

  function intersectCircles(c1, r1, c2, r2) {
    const d = dist(c1, c2);
    if (d === 0 || d > r1 + r2 + 1e-6 || d < Math.abs(r1 - r2) - 1e-6) return [];
    const a = (r1 * r1 - r2 * r2 + d * d) / (2 * d);
    const h = Math.sqrt(Math.max(0, r1 * r1 - a * a));
    const ux = (c2[0] - c1[0]) / d;
    const uy = (c2[1] - c1[1]) / d;
    const mx = c1[0] + a * ux;
    const my = c1[1] + a * uy;
    if (h < 1e-6) return [[mx, my]];
    return [
      [mx - h * uy, my + h * ux],
      [mx + h * uy, my - h * ux],
    ];
  }

  // Angle of a segment against the horizontal, 0-180°, as pupils measure it.
  function segmentAngle(a, b) {
    const degrees = (Math.atan2(-(b[1] - a[1]), b[0] - a[0]) * 180) / Math.PI;
    return ((degrees % 180) + 180) % 180;
  }

  const formatCm = (units) => `${(units / CM).toFixed(1)} cm`;

  // ---------- saved data ----------

  const isNumber = (n) => typeof n === "number" && Number.isFinite(n);
  const isPoint = (p) => Array.isArray(p) && p.length === 2 && isNumber(p[0]) && isNumber(p[1]);
  const safeColor = (color) => (COLOR_VALUES.includes(color) ? color : COLORS[0].value);

  function sanitizeItem(item) {
    if (!item || typeof item !== "object") return null;
    const color = safeColor(item.color);
    switch (item.type) {
      case "segment":
        return isPoint(item.a) && isPoint(item.b) ? { type: "segment", a: [...item.a], b: [...item.b], color } : null;
      case "circle":
        return isPoint(item.c) && isNumber(item.r) && item.r > 0 ? { type: "circle", c: [...item.c], r: item.r, color } : null;
      case "point":
        return isPoint(item.p) && typeof item.label === "string"
          ? { type: "point", p: [...item.p], label: item.label.slice(0, 6), color }
          : null;
      case "text":
        return isPoint(item.p) && typeof item.text === "string" && item.text.trim()
          ? { type: "text", p: [...item.p], text: item.text.slice(0, 40), color }
          : null;
      case "pen":
        return Array.isArray(item.points) && item.points.length >= 2 && item.points.length % 2 === 0 && item.points.every(isNumber)
          ? { type: "pen", points: [...item.points], color }
          : null;
      default:
        return null;
    }
  }

  function sanitize(value) {
    if (!value || typeof value !== "object" || !Array.isArray(value.items)) return [];
    return value.items.map(sanitizeItem).filter(Boolean).slice(0, MAX_ITEMS);
  }

  // Converts the question's `given` items from cm to drawing units.
  function readGiven(given) {
    const toUnits = (p) => [p[0] * CM, p[1] * CM];
    const items = [];
    for (const item of Array.isArray(given) ? given : []) {
      if (!item || typeof item !== "object") continue;
      if ((item.type === "segment" || item.type === "axis") && isPoint(item.a) && isPoint(item.b)) {
        items.push({ type: item.type, a: toUnits(item.a), b: toUnits(item.b), label: item.label || "" });
      } else if (item.type === "polygon" && Array.isArray(item.points) && item.points.length >= 3 && item.points.every(isPoint)) {
        items.push({ type: "polygon", points: item.points.map(toUnits) });
      } else if (item.type === "point" && isPoint(item.p)) {
        items.push({ type: "point", p: toUnits(item.p), label: item.label || "" });
      }
    }
    return items;
  }

  function readSpec(spec) {
    const source = spec && typeof spec === "object" ? spec : {};
    const kind = ["number-line", "blank"].includes(source.background) ? source.background : "grid";
    const heightCm = isNumber(source.height) ? Math.min(20, Math.max(6, source.height)) : DEFAULT_HEIGHT_CM;
    return {
      kind,
      start: Number.isInteger(source.start) ? source.start : 0,
      height: heightCm * CM,
      given: readGiven(source.given),
    };
  }

  // Segments of the given figure, used for snapping and intersections.
  function givenSegments(given, height) {
    const segments = [];
    for (const item of given) {
      if (item.type === "segment") segments.push([item.a, item.b]);
      else if (item.type === "polygon") item.points.forEach((p, i) => segments.push([p, item.points[(i + 1) % item.points.length]]));
      else if (item.type === "axis") {
        const length = dist(item.a, item.b) || 1;
        const ux = (item.b[0] - item.a[0]) / length;
        const uy = (item.b[1] - item.a[1]) / length;
        const reach = Math.max(AXIS_REACH, W + height);
        segments.push([
          [item.a[0] - ux * reach, item.a[1] - uy * reach],
          [item.b[0] + ux * reach, item.b[1] + uy * reach],
        ]);
      }
    }
    return segments;
  }

  // ---------- painting ----------

  // The board is unbounded: `view` is the visible rectangle in drawing units
  // (x0, y0, x1, y1) and unitPx, the CSS pixels per unit. The grid and the
  // number line are drawn for whatever part of the plane is visible.
  function paintBackground(ctx, spec, view) {
    const { x0, y0, x1, y1, unitPx } = view;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
    if (spec.kind === "blank") return;

    ctx.lineWidth = 1 / unitPx; // one screen pixel at any zoom
    for (let i = Math.floor(x0 / CM); i <= Math.ceil(x1 / CM); i += 1) {
      ctx.strokeStyle = i % 5 === 0 ? "#c9d7cd" : "#e4ece6";
      ctx.beginPath();
      ctx.moveTo(i * CM, y0);
      ctx.lineTo(i * CM, y1);
      ctx.stroke();
    }
    for (let i = Math.floor(y0 / CM); i <= Math.ceil(y1 / CM); i += 1) {
      ctx.strokeStyle = i % 5 === 0 ? "#c9d7cd" : "#e4ece6";
      ctx.beginPath();
      ctx.moveTo(x0, i * CM);
      ctx.lineTo(x1, i * CM);
      ctx.stroke();
    }

    if (spec.kind === "number-line") {
      // A ray from 0 when the line starts at 0 or above, otherwise a full line.
      const y = CM * NUMBER_LINE.y;
      const origin = CM * NUMBER_LINE.x0;
      const isRay = spec.start >= 0;
      const left = isRay ? origin : x0;
      const end = x1 - 6 / unitPx;
      if (end <= left) return;
      ctx.strokeStyle = "#25342d";
      ctx.fillStyle = "#25342d";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(left, y);
      ctx.lineTo(end, y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(end + 4, y);
      ctx.lineTo(end - 10, y - 6);
      ctx.lineTo(end - 10, y + 6);
      ctx.closePath();
      ctx.fill();
      // Numbers stay readable when zoomed out: at least 12 px high, and when
      // ticks get close only every 2nd, 5th or 10th one is numbered.
      const fontSize = Math.max(14, 12 / unitPx);
      ctx.font = `${fontSize}px ${FONT}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      const labelStep = [1, 2, 5, 10, 20].find((step) => CM * step * unitPx >= 30) || 50;
      const firstTick = Math.max(isRay ? 0 : -Infinity, Math.ceil((x0 - origin) / CM));
      for (let i = firstTick, x = origin + i * CM; x < end - CM / 2; i += 1, x += CM) {
        const value = spec.start + i;
        const labelled = value % labelStep === 0;
        ctx.beginPath();
        ctx.moveTo(x, y - (labelled ? 6 : 4));
        ctx.lineTo(x, y + (labelled ? 6 : 4));
        ctx.stroke();
        if (labelled) ctx.fillText(String(value).replace("-", "−"), x, y + Math.max(10, 8 / unitPx));
      }
    }
  }

  // Strokes scale with the zoom but never get thinner than MIN_STROKE_PX on
  // screen, so a zoomed-out drawing stays readable. Set by paintScene.
  let minStroke = 0;
  const stroke = (width) => Math.max(width, minStroke);

  function paintGiven(ctx, spec) {
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    for (const item of spec.given) {
      if (item.type === "axis") {
        const [a, b] = givenSegments([item], spec.height)[0];
        ctx.strokeStyle = "#25342d";
        ctx.lineWidth = stroke(2.5);
        ctx.beginPath();
        ctx.moveTo(a[0], a[1]);
        ctx.lineTo(b[0], b[1]);
        ctx.stroke();
        if (item.label) {
          ctx.fillStyle = "#25342d";
          ctx.font = `italic 700 22px ${FONT}`;
          ctx.textAlign = "left";
          ctx.textBaseline = "middle";
          ctx.fillText(item.label, item.a[0] + 8, item.a[1] + 6);
        }
      } else if (item.type === "segment" || item.type === "polygon") {
        ctx.strokeStyle = GIVEN_COLOR;
        ctx.lineWidth = stroke(3.5);
        ctx.beginPath();
        const points = item.type === "segment" ? [item.a, item.b] : item.points;
        ctx.moveTo(points[0][0], points[0][1]);
        points.slice(1).forEach((p) => ctx.lineTo(p[0], p[1]));
        if (item.type === "polygon") ctx.closePath();
        ctx.stroke();
      } else if (item.type === "point") {
        ctx.fillStyle = "#25342d";
        ctx.beginPath();
        ctx.arc(item.p[0], item.p[1], 4, 0, Math.PI * 2);
        ctx.fill();
        if (item.label) {
          ctx.font = `italic 700 20px ${FONT}`;
          ctx.textAlign = "left";
          ctx.textBaseline = "top";
          ctx.fillText(item.label, item.p[0] + 6, item.p[1] + 4);
        }
      }
    }
  }

  function paintItem(ctx, item, extraWidth = 0) {
    ctx.strokeStyle = item.color;
    ctx.fillStyle = item.color;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    switch (item.type) {
      case "segment":
        ctx.lineWidth = stroke(2 + extraWidth);
        ctx.beginPath();
        ctx.moveTo(item.a[0], item.a[1]);
        ctx.lineTo(item.b[0], item.b[1]);
        ctx.stroke();
        for (const p of [item.a, item.b]) {
          ctx.beginPath();
          ctx.arc(p[0], p[1], 2.5 + extraWidth / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      case "circle":
        ctx.lineWidth = stroke(1.5 + extraWidth);
        ctx.beginPath();
        ctx.arc(item.c[0], item.c[1], item.r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(item.c[0] - 4, item.c[1]);
        ctx.lineTo(item.c[0] + 4, item.c[1]);
        ctx.moveTo(item.c[0], item.c[1] - 4);
        ctx.lineTo(item.c[0], item.c[1] + 4);
        ctx.stroke();
        break;
      case "point":
        ctx.beginPath();
        ctx.arc(item.p[0], item.p[1], Math.max(3.5 + extraWidth, minStroke * 1.5), 0, Math.PI * 2);
        ctx.fill();
        if (item.label) {
          ctx.font = `700 16px ${FONT}`;
          ctx.textAlign = "left";
          ctx.textBaseline = "bottom";
          ctx.fillText(item.label, item.p[0] + 6, item.p[1] - 4);
        }
        break;
      case "text":
        ctx.font = `17px ${FONT}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(item.text, item.p[0], item.p[1]);
        break;
      case "pen": {
        const pts = item.points;
        ctx.lineWidth = stroke(2.5 + extraWidth);
        ctx.beginPath();
        ctx.moveTo(pts[0], pts[1]);
        if (pts.length === 2) {
          ctx.lineTo(pts[0] + 0.01, pts[1]);
        } else {
          for (let i = 2; i < pts.length - 2; i += 2) {
            const mx = (pts[i] + pts[i + 2]) / 2;
            const my = (pts[i + 1] + pts[i + 3]) / 2;
            ctx.quadraticCurveTo(pts[i], pts[i + 1], mx, my);
          }
          ctx.lineTo(pts[pts.length - 2], pts[pts.length - 1]);
        }
        ctx.stroke();
        break;
      }
      default:
        break;
    }
  }

  // Measurement label above the drawing point (x, y), drawn at the same
  // screen size at every zoom and kept inside the visible area.
  function paintPill(ctx, text, x, y, view) {
    ctx.save();
    ctx.setTransform(view.dpr, 0, 0, view.dpr, 0, 0);
    ctx.font = `700 14px ${FONT}`;
    const width = ctx.measureText(text).width + 16;
    const height = 24;
    const sx = (x - view.x0) * view.unitPx;
    const sy = (y - view.y0) * view.unitPx - 24;
    const left = Math.min(Math.max(sx - width / 2, 4), view.cssWidth - width - 4);
    const top = Math.min(Math.max(sy - height / 2, 4), view.cssHeight - height - 4);
    ctx.fillStyle = "rgba(37, 52, 45, 0.88)";
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(left, top, width, height, 12);
    else ctx.rect(left, top, width, height);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, left + width / 2, top + height / 2 + 1);
    ctx.restore();
  }

  // Rough bounding box [x0, y0, x1, y1] of a drawn or given item.
  function itemBounds(item) {
    switch (item.type) {
      case "segment":
      case "axis":
        return [Math.min(item.a[0], item.b[0]), Math.min(item.a[1], item.b[1]), Math.max(item.a[0], item.b[0]), Math.max(item.a[1], item.b[1])];
      case "circle":
        return [item.c[0] - item.r, item.c[1] - item.r, item.c[0] + item.r, item.c[1] + item.r];
      case "point":
        return [item.p[0] - 8, item.p[1] - 26, item.p[0] + 40, item.p[1] + 26];
      case "text": {
        const half = item.text.length * 5 + 6;
        return [item.p[0] - half, item.p[1] - 14, item.p[0] + half, item.p[1] + 14];
      }
      case "pen":
      case "polygon": {
        const xs = item.type === "pen" ? item.points.filter((_, i) => i % 2 === 0) : item.points.map((p) => p[0]);
        const ys = item.type === "pen" ? item.points.filter((_, i) => i % 2 === 1) : item.points.map((p) => p[1]);
        return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
      }
      default:
        return null;
    }
  }

  // The default page (W x height) plus everything drawn or given.
  function contentBounds(spec, items) {
    const box = [0, 0, W, spec.height];
    for (const item of [...spec.given, ...items]) {
      const b = itemBounds(item);
      if (!b) continue;
      box[0] = Math.min(box[0], b[0]);
      box[1] = Math.min(box[1], b[1]);
      box[2] = Math.max(box[2], b[2]);
      box[3] = Math.max(box[3], b[3]);
    }
    return box;
  }

  function paintScene(ctx, spec, items, highlight, view) {
    minStroke = MIN_STROKE_PX / view.unitPx;
    paintBackground(ctx, spec, view);
    paintGiven(ctx, spec);
    if (highlight && highlight.size) {
      ctx.globalAlpha = 0.35;
      items.forEach((item, index) => {
        if (highlight.has(index)) paintItem(ctx, { ...item, color: HIGHLIGHT_COLOR }, 7);
      });
      ctx.globalAlpha = 1;
    }
    items.forEach((item, index) => {
      paintItem(ctx, highlight && highlight.has(index) ? { ...item, color: HIGHLIGHT_COLOR } : item);
    });
  }

  // ---------- hit testing ----------

  function hitItem(item, p, tolerance) {
    switch (item.type) {
      case "segment":
        return distToSegment(p, item.a, item.b) <= tolerance;
      case "circle":
        return Math.abs(dist(p, item.c) - item.r) <= tolerance || dist(p, item.c) <= tolerance;
      case "point":
        return dist(p, item.p) <= tolerance + 4;
      case "text": {
        const half = (item.text.length * 9) / 2;
        return Math.abs(p[0] - item.p[0]) <= half + tolerance && Math.abs(p[1] - item.p[1]) <= 10 + tolerance;
      }
      case "pen": {
        const pts = item.points;
        if (pts.length === 2) return dist(p, [pts[0], pts[1]]) <= tolerance;
        for (let i = 0; i < pts.length - 2; i += 2) {
          if (distToSegment(p, [pts[i], pts[i + 1]], [pts[i + 2], pts[i + 3]]) <= tolerance) return true;
        }
        return false;
      }
      default:
        return false;
    }
  }

  // ---------- the pad ----------

  function create(options = {}) {
    const spec = readSpec(options.spec || options.background);
    const H = spec.height;
    const readOnly = Boolean(options.readOnly);
    const label = options.label || "Drawing area";
    const filename = (options.filename || "drawing").replace(/[\\/:*?"<>|]+/g, "-");
    const onChange = typeof options.onChange === "function" ? options.onChange : () => {};
    const fixedSegments = givenSegments(spec.given, H);
    const fixedPoints = [];
    for (const item of spec.given) {
      if (item.type === "segment") fixedPoints.push(item.a, item.b, midpoint(item.a, item.b));
      else if (item.type === "polygon") {
        item.points.forEach((p, i) => fixedPoints.push(p, midpoint(p, item.points[(i + 1) % item.points.length])));
      } else if (item.type === "point") fixedPoints.push(item.p);
    }

    let items = sanitize(options.value);
    let undoStack = [];
    let redoStack = [];
    let tool = "segment";
    let color = COLORS[0].value;
    let drag = null;
    let hover = null;
    let snapCache = null;
    let highlight = new Set();
    let editor = null;
    let selected = -1; // index of the selected item (Select tool)
    let editIndex = -1; // item being dragged; excluded from snapping

    // DOM
    const element = document.createElement("div");
    element.className = readOnly ? "drawing-pad read-only" : "drawing-pad";

    const stage = document.createElement("div");
    stage.className = "drawing-stage";
    stage.style.maxWidth = `${Math.min(W, Math.round((MAX_CSS_HEIGHT * W) / H))}px`;

    const canvas = document.createElement("canvas");
    canvas.className = "drawing-canvas";
    const stageMaxWidth = stage.style.maxWidth;
    // View onto the unbounded board: screen = (drawing - origin) * scale.
    let zoom = 1; // 1 = the default page (20 cm wide) fits the board
    let fitScale = 1; // CSS px per unit at zoom 1
    let scale = 1; // CSS px per unit now
    let originX = 0; // drawing units at the board's left edge
    let originY = 0; // drawing units at the board's top edge
    let viewWidth = 0; // board size in CSS px
    let viewHeight = 0;
    let pixelRatio = 1; // canvas pixels per CSS px
    let viewReady = false;
    let pageBox = null; // area shown at 100%: [x0, y0, x1, y1] in units
    let spaceDown = false; // Space + drag pans the view
    canvas.setAttribute("role", "img");
    canvas.setAttribute("aria-label", label);
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    stage.append(canvas);

    const toolButtons = new Map();
    const colorButtons = new Map();
    let undoButton;
    let redoButton;
    let clearButton;
    let downloadButton;
    let zoomInButton;
    let zoomOutButton;
    let zoomResetButton;
    let fullscreenButton;
    let boardElement = null;
    const hint = document.createElement("p");
    hint.className = "drawing-hint";
    hint.setAttribute("aria-live", "polite");
    const props = document.createElement("div");
    props.className = "drawing-props";
    props.hidden = true;
    let propsFor = null; // the item object the panel was built for

    if (readOnly) {
      element.append(stage);
    } else {
      canvas.tabIndex = 0;
      // Whiteboard frame: icon toolbox in the top-left corner, drawing beside it.
      // The toolbox has its own column so it never covers the given figure.
      const board = document.createElement("div");
      board.className = "drawing-board";
      board.style.maxWidth = `calc(${stage.style.maxWidth} + ${TOOLBOX_WIDTH}px)`;

      const toolbox = document.createElement("div");
      toolbox.className = "drawing-toolbox";
      toolbox.setAttribute("role", "toolbar");
      toolbox.setAttribute("aria-label", "Drawing tools");
      toolbox.setAttribute("aria-orientation", "vertical");

      const iconButton = (name, title, icon, handler) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "tool-button";
        button.title = title;
        button.setAttribute("aria-label", name);
        button.innerHTML = icon; // static SVG from ICONS, never user data
        button.addEventListener("click", handler);
        toolbox.append(button);
        return button;
      };
      const separator = () => {
        const line = document.createElement("div");
        line.className = "toolbox-separator";
        line.setAttribute("role", "separator");
        toolbox.append(line);
      };

      for (const definition of TOOLS) {
        const button = iconButton(
          definition.label,
          `${definition.label} (${definition.key.toUpperCase()})`,
          ICONS[definition.id],
          () => selectTool(definition.id),
        );
        toolButtons.set(definition.id, button);
      }
      if (TOOLS.length % 2) {
        const filler = document.createElement("span");
        filler.setAttribute("aria-hidden", "true");
        toolbox.append(filler);
      }

      separator();
      const colorRow = document.createElement("div");
      colorRow.className = "toolbox-colors";
      colorRow.setAttribute("role", "group");
      colorRow.setAttribute("aria-label", "Colour");
      for (const definition of COLORS) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "drawing-swatch";
        button.style.setProperty("--swatch", definition.value);
        button.title = definition.name;
        button.setAttribute("aria-label", definition.name);
        button.addEventListener("click", () => selectColor(definition.value));
        colorButtons.set(definition.value, button);
        colorRow.append(button);
      }
      toolbox.append(colorRow);

      separator();
      undoButton = iconButton("Undo", "Undo (Ctrl+Z)", ICONS.undo, undo);
      redoButton = iconButton("Redo", "Redo (Ctrl+Y)", ICONS.redo, redo);
      clearButton = iconButton("Clear", "Clear your drawing", ICONS.clear, clearDrawing);
      downloadButton = iconButton("Download PNG", "Save this drawing as an image (PNG)", ICONS.download, downloadPng);

      separator();
      zoomOutButton = iconButton("Zoom out", "Zoom out (−, or Ctrl + mouse wheel)", ICONS.zoomOut, () => stepZoom(-1));
      zoomInButton = iconButton("Zoom in", "Zoom in (+, or Ctrl + mouse wheel)", ICONS.zoomIn, () => stepZoom(1));
      zoomResetButton = iconButton("Reset zoom", "Back to 100% and the start of the page (0)", "", resetView);
      zoomResetButton.classList.add("zoom-level");
      fullscreenButton = iconButton("Full screen", "Full screen (F)", ICONS.fullscreen, toggleFullscreen);
      if (!element.requestFullscreen) fullscreenButton.hidden = true;
      boardElement = board;

      board.append(toolbox, stage);
      element.append(board, props, hint);
    }

    // state helpers
    function unitsPerCssPixel() {
      return 1 / scale;
    }

    function toLogical(event) {
      const rect = canvas.getBoundingClientRect();
      return [originX + (event.clientX - rect.left) / scale, originY + (event.clientY - rect.top) / scale];
    }

    function currentView() {
      return {
        x0: originX,
        y0: originY,
        x1: originX + viewWidth / scale,
        y1: originY + viewHeight / scale,
        unitPx: scale,
        dpr: pixelRatio,
        cssWidth: viewWidth,
        cssHeight: viewHeight,
      };
    }

    function snapPoints() {
      if (snapCache) return snapCache;
      const points = [...fixedPoints];
      const segments = fixedSegments.map(([a, b]) => ({ a, b }));
      const circles = [];
      for (const [index, item] of items.entries()) {
        if (index === editIndex) continue;
        if (item.type === "segment") {
          points.push(item.a, item.b);
          segments.push(item);
        } else if (item.type === "circle") {
          points.push(item.c);
          circles.push(item);
        } else if (item.type === "point") {
          points.push(item.p);
        }
      }
      for (let i = 0; i < segments.length; i += 1) {
        for (let j = i + 1; j < segments.length; j += 1) {
          points.push(...intersectSegments(segments[i].a, segments[i].b, segments[j].a, segments[j].b));
        }
        for (const circle of circles) {
          points.push(...intersectSegmentCircle(segments[i].a, segments[i].b, circle.c, circle.r));
        }
      }
      for (let i = 0; i < circles.length; i += 1) {
        for (let j = i + 1; j < circles.length; j += 1) {
          points.push(...intersectCircles(circles[i].c, circles[i].r, circles[j].c, circles[j].r));
        }
      }
      snapCache = points;
      return snapCache;
    }

    // Returns { p, kind } where kind is "point", "grid" or "free".
    function snap(raw, event) {
      if (event.altKey) return { p: raw, kind: "free" };
      const tolerance = SNAP_PX * unitsPerCssPixel();
      let best = null;
      let bestDistance = tolerance;
      for (const point of snapPoints()) {
        const d = dist(raw, point);
        if (d <= bestDistance) {
          best = point;
          bestDistance = d;
        }
      }
      if (best) return { p: [best[0], best[1]], kind: "point" };
      if (spec.kind === "blank") return { p: raw, kind: "free" };
      return {
        p: [Math.round(raw[0] / GRID_STEP) * GRID_STEP, Math.round(raw[1] / GRID_STEP) * GRID_STEP],
        kind: "grid",
      };
    }

    // End of a line being drawn from `start`. Priority: existing points, then a
    // grid corner if the pointer is very close, otherwise a position measured
    // from the start. Lengths that are multiples of 0.5 cm and angles that are
    // multiples of 15° attract the end from MAGNET_PX away, because school
    // constructions use them (an equilateral triangle's apex is off the grid).
    // Elsewhere the end moves in steps of 0.1 cm and 1°. Shift forces 0.5 cm /
    // 15° steps; Alt turns all snapping off.
    function segmentEnd(start, raw, event) {
      if (event.altKey) return { p: raw, kind: "free" };
      const scale = unitsPerCssPixel();
      if (!event.shiftKey) {
        const snapped = snap(raw, event);
        if (snapped.kind === "point") return snapped;
        if (snapped.kind === "grid" && dist(snapped.p, raw) <= GRID_SNAP_PX * scale) return snapped;
      }
      const rawLength = dist(start, raw);
      const rawAngle = (Math.atan2(raw[1] - start[1], raw[0] - start[0]) * 180) / Math.PI;
      const niceLength = Math.round(rawLength / GRID_STEP) * GRID_STEP;
      const niceAngle = Math.round(rawAngle / ANGLE_STEP) * ANGLE_STEP;
      const magnet = MAGNET_PX * scale;
      const length =
        event.shiftKey || Math.abs(rawLength - niceLength) <= magnet
          ? niceLength
          : Math.round(rawLength / FINE_LENGTH_STEP) * FINE_LENGTH_STEP;
      const angle =
        event.shiftKey || (Math.abs(rawAngle - niceAngle) * Math.PI / 180) * rawLength <= magnet
          ? niceAngle
          : Math.round(rawAngle / FINE_ANGLE_STEP) * FINE_ANGLE_STEP;
      const radians = (angle * Math.PI) / 180;
      return { p: [start[0] + length * Math.cos(radians), start[1] + length * Math.sin(radians)], kind: "polar" };
    }

    function circleRadius(center, raw, event) {
      if (event.altKey) return dist(center, raw);
      const snapped = snap(raw, event);
      if (snapped.kind === "point") return dist(center, snapped.p);
      return Math.max(GRID_STEP, Math.round(dist(center, raw) / GRID_STEP) * GRID_STEP);
    }

    function setHint(text) {
      const definition = TOOLS.find((entry) => entry.id === tool);
      hint.textContent = text || `${definition.label}: ${definition.hint}`;
    }

    function updateButtons() {
      if (readOnly) return;
      for (const [id, button] of toolButtons) button.setAttribute("aria-pressed", String(id === tool));
      for (const [value, button] of colorButtons) button.setAttribute("aria-pressed", String(value === color));
      undoButton.disabled = undoStack.length === 0;
      redoButton.disabled = redoStack.length === 0;
      clearButton.disabled = items.length === 0;
      downloadButton.disabled = items.length === 0 && spec.given.length === 0;
      canvas.dataset.tool = tool;
    }

    function selectTool(id) {
      closeEditor(false);
      tool = id;
      drag = null;
      if (id !== "select") setSelected(-1);
      setHint();
      updateButtons();
      render();
    }

    function selectColor(value) {
      color = value;
      updateButtons();
    }

    function remember() {
      undoStack.push(JSON.stringify(items));
      if (undoStack.length > MAX_HISTORY) undoStack.shift();
      redoStack = [];
    }

    function serialize() {
      if (items.length === 0) return null;
      return {
        v: 1,
        items: items.map((item) => {
          switch (item.type) {
            case "segment":
              return { ...item, a: item.a.map((n) => round(n, 2)), b: item.b.map((n) => round(n, 2)) };
            case "circle":
              return { ...item, c: item.c.map((n) => round(n, 2)), r: round(item.r, 2) };
            case "point":
            case "text":
              return { ...item, p: item.p.map((n) => round(n, 2)) };
            case "pen":
              return { ...item, points: item.points.map((n) => round(n, 1)) };
            default:
              return item;
          }
        }),
      };
    }

    function changed() {
      snapCache = null;
      highlight = new Set();
      if (selected >= items.length) selected = -1;
      updateButtons();
      updateProps();
      render();
      onChange(serialize());
    }

    // ---------- selecting and editing (Select tool) ----------

    const clone = (item) => JSON.parse(JSON.stringify(item));

    function setSelected(index) {
      selected = index;
      updateProps();
      render();
    }

    // Round handles that change an item's shape.
    function handlesOf(item) {
      if (item.type === "segment") return [{ key: "a", p: item.a }, { key: "b", p: item.b }];
      if (item.type === "circle") return [{ key: "c", p: item.c }, { key: "r", p: [item.c[0] + item.r, item.c[1]] }];
      return [];
    }

    // The point that snaps when the whole item is moved.
    function anchorOf(item) {
      if (item.type === "segment") return item.a;
      if (item.type === "circle") return item.c;
      if (item.type === "pen") return [item.points[0], item.points[1]];
      return item.p;
    }

    function translated(item, dx, dy) {
      const move = (p) => [p[0] + dx, p[1] + dy];
      switch (item.type) {
        case "segment":
          return { ...item, a: move(item.a), b: move(item.b) };
        case "circle":
          return { ...item, c: move(item.c) };
        case "pen":
          return { ...item, points: item.points.map((n, i) => n + (i % 2 ? dy : dx)) };
        default:
          return { ...item, p: move(item.p) };
      }
    }

    function topItemAt(p) {
      const tolerance = HIT_PX * unitsPerCssPixel();
      for (let i = items.length - 1; i >= 0; i -= 1) {
        if (hitItem(items[i], p, tolerance)) return i;
      }
      return -1;
    }

    function handleAt(p) {
      if (selected < 0) return null;
      const tolerance = (HIT_PX + 3) * unitsPerCssPixel();
      return handlesOf(items[selected]).find((handle) => dist(handle.p, p) <= tolerance) || null;
    }

    function deleteSelected() {
      if (selected < 0) return;
      remember();
      items.splice(selected, 1);
      selected = -1;
      changed();
    }

    // Apply an edit typed into the panel below the canvas.
    function editSelected(update) {
      if (selected < 0) return;
      const next = update(clone(items[selected]));
      if (!next || JSON.stringify(next) === JSON.stringify(items[selected])) {
        updateProps(true);
        return;
      }
      remember();
      items[selected] = next;
      changed();
    }

    // Panel with exact values for the selected item.
    function updateProps(force = false) {
      if (readOnly) return;
      const item = selected >= 0 ? items[selected] : null;
      if (!item) {
        props.hidden = true;
        props.replaceChildren();
        propsFor = null;
        return;
      }
      props.hidden = false;
      const sameItem = propsFor && propsFor.index === selected && propsFor.type === item.type;
      if (!sameItem || force) buildProps(item);
      else syncProps(item);
    }

    function numberField(labelText, unit, value, step, min, max, apply) {
      const wrap = document.createElement("label");
      wrap.className = "drawing-prop";
      const input = document.createElement("input");
      input.type = "number";
      input.step = String(step);
      input.min = String(min);
      input.max = String(max);
      input.value = String(value);
      input.addEventListener("change", () => {
        const number = Number(input.value);
        if (!Number.isFinite(number) || number < min || number > max) {
          updateProps(true);
          return;
        }
        apply(number);
      });
      input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") input.blur();
      });
      wrap.append(document.createTextNode(`${labelText} `), input, document.createTextNode(unit ? ` ${unit}` : ""));
      return { wrap, input };
    }

    function textField(labelText, value, maxLength, apply) {
      const wrap = document.createElement("label");
      wrap.className = "drawing-prop";
      const input = document.createElement("input");
      input.type = "text";
      input.maxLength = maxLength;
      input.value = value;
      input.addEventListener("change", () => apply(input.value));
      input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") input.blur();
      });
      wrap.append(document.createTextNode(`${labelText} `), input);
      return { wrap, input };
    }

    // Length and angle of a segment as shown to pupils (angle 0-180°).
    const segmentLength = (item) => round(dist(item.a, item.b) / CM, 2);
    const segmentDegrees = (item) => Math.round(segmentAngle(item.a, item.b));

    function buildProps(item) {
      props.replaceChildren();
      propsFor = { index: selected, type: item.type, fields: {} };
      const fields = propsFor.fields;
      const title = document.createElement("strong");
      props.append(title);

      if (item.type === "segment") {
        title.textContent = "Line";
        fields.length = numberField("Length", "cm", segmentLength(item), 0.1, 0.1, 40, (cm) =>
          editSelected((next) => {
            const length = dist(next.a, next.b);
            if (length === 0) return null;
            const scale = (cm * CM) / length;
            next.b = [next.a[0] + (next.b[0] - next.a[0]) * scale, next.a[1] + (next.b[1] - next.a[1]) * scale];
            return next;
          }),
        );
        fields.angle = numberField("Angle", "°", segmentDegrees(item), 1, 0, 180, (degrees) =>
          editSelected((next) => {
            const length = dist(next.a, next.b);
            // Keep the end on the same side of the first end as it is now.
            const current = Math.atan2(-(next.b[1] - next.a[1]), next.b[0] - next.a[0]);
            const options = [degrees, degrees + 180].map((d) => (d * Math.PI) / 180);
            const difference = (t) => Math.abs(Math.atan2(Math.sin(t - current), Math.cos(t - current)));
            const angle = difference(options[0]) <= difference(options[1]) ? options[0] : options[1];
            next.b = [next.a[0] + length * Math.cos(angle), next.a[1] - length * Math.sin(angle)];
            return next;
          }),
        );
        const note = document.createElement("span");
        note.className = "drawing-prop-note";
        note.textContent = "The first end stays in place.";
        props.append(fields.length.wrap, fields.angle.wrap, note);
      } else if (item.type === "circle") {
        title.textContent = "Circle";
        fields.radius = numberField("Radius", "cm", round(item.r / CM, 2), 0.1, 0.1, 30, (cm) =>
          editSelected((next) => ({ ...next, r: cm * CM })),
        );
        props.append(fields.radius.wrap);
      } else if (item.type === "point") {
        title.textContent = "Point";
        fields.label = textField("Name", item.label, 6, (value) =>
          editSelected((next) => ({ ...next, label: value.trim().slice(0, 6) })),
        );
        props.append(fields.label.wrap);
      } else if (item.type === "text") {
        title.textContent = "Text";
        fields.text = textField("Text", item.text, 40, (value) =>
          editSelected((next) => (value.trim() ? { ...next, text: value.trim().slice(0, 40) } : null)),
        );
        props.append(fields.text.wrap);
      } else {
        title.textContent = "Freehand line";
        const note = document.createElement("span");
        note.className = "drawing-prop-note";
        note.textContent = "Drag it to move it.";
        props.append(note);
      }

      const remove = document.createElement("button");
      remove.type = "button";
      remove.textContent = "Delete";
      remove.addEventListener("click", deleteSelected);
      props.append(remove);
    }

    // Refresh the values without rebuilding, unless the pupil is typing.
    function syncProps(item) {
      const fields = propsFor.fields;
      const set = (field, value) => {
        if (field && document.activeElement !== field.input) field.input.value = String(value);
      };
      if (item.type === "segment") {
        set(fields.length, segmentLength(item));
        set(fields.angle, segmentDegrees(item));
      } else if (item.type === "circle") {
        set(fields.radius, round(item.r / CM, 2));
      } else if (item.type === "point") {
        set(fields.label, item.label);
      } else if (item.type === "text") {
        set(fields.text, item.text);
      }
    }

    function addItem(item) {
      if (items.length >= MAX_ITEMS) {
        setHint("This drawing is full. Erase something or clear it to keep drawing.");
        return;
      }
      remember();
      items.push(item);
      changed();
    }

    function undo() {
      if (!undoStack.length) return;
      redoStack.push(JSON.stringify(items));
      items = JSON.parse(undoStack.pop());
      selected = -1;
      changed();
    }

    function redo() {
      if (!redoStack.length) return;
      undoStack.push(JSON.stringify(items));
      items = JSON.parse(redoStack.pop());
      selected = -1;
      changed();
    }

    function clearDrawing() {
      if (!items.length) return;
      if (!window.confirm("Clear your drawing?")) return;
      remember();
      items = [];
      selected = -1;
      changed();
    }

    function nextPointLabel() {
      const used = new Set(items.filter((item) => item.type === "point").map((item) => item.label));
      for (const item of spec.given) if (item.type === "point") used.add(item.label);
      for (let code = 65; code <= 90; code += 1) {
        const letter = String.fromCharCode(code);
        if (!used.has(letter)) return letter;
      }
      return "";
    }

    // Exports the page plus everything drawn outside it, with a 1 cm margin.
    function downloadPng() {
      const [bx0, by0, bx1, by1] = contentBounds(spec, items);
      const box = { x0: bx0 - CM, y0: by0 - CM, x1: bx1 + CM, y1: by1 + CM };
      const resolution = Math.min(2, MAX_BACKING / Math.max(box.x1 - box.x0, box.y1 - box.y0));
      const output = document.createElement("canvas");
      output.width = Math.round((box.x1 - box.x0) * resolution);
      output.height = Math.round((box.y1 - box.y0) * resolution);
      const outputCtx = output.getContext("2d");
      outputCtx.setTransform(resolution, 0, 0, resolution, -box.x0 * resolution, -box.y0 * resolution);
      paintScene(outputCtx, spec, items, null, { ...box, unitPx: 1, dpr: resolution, cssWidth: box.x1 - box.x0, cssHeight: box.y1 - box.y0 });
      const link = document.createElement("a");
      link.download = `${filename}.png`;
      link.href = output.toDataURL("image/png");
      link.click();
    }

    // Inline text box shown on top of the canvas (for labels and text).
    function closeEditor(save) {
      if (editor) editor.finish(save);
    }

    function askText(at, initial, maxLength, commit) {
      closeEditor(false);
      const input = document.createElement("input");
      input.type = "text";
      input.className = "drawing-text-input";
      input.value = initial;
      input.maxLength = maxLength;
      input.setAttribute("aria-label", maxLength <= 6 ? "Point name" : "Text to add");
      // The canvas fills the board, so board coordinates = screen coordinates.
      input.style.left = `${(at[0] - originX) * scale}px`;
      input.style.top = `${(at[1] - originY) * scale}px`;
      let done = false;
      const finish = (save) => {
        if (done) return;
        done = true;
        editor = null;
        const value = input.value;
        input.remove();
        if (save) commit(value);
      };
      input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          finish(true);
          canvas.focus({ preventScroll: true });
        } else if (event.key === "Escape") {
          event.preventDefault();
          finish(false);
          canvas.focus({ preventScroll: true });
        }
      });
      input.addEventListener("blur", () => finish(true));
      editor = { finish };
      stage.append(input);
      input.focus();
      input.select();
    }

    // rendering
    function render() {
      if (!viewReady) return;
      const view = currentView();
      const k = scale * pixelRatio;
      ctx.setTransform(k, 0, 0, k, -originX * k, -originY * k);
      paintScene(ctx, spec, items, highlight, view);
      if (readOnly) return;
      const px = 1 / scale; // one screen pixel in drawing units

      if (drag?.type === "segment") {
        ctx.globalAlpha = 0.85;
        paintItem(ctx, { type: "segment", a: drag.start, b: drag.end, color });
        ctx.globalAlpha = 1;
        const length = dist(drag.start, drag.end);
        if (length > 0) {
          paintPill(
            ctx,
            `${formatCm(length)} · ${Math.round(segmentAngle(drag.start, drag.end))}°`,
            (drag.start[0] + drag.end[0]) / 2,
            (drag.start[1] + drag.end[1]) / 2,
            view,
          );
        }
      } else if (drag?.type === "circle") {
        ctx.globalAlpha = 0.85;
        paintItem(ctx, { type: "circle", c: drag.center, r: drag.radius, color });
        ctx.globalAlpha = 1;
        const angle = Math.atan2(drag.pointer[1] - drag.center[1], drag.pointer[0] - drag.center[0]);
        const edge = [drag.center[0] + drag.radius * Math.cos(angle), drag.center[1] + drag.radius * Math.sin(angle)];
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(drag.center[0], drag.center[1]);
        ctx.lineTo(edge[0], edge[1]);
        ctx.stroke();
        ctx.setLineDash([]);
        paintPill(ctx, `r = ${formatCm(drag.radius)}`, (drag.center[0] + edge[0]) / 2, (drag.center[1] + edge[1]) / 2, view);
      } else if (drag?.type === "pen") {
        paintItem(ctx, drag.item);
      }

      const selectedItem = selected >= 0 ? items[selected] : null;
      if (selectedItem) {
        ctx.globalAlpha = 0.28;
        paintItem(ctx, { ...selectedItem, color: SELECT_COLOR }, 8);
        ctx.globalAlpha = 1;
        if (selectedItem.type === "text") {
          ctx.font = `17px ${FONT}`;
          const width = ctx.measureText(selectedItem.text).width;
          ctx.setLineDash([4, 3]);
          ctx.strokeStyle = SELECT_COLOR;
          ctx.lineWidth = 1.5;
          ctx.strokeRect(selectedItem.p[0] - width / 2 - 5, selectedItem.p[1] - 13, width + 10, 26);
          ctx.setLineDash([]);
        }
        for (const handle of handlesOf(selectedItem)) {
          ctx.fillStyle = "#ffffff";
          ctx.strokeStyle = SELECT_COLOR;
          ctx.lineWidth = 2.5 * px;
          ctx.beginPath();
          ctx.arc(handle.p[0], handle.p[1], 7 * px, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }
        if (drag?.type === "edit" && drag.moved) {
          if (selectedItem.type === "segment" && dist(selectedItem.a, selectedItem.b) > 0) {
            paintPill(
              ctx,
              `${formatCm(dist(selectedItem.a, selectedItem.b))} · ${Math.round(segmentAngle(selectedItem.a, selectedItem.b))}°`,
              (selectedItem.a[0] + selectedItem.b[0]) / 2,
              (selectedItem.a[1] + selectedItem.b[1]) / 2,
              view,
            );
          } else if (selectedItem.type === "circle") {
            paintPill(ctx, `r = ${formatCm(selectedItem.r)}`, selectedItem.c[0] + selectedItem.r / 2, selectedItem.c[1], view);
          }
        }
      }

      if (hover && drag?.type !== "pen" && drag?.type !== "eraser") {
        ctx.lineWidth = 2 * px;
        ctx.strokeStyle = hover.kind === "point" ? "#2d8a4e" : "#8a9a91";
        ctx.beginPath();
        ctx.arc(hover.p[0], hover.p[1], (hover.kind === "point" ? 7 : 4.5) * px, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // ---------- view: size, zoom and full screen ----------

    const isFullscreen = () => document.fullscreenElement === element;

    // Sizes the board and the canvas that fills it. The board keeps its size;
    // zooming and panning only move the view over the unbounded drawing.
    function layout() {
      const fullscreen = isFullscreen();
      stage.style.maxWidth = fullscreen ? "none" : stageMaxWidth;
      if (boardElement) boardElement.style.maxWidth = fullscreen ? "none" : `calc(${stageMaxWidth} + ${TOOLBOX_WIDTH}px)`;
      if (!stage.offsetWidth) return;
      if (fullscreen) {
        stage.style.height = "";
      } else {
        const base = Math.min(stage.clientWidth, (MAX_CSS_HEIGHT * W) / H);
        const height = `${Math.round((base * H) / W)}px`;
        if (stage.style.height !== height) stage.style.height = height;
      }
      const cssWidth = Math.max(1, stage.clientWidth);
      const cssHeight = Math.max(1, stage.clientHeight);

      // Keep the middle of the view in place when the board changes size.
      const centre = viewReady ? [originX + viewWidth / (2 * scale), originY + viewHeight / (2 * scale)] : null;
      if (!pageBox) {
        // Pupils start on the default page; the read-only view shows everything drawn.
        pageBox = readOnly ? contentBounds(spec, items).map((n, i) => n + (i < 2 ? -CM / 2 : CM / 2)) : [0, 0, W, H];
      }
      const fitBox = pageBox;
      fitScale = Math.min(cssWidth / (fitBox[2] - fitBox[0]), cssHeight / (fitBox[3] - fitBox[1]));
      scale = fitScale * zoom;
      viewWidth = cssWidth;
      viewHeight = cssHeight;
      const target = centre || [(fitBox[0] + fitBox[2]) / 2, (fitBox[1] + fitBox[3]) / 2];
      originX = target[0] - cssWidth / (2 * scale);
      originY = target[1] - cssHeight / (2 * scale);
      viewReady = true;

      if (canvas.style.width !== `${cssWidth}px`) canvas.style.width = `${cssWidth}px`;
      if (canvas.style.height !== `${cssHeight}px`) canvas.style.height = `${cssHeight}px`;
      pixelRatio = Math.min(window.devicePixelRatio || 1, MAX_BACKING / Math.max(cssWidth, cssHeight));
      const width = Math.round(cssWidth * pixelRatio);
      const height = Math.round(cssHeight * pixelRatio);
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      updateZoomControls();
      render();
    }

    // Back to 100% with the default page in the middle.
    function resetView() {
      closeEditor(true);
      zoom = 1;
      scale = fitScale;
      originX = (pageBox[0] + pageBox[2]) / 2 - viewWidth / (2 * scale);
      originY = (pageBox[1] + pageBox[3]) / 2 - viewHeight / (2 * scale);
      updateZoomControls();
      render();
    }

    function panBy(dx, dy) {
      originX -= dx / scale;
      originY -= dy / scale;
      render();
    }

    function updateZoomControls() {
      if (readOnly) return;
      zoomResetButton.textContent = `${Math.round(zoom * 100)}%`;
      zoomInButton.disabled = zoom >= MAX_ZOOM;
      zoomOutButton.disabled = zoom <= MIN_ZOOM;
      const fullscreen = isFullscreen();
      fullscreenButton.setAttribute("aria-pressed", String(fullscreen));
      fullscreenButton.setAttribute("aria-label", fullscreen ? "Exit full screen" : "Full screen");
      fullscreenButton.title = fullscreen ? "Exit full screen (F or Esc)" : "Full screen (F)";
      fullscreenButton.innerHTML = fullscreen ? ICONS.exitFullscreen : ICONS.fullscreen;
    }

    // Zoom so that the point under `anchor` (client coordinates, default the
    // middle of the board) stays where it is.
    function setZoom(next, anchor) {
      const target = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.round(next * 100) / 100));
      if (target === zoom) return;
      const rect = canvas.getBoundingClientRect();
      const ax = anchor ? anchor.x - rect.left : viewWidth / 2;
      const ay = anchor ? anchor.y - rect.top : viewHeight / 2;
      const lx = originX + ax / scale;
      const ly = originY + ay / scale;
      closeEditor(true);
      zoom = target;
      scale = fitScale * zoom;
      originX = lx - ax / scale;
      originY = ly - ay / scale;
      updateZoomControls();
      render();
    }

    function stepZoom(direction) {
      const next =
        direction > 0
          ? ZOOM_LEVELS.find((level) => level > zoom + 0.001) ?? MAX_ZOOM
          : [...ZOOM_LEVELS].reverse().find((level) => level < zoom - 0.001) ?? MIN_ZOOM;
      setZoom(next);
    }

    function toggleFullscreen() {
      closeEditor(true);
      if (isFullscreen()) {
        document.exitFullscreen().catch(() => {});
      } else if (element.requestFullscreen) {
        element.requestFullscreen().catch(() => setHint("Full screen is not available in this browser."));
      }
    }

    const resize = layout;

    // pointer input
    function eraseAt(p) {
      const tolerance = HIT_PX * unitsPerCssPixel();
      for (let i = items.length - 1; i >= 0; i -= 1) {
        if (hitItem(items[i], p, tolerance)) {
          if (!drag.erased) {
            remember();
            drag.erased = true;
          }
          items.splice(i, 1);
          selected = -1;
          changed();
          return;
        }
      }
    }

    if (!readOnly) {
      canvas.addEventListener("pointerdown", (event) => {
        // Middle button, or Space + left button, pans the zoomed view.
        if (event.button === 1 || (event.button === 0 && (spaceDown || tool === "hand"))) {
          event.preventDefault();
          canvas.setPointerCapture(event.pointerId);
          drag = { type: "pan", x: event.clientX, y: event.clientY };
          canvas.style.cursor = "grabbing";
          return;
        }
        if (event.button !== 0) return;
        if (editor) {
          // The first click outside an open text box only closes it.
          closeEditor(true);
          return;
        }
        canvas.focus({ preventScroll: true });
        const raw = toLogical(event);

        if (tool === "point") {
          event.preventDefault();
          const tolerance = HIT_PX * unitsPerCssPixel();
          const existing = [...items].reverse().find((item) => item.type === "point" && dist(item.p, raw) <= tolerance + 4);
          if (existing) {
            askText(existing.p, existing.label, 6, (name) => {
              const trimmed = name.trim().slice(0, 6);
              if (trimmed === existing.label) return;
              remember();
              existing.label = trimmed;
              changed();
            });
            return;
          }
          const p = snap(raw, event).p;
          const point = { type: "point", p, label: nextPointLabel(), color };
          addItem(point);
          return;
        }

        if (tool === "text") {
          event.preventDefault();
          askText(raw, "", 40, (text) => {
            if (text.trim()) addItem({ type: "text", p: raw, text: text.trim().slice(0, 40), color });
          });
          return;
        }

        if (tool === "select") {
          // A handle of the selected item first, otherwise the item under the pointer.
          const handle = handleAt(raw);
          let index = selected;
          if (!handle) {
            index = topItemAt(raw);
            setSelected(index);
            if (index < 0) return;
          }
          canvas.setPointerCapture(event.pointerId);
          drag = { type: "edit", key: handle ? handle.key : "move", start: raw, original: clone(items[index]), moved: false };
          editIndex = index;
          snapCache = null;
          canvas.style.cursor = "grabbing";
          return;
        }

        canvas.setPointerCapture(event.pointerId);
        if (tool === "segment") {
          const start = snap(raw, event).p;
          drag = { type: "segment", start, end: start };
        } else if (tool === "circle") {
          const center = snap(raw, event).p;
          drag = { type: "circle", center, radius: 0, pointer: raw };
        } else if (tool === "pen") {
          drag = { type: "pen", item: { type: "pen", points: [raw[0], raw[1]], color } };
        } else if (tool === "eraser") {
          drag = { type: "eraser", erased: false };
          eraseAt(raw);
        }
        render();
      });

      canvas.addEventListener("pointermove", (event) => {
        const raw = toLogical(event);
        if (drag?.type === "pan") {
          panBy(event.clientX - drag.x, event.clientY - drag.y);
          drag.x = event.clientX;
          drag.y = event.clientY;
          return;
        }
        if (!drag && (spaceDown || tool === "hand")) {
          canvas.style.cursor = "grab";
          hover = null;
          return;
        }
        if (!drag) {
          hover = ["segment", "circle", "point"].includes(tool) ? snap(raw, event) : null;
          if (tool === "select") {
            canvas.style.cursor = handleAt(raw) ? "grab" : topItemAt(raw) >= 0 ? "move" : "default";
          } else {
            canvas.style.cursor = "";
          }
          render();
          return;
        }
        if (drag.type === "edit") {
          if (!drag.moved && dist(raw, drag.start) < 3 * unitsPerCssPixel()) return;
          if (!drag.moved) {
            remember();
            drag.moved = true;
          }
          const original = drag.original;
          let next;
          if (drag.key === "a") next = { ...original, a: segmentEnd(original.b, raw, event).p };
          else if (drag.key === "b") next = { ...original, b: segmentEnd(original.a, raw, event).p };
          else if (drag.key === "c") next = { ...original, c: snap(raw, event).p };
          else if (drag.key === "r") next = { ...original, r: Math.max(1, circleRadius(original.c, raw, event)) };
          else {
            const anchor = anchorOf(original);
            const target = [anchor[0] + raw[0] - drag.start[0], anchor[1] + raw[1] - drag.start[1]];
            const p = original.type === "pen" ? target : snap(target, event).p;
            next = translated(original, p[0] - anchor[0], p[1] - anchor[1]);
          }
          items[selected] = next;
          if (next.type === "segment") {
            setHint(`Length ${formatCm(dist(next.a, next.b))}, angle ${Math.round(segmentAngle(next.a, next.b))}°`);
          } else if (next.type === "circle") {
            setHint(`Radius ${formatCm(next.r)}`);
          }
          updateProps();
          render();
          return;
        }
        if (drag.type === "segment") {
          const end = segmentEnd(drag.start, raw, event);
          drag.end = end.p;
          hover = end;
          setHint(`Length ${formatCm(dist(drag.start, drag.end))}, angle ${Math.round(segmentAngle(drag.start, drag.end))}°`);
        } else if (drag.type === "circle") {
          drag.pointer = raw;
          drag.radius = circleRadius(drag.center, raw, event);
          hover = null;
          setHint(`Radius ${formatCm(drag.radius)}`);
        } else if (drag.type === "pen") {
          const pts = drag.item.points;
          if (dist(raw, [pts[pts.length - 2], pts[pts.length - 1]]) >= 1.5) pts.push(raw[0], raw[1]);
        } else if (drag.type === "eraser") {
          eraseAt(raw);
        }
        render();
      });

      const finishDrag = () => {
        if (!drag) return;
        const finished = drag;
        drag = null;
        setHint();
        if (finished.type === "pan") {
          canvas.style.cursor = spaceDown || tool === "hand" ? "grab" : "";
          return;
        }
        if (finished.type === "edit") {
          editIndex = -1;
          snapCache = null;
          canvas.style.cursor = "";
          if (finished.moved) changed();
          else render();
          return;
        }
        if (finished.type === "segment" && dist(finished.start, finished.end) > 0.5) {
          addItem({ type: "segment", a: finished.start, b: finished.end, color });
        } else if (finished.type === "circle" && dist(finished.center, finished.pointer) > 2) {
          addItem({ type: "circle", c: finished.center, r: finished.radius, color });
        } else if (finished.type === "pen") {
          addItem(finished.item);
        } else {
          render();
        }
      };

      canvas.addEventListener("pointerup", finishDrag);
      canvas.addEventListener("pointercancel", () => {
        if (drag?.type === "edit" && drag.moved) {
          // Put the item back where it was.
          items[selected] = drag.original;
          undoStack.pop();
        }
        drag = null;
        editIndex = -1;
        snapCache = null;
        setHint();
        updateProps();
        render();
      });
      canvas.addEventListener("pointerleave", () => {
        if (drag) return;
        hover = null;
        render();
      });

      canvas.addEventListener("keydown", (event) => {
        if (tool === "select" && selected >= 0 && !drag) {
          if (event.key === "Delete" || event.key === "Backspace") {
            event.preventDefault();
            deleteSelected();
            return;
          }
          if (event.key === "Escape") {
            event.preventDefault();
            setSelected(-1);
            return;
          }
          // Arrow keys nudge the selected item by 0.1 cm.
          const nudges = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
          if (nudges[event.key]) {
            event.preventDefault();
            const [dx, dy] = nudges[event.key];
            remember();
            items[selected] = translated(items[selected], dx * FINE_LENGTH_STEP, dy * FINE_LENGTH_STEP);
            changed();
            return;
          }
        }
        if (!event.ctrlKey && !event.metaKey && !event.altKey) {
          if (event.key === " ") {
            event.preventDefault();
            if (!spaceDown) {
              spaceDown = true;
              hover = null;
              canvas.style.cursor = "grab";
              render();
            }
            return;
          }
          const zoomKeys = { "+": () => stepZoom(1), "=": () => stepZoom(1), "-": () => stepZoom(-1), 0: resetView };
          if (zoomKeys[event.key]) {
            event.preventDefault();
            zoomKeys[event.key]();
            return;
          }
          if (event.key.toLowerCase() === "f" && !drag) {
            event.preventDefault();
            toggleFullscreen();
            return;
          }
        }
        if (!event.ctrlKey && !event.metaKey && !event.altKey && !drag) {
          // Single-letter shortcuts, as in diagram editors.
          const shortcut = TOOLS.find((definition) => definition.key === event.key.toLowerCase());
          if (shortcut) {
            event.preventDefault();
            selectTool(shortcut.id);
          }
          return;
        }
        if (!(event.ctrlKey || event.metaKey)) return;
        const key = event.key.toLowerCase();
        if (key === "z" && !event.shiftKey) {
          event.preventDefault();
          undo();
        } else if (key === "y" || (key === "z" && event.shiftKey)) {
          event.preventDefault();
          redo();
        }
      });
    }

    if (!readOnly) {
      const releaseSpace = () => {
        if (!spaceDown) return;
        spaceDown = false;
        if (drag?.type !== "pan") canvas.style.cursor = tool === "hand" ? "grab" : "";
      };
      canvas.addEventListener("keyup", (event) => {
        if (event.key === " ") releaseSpace();
      });
      canvas.addEventListener("blur", releaseSpace);
      // Stop the browser's middle-click auto-scroll so middle-drag can pan.
      canvas.addEventListener("mousedown", (event) => {
        if (event.button === 1) event.preventDefault();
      });
      // Ctrl + wheel (and trackpad pinch) zooms around the pointer.
      stage.addEventListener(
        "wheel",
        (event) => {
          if (!(event.ctrlKey || event.metaKey)) return;
          event.preventDefault();
          setZoom(zoom * Math.exp(-event.deltaY * 0.0015), { x: event.clientX, y: event.clientY });
        },
        { passive: false },
      );
      document.addEventListener("fullscreenchange", () => {
        layout();
        if (isFullscreen()) canvas.focus({ preventScroll: true });
      });
    }

    if (typeof ResizeObserver === "function") {
      new ResizeObserver(() => layout()).observe(stage);
    } else {
      window.addEventListener("resize", () => layout());
    }

    if (!readOnly) setHint();
    updateButtons();
    render();
    requestAnimationFrame(resize);

    return {
      element,
      isEmpty: () => items.length === 0,
      getValue: serialize,
      // Replace the drawing without notifying onChange (used by "Clear my answers").
      setValue(value) {
        closeEditor(false);
        items = sanitize(value);
        undoStack = [];
        redoStack = [];
        drag = null;
        snapCache = null;
        highlight = new Set();
        selected = -1;
        editIndex = -1;
        updateButtons();
        updateProps();
        render();
      },
      // Mark items (by index in the saved value) in red, e.g. after a check.
      setHighlight(indices) {
        highlight = new Set(Array.isArray(indices) ? indices : []);
        render();
      },
    };
  }

  window.MathsDrawingPad = { create };
})();
