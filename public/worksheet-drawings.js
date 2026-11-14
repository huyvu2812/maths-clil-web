// Drawing tasks: given figures and automatic checks for drawing questions.
//
// Loaded after the worksheet-content*.js files. Each entry is merged into the
// matching question's `drawing` spec (see drawing-pad.js and drawing-check.js
// for the fields). `prompt` and `answer` replace the question's text, used where
// the figure here replaces one from the original worksheet PDF.
//
// All coordinates are in centimetres on the drawing grid (20 cm wide, 12 cm
// tall unless `height` is set), measured from the top-left corner.
(() => {
  const axis = (a, b, label = "d") => ({ type: "axis", a, b, label });
  const point = (p, label) => ({ type: "point", p, label });
  const polygon = (...points) => ({ type: "polygon", points });
  // A broken line through the given points, as separate segments.
  const path = (...points) =>
    points.slice(1).map((p, i) => ({ type: "segment", a: points[i], b: p }));

  const r3 = Math.sqrt(3);
  const hexagon = (cx, cy, r) =>
    polygon(...Array.from({ length: 6 }, (_, i) => [cx + r * Math.cos((i * Math.PI) / 3), cy + r * Math.sin((i * Math.PI) / 3)]));

  const DRAWINGS = {
    "lesson-3": {
      "1.22": { check: { type: "marks", values: [6, 13] } },
    },
    review: {
      10: { check: { type: "marks", values: [6, 8, 10, 12] } },
    },
    "lesson-13": {
      "3.4": { check: { type: "marks", values: [5, -5, -3, 3, -2, 2] } },
    },
    "lesson-18": {
      "4.2": { check: { type: "polygon", vertices: 3, sides: [6], labels: ["E", "F", "G"] } },
      "4.3": { check: { type: "polygon", vertices: 4, sides: [4], right: true, diagonals: true, labels: ["M", "N", "P", "Q"] } },
    },
    "lesson-19": {
      "4.10": { check: { type: "polygon", vertices: 4, sides: [6, 4], right: true, labels: ["A", "B", "C", "D"] } },
      "4.11": { check: { type: "polygon", vertices: 4, sides: [3], labels: ["M", "N", "P", "Q"] } },
      "4.12": { check: { type: "polygon", vertices: 4, sides: [5, 3], labels: ["E", "F", "H", "K"] } },
      "4.13": { check: { type: "polygon", vertices: 4, sides: [4, 6], diagonal: 7, labels: ["A", "B", "C", "D"] } },
      "4.14": { check: { type: "polygon", vertices: 4, sides: [4], angle: 60, labels: ["M", "N", "P", "Q"] } },
    },
    "chapter-4-review": {
      "4.29": {
        height: 14,
        check: [
          { type: "polygon", label: "(a)", vertices: 4, sides: [4.5], right: true },
          { type: "polygon", label: "(b)", vertices: 4, sides: [5, 7], right: true },
          { type: "polygon", label: "(c)", vertices: 4, sides: [5], angle: 60 },
          { type: "polygon", label: "(d)", vertices: 4, sides: [5, 7], height: 4 },
        ],
      },
    },
    "lesson-21": {
      "5.2": {
        prompt: "Draw all the axes of symmetry (if any) of the shapes below: a rectangle, a square, a parallelogram, an isosceles trapezoid, and a kite.",
        answer: "Rectangle: 2 axes. Square: 4 axes. Parallelogram: no axis. Isosceles trapezoid: 1 axis. Kite: 1 axis.",
        given: [
          polygon([1, 2], [6, 2], [6, 5], [1, 5]),
          polygon([8, 1.5], [12, 1.5], [12, 5.5], [8, 5.5]),
          polygon([14, 5], [17, 5], [19, 2], [16, 2]),
          polygon([2, 11], [8, 11], [6.5, 8], [3.5, 8]),
          polygon([12, 7], [14, 8.5], [12, 11], [10, 8.5]),
        ],
        check: { type: "axes" },
      },
      "5.5": {
        prompt: "Draw all the axes of symmetry of the shapes below: an equilateral triangle, a rhombus, and a regular hexagon.",
        answer: "Equilateral triangle: 3 axes. Rhombus: 2 axes (its diagonals). Regular hexagon: 6 axes.",
        given: [
          polygon([1, 10], [5, 10], [3, 10 - 2 * r3]),
          polygon([8, 7], [10, 4], [12, 7], [10, 10]),
          hexagon(16, 7, 2.5),
        ],
        check: { type: "axes" },
      },
      "5.6": {
        prompt: "Draw more on the shape below so that line d is an axis of symmetry of the new shape.",
        given: [
          axis([10, 0.5], [10, 11.5]),
          ...path([10, 1.5], [6, 3.5], [10, 3.5]),
          ...path([7, 3.5], [7, 9.5], [10, 9.5]),
          ...path([10, 7], [8, 7], [8, 9.5]),
        ],
        check: { type: "symmetry", axes: ["d"] },
      },
      "5.8": {
        prompt: "Draw more on the shape below so that line d is an axis of symmetry of the new shape.",
        given: [axis([10, 0.5], [10, 11.5]), ...path([10, 1], [7, 1], [6, 4], [8, 6], [6, 8], [7, 11], [10, 11])],
        check: { type: "symmetry", axes: ["d"] },
      },
    },
    "lesson-22": {
      "5.16": {
        prompt: "Draw more on the shape below so that point O is the centre of symmetry of the new shape.",
        given: [point([10, 6], "O"), ...path([10, 6], [7, 6], [6, 3], [9, 3], [8, 1], [12, 1])],
        check: { type: "symmetry", centres: ["O"] },
      },
    },
    "chapter-5-review": {
      "5.24": {
        prompt: "Complete the drawing below so that d is an axis of symmetry.",
        given: [axis([0.5, 6], [19.5, 6]), ...path([5, 6], [7, 3], [13, 3], [15, 6]), ...path([10, 3], [10, 1], [12, 1])],
        check: { type: "symmetry", axes: ["d"] },
      },
      "5.25": {
        prompt: "Complete the drawing below so that d is an axis of symmetry.",
        given: [axis([10, 0.5], [10, 11.5]), ...path([10, 1], [6, 5], [8, 5], [8, 11], [10, 11])],
        check: { type: "symmetry", axes: ["d"] },
      },
      "5.26": {
        prompt: "Complete the drawing below so that O is the centre of symmetry.",
        given: [point([10, 6], "O"), ...path([10, 6], [10, 3], [13, 3], [13, 1], [15, 1])],
        check: { type: "symmetry", centres: ["O"] },
      },
      "5.27": {
        prompt: "Complete the drawing below so that d is an axis of symmetry and O is a centre of symmetry.",
        given: [axis([10, 0.5], [10, 11.5]), point([10, 6], "O"), ...path([10, 1], [13, 1], [15, 4], [13, 6])],
        check: { type: "symmetry", axes: ["d"], centres: ["O"] },
      },
    },
  };

  const sets = window.WORKSHEET_SETS;
  for (const [setId, questions] of Object.entries(DRAWINGS)) {
    const worksheet = sets[setId];
    if (!worksheet) throw new Error(`worksheet-drawings.js: unknown worksheet "${setId}".`);
    for (const [number, patch] of Object.entries(questions)) {
      const question = worksheet.questions.find((q) => q.number === String(number));
      if (!question) throw new Error(`worksheet-drawings.js: no question ${number} in "${setId}".`);
      const { prompt, answer, ...drawing } = patch;
      question.drawing = { ...(question.drawing || {}), ...drawing };
      if (prompt) question.prompt = prompt;
      if (answer) question.answer = answer;
    }
  }
})();
