---
topic: dwa-konta-github
topic_title: "Two GitHub accounts, one computer"
topic_dek: "Configure git and SSH so every push lands on the right account automatically — no re-login required."
lang: en
order: 3
id: "003"
title: "macOS: SSH keys and Keychain"
dek: "macOS's ssh-agent remembers the passphrase in Keychain — one flag and reboots stop being a problem."
tags: ["macOS"]
---

## 1. Generate two SSH keys

In Terminal:

```bash
ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519_user1 -C "user1@example.com"
ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519_user2 -C "user2@example.com"
```

Set a passphrase for each key — on macOS, "don't ask every time" is built in and more convenient than on Windows (see step 6).

## 2. Add the public keys to GitHub

```bash
cat ~/.ssh/id_ed25519_user1.pub | pbcopy
```

Paste it under **Settings → SSH and GPG keys** on the `user1` account. Repeat for `user2`.

## 3. Wire the keys into `.gitconfig-userX`

This is the file you created in step 1 of the tutorial (in your home directory, `~`, e.g. `/Users/yourname/.gitconfig-user1`). Now you add a `[core]` section to it pointing at a specific key.

**Open the file with the `nano` terminal editor** (simpler than `vim` for beginners):

```bash
nano ~/.gitconfig-user1
```

If the file already exists from step 1 (with a `[user]` section), you'll see its content. Use the arrow keys to move to the end of the file and add the new section. **The whole file should look like this:**

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

Paths starting with `~` generally work fine in `core.sshCommand` on macOS/Linux (unlike Windows, where it's safer to give the full path).

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

macOS has built-in `ssh-agent` integration with **Keychain**. Add an entry to `~/.ssh/config`:

```
Host github.com-user1
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_user1
    UseKeychain yes
    AddKeysToAgent yes

Host github.com-user2
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_user2
    UseKeychain yes
    AddKeysToAgent yes
```

`UseKeychain yes` plus `AddKeysToAgent yes` means that after entering the passphrase once during the first `ssh-add`, it's stored in Keychain and **survives a reboot** — unlike on Windows.

Add the keys once:

```bash
ssh-add --apple-use-keychain ~/.ssh/id_ed25519_user1
ssh-add --apple-use-keychain ~/.ssh/id_ed25519_user2
```

Check:

```bash
ssh-add -l
```

> If you use `Host github.com-userX` aliases from `~/.ssh/config` **together** with `core.sshCommand` in gitconfig, pick one mechanism so they don't fight each other. `core.sshCommand` alone (step 1 of the tutorial), without aliases in `~/.ssh/config`, is easier to maintain. If you prefer aliases instead, in `.gitconfig-userX` skip `core.sshCommand` and just point the remote at `git@github.com-user1:user1/repo.git`.

## Note: Apple's Git vs Homebrew Git

macOS ships with Apple's Git (Xcode Command Line Tools) by default. If you've also installed Git via Homebrew, check which one is active:

```bash
which git
git --version
```

`includeIf` behaves identically in both, but it's worth knowing which install you're using when something doesn't behave as expected.
