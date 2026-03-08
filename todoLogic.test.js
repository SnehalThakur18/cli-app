import {
  parsePriority,
  isOverdue,
  normalizeTasks,
  sortByPriority,
  sortByStatus,
} from "./todoLogic.js";

describe("parsePriority", () => {
  test("returns Low for l/low", () => {
    expect(parsePriority("l")).toBe("Low");
    expect(parsePriority("low")).toBe("Low");
  });

  test("returns High for h/high", () => {
    expect(parsePriority("h")).toBe("High");
    expect(parsePriority("HIGH")).toBe("High");
  });

  test("defaults to Medium for m/medium/empty/unknown", () => {
    expect(parsePriority("m")).toBe("Medium");
    expect(parsePriority("medium")).toBe("Medium");
    expect(parsePriority("")).toBe("Medium");
    expect(parsePriority("something-else")).toBe("Medium");
  });
});

describe("isOverdue", () => {
  test("returns true when past due and not completed", () => {
    const task = { description: "Test", completed: false, dueDate: "2026-03-01" };
    const now = new Date("2026-03-08T12:00:00Z");
    expect(isOverdue(task, now)).toBe(true);
  });

  test("returns false when completed", () => {
    const task = { description: "Test", completed: true, dueDate: "2026-03-01" };
    const now = new Date("2026-03-08T12:00:00Z");
    expect(isOverdue(task, now)).toBe(false);
  });

  test("returns false when no dueDate", () => {
    const task = { description: "Test", completed: false, dueDate: null };
    const now = new Date("2026-03-08T12:00:00Z");
    expect(isOverdue(task, now)).toBe(false);
  });
});

describe("normalizeTasks", () => {
  test("normalizes missing fields with defaults", () => {
    const input = [
      { description: "Task 1" },
      { completed: true },
      {},
    ];
    const result = normalizeTasks(input);

    expect(result).toHaveLength(3);
    expect(result[0]).toMatchObject({
      description: "Task 1",
      completed: false,
      priority: "Medium",
      dueDate: null,
    });
    expect(result[1]).toMatchObject({
      description: "",
      completed: true,
      priority: "Medium",
      dueDate: null,
    });
  });
});

describe("sorting helpers", () => {
  const sample = [
    { description: "C", completed: false, priority: "Low" },
    { description: "A", completed: false, priority: "High" },
    { description: "B", completed: true, priority: "Medium" },
  ];

  test("sortByPriority orders by priority, then status, then description", () => {
    const sorted = sortByPriority(sample);
    expect(sorted.map((t) => t.description)).toEqual(["A", "B", "C"]);
  });

  test("sortByStatus orders by status, then priority, then description", () => {
    const sorted = sortByStatus(sample);
    expect(sorted.map((t) => t.description)).toEqual(["A", "C", "B"]);
  });
});
