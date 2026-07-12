---
topic: dwa-konta-github
topic_title: "Two GitHub accounts, one computer"
topic_dek: "Configure git and SSH so every push lands on the right account automatically — no re-login required."
lang: en
order: 1
id: "001"
title: "Configuring .gitconfig"
dek: "This step is identical on Windows, macOS, and Linux."
tags: ["all platforms"]
---

## 1. The main `~/.gitconfig` file

Find or create `~/.gitconfig` (on Windows that's usually `C:\Users\YOURNAME\.gitconfig`) and add `includeIf` sections pointing at your project folders. Substitute your own drive letter and path:

```ini
[includeIf "gitdir:D:/Projects/user1/"]
    path = .gitconfig-user1
[includeIf "gitdir:D:/Projects/user2/"]
    path = .gitconfig-user2
```

On macOS/Linux the paths look similar, e.g.:

```ini
[includeIf "gitdir:~/Projects/user1/"]
    path = .gitconfig-user1
[includeIf "gitdir:~/Projects/user2/"]
    path = .gitconfig-user2
```

**Details that most commonly break this mechanism:**

- The path in `gitdir:` must end with a **trailing slash** `/`.
- The drive letter and casing must match your actual folder layout exactly — if the folder is `Projects` and your config says `projects`, `includeIf` may not fire on some systems.
- Relative paths in `path =` (e.g. `.gitconfig-user1`) are resolved relative to the folder containing *this* `.gitconfig` — usually your home directory.
- On Windows, use `/` in paths, not `\`.

## 2. Per-account config files

Create `~/.gitconfig-user1`:

```ini
[user]
    name = User1
    email = user1@example.com
[core]
    sshCommand = "ssh -i ~/.ssh/id_ed25519_user1 -o IdentitiesOnly=yes"
```

And similarly `~/.gitconfig-user2`:

```ini
[user]
    name = User2
    email = user2@example.com
[core]
    sshCommand = "ssh -i ~/.ssh/id_ed25519_user2 -o IdentitiesOnly=yes"
```

On Windows, give `sshCommand` the full path with slashes, e.g. `C:/Users/YOURNAME/.ssh/id_ed25519_user1`.

The `-o IdentitiesOnly=yes` flag matters — without it, the SSH agent may try a different key before reaching for the one explicitly given.

## 3. Sanity check before moving on

Go into the `user1` project folder and check where Git is pulling the identity from:

```bash
cd D:/Projects/user1/some-project
git config --show-origin --get user.email
git config --show-origin --get core.sshCommand
```

Both should point to `.gitconfig-user1`. If they show something else, the most common cause is a local `.git/config` inside this specific repository, which **always overrides** values from `includeIf`. Check:

```bash
cat .git/config
```

If there's a `[user]` section with the wrong email, remove it:

```bash
git config --local --unset user.email
git config --local --unset user.name
```

> The same can happen with `core.sshCommand` if it was ever set locally in this repo.

Next up — generating SSH keys and configuring the agent — pick your platform below.
