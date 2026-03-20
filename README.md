# Taskr

Taskr is a full deployable task manager built as a single Node.js application. It serves the frontend directly from `public/` and persists tasks in `data/tasks.json`, so there is no database or frontend build step required.

## Stack

- Node.js 18+
- Express
- Plain HTML, CSS, and JavaScript frontend
- Local JSON file storage

## Project Structure

```text
.
|-- data/
|   `-- tasks.json
|-- public/
|   |-- app.js
|   |-- index.html
|   `-- styles.css
|-- .env.example
|-- .gitignore
|-- package.json
`-- server.js
```

## Run Locally

```bash
npm install
npm start
```

The app will start at `http://localhost:5000` by default.

For development with Node's built-in file watcher:

```bash
npm run dev
```

## Environment Variables

Create a `.env` file if you want to override the port:

```bash
PORT=5000
```

## API Endpoints

- `GET /api/health` - health check
- `GET /api/tasks` - list tasks
- `POST /api/tasks` - create task
- `PUT /api/tasks/:id` - update task
- `PATCH /api/tasks/:id/toggle` - toggle task status
- `DELETE /api/tasks/:id` - delete task

Example request body for creating a task:

```json
{
  "title": "Finish deployment setup",
  "description": "Add package.json and verify the app boots"
}
```

## Deployment

This project is ready for simple Node hosting platforms such as Render, Railway, or a VPS.

- Build command: `npm install`
- Start command: `npm start`
- Node version: `18+`

If you deploy to an ephemeral filesystem, task data will reset when the instance is recreated. For persistent production data, swap `data/tasks.json` for a real database or attach persistent storage.
