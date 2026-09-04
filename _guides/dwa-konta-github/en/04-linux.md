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

> The key file name and the "Title" label on GitHub are arbitrary. What must match exactly is the public key contents and which account you add it to. More in the "How it works" step.

## 3. Wire the keys into `.gitconfig-userX`

This is the file you created in step 1 of the tutorial (e.g. `~/.gitconfig-user1`). Now you add a `[core]` section to it pointing at a specific key.

**Open the file with the `nano` terminal editor** (if you prefer `vim` or something else, use that instead):

```bash
nano ~/.gitconfig-user1
```

If the file already exists from step 1 (with a `[user]` section), you'll see its content. Move to the end of the file and add the new section. **The whole file should look like this:**

```ini
[user]
    name = User1
    email = user1@example.com
[core]
    sshCommand = "ssh -i ~/.ssh/id_ed25519_user1 -o IdentitiesOnly=yes"
```

Save and exit `nano`: **Ctrl+O** (write out), Enter (confirm the file name), **Ctrl+X** (exit). Repeat the same for `.gitconfig-user2`, swapping `user1` for `user2` in both places (the file name and the key path inside `sshCommand`).

**Alternative without opening an editor** — append the section directly from the terminal:

```bash
cat >> ~/.gitconfig-user1 << 'EOF'
[core]
    sshCommand = "ssh -i ~/.ssh/id_ed25519_user1 -o IdentitiesOnly=yes"
EOF
```

This appends the `[core]` section to the end of the file without touching what's already there. Verify:

```bash
cat ~/.gitconfig-user1
```

You should see both the `[user]` and `[core]` sections, one after the other.

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
