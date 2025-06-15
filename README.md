![PR Peer Logo](static/pr-peer.png)

Code review at a glance.

PR Peer is an AI-powered tool designed to significantly speed up the code review process.

## Core Features

- Review any pull request in a matter of seconds, no matter the language
- Allows viewing any public GitHub repository's pull requests in real-time
- Summarizes pull requests for quick understanding
- Assesses the risk and complexity of changes
- Suggests the level of expertise required for review
- Rates the PR author's skill based on their contributions
- Visualizes code changes with a diff view
- Independent front- & backend with integrations for:
  - local deployment
  - Codesphere (any model supported by llama_cpp)
  - OpenAI API
  - Mistral API
- Full control over privacy & data with self-hosted options

## Fluff Features

- Automatic search suggestions for quick browsing
- Automatic light & dark modes
- PR tags, recency and author labels
- Responsive design for mobile and desktop
- Links to GitHub entities (users, repos, PRs)
- Tab view for easy navigation
- AI output streaming for faster responses on low-spec backends

## Deploy it Yourself

Requirements:

- Node.js (latest LTS version recommended)
- pnpm (package manager)

1. Clone this repository.
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Start the development server:
   ```bash
   pnpm run dev
   ```
4. Open your browser and navigate to `http://localhost:80` (or the port shown in your terminal).
