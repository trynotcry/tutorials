---
topic: dwa-konta-github
topic_title: "Two GitHub accounts, one computer"
topic_dek: "Configure git and SSH so every push lands on the right account automatically — no re-login required."
lang: en
order: 6
id: "006"
title: "A new repository and a new device"
dek: "How to start a repo from scratch, connect to an existing one on a new machine, and pull the latest data."
tags: ["workflow"]
---

This step assumes you already have an account configured (SSH key + `.gitconfig-userX`) following the earlier steps in this tutorial. Below are three separate scenarios — pick the one you need.

## A. A brand-new repository from scratch

**1. Create an empty repository on GitHub**, on the `user1` account (the **New repository** button — **don't** check "Initialize with README", to avoid a conflict on the first push). Copy the SSH address GitHub shows on the next screen — it looks like `git@github.com:user1/repo-name.git`.

**2. Create the project folder in the right place** (i.e. wherever you have `includeIf` configured for `user1`):

```bash
cd D:/Projects/user1
mkdir repo-name
cd repo-name
```

**3. Initialize the repository locally:**

```bash
git init
```

**4. Check that Git actually sees the `user1` identity** (thanks to `includeIf` from the earlier steps):

```bash
git config --show-origin --get user.email
```

It should show `user1@example.com` from `.gitconfig-user1`. If it shows something else, go back to the "Configuring .gitconfig" step before continuing.

**5. Wire up the remote (the address you copied in step 1) and make your first commit:**

```bash
git remote add origin git@github.com:user1/repo-name.git
echo "# Project name" > README.md
git add README.md
git commit -m "Initial commit"
```

**6. Push to GitHub:**

```bash
git branch -M main
git push -u origin main
```

The `-u` flag remembers the link between your local `main` branch and the remote one — from now on, plain `git push` is enough.

## B. Connecting to an existing repo on a new device

We're assuming that on the new machine you go through steps 1–2 of this tutorial **from scratch** (a new SSH key pair, a new `.gitconfig`, `includeIf`, adding the public key to GitHub) — SSH keys don't "carry over" by themselves; you either copy them securely from the old machine, or (simpler and safer) generate a fresh pair and add it as another key on the same GitHub account.

**1. Confirm the setup works** before attempting to clone:

```bash
ssh -T -i path/to/key -o IdentitiesOnly=yes git@github.com
```

It should show `Hi user1!`.

**2. Clone the repository into the right folder** (the one that has `includeIf` configured):

```bash
cd D:/Projects/user1
git clone git@github.com:user1/repo-name.git
```

Git will use SSH right away (since the URL starts with `git@github.com:`), so it'll land on the correct account automatically — as long as the key for that folder is already wired up in `core.sshCommand`.

**3. Check the identity in the freshly cloned repo:**

```bash
cd repo-name
git config --show-origin --get user.email
```

## C. Pulling the latest changes (an existing, already cloned folder)

If you already have the repo locally and want to fetch changes someone (or you, from another device) pushed in the meantime:

```bash
cd D:/Projects/user1/repo-name
git pull
```

`git pull` is really `git fetch` (download changes from GitHub) plus `git merge` (blend them into your local branch) in one command. If you'd rather see what changed before merging it into your work:

```bash
git fetch
git log HEAD..origin/main --oneline
```

This second command lists the commits that exist on GitHub but not yet locally, without pulling them into your current branch.

> If `git pull` reports a conflict with your uncommitted changes, run `git status` first to see what's unsaved, then either `git stash` (set your changes aside) or `git commit` (save them) before trying again.
