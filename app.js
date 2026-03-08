import readline from "node:readline";
import chalk from "chalk";
import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import {
  parsePriority,
  isOverdue,
  normalizeTasks,
  sortByPriority as sortByPriorityLogic,
  sortByStatus as sortByStatusLogic,
} from "./todoLogic.js";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const DATA_FILE = "tasks.json";
let todoList = [];

// Load tasks from file if it exists.
const loadTasks = async () => {
  if (existsSync(DATA_FILE)) {
    try {
      const data = await readFile(DATA_FILE, "utf8");
      const parsed = JSON.parse(data);
      // Normalize tasks to ensure priority and dueDate fields exist
      todoList = normalizeTasks(parsed);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : `Unknown error: ${String(err)}`;
      console.log(
        chalk.red(
          `Error loading tasks from ${DATA_FILE}: ${message}. Starting fresh.`,
        ),
      );
      // Fall back to an empty list so the app can still run
      todoList = [];
    }
  }
};

// Save tasks to file whenever they change
const saveTasks = async () => {
  try {
    await writeFile(DATA_FILE, JSON.stringify(todoList, null, 2), "utf8");
  } catch (err) {
    const message =
      err instanceof Error ? err.message : `Unknown error: ${String(err)}`;
    console.log(chalk.red(`Error saving tasks to ${DATA_FILE}: ${message}.`));
  }
};

const showMenu = () => {
  console.log(chalk.cyanBright("\n==== TODO LIST APP ====\n"));
  console.log(chalk.yellow("1.") + " Add a new Task");
  console.log(chalk.yellow("2.") + " View all Tasks");
  console.log(chalk.yellow("3.") + " Mark Task as Completed");
  console.log(chalk.yellow("4.") + " Edit a Task");
  console.log(chalk.yellow("5.") + " Remove a Task");
  console.log(chalk.yellow("6.") + " Clear All Tasks");
  console.log(chalk.yellow("7.") + " Sort Tasks by Priority");
  console.log(chalk.yellow("8.") + " Sort Tasks by Status (Pending/Completed)");
  console.log(chalk.yellow("9.") + " Exit");
  console.log();
  rl.question(chalk.magenta("Please select an option: "), handleInput);
};

const promptForTaskDescription = () => {
  rl.question(
    chalk.magenta(
      "Enter the task description (or press Enter with no text to stop): ",
    ),
    handleTaskDescription,
  );
};

const handleTaskDescription = (task) => {
  const trimmed = task.trim();
  if (trimmed.length === 0) {
    // Stop adding and go back to menu
    showMenu();
    return;
  }

  rl.question(
    chalk.magenta(
      "Set priority (L)ow, (M)edium, (H)igh. Press Enter for Medium: ",
    ),
    (priorityInput) => handlePriorityInput(trimmed, priorityInput),
  );
};

const handlePriorityInput = (description, priorityInput) => {
  const normalized = priorityInput.trim().toLowerCase();
  const priority = parsePriority(priorityInput);

  // Warn if the user entered an unrecognized value
  if (
    normalized !== "" &&
    normalized !== "l" &&
    normalized !== "low" &&
    normalized !== "m" &&
    normalized !== "medium" &&
    normalized !== "h" &&
    normalized !== "high"
  ) {
    console.log(chalk.yellow("Unknown priority, defaulting to Medium."));
  }

  rl.question(
    chalk.magenta("Enter due date (YYYY-MM-DD) or press Enter to skip: "),
    (dueInput) => handleDueDateInput(description, priority, dueInput),
  );
};

const handleDueDateInput = async (description, priority, dueInput) => {
  const dueTrimmed = dueInput.trim();
  const dueDate = dueTrimmed.length > 0 ? dueTrimmed : null;

  todoList.push({
    description,
    completed: false,
    priority,
    dueDate,
  });
  console.log(chalk.green("Task added."));
  await saveTasks();
  // Ask again for another task
  promptForTaskDescription();
};

const addTask = () => {
  promptForTaskDescription();
};

const viewTasks = () => {
  console.log(chalk.bold("Todo List:"));
  if (todoList.length === 0) {
    console.log(chalk.yellow("No tasks yet. Add a new task from option 1."));
    showMenu();
    return;
  }
  todoList.forEach((task, index) => {
    const status = task.completed
      ? chalk.greenBright("[✓]")
      : chalk.gray("[ ]");
    let priorityLabel;
    if (task.priority === "High") {
      priorityLabel = chalk.redBright("(High)");
    } else if (task.priority === "Low") {
      priorityLabel = chalk.green("(Low)");
    } else {
      priorityLabel = chalk.yellow("(Medium)");
    }

    let dueInfo = "";
    if (task.dueDate) {
      if (isOverdue(task)) {
        dueInfo = " " + chalk.redBright("[OVERDUE]");
      } else {
        dueInfo = " " + chalk.blue(`(Due: ${task.dueDate})`);
      }
    }

    const line = `${index + 1}. ${status} ${priorityLabel} ${task.description} ${dueInfo}`;
    console.log(task.completed ? chalk.greenBright(line) : line);
  });
  showMenu();
};

const markTaskCompleted = () => {
  if (todoList.length === 0) {
    console.log(chalk.yellow("No tasks to mark as completed."));
    showMenu();
    return;
  }

  const askForCompletion = () => {
    rl.question(
      chalk.magenta(
        "Enter the task number to mark as completed (or press Enter with no text to stop): ",
      ),
      async (input) => {
        const trimmed = input.trim();
        if (trimmed.length === 0) {
          // Stop marking and go back to menu
          showMenu();
          return;
        }

        const index = Number.parseInt(trimmed, 10) - 1;
        if (Number.isNaN(index)) {
          console.log(chalk.red("Please enter a valid number."));
        } else if (index >= 0 && index < todoList.length) {
          if (todoList[index].completed) {
            console.log(chalk.yellow("Task is already completed."));
          } else {
            todoList[index].completed = true;
            console.log(chalk.green("Task marked as completed."));
            await saveTasks();
          }
        } else {
          console.log(chalk.red("Invalid task number"));
        }

        // Ask again for another task to mark
        askForCompletion();
      },
    );
  };

  askForCompletion();
};

const editTask = () => {
  if (todoList.length === 0) {
    console.log(chalk.yellow("No tasks to edit."));
    showMenu();
    return;
  }

  rl.question(chalk.magenta("Enter the task number to edit: "), (number) => {
    const index = Number.parseInt(number) - 1;
    if (index >= 0 && index < todoList.length) {
      const currentDescription = todoList[index].description;
      rl.question(
        chalk.magenta(
          `Current description: "${currentDescription}". Enter new description: `,
        ),
        async (newDescription) => {
          if (newDescription.trim().length === 0) {
            console.log(
              chalk.yellow("Description cannot be empty. Task not changed."),
            );
          } else {
            todoList[index].description = newDescription;
            console.log(chalk.green("Task updated successfully."));
            await saveTasks();
          }
          showMenu();
        },
      );
    } else {
      console.log(chalk.red("Invalid task number"));
      showMenu();
    }
  });
};

const removeTask = () => {
  if (todoList.length === 0) {
    console.log(chalk.yellow("No tasks to remove."));
    showMenu();
    return;
  }

  rl.question(
    chalk.magenta("Enter the task number to remove: "),
    async (number) => {
      const index = Number.parseInt(number) - 1;
      if (index >= 0 && index < todoList.length) {
        todoList.splice(index, 1);
        console.log(chalk.green("Task Removed Successfully"));
        await saveTasks();
      } else {
        console.log(chalk.red("Invalid task number"));
      }
      showMenu();
    },
  );
};

const clearAllTasks = () => {
  if (todoList.length === 0) {
    console.log(chalk.yellow("No tasks to clear."));
    showMenu();
    return;
  }

  rl.question(
    chalk.magenta("Are you sure you want to clear all tasks? (y/n): "),
    async (answer) => {
      const normalized = answer.trim().toLowerCase();
      if (normalized === "y" || normalized === "yes") {
        todoList.length = 0;
        console.log(chalk.green("All tasks cleared."));
        await saveTasks();
      } else {
        console.log(chalk.yellow("No tasks were cleared."));
      }
      showMenu();
    },
  );
};

const sortByPriority = async () => {
  if (todoList.length === 0) {
    console.log(chalk.yellow("No tasks to sort."));
    showMenu();
    return;
  }

  todoList = sortByPriorityLogic(todoList);

  await saveTasks();
  console.log(chalk.green("Tasks sorted by priority."));
  showMenu();
};

const sortByStatus = async () => {
  if (todoList.length === 0) {
    console.log(chalk.yellow("No tasks to sort."));
    showMenu();
    return;
  }

  todoList = sortByStatusLogic(todoList);

  await saveTasks();
  console.log(chalk.green("Tasks sorted by status (pending/completed)."));
  showMenu();
};

const exitApp = () => {
  console.log(chalk.cyan("Exiting..."));
  rl.close();
};

const handleInvalidOption = () => {
  console.log(chalk.red("Invalid Option. Please try again."));
  showMenu();
};

const handleInput = (option) => {
  switch (option) {
    case "1":
      addTask();
      break;
    case "2":
      viewTasks();
      break;
    case "3":
      markTaskCompleted();
      break;
    case "4":
      editTask();
      break;
    case "5":
      removeTask();
      break;
    case "6":
      clearAllTasks();
      break;
    case "7":
      // Sort by priority
      sortByPriority();
      break;
    case "8":
      // Sort by status
      sortByStatus();
      break;
    case "9":
      exitApp();
      break;
    default:
      handleInvalidOption();
  }
};

await loadTasks();
showMenu();
