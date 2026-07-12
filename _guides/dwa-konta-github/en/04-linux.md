---
topic: dwa-konta-github
topic_title: "Two GitHub accounts, one computer"
topic_dek: "Configure git and SSH so every push lands on the right account automatically — no re-login required."
lang: en
order: 4
id: "004"
title: "Linux: SSH keys and the agent"
dek: "ssh-agent started by your desktop environment, or manually in the shell."
tags: ["Linux"]
---

## 1. Generate two SSH keys

```bash
ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519_user1 -C "user1@example.com"
ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519_user2 -C "user2@example.com"
```

## 2. Add the public keys to GitHub

```bash
cat ~/.ssh/id_ed25519_user1.pub
```

Copy the output and paste it under **Settings → SSH and GPG keys** on the `user1` account. Repeat for `user2`. (If you have `xclip`: `xclip -sel clip < ~/.ssh/id_ed25519_user1.pub`)

## 3. Wire the keys into `.gitconfig-userX`

```ini
[core]
    sshCommand = "ssh -i ~/.ssh/id_ed25519_user1 -o IdentitiesOnly=yes"
```

## 4. Switch the repository remote to SSH

```bash
git remote set-url origin git@github.com:user1/repo-name.git
git remote -v
```

## 5. Test the connection

```bash
ssh -T -i ~/.ssh/id_ed25519_user1 -o IdentitiesOnly=yes git@github.com
```

You should see `Hi user1! You've successfully authenticated...`.

## 6. Skip typing the passphrase on every push

Most desktop distros (GNOME, KDE) start `ssh-agent` automatically at login and integrate it with the system's keyring (e.g. GNOME Keyring), so a single `ssh-add` is enough and the passphrase survives future logins.

Add the keys to the agent:

```bash
eval "$(ssh-agent -s)"   # only if the agent isn't already running
ssh-add ~/.ssh/id_ed25519_user1
ssh-add ~/.ssh/id_ed25519_user2
```

Check:

```bash
ssh-add -l
```

**On systems without keyring integration** (minimal installs, WSL, headless servers) an `ssh-agent` started with `eval "$(ssh-agent -s)"` only lives for the current terminal/shell session. To avoid starting it manually every time, add this to `~/.bashrc` or `~/.zshrc`:

```bash
if [ -z "$SSH_AUTH_SOCK" ]; then
  eval "$(ssh-agent -s)" > /dev/null
  ssh-add ~/.ssh/id_ed25519_user1 2>/dev/null
  ssh-add ~/.ssh/id_ed25519_user2 2>/dev/null
fi
```

This will still prompt for the passphrase on every fresh system login — that's expected, unless you drop the passphrase from the key entirely (see the security trade-off note in the Windows guide).

## WSL (Windows Subsystem for Linux)

If you're working inside WSL, remember it's a **separate SSH environment** from Windows — keys, `~/.gitconfig`, and `ssh-agent` inside WSL are independent from the ones in PowerShell. Stick to one environment (either WSL or Windows) per repository to avoid mixing keys and configs.
