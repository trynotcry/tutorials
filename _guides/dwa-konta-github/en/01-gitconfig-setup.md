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

## 1. Check the exact path of your project folders

Before typing anything into the config, check the **exact, real path** to your `user1` and `user2` folders — a typo or wrong casing is the most common reason `includeIf` fails to fire later.

**Windows (PowerShell)** — go into the folder and print its full path:

```powershell
cd D:\Projects\user1
(Get-Location).Path
```

You'll get something like `D:\Projects\user1`. In the config you'll write this **with `/` instead of `\`** — i.e. `D:/Projects/user1/`. Repeat for `user2`.

**macOS / Linux** — similarly:

```bash
cd ~/Projects/user1
pwd
```

You'll get something like `/Users/yourname/Projects/user1`. You'll paste this path into the config as-is. Repeat for `user2`.

> Save both paths somewhere — you'll need them in the next step, in exactly the form you just saw.

## 2. Open (or create) the main `~/.gitconfig` file

**Windows (PowerShell)** — check your username and open the file in Notepad:

```powershell
echo $env:USERNAME
notepad C:\Users\YOURNAME\.gitconfig
```

If Notepad asks whether to create a new file, say yes — that's normal the first time.

**macOS / Linux** — open the file with `nano`:

```bash
nano ~/.gitconfig
```

## 3. Add the `includeIf` sections

In the open file, add (without deleting anything already there) sections pointing at your folders — use the paths you checked in step 1:

```ini
[includeIf "gitdir:D:/Projects/user1/"]
    path = .gitconfig-user1
[includeIf "gitdir:D:/Projects/user2/"]
    path = .gitconfig-user2
```

On macOS/Linux, similarly, e.g.:

```ini
[includeIf "gitdir:~/Projects/user1/"]
    path = .gitconfig-user1
[includeIf "gitdir:~/Projects/user2/"]
    path = .gitconfig-user2
```

Save the file: in Notepad, Ctrl+S; in `nano`, Ctrl+O, Enter, Ctrl+X.

**Alternative without opening an editor** — append directly from the terminal:

```powershell
# Windows (PowerShell)
Add-Content "C:\Users\YOURNAME\.gitconfig" "`n[includeIf `"gitdir:D:/Projects/user1/`"]`n    path = .gitconfig-user1`n[includeIf `"gitdir:D:/Projects/user2/`"]`n    path = .gitconfig-user2"
```

```bash
# macOS / Linux
cat >> ~/.gitconfig << 'EOF'
[includeIf "gitdir:~/Projects/user1/"]
    path = .gitconfig-user1
[includeIf "gitdir:~/Projects/user2/"]
    path = .gitconfig-user2
EOF
```

**Details that most commonly break this mechanism:**

- The path in `gitdir:` must end with a **trailing slash** `/`.
- The drive letter and casing must match exactly what you saw in step 1 — if the folder is `Projects` and your config says `projects`, `includeIf` may not fire on some systems.
- Relative paths in `path =` (e.g. `.gitconfig-user1`) are resolved relative to the folder containing *this* `.gitconfig` — usually your home directory.
- On Windows, always use `/` in paths, not `\`.

## 4. Create the per-account file

**Windows:**

```powershell
notepad C:\Users\YOURNAME\.gitconfig-user1
```

**macOS / Linux:**

```bash
nano ~/.gitconfig-user1
```

Type in the identity (you'll add the `[core]` section with the SSH key in the next step, once the key exists):

```ini
[user]
    name = User1
    email = user1@example.com
```

Save and close. Repeat the same for `.gitconfig-user2`, swapping in the `user2` details:

```ini
[user]
    name = User2
    email = user2@example.com
```

## 5. Sanity check before moving on

Go into the `user1` project folder and check where Git is pulling the identity from:

```bash
cd D:/Projects/user1/some-project
git config --show-origin --get user.email
```

The result should point to `.gitconfig-user1` and show `user1@example.com`. If it shows something else, the most common cause is a local `.git/config` inside this specific repository, which **always overrides** values from `includeIf`. Check:

```bash
cat .git/config
```

If there's a `[user]` section with the wrong email, remove it:

```bash
git config --local --unset user.email
git config --local --unset user.name
```

> The same can happen with `core.sshCommand` if it was ever set locally in this repo.

Next up — generating SSH keys and adding `core.sshCommand` to the `.gitconfig-userX` files — pick your platform below.
