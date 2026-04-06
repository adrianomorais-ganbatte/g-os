# G-OS (Gemini AI Operational System) — CLI Installation Guide

G-OS is a modern operational framework designed for **design-to-code**, delivery squads, and automated sprint synchronization with ClickUp. Built upon the `.a8z-OS` architecture, it integrates Figma, ClickUp, and 7 primary IDEs (Claude Code, Cursor, Gemini, etc.) into a seamless workspace.

---

## 🛠 Prerequisites

Before starting, ensure you have the following installed:

- **Node.js**: Version 18 or higher.
- **Git**: Properly configured for repository management.

---

## 🚀 Quick Start (Installation)

There are two main ways to set up G-OS in your project:

### Method A: Direct Installation (Recommended)
Use `npx` to install the framework directly into an existing or new project directory. This is the fastest way to get the latest version.

```bash
npx g-os install
```

### Method B: Repository Clone
Ideal for framework developers or those who want to maintain a separate fork.

```bash
git clone https://github.com/adrianomorais-ganbatte/g-os.git my-workspace
cd my-workspace
node scripts/cli/gos-cli.js init
```

> [!NOTE]
> **Install vs Init**: The `install` command copies the framework files into your current directory and then triggers `init`. The `init` command only performs the configuration (remotes, directories) and expects the files to already be present.

### 3. Register the Global CLI (Optional)
To use the `gos` command from any directory within the workspace, link the package globally:

```bash
npm link
```

Now you can use `gos <command>` instead of the full script path.

---

## 💻 CLI Commands Registry

The `gos` CLI utility handles the workspace lifecycle:

| Command | Description | Flags |
| :--- | :--- | :--- |
| `gos init` | Mandatory setup. Renames remotes and creates directories. | `--force`: Re-run on already initialized workspaces. |
| `gos update` | Fetches framework updates from `upstream/main` and merges them. | `--no-stash`: Skip the automatic git stash process. |
| `gos doctor` | Diagnostic tool to check workspace health and IDE compatibility. | — |
| `gos version` | Displays the current G-OS version and checks for updates. | — |

---

## 📦 Workspace Architecture

After `gos init`, your workspace will be structured as follows:

```text
my-workspace/
├── .gos-local/       # Local temporary files (worktrees, task-queue, logs)
├── agents/           # Canonical AI agent profiles (.md)
├── scripts/          # CLI core and integration tools
├── skills/           # Pluggable AI capabilities organized by intent
├── squads/           # Workflow and delivery squad definitions
├── packages/         # Your actual software projects reside here
└── manifests/        # Runtime configuration for IDE adapters
```

---

## 🔄 Updating the Framework

G-OS is an evolving system. To stay up to date with the latest skills and agents, run:

```bash
npm run gos:update
# or
gos update
```

This will automatically:
1. Stash your local changes.
2. Fetch `upstream/main`.
3. Merge framework files (auto-resolving framework path conflicts).
4. Synchronize IDE adapters.
5. Pop your stash back.

---

## 🧭 Next Steps

1. **Configure Your Project Remote**:
   ```bash
   git remote add origin <your-git-repo-url>
   ```
2. **Start Developing**: Create new projects inside the `packages/` directory.
3. **Sync IDEs**: If you manually modify agents or skills, ensure your IDEs are synchronized with:
   ```bash
   npm run sync:ides
   ```

---

> [!IMPORTANT]
> The G-OS CLI uses native Node.js modules only—no external dependencies required. This makes it light and portable.
