// Pure helper functions for the Todo CLI logic

export function parsePriority(input) {
  const normalized = input.trim().toLowerCase();
  if (normalized === "l" || normalized === "low") return "Low";
  if (normalized === "h" || normalized === "high") return "High";
  if (normalized === "m" || normalized === "medium" || normalized === "") {
    return "Medium";
  }
  // For any unknown value, default to Medium (same behavior as CLI)
  return "Medium";
}

export function isOverdue(task, now = new Date()) {
  if (!task || !task.dueDate || task.completed) return false;
  const due = new Date(task.dueDate);
  if (Number.isNaN(due.getTime())) return false;

  const endOfDue = new Date(
    due.getFullYear(),
    due.getMonth(),
    due.getDate(),
    23,
    59,
    59,
  );
  return now > endOfDue;
}

export function normalizeTasks(parsed) {
  if (!Array.isArray(parsed)) return [];
  return parsed.map((item) => ({
    description: String(item.description ?? ""),
    completed: Boolean(item.completed),
    priority: item.priority ?? "Medium",
    dueDate: item.dueDate ?? null,
  }));
}

export function sortByPriority(list) {
  const order = { High: 0, Medium: 1, Low: 2 };
  return [...list].sort((a, b) => {
    const pa = order[a.priority ?? "Medium"] ?? 1;
    const pb = order[b.priority ?? "Medium"] ?? 1;
    if (pa !== pb) return pa - pb;
    // Pending before completed
    if (a.completed !== b.completed)
      return Number(a.completed) - Number(b.completed);
    return a.description.localeCompare(b.description);
  });
}

export function sortByStatus(list) {
  const order = { High: 0, Medium: 1, Low: 2 };
  return [...list].sort((a, b) => {
    // Pending (false) first, then completed (true)
    if (a.completed !== b.completed)
      return Number(a.completed) - Number(b.completed);
    const pa = order[a.priority ?? "Medium"] ?? 1;
    const pb = order[b.priority ?? "Medium"] ?? 1;
    if (pa !== pb) return pa - pb;
    return a.description.localeCompare(b.description);
  });
}
