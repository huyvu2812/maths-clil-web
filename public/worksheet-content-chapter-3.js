(() => {
  const worksheets = {
    "lesson-13": {
      title: "Lesson 13: The Set of Integers",
      questions: [
        { number: "3.1", prompt: "Rewrite without using a negative number: “The submarine is at a height of −120 m compared with sea level.”", answer: "The submarine is 120 m below sea level." },
        { number: "3.2", prompt: "Mr Tám's bank message says his balance changed by −356 500 dong. What does this mean?", answer: "356 500 dong was taken out of his account; his balance decreased by that amount." },
        { number: "3.3", prompt: "Which integers do points M, N, P, and Q represent in Figure 3.1 of the original worksheet PDF?", answer: "Read the positions of M, N, P, and Q relative to 0 on the number line in Figure 3.1; points to the left are negative and points to the right are positive." },
        { number: "3.4", prompt: "Mark 5, −5, −3, 3, −2, and 2 on one number line. Give their order from left to right.", answer: "−5, −3, −2, 2, 3, 5." },
        { number: "3.5", prompt: "An ant walks 13 units on a number line. Where does it stop if it starts at O and walks (a) in the positive direction; (b) in the negative direction?", answer: "(a) At 13. (b) At −13." },
        { number: "3.6", prompt: "List in increasing order M = {x ∈ ℤ | x ends in the digit 3 and −25 < x ≤ 30}.", answer: "M = {−23, −13, −3, 3, 13, 23}." },
        { number: "3.7", prompt: "Compare −57 312 and −57 298.", answer: "−57 312 < −57 298." },
      ],
    },
    "lesson-14": {
      title: "Lesson 14: Addition and Subtraction of Integers",
      questions: [
        { number: "3.8", prompt: "Give the sign and natural-number part of each integer: −73, +415, −1 204, 2 026.", answer: "−73: sign −, part 73; +415: sign +, part 415; −1 204: sign −, part 1 204; 2 026: sign +, part 2 026." },
        { number: "3.9", prompt: "Find the opposite of +37, −26, 583, and −7 641. What do you notice about opposite integers?", answer: "The opposites are −37, +26, −583, and +7 641. Opposite integers have the same natural-number part and opposite signs." },
        { number: "3.10", prompt: "Should z be negative or positive so that (a) −z is negative; (b) −z is positive?", answer: "(a) z is positive. (b) z is negative." },
        { number: "3.11", prompt: "Calculate: (a) (−128) + (+97); (b) 416 + (−389).", answer: "(a) −31. (b) 27." },
        { number: "3.12", prompt: "Calculate: (a) 1 365 + (−1 536); (b) (−4 627) + (−2 158).", answer: "(a) −171. (b) −6 785." },
        { number: "3.13", prompt: "Calculate: (a) 7 386 + (−48 529); (b) (−23 645) + 418 732.", answer: "(a) −41 143. (b) 395 087." },
        { number: "3.14", prompt: "Calculate: (a) 38 627 − 14 395; (b) 7 254 − (−479).", answer: "(a) 24 232. (b) 7 733." },
        { number: "3.15", prompt: "Complete the x, y, x + y, and x − y table from the original worksheet. The x row is −15, 8, −19, 0, −143, 0, 7, ?; the y row is 9, −27, −26, −64, 0, −48, ?, 61. The given values are x + y = −31 in column 7 and x − y = −44 in column 8.", answer: "Missing x in column 8 is 17; missing y in column 7 is −38. x + y: −6, −19, −45, −64, −143, −48, −31, 78. x − y: −24, 35, 7, 64, −143, 48, 45, −44." },
        { number: "3.16", prompt: "The daytime temperature in Moscow was −6 °C. At night it fell by 5 °C. What was the night temperature?", answer: "−11 °C." },
        { number: "3.17", prompt: "Mr X had 18 465 300 dong. His account transactions were −2 350 000, +6 480 000, and −4 125 000 dong. How much remained?", answer: "18 470 300 dong." },
        { number: "3.18", prompt: "Calculate mentally: (a) 465 + (−318) + (−65); (b) (−64) + 517 + (−36).", answer: "(a) 82. (b) 417." },
        { number: "3.19", prompt: "Calculate mentally: (a) 13 + (−16) + 19 + (−22); (b) (−32) + 35 + (−38) + 43.", answer: "(a) −6. (b) 8." },
      ],
    },
    "lesson-15": {
      title: "Lesson 15: Rules for Removing Brackets",
      questions: [
        { number: "3.20", prompt: "Remove brackets and calculate: (a) (−36) + (−47) − 85 + (−72); (b) 24 − (−39) + (−58) − (+46).", answer: "(a) −240. (b) −41." },
        { number: "3.21", prompt: "Remove brackets and calculate: (a) (73 − 95) − (18 − 64 + 7); (b) 48 + (17 − 35) − (71 + 48).", answer: "(a) 17. (b) −89." },
        { number: "3.22", prompt: "Calculate in a smart way: (a) 52 − 55 + 58 − 61 + 64 − 67; (b) 86 − (47 − 9) + (−48).", answer: "(a) −9. (b) 0." },
        { number: "3.23", prompt: "Calculate in a smart way: (a) 457 − (318 + 457) − (82 + 0); (b) 425 − (713 + 325 − 488).", answer: "(a) −400. (b) −125." },
        { number: "3.24", prompt: "Find the sum of all elements of M = {x ∈ ℤ | −25 ≤ x < 25}.", answer: "0; the negative and positive integers cancel in pairs, leaving 0." },
        { number: "3.25", prompt: "Seven integers have the property that the sum of any three is negative. Explain why the sum of all seven is negative.", answer: "The sum of all 35 three-number sums equals 15 times the sum of the seven integers. Since all 35 sums are negative, the total—and therefore the sum of the seven integers—is negative." },
      ],
    },
    "lesson-16": {
      title: "Lesson 16: Multiplication of Integers",
      questions: [
        { number: "3.26", prompt: "Calculate 127 × 6, then use it to find (a) (−127) × 6; (b) 127 × (−6); (c) (−127) × (−6).", answer: "127 × 6 = 762; (a) −762; (b) −762; (c) 762." },
        { number: "3.27", prompt: "Compare each product with 0: (a) 413 × 628; (b) (−517) × 846; (c) (−394) × (−725).", answer: "(a) Greater than 0. (b) Less than 0. (c) Greater than 0." },
        { number: "3.28", prompt: "Compare: (a) (+27) × (−15) and (−6) × (−9); (b) (−36) × (−5) and (−12) × (−15); (c) (−18) × (+35) and (+28) × (−24).", answer: "(a) −405 < 54. (b) 180 = 180. (c) −630 > −672." },
        { number: "3.29", prompt: "Let a be negative. Is b positive or negative if (a) a × b is positive; (b) a × b is negative?", answer: "(a) b is negative. (b) b is positive." },
        { number: "3.30", prompt: "Complete the products for the paired x and y values: x = −34, 45, −24, −25, 0, −427, −1, −615; y = 12, −9, −35, −160, −718, 1, 386, −1.", answer: "x × y = −408, −405, 840, 4 000, 0, −427, −386, 615." },
        { number: "3.31", prompt: "Find x: (a) 7 × (x + 35) = 0; (b) (19 − x)(x + 14) = 0; (c) (−x)(x − 52) = 0.", answer: "(a) x = −35. (b) x = 19 or −14. (c) x = 0 or 52." },
        { number: "3.32", prompt: "Calculate in a smart way: (a) (37 − 12)(−7) + (−16 − 9) × 33; (b) (−148)(135 − 284) − 135(284 − 148).", answer: "(a) −1 000. (b) 3 692." },
        { number: "3.33", prompt: "A new outfit changes the fabric needed by x dm compared with the old style. Find the total change for 360 outfits when (a) x = 15; (b) x = −6.", answer: "(a) 5 400 dm more. (b) 2 160 dm less (a change of −2 160 dm)." },
        { number: "3.34", prompt: "Seven integers have the property that the product of any three is negative. Is the product of all seven negative or positive? Explain.", answer: "Negative. Comparing triples that differ in just one factor shows all seven integers have the same sign; since every triple product is negative, all seven are negative, and their product is negative." },
      ],
    },
    "lesson-17": {
      title: "Lesson 17: Divisibility, Divisors and Multiples of an Integer",
      questions: [
        { number: "3.35", prompt: "Calculate: (a) 846 ÷ (−6); (b) (−637) ÷ (−13); (c) (−3 030) ÷ 101.", answer: "(a) −141. (b) 49. (c) −30." },
        { number: "3.36", prompt: "List the integer divisors of 33 and of −70.", answer: "Divisors of 33: ±1, ±3, ±11, ±33. Divisors of −70: ±1, ±2, ±5, ±7, ±10, ±14, ±35, ±70." },
        { number: "3.37", prompt: "List the non-zero multiples of 13 greater than −60 and less than 90.", answer: "−52, −39, −26, −13, 13, 26, 39, 52, 65, 78." },
        { number: "3.38", prompt: "List P = {x ∈ ℤ | x is divisible by 4 and −20 < x ≤ 20}.", answer: "P = {−16, −12, −8, −4, 0, 4, 8, 12, 16, 20}." },
        { number: "3.39", prompt: "Write 35 as a product of two integers in all possible ways.", answer: "Ignoring order: 35 = 1 × 35 = 5 × 7 = (−1) × (−35) = (−5) × (−7). Reversing the factors gives the corresponding ordered pairs." },
        { number: "3.40", prompt: "Find all integers x such that x + 7 is divisible by x.", answer: "x = −7, −1, 1, or 7, since x must be a non-zero divisor of 7." },
      ],
    },
    "chapter-3-review": {
      title: "Chapter III: Review and Exercises",
      questions: [
        { number: "1", prompt: "Compare 0, 5, and −9. (A) 0 < −9 < 5; (B) −9 < 0 < 5; (C) 0 < 5 < −9; (D) 5 < −9 < 0.", answer: "B. −9 < 0 < 5." },
        { number: "2", prompt: "For B = {x ∈ ℤ | −12 < x ≤ 8}, which is true? (A) −12 ∈ B and 8 ∈ B; (B) −12 ∉ B and 8 ∈ B; (C) −12 ∈ B and 8 ∉ B; (D) −12 ∉ B and 8 ∉ B.", answer: "B." },
        { number: "3", prompt: "Integers a and b have a negative sum and a positive product. What are their signs? (A) both negative; (B) a positive, b negative; (C) a negative, b positive; (D) both positive.", answer: "A. Both are negative." },
        { number: "4", prompt: "Integers a and b have a positive sum and a positive product. What are their signs? (A) both negative; (B) a positive, b negative; (C) a negative, b positive; (D) both positive.", answer: "D. Both are positive." },
        { number: "5", prompt: "Integers a and b have a negative product and a positive difference a − b. What are their signs? (A) both negative; (B) a positive, b negative; (C) a negative, b positive; (D) both positive.", answer: "B. a is positive and b is negative." },
        { number: "6", prompt: "Integers a and b have a negative product and a negative difference a − b. What are their signs? (A) both negative; (B) a positive, b negative; (C) a negative, b positive; (D) both positive.", answer: "C. a is negative and b is positive." },
        { number: "3.41", prompt: "Integer a has a negative sign and natural-number part 34. Write a and its opposite.", answer: "a = −34; its opposite is 34." },
        { number: "3.42", prompt: "Arrange in increasing order: a = 41 + (−36), b = (−9) − 6, c = (−8)(−7), d = (−42) ÷ 6.", answer: "b = −15 < d = −7 < a = 5 < c = 56." },
        { number: "3.43", prompt: "Calculate smartly: (a) 24 × 31 − 4 × 6 × (−19); (b) 36 × 5 − 9 × [(−29) + 13].", answer: "(a) 1 200. (b) 324." },
        { number: "3.44", prompt: "Calculate smartly: (a) 63 × 48 + 24 × (−9) − 15 × 24; (b) 15 × (37 − 19) − 15 × (37 + 19).", answer: "(a) 2 448. (b) −570." },
        { number: "3.45", prompt: "Find x if (46 − x)(x + 17) = 0.", answer: "x = 46 or x = −17." },
        { number: "3.46", prompt: "Find all multiples of 7 greater than −22 and less than 22.", answer: "−21, −14, −7, 0, 7, 14, 21." },
        { number: "3.47", prompt: "Find all common integer divisors of 30 and 45.", answer: "−15, −5, −3, −1, 1, 3, 5, and 15." },
        { number: "3.48", prompt: "The 11 cells in the original worksheet form a row. Fill the row so the product of any three neighbouring entries is 90; the second entry is 5 and the ninth is −3.", answer: "−6, 5, −3, −6, 5, −3, −6, 5, −3, −6, 5." },
        { number: "3.49", prompt: "The 11 cells in the original worksheet form a row. Fill the row so the sum of any three neighbouring entries is 0; the third entry is −8 and the seventh is 5.", answer: "5, 3, −8, 5, 3, −8, 5, 3, −8, 5, 3." },
      ],
    },
  };

  Object.assign(window.WORKSHEET_SETS, worksheets);
})();
