# Contributing to Rentify

Thank you for your interest in contributing to Rentify! This document provides guidelines and instructions for contributing.

## Development Setup

### Prerequisites

- Node.js >= 18
- pnpm >= 8
- Docker & Docker Compose
- PostgreSQL (or use Docker)

### Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd rentify
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   Edit `.env` with your configuration.

4. **Start PostgreSQL**
   ```bash
   docker-compose up -d postgres
   ```

5. **Run database migrations**
   ```bash
   pnpm db:migrate
   ```

6. **Seed the database (optional)**
   ```bash
   pnpm --filter @rentify/db db:seed
   ```

7. **Start development servers**
   ```bash
   pnpm dev
   ```

## Project Structure

```
rentify/
├── apps/
│   ├── web/          # Next.js frontend
│   └── api/          # NestJS backend
├── packages/
│   ├── db/           # Prisma schema & client
│   ├── types/        # Shared TypeScript types
│   └── utils/        # Shared utilities
```

## Development Workflow

### Making Changes

1. Create a new branch
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes

3. Test your changes
   ```bash
   pnpm lint
   pnpm type-check
   ```

4. Commit your changes
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

### Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

### Code Style

- Use TypeScript for all code
- Follow ESLint and Prettier configurations
- Write meaningful variable and function names
- Add comments for complex logic

### Database Changes

When modifying the database schema:

1. Update `packages/db/schema.prisma`
2. Create a migration:
   ```bash
   pnpm db:migrate
   ```
3. Update seed file if necessary

## Testing

```bash
# Run tests (when implemented)
pnpm test

# Type checking
pnpm type-check

# Linting
pnpm lint
```

## Pull Requests

1. Ensure your code follows the project's coding standards
2. Update documentation if needed
3. Add tests for new features
4. Ensure all tests pass
5. Submit a pull request with a clear description

## Questions?

Feel free to open an issue for any questions or concerns.

