import readline from "node:readline";
import chalk from "chalk";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const todoList = [];

const showMenu = () => {
  console.log(chalk.cyanBright("\n==== TODO LIST APP ====\n"));
  console.log(chalk.yellow("1.") + " Add a new Task");
  console.log(chalk.yellow("2.") + " View all Tasks");
  console.log(chalk.yellow("3.") + " Mark Task as Completed");
  console.log(chalk.yellow("4.") + " Edit a Task");
  console.log(chalk.yellow("5.") + " Remove a Task");
  console.log(chalk.yellow("6.") + " Clear All Tasks");
  console.log(chalk.yellow("7.") + " Exit");
  console.log();
  rl.question(chalk.magenta("Please select an option: "), handleInput);
};

const addTask = () => {
  const askForTask = () => {
    rl.question(
      chalk.magenta(
        "Enter the task description (or press Enter with no text to stop): ",
      ),
      (task) => {
        if (task.trim().length === 0) {
          // Stop adding and go back to menu
          showMenu();
          return;
        }
        todoList.push({ description: task, completed: false });
        console.log(chalk.green("Task added."));
        // Ask again for another task
        askForTask();
      },
    );
  };

  askForTask();
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
    const line = `${index + 1}. ${status} ${task.description}`;
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
      (input) => {
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
        (newDescription) => {
          if (newDescription.trim().length === 0) {
            console.log(
              chalk.yellow("Description cannot be empty. Task not changed."),
            );
          } else {
            todoList[index].description = newDescription;
            console.log(chalk.green("Task updated successfully."));
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

  rl.question(chalk.magenta("Enter the task number to remove: "), (number) => {
    const index = Number.parseInt(number) - 1;
    if (index >= 0 && index < todoList.length) {
      todoList.splice(index, 1);
      console.log(chalk.green("Task Removed Successfully"));
    } else {
      console.log(chalk.red("Invalid task number"));
    }
    showMenu();
  });
};

const clearAllTasks = () => {
  if (todoList.length === 0) {
    console.log(chalk.yellow("No tasks to clear."));
    showMenu();
    return;
  }

  rl.question(
    chalk.magenta("Are you sure you want to clear all tasks? (y/n): "),
    (answer) => {
      const normalized = answer.trim().toLowerCase();
      if (normalized === "y" || normalized === "yes") {
        todoList.length = 0;
        console.log(chalk.green("All tasks cleared."));
      } else {
        console.log(chalk.yellow("No tasks were cleared."));
      }
      showMenu();
    },
  );
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
      exitApp();
      break;
    default:
      handleInvalidOption();
  }
};

showMenu();
