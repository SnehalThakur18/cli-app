## Todo CLI App

This is a simple Node.js command-line Todo application that lets you manage tasks directly from your terminal with colored output using `chalk`.

### Features

- Add multiple tasks in one go
- View all tasks with status indicators
- Mark one or many tasks as completed
- Edit an existing task description
- Remove a task by its number
- Clear all tasks with confirmation

### Prerequisites

- Node.js (v18+ recommended)

### Install dependencies

In the project folder run:

```bash
npm install
```

### Run the app

```bash
node app.js
```

### Menu options

1. **Add a new Task**
   - You will see: `Enter the task description (or press Enter with no text to stop):`
   - Type a description and press Enter to add a task.
   - It will keep asking so you can add multiple tasks.
   - Press Enter on an empty line to stop adding and return to the menu.

2. **View all Tasks**
   - Shows the list of tasks with:
     - `[ ]` for pending tasks (gray)
     - `[✓]` for completed tasks (bright green)

3. **Mark Task as Completed**
   - Prompts: `Enter the task number to mark as completed (or press Enter with no text to stop):`
   - Enter a task number (e.g. `2`) to mark it completed.
   - You can enter multiple numbers one by one.
   - Press Enter on an empty line to finish.

4. **Edit a Task**
   - Enter the task number to edit.
   - You will see the current description and can type a new one.
   - Leaving it empty keeps the old description.

5. **Remove a Task**
   - Enter the task number you want to delete.
   - That item is removed from the list.

6. **Clear All Tasks**
   - Asks for confirmation (`y` / `yes`).
   - If confirmed, removes all tasks.

7. **Exit**
   - Closes the application.
