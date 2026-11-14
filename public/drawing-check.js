// Automatic checking of drawn answers.
//
// Works on the vector data saved by drawing-pad.js and on the `drawing` spec of
// a worksheet question. All geometry here is in centimetres of the drawing grid
// (the pad stores UNITS_PER_CM units per centimetre).
//
// Supported `drawing.check` types:
//   { type: "polygon", vertices: 3|4, sides: [cm...], right, angle, diagonal,
//     diagonals, height, labels, label }       construct a shape with measurements
//   { type: "symmetry", axes: ["d"], centres: ["O"] }
//                                               complete the given figure
//   { type: "axes" }                            draw every axis of symmetry of the
//                                               given polygons
//   { type: "marks", values: [numbers] }        mark points on the number line
// `check` may also be an array; every entry must pass.
//
// Works in the browser (window.MathsDrawingCheck) and in Node (module.exports).
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.MathsDrawingCheck = api;
})(globalThis, function () {
  "use strict";

  const UNITS_PER_CM = 40;
  const LEN_TOL = 0.1; // cm
  const ANGLE_TOL = 1.5; // degrees
  const POINT_TOL = 0.05; // cm: two ends closer than this are the same point
  const LINE_TOL = 0.08; // cm: distance from a line that still counts as on it
  const NUMBER_LINE = { y: 6, x0: 1 }; // must match drawing-pad.js
  const MAX_NODES = 40;

  // ---------- vectors ----------

  const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1];
  const cross = (a, b) => a[0] * b[1] - a[1] * b[0];
  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
  const unit = (v) => {
    const length = Math.hypot(v[0], v[1]);
    return length ? [v[0] / length, v[1] / length] : null;
  };
  const isNumber = (n) => typeof n === "number" && Number.isFinite(n);
  const isPoint = (p) => Array.isArray(p) && p.length === 2 && isNumber(p[0]) && isNumber(p[1]);

  function lineDistance(p, origin, direction) {
    return Math.abs(cross(sub(p, origin), direction));
  }

  function angleAt(previous, vertex, next) {
    const u = sub(previous, vertex);
    const w = sub(next, vertex);
    const cosine = dot(u, w) / (Math.hypot(u[0], u[1]) * Math.hypot(w[0], w[1]));
    return (Math.acos(Math.max(-1, Math.min(1, cosine))) * 180) / Math.PI;
  }

  function polygonArea(points) {
    let sum = 0;
    points.forEach((p, i) => {
      sum += cross(p, points[(i + 1) % points.length]);
    });
    return Math.abs(sum) / 2;
  }

  function intersectSegments(s, t) {
    const r = sub(s.b, s.a);
    const q = sub(t.b, t.a);
    const denominator = cross(r, q);
    if (Math.abs(denominator) < 1e-9) return null;
    const w = sub(t.a, s.a);
    const u = cross(w, q) / denominator;
    const v = cross(w, r) / denominator;
    if (u < -1e-6 || u > 1 + 1e-6 || v < -1e-6 || v > 1 + 1e-6) return null;
    return [s.a[0] + u * r[0], s.a[1] + u * r[1]];
  }

  // True when segment a-b is fully covered by the collinear parts of `segments`.
  function covered(a, b, segments, lineTol = LINE_TOL) {
    const length = dist(a, b);
    if (length < POINT_TOL) return true;
    const direction = [(b[0] - a[0]) / length, (b[1] - a[1]) / length];
    const intervals = [];
    for (const s of segments) {
      if (lineDistance(s.a, a, direction) > lineTol || lineDistance(s.b, a, direction) > lineTol) continue;
      const t1 = dot(sub(s.a, a), direction);
      const t2 = dot(sub(s.b, a), direction);
      const lo = Math.max(0, Math.min(t1, t2));
      const hi = Math.min(length, Math.max(t1, t2));
      if (hi > lo) intervals.push([lo, hi]);
    }
    intervals.sort((x, y) => x[0] - y[0]);
    let reach = 0;
    for (const [lo, hi] of intervals) {
      if (lo > reach + LEN_TOL / 2) return false;
      reach = Math.max(reach, hi);
    }
    return reach >= length - LEN_TOL / 2;
  }

  // Length of segment s that lies along the chord a-b (0 if not collinear).
  function overlapAlong(s, a, b, lineTol) {
    const length = dist(a, b);
    const direction = unit(sub(b, a));
    if (!direction) return 0;
    if (lineDistance(s.a, a, direction) > lineTol || lineDistance(s.b, a, direction) > lineTol) return 0;
    const t1 = dot(sub(s.a, a), direction);
    const t2 = dot(sub(s.b, a), direction);
    return Math.max(0, Math.min(length, Math.max(t1, t2)) - Math.max(0, Math.min(t1, t2)));
  }

  const sameSegment = (s, t) =>
    (dist(s.a, t.a) <= POINT_TOL && dist(s.b, t.b) <= POINT_TOL) ||
    (dist(s.a, t.b) <= POINT_TOL && dist(s.b, t.a) <= POINT_TOL);

  // ---------- formatting ----------

  const fmt = (n) => {
    const rounded = Math.round(n * 10) / 10;
    return String(rounded).replace("-", "−");
  };
  const fmtList = (values) => values.map(fmt).join(", ");
  const plural = (count, one, many) => `${count} ${count === 1 ? one : many}`;

  // ---------- input data ----------

  function readStudent(value) {
    const items = value && typeof value === "object" && Array.isArray(value.items) ? value.items : [];
    const toCm = (p) => [p[0] / UNITS_PER_CM, p[1] / UNITS_PER_CM];
    const segments = [];
    const points = [];
    items.forEach((item, index) => {
      if (!item || typeof item !== "object") return;
      if (item.type === "segment" && isPoint(item.a) && isPoint(item.b)) {
        segments.push({ a: toCm(item.a), b: toCm(item.b), index });
      } else if (item.type === "point" && isPoint(item.p)) {
        points.push({ p: toCm(item.p), label: typeof item.label === "string" ? item.label.trim() : "", index });
      }
    });
    return { segments, points, total: items.length };
  }

  function readGiven(given) {
    const segments = [];
    const polygons = [];
    const axes = new Map();
    const points = new Map();
    for (const item of Array.isArray(given) ? given : []) {
      if (item.type === "segment") {
        segments.push({ a: item.a, b: item.b });
      } else if (item.type === "polygon") {
        polygons.push(item.points);
        item.points.forEach((p, i) => segments.push({ a: p, b: item.points[(i + 1) % item.points.length] }));
      } else if (item.type === "axis") {
        axes.set(item.label || "d", { a: item.a, b: item.b });
      } else if (item.type === "point") {
        points.set(item.label, item.p);
      }
    }
    return { segments, polygons, axes, points };
  }

  // ---------- polygon construction ----------

  function findPolygons(segments, vertexCount) {
    const raw = [];
    segments.forEach((s) => raw.push(s.a, s.b));
    for (let i = 0; i < segments.length; i += 1) {
      for (let j = i + 1; j < segments.length; j += 1) {
        const p = intersectSegments(segments[i], segments[j]);
        if (p) raw.push(p);
      }
    }
    const nodes = [];
    for (const p of raw) {
      if (!nodes.some((n) => dist(n, p) <= POINT_TOL)) nodes.push(p);
      if (nodes.length >= MAX_NODES) break;
    }

    const edgeCache = new Map();
    const edge = (i, j) => {
      const key = i < j ? `${i}-${j}` : `${j}-${i}`;
      if (!edgeCache.has(key)) edgeCache.set(key, covered(nodes[i], nodes[j], segments));
      return edgeCache.get(key);
    };

    const cycles = [];
    const n = nodes.length;
    if (vertexCount === 3) {
      for (let i = 0; i < n; i += 1)
        for (let j = i + 1; j < n; j += 1)
          for (let k = j + 1; k < n; k += 1) cycles.push([i, j, k]);
    } else {
      for (let i = 0; i < n; i += 1)
        for (let j = i + 1; j < n; j += 1)
          for (let k = j + 1; k < n; k += 1)
            for (let l = k + 1; l < n; l += 1) cycles.push([i, j, k, l], [i, j, l, k], [i, k, j, l]);
    }

    const polygons = [];
    for (const cycle of cycles) {
      if (!cycle.every((index, position) => edge(index, cycle[(position + 1) % cycle.length]))) continue;
      const polygon = cycle.map((index) => nodes[index]);
      if (isProperConvex(polygon)) polygons.push(polygon);
    }
    return polygons;
  }

  function isProperConvex(polygon) {
    if (polygonArea(polygon) < 0.25) return false;
    let sign = 0;
    for (let i = 0; i < polygon.length; i += 1) {
      const previous = polygon[(i - 1 + polygon.length) % polygon.length];
      const vertex = polygon[i];
      const next = polygon[(i + 1) % polygon.length];
      const angle = angleAt(previous, vertex, next);
      if (angle < 2 || angle > 178) return false;
      const turn = Math.sign(cross(sub(vertex, previous), sub(next, vertex)));
      if (sign && turn !== sign) return false;
      sign = turn;
    }
    return true;
  }

  function matchesCyclic(actual, expected) {
    const k = actual.length;
    const reversed = [...actual].reverse();
    for (const sequence of [actual, reversed]) {
      for (let start = 0; start < k; start += 1) {
        if (expected.every((value, i) => Math.abs(sequence[(start + i) % k] - value) <= LEN_TOL)) return true;
      }
    }
    return false;
  }

  function evaluatePolygon(polygon, spec, student) {
    const k = polygon.length;
    const sides = polygon.map((p, i) => dist(p, polygon[(i + 1) % k]));
    const angles = polygon.map((p, i) => angleAt(polygon[(i - 1 + k) % k], p, polygon[(i + 1) % k]));
    const problems = [];
    const tips = [];

    if (Array.isArray(spec.sides) && spec.sides.length) {
      const expected = Array.from({ length: k }, (_, i) => spec.sides[i % spec.sides.length]);
      if (!matchesCyclic(sides, expected)) {
        problems.push(`The sides measure ${fmtList(sides)} cm, but they should be ${fmtList(expected)} cm.`);
      }
    }
    if (spec.right && !angles.every((angle) => Math.abs(angle - 90) <= ANGLE_TOL)) {
      problems.push(`The angles are ${fmtList(angles.map(Math.round))}°, but every angle should be 90°.`);
    }
    if (isNumber(spec.angle) && !angles.some((angle) => Math.abs(angle - spec.angle) <= ANGLE_TOL)) {
      problems.push(`None of the angles is ${fmt(spec.angle)}° (they are ${fmtList(angles.map(Math.round))}°).`);
    }
    if (k === 4 && isNumber(spec.diagonal)) {
      const diagonals = [dist(polygon[0], polygon[2]), dist(polygon[1], polygon[3])];
      if (!diagonals.some((d) => Math.abs(d - spec.diagonal) <= LEN_TOL)) {
        problems.push(`The diagonals measure ${fmtList(diagonals)} cm, but one of them should be ${fmt(spec.diagonal)} cm.`);
      }
    }
    if (k === 4 && spec.diagonals) {
      if (!covered(polygon[0], polygon[2], student.segments) || !covered(polygon[1], polygon[3], student.segments)) {
        problems.push("Draw both diagonals of the shape.");
      }
    }
    if (k === 4 && isNumber(spec.height)) {
      const heights = polygon.map((_, i) => {
        const a = polygon[i];
        const direction = unit(sub(polygon[(i + 1) % 4], a));
        return lineDistance(polygon[(i + 2) % 4], a, direction);
      });
      if (!heights.some((h) => Math.abs(h - spec.height) <= LEN_TOL)) {
        problems.push(`The height should be ${fmt(spec.height)} cm, but your shape's heights are ${fmtList([...new Set(heights.map((h) => Math.round(h * 10) / 10))])} cm.`);
      }
    }
    if (Array.isArray(spec.labels) && spec.labels.length) {
      const used = new Set();
      for (const vertex of polygon) {
        for (const point of student.points) {
          if (dist(point.p, vertex) <= 0.15 && point.label) used.add(point.label.toUpperCase());
        }
      }
      if (!spec.labels.every((label) => used.has(label.toUpperCase()))) {
        tips.push(`Tip: name the vertices ${spec.labels.join(", ")} with the Point tool.`);
      }
    }
    return { problems, tips, area: polygonArea(polygon) };
  }

  function checkPolygon(spec, student) {
    const vertexCount = spec.vertices === 3 ? 3 : 4;
    const shapeName = vertexCount === 3 ? "triangle" : "four-sided shape";
    const polygons = findPolygons(student.segments, vertexCount);
    if (!polygons.length) {
      return {
        ok: false,
        messages: [`No closed ${shapeName} found yet. Draw every side with the Line tool and make the ends meet.`],
        tips: [],
        highlight: [],
      };
    }
    let best = null;
    for (const polygon of polygons) {
      const result = evaluatePolygon(polygon, spec, student);
      if (!result.problems.length) return { ok: true, messages: [], tips: result.tips, highlight: [] };
      if (
        !best ||
        result.problems.length < best.problems.length ||
        (result.problems.length === best.problems.length && result.area > best.area)
      ) {
        best = result;
      }
    }
    return { ok: false, messages: best.problems, tips: [...best.tips, MEASURE_TIP], highlight: [] };
  }

  const MEASURE_TIP =
    "Tip: while you drag a line, its length and angle are shown next to it — stop when they match. The Circle tool works like a compass.";

  // ---------- symmetry ----------

  function reflectAcross(p, axis) {
    const direction = unit(sub(axis.b, axis.a));
    const along = dot(sub(p, axis.a), direction);
    const foot = [axis.a[0] + direction[0] * along, axis.a[1] + direction[1] * along];
    return [2 * foot[0] - p[0], 2 * foot[1] - p[1]];
  }

  function checkSymmetry(spec, given, student) {
    const transforms = [];
    for (const label of spec.axes || []) {
      const axis = given.axes.get(label);
      if (!axis) throw new Error(`Symmetry check refers to missing axis "${label}".`);
      transforms.push((p) => reflectAcross(p, axis));
    }
    for (const label of spec.centres || []) {
      const centre = given.points.get(label);
      if (!centre) throw new Error(`Symmetry check refers to missing centre "${label}".`);
      transforms.push((p) => [2 * centre[0] - p[0], 2 * centre[1] - p[1]]);
    }
    if (!transforms.length) throw new Error("Symmetry check needs at least one axis or centre.");

    const expected = given.segments.map((s) => ({ a: s.a, b: s.b }));
    for (let round = 0; round < 4; round += 1) {
      let added = false;
      for (const segment of [...expected]) {
        for (const transform of transforms) {
          const image = { a: transform(segment.a), b: transform(segment.b) };
          if (!expected.some((e) => sameSegment(e, image))) {
            expected.push(image);
            added = true;
          }
        }
      }
      if (!added) break;
    }

    const available = given.segments.concat(student.segments);
    const missing = expected.filter((e) => !covered(e.a, e.b, available));
    const extras = student.segments.filter((s) => !covered(s.a, s.b, expected));
    const messages = [];
    if (missing.length) messages.push(`${plural(missing.length, "line is", "lines are")} still missing from the symmetric shape.`);
    if (extras.length) messages.push(`${plural(extras.length, "line does", "lines do")} not belong to the symmetric shape (shown in red).`);
    return { ok: !messages.length, messages, tips: [], highlight: extras.map((s) => s.index) };
  }

  // ---------- axes of symmetry ----------

  function polygonAxes(points) {
    const centre = [
      points.reduce((sum, p) => sum + p[0], 0) / points.length,
      points.reduce((sum, p) => sum + p[1], 0) / points.length,
    ];
    const candidates = [
      ...points,
      ...points.map((p, i) => {
        const q = points[(i + 1) % points.length];
        return [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
      }),
    ];
    const directions = [];
    for (const target of candidates) {
      const direction = unit(sub(target, centre));
      if (!direction) continue;
      if (directions.some((d) => Math.abs(cross(d, direction)) < 1e-3)) continue;
      const axis = { a: centre, b: [centre[0] + direction[0], centre[1] + direction[1]] };
      const symmetric = points.every((p) => {
        const image = reflectAcross(p, axis);
        return points.some((q) => dist(q, image) <= POINT_TOL * 2);
      });
      if (symmetric) directions.push(direction);
    }

    // Each axis is reported as its chord across the shape.
    return directions.map((direction) => {
      const ts = [];
      points.forEach((p, i) => {
        const q = points[(i + 1) % points.length];
        const hit = intersectSegments(
          { a: [centre[0] - direction[0] * 1e3, centre[1] - direction[1] * 1e3], b: [centre[0] + direction[0] * 1e3, centre[1] + direction[1] * 1e3] },
          { a: p, b: q },
        );
        if (hit) ts.push(dot(sub(hit, centre), direction));
      });
      const lo = Math.min(...ts);
      const hi = Math.max(...ts);
      return {
        a: [centre[0] + direction[0] * lo, centre[1] + direction[1] * lo],
        b: [centre[0] + direction[0] * hi, centre[1] + direction[1] * hi],
      };
    });
  }

  function checkAxes(given, student) {
    if (!given.polygons.length) throw new Error("Axes check needs at least one given polygon.");
    const axes = given.polygons.flatMap(polygonAxes);
    const onAxis = (segment, axis) => overlapAlong(segment, axis.a, axis.b, 0.1) >= 0.5 * dist(axis.a, axis.b);
    const missing = axes.filter((axis) => !student.segments.some((segment) => onAxis(segment, axis)));
    const extras = student.segments.filter((segment) => !axes.some((axis) => onAxis(segment, axis)));
    const messages = [];
    if (missing.length) messages.push(`${plural(missing.length, "axis of symmetry is", "axes of symmetry are")} still missing.`);
    if (extras.length) messages.push(`${plural(extras.length, "line is not an axis", "lines are not axes")} of symmetry (shown in red).`);
    return { ok: !messages.length, messages, tips: [], highlight: extras.map((s) => s.index) };
  }

  // ---------- number line ----------

  function checkMarks(spec, drawingSpec, student) {
    const start = Number.isInteger(drawingSpec.start) ? drawingSpec.start : 0;
    const values = spec.values || [];
    const found = new Set();
    const extras = [];
    for (const point of student.points) {
      if (Math.abs(point.p[1] - NUMBER_LINE.y) > 0.3) continue;
      const value = point.p[0] - NUMBER_LINE.x0 + start;
      const nearest = Math.round(value);
      if (Math.abs(value - nearest) <= LEN_TOL && values.includes(nearest)) found.add(nearest);
      else extras.push(point.index);
    }
    const missing = values.filter((value) => !found.has(value));
    const messages = [];
    if (!student.points.length) {
      messages.push("Use the Point tool to mark the numbers on the line.");
    } else {
      if (missing.length) messages.push(`Still to mark: ${fmtList(missing)}.`);
      if (extras.length) messages.push(`${plural(extras.length, "point is", "points are")} in the wrong place (shown in red).`);
    }
    return { ok: !messages.length, messages, tips: [], highlight: extras };
  }

  // ---------- entry point ----------

  function hasCheck(drawingSpec) {
    return Boolean(drawingSpec && drawingSpec.check);
  }

  // Returns null when the question has no automatic check, otherwise
  // { status: "correct" | "incorrect" | "empty", messages, tips, highlight }.
  function check(drawingSpec, value) {
    if (!hasCheck(drawingSpec)) return null;
    const student = readStudent(value);
    if (!student.total) {
      return { status: "empty", messages: ["Draw your answer first."], tips: [], highlight: [] };
    }
    const given = readGiven(drawingSpec.given);
    const specs = Array.isArray(drawingSpec.check) ? drawingSpec.check : [drawingSpec.check];
    const messages = [];
    const tips = [];
    const highlight = new Set();
    let ok = true;
    for (const spec of specs) {
      let result;
      if (spec.type === "polygon") result = checkPolygon(spec, student);
      else if (spec.type === "symmetry") result = checkSymmetry(spec, given, student);
      else if (spec.type === "axes") result = checkAxes(given, student);
      else if (spec.type === "marks") result = checkMarks(spec, drawingSpec, student);
      else throw new Error(`Unknown drawing check type "${spec.type}".`);
      const prefix = spec.label ? `${spec.label} ` : "";
      ok = ok && result.ok;
      result.messages.forEach((message) => messages.push(prefix + message));
      result.tips.forEach((tip) => tips.push(prefix + tip));
      result.highlight.forEach((index) => highlight.add(index));
    }
    return {
      status: ok ? "correct" : "incorrect",
      messages: ok ? ["Correct! Your drawing meets every condition."] : messages,
      tips,
      highlight: [...highlight],
    };
  }

  return { check, hasCheck, polygonAxes, UNITS_PER_CM, NUMBER_LINE };
});
