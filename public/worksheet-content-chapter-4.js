(() => {
  const worksheets = {
    "lesson-18": {
      title: "Lesson 18: Equilateral Triangles, Squares and Regular Hexagons",
      questions: [
        { number: "4.1", prompt: "Use Figure 4.4 in the original worksheet PDF. Identify which figure is an equilateral triangle, which is a square, and which is a regular hexagon.", answer: "Match the equilateral triangle to the figure with three equal sides, the square to the four equal sides and four right angles, and the regular hexagon to the six equal sides and angles." },
        { number: "4.2", prompt: "Draw equilateral triangle EFG with side EF = 6 cm.", answer: "Draw all three sides 6 cm; all three angles are 60°." },
        { number: "4.3", prompt: "Draw square MNPQ with side MN = 4 cm and diagonals MP and NQ. Are the diagonals perpendicular?", answer: "Yes. The diagonals of a square meet at right angles." },
        { number: "4.4", prompt: "For regular hexagon ABCDEF in Figure 4.5: (a) name its short diagonals; (b) are triangles ACE and BDF equilateral?", answer: "(a) AC, CE, EA, BD, DF, and FB. (b) Yes; each triangle has three equal sides." },
        { number: "4.5", prompt: "Use Figure 4.6 to check (a) whether ABC is equilateral; (b) whether MNPQ is a square.", answer: "Measure all three sides of ABC to check equality. For MNPQ, check that all sides are equal and that each angle is 90°; compare with the shapes in Figure 4.6." },
        { number: "4.6", prompt: "Six equilateral triangles with side 4 cm form a regular hexagon. Find the length of a main diagonal.", answer: "8 cm; a main diagonal joins opposite vertices and is twice the side length." },
        { number: "4.7", prompt: "Use Figure 4.8 to count the regular hexagons and the equilateral triangles, and name the regular hexagons.", answer: "Count the outlined six-sided regular polygons, then count each smallest equilateral triangle once. Use the labels and boundaries shown in Figure 4.8." },
      ],
    },
    "lesson-19": {
      title: "Lesson 19: Rectangles, Rhombuses, Parallelograms and Isosceles Trapezoids",
      questions: [
        { number: "4.8", prompt: "Use Figure 4.11 in the original worksheet PDF to identify the rectangle and the rhombus.", answer: "The rectangle has four right angles; the rhombus has four equal sides. Match these properties to the labeled figures in Figure 4.11." },
        { number: "4.9", prompt: "Use Figure 4.12 to identify the parallelogram and the isosceles trapezoid.", answer: "A parallelogram has two pairs of parallel opposite sides. An isosceles trapezoid has one pair of parallel sides and equal legs." },
        { number: "4.10", prompt: "Draw rectangle ABCD with AB = 6 cm and BC = 4 cm.", answer: "Draw opposite sides equal and parallel; the four angles are 90°." },
        { number: "4.11", prompt: "Draw rhombus MNPQ with side MN = 3 cm.", answer: "All four sides must be 3 cm; the angles do not have to be right angles." },
        { number: "4.12", prompt: "Draw parallelogram EFHK with EF = 5 cm and FH = 3 cm.", answer: "Use EF and FH as adjacent sides; opposite sides are equal and parallel." },
        { number: "4.13", prompt: "Draw parallelogram ABCD with AB = 4 cm, BC = 6 cm, and diagonal AC = 7 cm.", answer: "Triangle ABC has sides 4, 6, and 7 cm; complete the parallelogram by drawing the opposite sides parallel." },
        { number: "4.14", prompt: "Draw rhombus MNPQ with side length 4 cm and one angle of 60°.", answer: "All four sides are 4 cm; adjacent angles are 60° and 120°." },
        { number: "4.15", prompt: "In Figure 4.13, EFGH is a rectangle and I, K, L, M are the midpoints of its sides. Is quadrilateral IKLM a rhombus?", answer: "Yes. Joining the midpoints of a rectangle forms a rhombus: each side is half a rectangle diagonal, so all four sides are equal." },
        { number: "4.16", prompt: "Use Figure 4.14 to check whether WXYZ is a parallelogram and whether KLMN is a rectangle.", answer: "Check whether both pairs of opposite sides of WXYZ are parallel. For KLMN, check that all four angles are right angles; use the measurements and markings in Figure 4.14." },
        { number: "4.17", prompt: "In Figure 4.15, I is the circle's centre. Check whether ITPQ and IQRS are rhombuses, and whether PSRQ is an isosceles trapezoid.", answer: "Use the equal radii from I to points on the circle to check the rhombus sides; for PSRQ, check that one pair of opposite sides is parallel and the non-parallel sides are equal." },
        { number: "4.18", prompt: "Arrange three equilateral triangles with side 3 cm to make an isosceles trapezoid.", answer: "Join the three triangles edge-to-edge as shown in the construction; the outside boundary should have one pair of parallel bases and equal sloping legs." },
        { number: "4.19", prompt: "Arrange eight isosceles trapezoids, each with its short base equal to its legs, to make the top of a Tết sweets tray as in Figure 4.16.", answer: "Place the eight trapezoids edge-to-edge around the centre as in Figure 4.16, matching equal short bases and legs; the outside boundary forms the tray top." },
      ],
    },
    "lesson-20": {
      title: "Lesson 20: Perimeter and Area of Quadrilaterals",
      questions: [
        { number: "4.20", prompt: "Find the area and perimeter of a rectangle 12 cm long and 7 cm wide.", answer: "Area = 84 cm²; perimeter = 38 cm." },
        { number: "4.21", prompt: "A rectangular piece of wood has one side 9 cm and area 72 cm². Find the other side.", answer: "8 cm." },
        { number: "4.22", prompt: "Find the area of each figure: (a) square, side 7 cm; (b) isosceles trapezoid, bases 8 cm and 12 cm, height 5 cm; (c) rhombus, diagonals 8 cm and 14 cm; (d) parallelogram, side 15 cm and matching height 6 cm.", answer: "(a) 49 cm². (b) 50 cm². (c) 56 cm². (d) 90 cm²." },
        { number: "4.23", prompt: "A window vent has the dimensions shown in Figure 4.19. Is a 7 m iron bar enough to make all its bars? Ignore joints.", answer: "Add the lengths of all bars shown in Figure 4.19, counting each segment once. The material is enough if the total is no more than 7 m." },
        { number: "4.24", prompt: "Calculate the perimeter and area of the garden shown in Figure 4.20.", answer: "Use the side lengths and dimensions in Figure 4.20: add the outside boundary lengths for perimeter and decompose the shape into rectangles/triangles to find area." },
        { number: "4.25", prompt: "A paving stone is made from a small regular hexagon and six isosceles trapezoids. Each trapezoid has bases 20 cm and 40 cm and height 17.3 cm. The small hexagon has six equilateral triangles with side 20 cm and height 17.3 cm. Find the total area.", answer: "Each trapezoid is 519 cm² and the small hexagon is 1 038 cm². Total area = 6 × 519 + 1 038 = 4 152 cm²." },
        { number: "4.26", prompt: "A rectangular garden has area 3 500 m² and width 50 m. A 4 m gate is left open. How much barbed wire is needed for two layers of fencing?", answer: "Length = 70 m. One fence layer is 2(70 + 50) − 4 = 236 m; two layers need 472 m." },
        { number: "4.27", prompt: "Mrs Thu's yard is 16 m by 9 m. Tiles are squares with side 0.6 m and come 8 per box. How many boxes are needed?", answer: "The yard area is 144 m²; each tile covers 0.36 m², so 400 tiles are needed. 400 ÷ 8 = 50 boxes." },
        { number: "4.28", prompt: "A yard is 18 m × 25 m. One thousand paving stones each cover a 60 cm × 60 cm square. The rest is grass at 40 000 dong per m². What is the grass cost?", answer: "Yard area = 450 m²; paving area = 1 000 × 0.36 = 360 m²; grass area = 90 m². Cost = 3 600 000 dong." },
      ],
    },
    "chapter-4-review": {
      title: "Chapter IV: Review and Exercises",
      questions: [
        { number: "1", prompt: "Which figure in Figure 4.21 is an isosceles trapezoid? (A) Figure 1; (B) Figure 2; (C) Figure 3; (D) Figure 4.", answer: "Use Figure 4.21: choose the quadrilateral with one pair of parallel sides and equal non-parallel sides." },
        { number: "2", prompt: "Which figure in Figure 4.22 is a parallelogram? (A) Figure 1; (B) Figure 2; (C) Figure 3; (D) Figure 4.", answer: "Use Figure 4.22: choose the quadrilateral with both pairs of opposite sides parallel." },
        { number: "3", prompt: "Which statement about a rectangle is correct? (A) Its diagonals are parallel. (B) All four angles are 90°. (C) Its diagonals are unequal. (D) All four angles are 60°.", answer: "B." },
        { number: "4", prompt: "Which statement about a regular hexagon is correct? (A) Its main diagonals are equal. (B) Each angle is 60°. (C) A main diagonal equals a short diagonal. (D) Each angle is 90°.", answer: "A." },
        { number: "5", prompt: "Which statement is false? (A) Rectangle diagonals bisect each other. (B) Opposite angles in a rhombus are not equal. (C) The base angles of an isosceles trapezoid are equal. (D) Square diagonals are equal.", answer: "B. Opposite angles in a rhombus are equal." },
        { number: "6", prompt: "A square has side 12 cm. What is its perimeter? (A) 144 cm²; (B) 48 cm; (C) 48 cm²; (D) 96 cm.", answer: "B. 48 cm." },
        { number: "7", prompt: "A rectangle has area 1 200 m² and one side 40 m. What is its perimeter? (A) 70 m; (B) 140 m; (C) 120 m; (D) 2 400 m.", answer: "B. The other side is 30 m, so the perimeter is 140 m." },
        { number: "8", prompt: "A rhombus has diagonals 10 cm and 12 cm. What is its area? (A) 120 cm²; (B) 22 cm²; (C) 11 cm²; (D) 60 cm².", answer: "D. 10 × 12 ÷ 2 = 60 cm²." },
        { number: "9", prompt: "A parallelogram has a side 12 cm and matching height 7 cm. What is its area? (A) 84 cm; (B) 84 cm²; (C) 42 cm²; (D) 38 cm².", answer: "B. 12 × 7 = 84 cm²." },
        { number: "10", prompt: "An isosceles trapezoid has bases 6 cm and 12 cm and height 5 cm. What is its area? (A) 18 cm²; (B) 90 cm²; (C) 45 cm²; (D) 360 cm².", answer: "C. (6 + 12) × 5 ÷ 2 = 45 cm²." },
        { number: "4.29", prompt: "Draw: (a) a square with side 4.5 cm; (b) a rectangle with one side 5 cm and area 35 cm²; (c) a rhombus with side 5 cm and one angle 60°; (d) a parallelogram with adjacent sides 5 cm and 7 cm and height 4 cm.", answer: "(a) Four 4.5 cm sides and right angles. (b) The other side is 7 cm. (c) Four 5 cm sides with a 60° angle. (d) Use adjacent sides 5 cm and 7 cm with perpendicular height 4 cm." },
        { number: "4.30", prompt: "In Figure 4.23, O is the centre of a hexagon. Identify the regular hexagon, rhombus, and equilateral triangle.", answer: "Use the vertex labels in Figure 4.23; identify the six-sided regular polygon, then name the four-sided figure with equal sides and the three-sided figure with equal sides." },
        { number: "4.31", prompt: "In Figure 4.24, PQRS is a square and E, F, G, H are the midpoints of its sides. (a) Is ABCD a square? (b) Is AFRH an isosceles trapezoid?", answer: "Check the angle and side markings in Figure 4.24. A square needs four equal sides and four right angles; an isosceles trapezoid needs one pair of parallel sides and equal legs." },
        { number: "4.32", prompt: "Cut a 3 cm × 12 cm rectangle into four pieces and rearrange them, without overlap, to make a square.", answer: "Cut it into four 3 cm × 3 cm squares and arrange them in a 2 × 2 square of side 6 cm." },
        { number: "4.33", prompt: "Use Figure 4.26 to find (a) the area of the yard; (b) how many square tiles of side 50 cm are needed to cover it.", answer: "Find the yard's area from the dimensions in Figure 4.26. Each tile covers 0.25 m², so divide the area in m² by 0.25 to get the number of tiles." },
      ],
    },
  };

  Object.assign(window.WORKSHEET_SETS, worksheets);
})();
