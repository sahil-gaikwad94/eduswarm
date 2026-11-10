import type { TopicLesson } from "../topicLessons.js"; /** * Engineering Foundations — 3 authored topic lessons. * * Standalone chapters per topic. Subject-first prose, foundations, core * concepts, worked examples, exam practice, cheat sheet, recap. No shared * templates, no runtime composition. */
export const engineeringFoundations: Record<string, TopicLesson> = {
  "web-dev-engineering-foundations-git-and-github-workflow": {
    intro: `Git is a distributed version control system in which every clone is a complete repository with full history, and collaborating means exchanging commits between these full copies. The subject is how Git records work (content-addressed snapshots), how branches and merges move freely, how pull requests turn local work into reviewed shared history, and how to resolve the conflicts that inevitably arise. version control is the memory of the project, and it rewards people who understand it with safety and speed.`,
    foundations: `The object model: blobs hold file contents, trees hold directories, commits hold snapshots plus metadata, and refs (branches, tags) point at commits. Every object is named by the hash of its contents, which makes history tamper-evident. The staging area (index) sits between the working tree and history; a commit is a snapshot of the index, not of working files. HEAD identifies your current position; branches are movable pointers; remotes are named references to other copies of the repository. GitHub adds pull requests, review, and CI on top of these primitives.`,
    concepts: [
      {
        title: "The object model: snapshots, not diffs.",
        body: `Git stores snapshots of the whole tree, deduplicated by identity: unchanged files share the same blob objects; changed files get new objects; each commit references the parent commit(s), forming the DAG of history. Because names are content hashes, identical content has the same identity everywhere, which is what enables cheap branching, integrity checking (fsck), and immutable history. Refs are lightweight files containing a hash; updating a branch is just rewriting a small file, which is why creating and deleting branches is instantaneous.`,
      },
      {
        title: "Branching, merging, and fast-forward.",
        body: `A branch is a pointer; creating one is writing one file. When you merge, Git either moves the branch pointer forward (fast-forward, when no divergence exists) or creates a merge commit with two parents. Fast-forward preserves linear history; merge commits preserve branch structure and context. Detached HEAD happens when you check out a commit rather than a branch; work done there lives on a dangling commit until a branch points at it. merge --no-ff forces a merge commit even when fast-forward is possible, which preserves the feature boundary in history.`,
      },
      {
        title: "Rebasing and rewriting history safely.",
        body: `Rebase replays commits on top of a new base, rewriting their hashes. It produces linear, reviewable history, which is why teams rebase feature branches onto main before opening a PR. Interactive rebase (git rebase -i) lets you squash WIP commits, reword messages, reorder, and drop commits. The rule: never rebase commits that others have built on — rewriting shared history forces everyone to reconcile divergent copies. Push --force-with-lease is the safer alternative to --force for updating a branch you know no one else has moved.`,
      },
      {
        title: "Pull requests, review, and merge strategies.",
        body: `A pull request is a proposal: a diff plus conversation, gated by CI. Good PRs are small, self-describing (title and description), and reviewed by someone who understands the area. Merge strategies on GitHub: merge commit (preserves structure), squash (one commit per PR, linear history), rebase and merge (replays commits without a merge commit). Teams pick one strategy and enforce it; the workflow is branch, open PR, pass checks, review, merge, and delete the branch. Squash is the common default for tidy history; merge commits win when the branch history itself carries meaningful structure.`,
      },
      {
        title: "Conflict resolution without drama.",
        body: `Conflicts happen when both sides changed the same lines. Git marks the regions with <<<<<<< HEAD, =======, >>>>>>> branch; you edit the file to the desired result and mark resolved with git add. Rerere (reuse recorded resolution) remembers resolutions and replays them. Prevention beats cure: pull from main frequently, keep PRs small, and avoid parallel formatting sweeps that touch everything. When a conflict is in generated files or lockfiles, prefer the one that reflects the intended dependency set and regenerate rather than hand-merge.`,
      },
    ],
    worked: [
      {
        title: "From zero to merged PR.",
        body: `Create a repo (git init), configure identity, make a commit, create a feature branch (git checkout -b feat/login), implement, commit. Push with -u, open a PR, CI runs, a reviewer comments; address comments, push again (history unchanged). Once approved, squash-merge on GitHub; locally pull main (git switch main; git pull), delete the stale branch (git branch -d feat/login). The cycle is loop: branch, commit small, push, review, merge, clean up.`,
      },
      {
        title: "Squash messy commits before review.",
        body: `You made 9 commits during development, including 4 fixups and typos. Run git rebase -i origin/main; mark the accidental commits as squash (or fixup) into the feature commit; reword the final message; save and close; Git rewrites the range. Force-push the branch (git push --force-with-lease). The PR now shows one clean commit; reviewers review one logical change, not your process.`,
      },
      {
        title: "Recover from work committed to main.",
        body: `You committed to main by mistake instead of a feature branch. Solution: create a branch at the current commit (git branch feat/login), reset main back to origin/main (git reset --hard origin/main), and switch to the feature branch (git switch feat/login). Nothing is lost: the commit moved with the new branch pointer, main is clean, and your work lives safely on the feature branch.`,
      },
    ],
    exam: [
      {
        question: "Why does git rebase -i require force-pushing afterwards?",
        answer:
          "Rebase rewrites commits: each replayed commit gets a new hash. The remote branch still points at the old hashes, so pushing requires updating the remote ref, which Git refuses in the normal push path because it would overwrite someone else-advertised history; --force-with-lease replaces those hashes after verifying no one else pushed meanwhile.",
      },
      {
        question:
          "What is the difference between the staging area (index) and the working tree?",
        answer:
          "The working tree is the files on disk. The index is a snapshot Git has prepared for the next commit; git status shows changes staged (index vs HEAD) and unstaged (working tree vs index). A commit captures exactly the index, which is why partial staging with git add -p exists — you commit selected hunks, not whole files.",
      },
      {
        question:
          "When should a conflict be regenerated instead of hand-merged?",
        answer:
          "When the conflicting file is generated (lockfiles, compiled assets, autogenerated API clients) or when its resolution is mechanically derivable from the resolved sources. Hand-merging generated files produces drift; instead resolve the source inputs and regenerate. For source files, edit carefully and re-review.",
      },
      {
        question: "What does rerere do and why enable it?",
        answer:
          "Rerere records the resolution of a conflict and replays it automatically when the same conflict reappears, which is common during long-lived rebases. Enabling it turns repeated conflicting hunks into a non-event; you still verify the result but avoid resolving the same hunk twice.",
      },
    ],
    cheat: [
      "Object model: blob, tree, commit, tag; refs point at commits; history is a DAG.",
      "Branch = writable ref; HEAD = where you are; Detached HEAD = at a commit.",
      "Merge vs rebase: merge preserves; rebase rewrites for linear history.",
      "Never rebase shared commits; use --force-with-lease for your own.",
      "PRs: small diffs, CI gate, review, squash or merge; delete branch after.",
      "Conflicts: edit markers, git add, rerere for repeats.",
      "Remotes: fetch updates refs; pull = fetch + merge; push -u upstream.",
      "Recovery: reflog is your safety net for lost commits.",
    ],
    recap: `Git is content-addressed snapshot storage forming a DAG of commits; branches and tags are refs; the index stages the next snapshot; merging either fast-forwards or creates a two-parent merge commit; rebase replays commits for linear history; pull requests gate shared work with CI and review; conflicts mark overlapping edits and are resolved by editing markers (or rerere); the reflog makes history recoverable almost always.`,
    code: {
      title: "A safe rebase-and-PR session",
      language: "bash",
      code: `git switch -c feat/report\ngit switch main && git pull\ngit switch feat/report\ngit rebase -i main\ngit push --force-with-lease -u origin feat/report`,
      explanation:
        "Branch from updated main; rebase the feature onto main; update the remote branch safely after history changed.",
    },
    diagram: {
      title: "The pull request loop",
      caption: "Branch, commit, push, PR, review, merge, clean up.",
      mermaid: `flowchart LR\n B[Branch] --> C[Small commits]\n C --> P[Push and PR]\n P --> R[Review and CI]\n R --> M[Merge]\n M --> X[Delete branch]`,
    },
  },
  "web-dev-engineering-foundations-terminal-shell-and-tooling": {
    intro: `The shell is the program that reads typed commands and executes them, wiring together the operating system's tools; fluency with it multiplies every part of your work because every command is composable with pipes and redirections. The subject is the shell's execution model (fork/exec, PATH, exit codes, file descriptors), the filters that turn it into a data-processing engine, remote access with SSH, and the configuration that makes the machine fast to work in. learn the shell once and every other tool becomes easier.`,
    foundations: `A command is parsed into arguments; redirections attach stdin/stdout/stderr to files or pipes; pipes connect stdout of one command to stdin of the next. The shell searches PATH for commands; exit codes (0 success, non-zero failure) drive scripts and CI. Shell startup files (.bashrc, .zshrc, .profile, .zprofile) define environment: PATH, aliases, functions, and prompt. Quoting controls expansion: single quotes are literal, double quotes expand variables, and backslash escapes the next character.`,
    concepts: [
      {
        title: "Navigation and filesystem fluency.",
        body: `pwd prints the working directory; cd moves (absolute paths start at /, relative from cwd, .. is parent, - returns to previous). ls -la shows hidden files and metadata; stat shows all metadata; find locates files by name, type, or mtime; fd is a friendlier finder. du -sh shows directory size; df -h shows free space. Absolute vs relative paths matter in scripts; use absolute paths or script-relative resolution. Symlinks (ln -s) point at files; deleting a symlink does not delete the target. Always know where your downloads and outputs land.`,
      },
      {
        title: "Pipes and filters: the Unix philosophy.",
        body: `Small tools, each doing one thing well, joined by pipes. grep filters by pattern; cut extracts fields; sort sorts; uniq deduplicates (needs sorted input); awk processes fields with a mini language; sed edits with regex; xargs turns lines into arguments; tee writes to file and stdout; wc counts. Compose: history | awk '{print $2}' | sort | uniq -c | sort -nr | head -20 shows your most-used commands. This pattern — collect, transform, reduce — solves a surprising fraction of daily problems without opening a single application.`,
      },
      {
        title: "Environment variables and shell startup.",
        body: `Environment variables configure processes. export VARIABLE=value puts it in the environment for children; env shows all; echo $PATH shows the search path. PATH is colon-separated directories the shell searches in order; earlier entries win, which is how you override tools (put ~/bin first). Shell config: .zshrc for interactive settings, .zprofile for login sessions, .profile for portable sh. Aliases shortcut commands (alias ll='ls -lah'); functions do more. Dotfiles in a git repo let you rebuild your environment anywhere in minutes.`,
      },
      {
        title: "SSH: keys, agents, tunnels.",
        body: `SSH provides encrypted remote shells. Key auth: ssh-keygen -t ed25519; the public key goes to authorized_keys on servers; ssh-agent holds decrypted keys; ssh-add adds them. Config in ~/.ssh/config gives shortcuts (Host short: HostName address, User, AddKeysToAgent). rsync -avz copies with progress and resume; scp is simpler. Port forwarding (-L local:remote:port) and dynamic forwarding (-D) tunnel traffic through the host; jump hosts (ProxyJump) chain connections. SSH keys beat passwords: no phishing, no typing, revocable per key.`,
      },
      {
        title: "Scripting defensively.",
        body: `Scripts encode repeated work. Start with a shebang (#!/usr/bin/env bash) and set -euo pipefail: -e stops on error, -u errors on unset variables, -o pipefail catches failures inside pipelines. Quote variables ("$var") to survive spaces and globs; use local in functions; use [[ ]] for modern comparisons; handle errors with explicit messages to stderr (echo "..." >&2). Prefer portable POSIX where possible; document the script's purpose and required inputs at the top; keep secrets out of the file — pass via env.`,
      },
    ],
    worked: [
      {
        title: "Find and count duplicated files by content.",
        body: `List files, hash them, group by hash: find. -type f -printf '%h %f\n' or, portably, find. -type f -exec sha256sum {} + | sort | awk '{print $1}' | uniq -c | awk '$1 > 1 {print $2}'. The pipeline: gather hashes, sort by hash, count equal hashes, print those appearing more than once. Adapt with cut to drop the filename, then join with find to locate paths. This is the Unix way: no single tool needed to know this, but the pipeline answers it in seconds.`,
      },
      {
        title: "Build a timestamped backup script.",
        body: `Create ~/bin/backup.sh: set -euo pipefail; src="$1"; src must be provided and dest comes second: ts=$(date +%Y%m%d-%H%M%S); tar -czf "$dest/backup-$ts.tar.gz" "$src"; echo "wrote $dest/backup-$ts.tar.gz". Make it executable (chmod +x). Run it with backup.sh ~/projects ~/backups. Schedule with cron or a systemd timer; keep retention by pruning old files with find -mtime +30 -delete. One script, one problem, endlessly reusable.`,
      },
      {
        title: "Diagnose a command not found.",
        body: `command not found means the shell searched PATH and found nothing. Debug sequence: which -a node to see what the shell resolves, type node for the resolved path and kind, echo $PATH to inspect ordering, and ls the candidate directories for the binary. On macOS, Homebrew installs to /opt/homebrew/bin which must be in PATH; on Linux, ensure ~/.local/bin is included in .profile. Fix by exporting PATH in the right startup file and restarting the shell.`,
      },
    ],
    exam: [
      {
        question: "What is the difference between > and | in bash?",
        answer:
          "> redirects stdout to a file, truncating or creating it (>> appends); | connects stdout of one command to stdin of another, both processes run concurrently and the second consumes the first output as it is produced. Redirection talks to files; pipes talk to other processes.",
      },
      {
        question:
          "The pipeline cmd1 | cmd2 exits with code 1, but cmd2 clearly succeeded. Why can this misreport?",
        answer:
          "The pipeline exit code is the exit code of the last command (cmd2) by default in POSIX sh; cmd2 never saw cmd1 fail, so it reports its own status. With pipefail (bash), the pipeline fails if any component fails, which is why set -o pipefail is essential — otherwise a failing first stage is invisible in CI scripts.",
      },
      {
        question:
          "Why do single quotes not allow variable expansion while double quotes do?",
        answer:
          "Single quotes preserve every character literally; the shell does not expand $VAR, globs, or command substitutions inside them. Double quotes preserve most characters but allow variable and command expansion. Use single quotes for literal text (regex patterns), double quotes for values that must expand.",
      },
      {
        question:
          "What does ssh -L 5432:db.internal:5432 user@bastion achieve?",
        answer:
          "It tunnels the local port 5432 on your machine through SSH to port 5432 on db.internal as seen from the bastion host. Local 5432 forwarded to remote 5432 via the bastion; you can then point your local client at localhost:5432, and all traffic flows encrypted through the bastion, which is how you reach private databases from a laptop.",
      },
    ],
    cheat: [
      "PATH order decides which binary runs; earlier wins; ~/bin is the place to put overrides.",
      "Exit codes: 0 success; non-zero failure; pipefail surfaces mid-pipeline failures.",
      "Single quotes literal, double quotes expand, backslash escapes.",
      "Pipes: stdout -> stdin, both run concurrently; tee tees to file and stdout.",
      "find: -name, -mtime, -type, -exec; xargs feeds lines as arguments.",
      "dotfiles in git; .zshrc for interactive, .zprofile for login.",
      "ssh-keygen -t ed25519; ssh-agent; ~/.ssh/config; ProxyJump for chains.",
      "Scripts: shebang, set -euo pipefail, quote variables, local in functions.",
    ],
    recap: `The shell parses commands into arguments, wires stdin/stdout/stderr, and resolves binaries via PATH; composing small tools with pipes builds powerful one-liners; environment variables live in dotfiles and configure behavior; SSH keys, agents, config, and tunneling replace passwords with revocable access; defensive scripts (set -euo pipefail, quoting, stderr messages) turn repeated work into reliable tooling; the reflog habit of "know where everything is" applies to the filesystem too.`,
    code: {
      title: "A minimal defensive script",
      language: "bash",
      code: `#!/usr/bin/env bash\nset -euo pipefail\nsrc="$1"; dest="$2"\nmkdir -p "$dest"\ncp -av "$src" "$dest"`,
      explanation:
        "Shebang picks the interpreter; pipefail catches failures inside the pipeline; variables are quoted so paths with spaces survive; the script dies on the first error instead of producing half-copied output.",
    },
    diagram: {
      title: "How a command reaches output",
      caption: "Parse, resolve via PATH, fork/exec, wire descriptors.",
      mermaid: `flowchart LR\n C[Command line] --> P[Parse and expand]\n P --> R[Resolve via PATH]\n R --> F[fork and exec]\n F --> D[stdin stdout stderr to pipe or file]`,
    },
  },
  "web-dev-engineering-foundations-package-managers-and-dependency-hygiene": {
    intro: `A package manager is the tool that installs, upgrades, and tracks third-party libraries, turning declared intent in package.json into a working node_modules with a lockfile pinning every transitive version. The subject is how npm resolves and installs dependencies, what lockfiles guarantee, how semantic versioning signals compatibility, and how to keep a dependency set small, audited, and current without breaking the project. dependency management is where reproducibility and supply-chain risk meet, and hygiene here pays for itself.`,
    foundations: `package.json declares name, version, scripts, and dependencies (runtime) vs devDependencies (build and test only). npm resolves the version range to exact versions, writes package-lock.json with integrity hashes, and installs into node_modules (hoisted by default). Lockfiles must be committed; CI uses npm ci, which installs exactly the lockfile or fails. Semantic versioning: MAJOR.MINOR.PATCH; caret (^) allows minor and patch upgrades, tilde (~) allows patch only; pre-release versions sort before release versions.`,
    concepts: [
      {
        title: "How npm resolves and installs.",
        body: `npm reads package.json, computes the dependency graph (your direct deps, their deps, and so on), picks versions satisfying all ranges (nearest feasible), downloads tarballs from the registry, and records exact versions plus integrity (SHA-512) hashes in package-lock.json. node_modules is hoisted so nested copies dedupe where possible; conflicting versions nest under the dependent. npm ci bypasses resolution entirely and installs the lockfile verbatim — this is what CI must use to guarantee the same tree every time. Never commit node_modules.`,
      },
      {
        title: "The lockfile is the contract.",
        body: `package-lock.json is the reproducibility contract: exact versions, integrity hashes, resolved URLs. Commit it. Without it, two installs on different days can yield different trees — a classic source of "works on my machine". CI failures from lock drift mean package.json and lock disagree; fix with npm install (regenerate) or by reverting the bad edit. Review lockfile diffs like code: a suspicious new transitive dependency in a PR deserves scrutiny.`,
      },
      {
        title: "Semantic versioning and ranges.",
        body: `MAJOR: breaking changes; MINOR: new features, backward compatible; PATCH: bug fixes. ^1.2.3 allows >=1.2.3 <2.0.0 (minor and patch); ~1.2.3 allows >=1.2.3 <1.3.0 (patch only); exact pins (1.2.3) and ranges like >=1.2.3 <2 are possible. Pre-releases (-rc.1) are excluded from ranges unless explicitly allowed. Pinning exact versions trades ease of updates for determinism; letting minors flow keeps you current but relies on publishers honoring semver — most do, not all, which is why reviewing upgrade diffs in CI matters.`,
      },
      {
        title: "npm workspaces and monorepos.",
        body: `Workspaces let one root package.json manage many packages: declare "workspaces": ["packages/*"], and npm hoists shared dependencies, symlinks packages to each other, and runs scripts across all (-ws) or one (--workspace). This kills the copy-paste-share problem: shared config and types live in a workspace package, and apps import it as a normal dependency. Monorepo tools (turborepo, nx) add caching and task orchestration on top, but plain npm workspaces are the foundation.`,
      },
      {
        title: "Supply-chain risk and audits.",
        body: `npm audit compares your tree against the advisory database and reports known vulnerabilities; npm outdated lists stale packages. Supply-chain hygiene: minimize dependencies (each dep is attack surface), pin and review updates, prefer well-maintained packages (recent releases, real issue tracking), avoid packages with install scripts unless trusted, and keep engines declared. CI should run npm audit --audit-level=high and fail on critical advisories; consider npm ci with a checked-in lockfile so CI installs are identical to what you tested locally.`,
      },
    ],
    worked: [
      {
        title: "Repair a lockfile that fails npm ci in CI.",
        body: `CI fails: "npm ci can only install packages when your package.json and package-lock.json are in sync". Diagnosis: someone edits package.json (added a dependency or changed a range) without regenerating the lockfile. Fix: run npm install locally to regenerate the lockfile, commit both together, and push; CI now installs the exact recorded tree. Add a CI check that fails the build if the lockfile is outdated (npm ci catches it), preventing recurrence.`,
      },
      {
        title: "Upgrade a dependency across a major version safely.",
        body: `Your router major bump broke two routes. Workflow: read the changelog and migration guide; bump in a branch; run the full test suite and manual smoke test of critical flows; fix breakage; open a PR labeled with the migration notes; deploy behind a flag if the surface is large; monitor error rates post-release. Never upgrade blindly: major versions exist to signal breakage. Keep changes small — one dependency per PR — so failures are attributable.`,
      },
      {
        title: "Audit and slim a fresh repository.",
        body: `Fresh project: run npm install, then npm audit (fixable items with npm audit fix, carefully reviewed), then npm outdated. Remove unused deps detected by depcheck (or by grep of imports): e.g., drop a 3MB library used once. Add .npmrc with save-exact=true if the team prefers pinned installs, set engines.node, and wire npm run lint and npm test into CI. The project now ships a smaller tree with known history of what changed and why.`,
      },
    ],
    exam: [
      {
        question: "Why does CI use npm ci instead of npm install?",
        answer:
          "npm ci installs exactly what the lockfile records and refuses to run if package.json and the lockfile disagree; it also deletes node_modules first for a clean install. npm install may silently update the lockfile and resolve versions differently, which means CI could test a tree that differs from what developers run.",
      },
      {
        question: "What is the difference between ^1.2.3 and ~1.2.3?",
        answer:
          "^1.2.3 permits any version >=1.2.3 <2.0.0 (minor and patch); ~1.2.3 permits >=1.2.3 <1.3.0 (patch only). Use ~ when you want only bug fixes; use ^ when you trust the publisher to keep minor releases backward compatible; pin exact versions when you need absolute determinism.",
      },
      {
        question: "Why must package-lock.json be committed to git?",
        answer:
          "It is the shared record of exactly which versions every environment installs, with integrity hashes; without it, installs on different days resolve differently, breaking reproducibility and silently changing behavior, including security-relevant code, between CI runs and production deploys.",
      },
      {
        question:
          "npm audit reports a high-severity vulnerability in a transitive dependency. What are your options?",
        answer:
          "First check what it is and whether the vulnerable code path is reachable in your usage; check if a fixed version exists and upgrade the direct dependency that pulls it; if none exists, consider npm overrides (npm overrides field) to force the patched transitive version, replace the dependency, or accept the risk with a documented decision; never blindly audit-fix major bumps that break tests.",
      },
    ],
    cheat: [
      "package.json declares; package-lock.json pins; commit both.",
      "CI uses npm ci; npm install may rewrite the lockfile.",
      "^ = minor+patch, ~ = patch only; majors signal breaking changes.",
      "node_modules is hoisted; conflicting versions nest.",
      "npm audit fix reviews advisories; overrides pin transitive deps.",
      "depcheck finds unused deps; remove them to shrink attack surface.",
      'workspaces: root "workspaces" array, hoisted shared deps, linked packages.',
      "engines field declares the required Node version; .npmrc sets project policy.",
    ],
    recap: `npm resolves declared ranges to exact versions, records them in a committed lockfile with integrity hashes, and installs trees into hoisted node_modules; npm ci enforces the lockfile in CI; semver ranges (^, ~) express how much drift you accept and majors tell you when that drift can break; workspaces manage monorepos; audits, minimalism, and review of lockfile diffs keep the supply chain lean and honest.`,
    code: {
      title: "package.json with engines and pinned scripts",
      language: "json",
      code: `{\n "name": "app",\n "version": "1.0.0",\n "engines": { "node": ">=20" },\n "scripts": { "dev": "vite", "test": "vitest run" }\n}`,
      explanation:
        "engines declares the runtime contract; scripts are the project interface; dependencies list runtime needs, devDependencies everything needed only to build and test.",
    },
    diagram: {
      title: "Install flow",
      caption: "Manifest to lockfile to tree.",
      mermaid: `flowchart LR\n PJ[package.json] --> R[Resolve versions]\n R --> L[package-lock.json]\n L --> N[node_modules]\n N --> A[npm audit check]`,
    },
  },
};
