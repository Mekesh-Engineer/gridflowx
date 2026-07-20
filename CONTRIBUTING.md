# Contributing to GridFlowX

Thank you for your interest in contributing to **GridFlowX**! This guide will help you get up and running quickly.

---

## Prerequisites

Before contributing, ensure you have the following installed:

- **Node.js** >= 20 ([Download](https://nodejs.org/))
- **Python** >= 3.11 ([Download](https://www.python.org/))
- **Firebase CLI** — `npm install -g firebase-tools`
- **Git** >= 2.40

---

## Getting Started

### 1. Fork & Clone

```bash
# Fork the repository on GitHub, then clone your fork:
git clone https://github.com/YOUR_USERNAME/gridflowx.git
cd gridflowx
```

### 2. Install Dependencies

```bash
# Install Node.js dependencies
npm install

# Install Python dependencies (for the AI microservice)
pip install -r ai/requirements.txt
```

### 3. Configure Environment

```bash
# Copy the environment example file
cp .env.example .env.local

# Fill in your Firebase credentials and API keys in .env.local
# Never commit .env.local — it is gitignored
```

### 4. Run the Development Servers

```bash
# Terminal 1 — Next.js frontend (http://localhost:3000)
npm run dev

# Terminal 2 — FastAPI AI microservice (http://localhost:8000)
npm run ai:dev
```

---

## Branch Naming Conventions

Use descriptive branch names following this pattern:

| Prefix | Purpose | Example |
|--------|---------|---------|
| `feature/` | New features | `feature/relay-scheduling` |
| `fix/` | Bug fixes | `fix/websocket-reconnect` |
| `docs/` | Documentation only | `docs/update-readme` |
| `chore/` | Maintenance tasks | `chore/upgrade-dependencies` |
| `refactor/` | Code refactoring | `refactor/auth-hooks` |

---

## Making Changes

1. Create a branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes, ensuring:
   - Code is linted: `npm run lint`
   - The app builds: `npm run build`
   - No secrets are committed (check `.env.local` is gitignored)

3. Commit with a clear, descriptive message:
   ```bash
   git commit -m "feat: add relay scheduling to dashboard"
   ```

---

## Pull Request Checklist

Before opening a pull request, confirm the following:

- [ ] My branch is up to date with `main`
- [ ] `npm run lint` passes with no errors
- [ ] `npm run build` completes successfully
- [ ] I have not committed any `.env` files or API keys
- [ ] I have updated relevant documentation if my changes affect behaviour
- [ ] My PR description clearly explains what changed and why

---

## Code Style

- **TypeScript**: Strict mode is enabled. Avoid `any` types where possible.
- **Python**: Follow [PEP 8](https://peps.python.org/pep-0008/). Use type hints on all function signatures.
- **Commits**: Use [Conventional Commits](https://www.conventionalcommits.org/) format (`feat:`, `fix:`, `docs:`, `chore:`, etc.).

---

## Reporting Issues

Found a bug or want to request a feature? [Open an issue](../../issues/new) and include:
- Steps to reproduce (for bugs)
- Expected vs. actual behaviour
- Environment details (OS, Node version, Python version)

---

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.
