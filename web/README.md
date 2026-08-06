# Portfolio web

React and Vite frontend for AWS Portfolio Ops.

## Local development

```bash
cp .env.example .env
npm install
npm run dev
```

The frontend runs at `http://localhost:5173` and expects the API base URL from
`VITE_API_BASE_URL`.

Routes:

- `/` published project list with cover images
- `/projects/:slug` project detail, description, and PDF link

## Checks

```bash
npm run lint
npm test
npm run build
```
