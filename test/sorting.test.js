
import test from "node:test";
import assert from "node:assert/strict";
import { mergeSort } from "../src/domain/sorting.js";

test("mergeSort returns items in ascending order", () => {
  const numbers = [8, 3, 6, 1, 5];

  const result = mergeSort(numbers, (a, b) => a - b);

  assert.deepEqual(result, [1, 3, 5, 6, 8]);
});

test("mergeSort does not mutate the original array", () => {
  const numbers = [8, 3, 6, 1, 5];
  const original = [...numbers];

  mergeSort(numbers, (a, b) => a - b);

  assert.deepEqual(numbers, original);
});

test("mergeSort returns a new array", () => {
  const numbers = [3, 1, 2];

  const result = mergeSort(numbers, (a, b) => a - b);

  assert.notStrictEqual(result, numbers);
});

test("mergeSort preserves the order of equal elements", () => {
  const items = [
    { name: "A", score: 2 },
    { name: "B", score: 1 },
    { name: "C", score: 2 },
    { name: "D", score: 1 },
  ];

  const result = mergeSort(items, (a, b) => a.score - b.score);

  assert.deepEqual(
    result.map((item) => item.name),
    ["B", "D", "A", "C"]
  );
});

test("mergeSort handles an empty array", () => {
  assert.deepEqual(mergeSort([], (a, b) => a - b), []);
});

test("mergeSort handles a single item", () => {
  assert.deepEqual(mergeSort([5], (a, b) => a - b), [5]);
});
