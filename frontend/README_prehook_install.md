# Pre-commit Hook Setup

We are using **Lefthook** to manage pre-commit hooks in this project. Lefthook is newer, smaller, supports parallelization, and has been configured to run Biome for linting and formatting.

### Installation Steps

1. Install the project dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

2. Install Lefthook hooks on your local machine:
   ```bash
   lefthook install
   ```

### Important Notes

- **Lefthook** manages the hooks for this project, so make sure to run `lefthook install` after cloning the repository, as the `.git` folder is not tracked by Git.
- **Biome** is used for both linting and formatting, and although it lacks some of the rules from ESLint, it should meet our current needs.

