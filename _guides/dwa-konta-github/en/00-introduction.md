---
topic: dwa-konta-github
topic_title: "Two GitHub accounts, one computer"
topic_dek: "Configure git and SSH so every push lands on the right account automatically — no re-login required."
lang: en
order: 0
id: "000"
title: "How it works"
dek: "The mechanism: includeIf in gitconfig, plus a separate SSH key per folder."
tags: ["concept"]
---

## The problem

You have two GitHub accounts (`user1`, `user2`) and two project folders on the same machine, e.g.:

```
D:\Projects\user1\
D:\Projects\user2\
```

> The drive letter (`D:`, `G:`, `C:`...) doesn't matter — it's just an example. The whole mechanism relies on the **folder path**, not a specific drive. Use your own letter and folder layout, substituting it consistently in the steps below.

You want `git push` from the `user1` folder to always go to the `user1` account, and pushes from `user2` to go to `user2` — **without manually switching accounts** in the browser or in your editor.

## Why `.gitconfig` alone isn't enough

`.gitconfig` with `includeIf` only sets the **identity** attached to commits (`user.name`, `user.email`) — who shows up as the author. It does not set the **credentials** used when pushing. If you sign in over HTTPS (e.g. through the GitHub extension in VS Code), Git will keep using one cached OAuth token regardless of what `user.email` your config says.

## The fix: SSH + a separate key per folder

Instead of HTTPS, we use SSH. Each GitHub account gets its own SSH key pair, and Git — based on the folder you're working in — automatically picks the right key for every connection to GitHub.

The mechanism has three layers:

1. **`includeIf "gitdir:..."`** in the main `~/.gitconfig` — tells Git "if you're working inside this folder, also load this extra config file".
2. **A separate config file per account** (`.gitconfig-user1`, `.gitconfig-user2`) — sets `user.name`, `user.email`, **and** `core.sshCommand` pointing at a specific SSH key.
3. **The repository remote in SSH form** (`git@github.com:user/repo.git`) — so Git actually uses SSH instead of HTTPS.

End result: you `cd` into a folder, run `git push`, and Git silently picks the right key and the right identity — automatically.

> The following pages walk through this step by step for Windows, macOS, and Linux. Steps 1–2 (generating keys, configuring gitconfig) are identical on every system — only file locations and how you run the SSH agent differ.
