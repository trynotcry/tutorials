---
topic: dwa-konta-github
topic_title: "Two GitHub accounts, one computer"
topic_dek: "Configure git and SSH so every push lands on the right account automatically — no re-login required."
lang: en
order: 2
id: "002"
title: "Windows: SSH keys and the agent"
dek: "PowerShell, OpenSSH, Credential Manager, and the 32-bit vs 64-bit trap."
tags: ["Windows"]
---

## 1. Generate two SSH keys

In PowerShell or Git Bash:

```bash
ssh-keygen -t ed25519 -f C:/Users/YOURNAME/.ssh/id_ed25519_user1 -C "user1@example.com"
ssh-keygen -t ed25519 -f C:/Users/YOURNAME/.ssh/id_ed25519_user2 -C "user2@example.com"
```

You can set a passphrase during generation (recommended) — see the section below for not having to type it every time.

## 2. Add the public keys to GitHub

Add the contents of `id_ed25519_user1.pub` and `id_ed25519_user2.pub` under **Settings → SSH and GPG keys** on the matching GitHub accounts — each key on a different account.

## 3. Wire the keys into `.gitconfig-userX`

This is the file you created in step 1 of the tutorial. Now you add a `[core]` section to it pointing at a specific key.

**Find your Windows username** (you'll need it in the paths below):

```powershell
echo $env:USERNAME
```

**Open the file in Notepad** (replace `YOURNAME` with the result above):

```powershell
notepad C:\Users\YOURNAME\.gitconfig-user1
```

If Notepad asks "do you want to create a new file?" — that means the file doesn't exist yet; say yes, that's normal. If it already exists from step 1 (with a `[user]` section), Notepad will just open it with the existing content.

**The whole file should look like this** (if `[user]` is already there, just add the missing `[core]` part below it — don't delete `[user]`):

```ini
[user]
    name = User1
    email = user1@example.com
[core]
    sshCommand = "ssh -i C:/Users/YOURNAME/.ssh/id_ed25519_user1 -o IdentitiesOnly=yes"
```

Save the file (Ctrl+S) and close Notepad. Repeat the same for `.gitconfig-user2`, swapping `user1` for `user2` in both places (the file name and the key path inside `sshCommand`).

**Alternative without opening an editor** — append the section directly from the terminal (PowerShell):

```powershell
Add-Content "C:\Users\YOURNAME\.gitconfig-user1" "`n[core]`n    sshCommand = `"ssh -i C:/Users/YOURNAME/.ssh/id_ed25519_user1 -o IdentitiesOnly=yes`""
```

This appends the `[core]` section to the end of the file without touching what's already there. Verify:

```powershell
type C:\Users\YOURNAME\.gitconfig-user1
```

You should see both the `[user]` and `[core]` sections, one after the other.

## 4. Switch the repository remote to SSH

```bash
git remote set-url origin git@github.com:user1/repo-name.git
git remote -v
```

If the remote still starts with `https://`, that's usually why pushes go to whichever account you're logged into in the browser/VS Code, rather than the one your SSH key points at.

## 5. Test the connection

```bash
ssh -T -i C:/Users/YOURNAME/.ssh/id_ed25519_user1 -o IdentitiesOnly=yes git@github.com
```

You should see `Hi user1! You've successfully authenticated...`. Repeat for `user2`.

## 6. Skip typing the passphrase on every push

Windows ships with the **OpenSSH Authentication Agent** service, but it's disabled by default.

**a) Enable the service and set it to autostart** (PowerShell **as Administrator**):

```powershell
Set-Service -Name ssh-agent -StartupType Automatic
Start-Service ssh-agent
Get-Service ssh-agent
```

Status should show `Running`.

**b) Add both keys to the agent:**

```powershell
ssh-add C:/Users/YOURNAME/.ssh/id_ed25519_user1
ssh-add C:/Users/YOURNAME/.ssh/id_ed25519_user2
```

Each one will prompt for the passphrase once — after that, the key sits in the agent's memory for the rest of the Windows session.

Check:

```powershell
ssh-add -l
```

> **32-bit vs 64-bit trap:** if `ssh-add` reports `The term 'ssh-add' is not recognized`, even though `C:\Windows\System32\OpenSSH\ssh-add.exe` physically exists — you're most likely running the **32-bit (x86) PowerShell**. WOW64 silently redirects `System32` to `SysWOW64`, where that folder doesn't exist. Check `[Environment]::Is64BitProcess` (should be `True`). Open a regular 64-bit PowerShell (no `(x86)` suffix in the Start menu entry) and try again.

**c) Keep in mind:** keys added via `ssh-add` **disappear after a reboot** — you'll need to add them again (once, one command per key).

## Alternatives if you'd rather skip the agent

- **Remove the passphrase from the key** (`ssh-keygen -p -f path_to_key`, blank new passphrase) — convenient, but the key file becomes fully usable by anyone who gets hold of it. Only sensible on a fully encrypted drive (BitLocker), on a machine no one else has access to.
- **Pageant** (from the PuTTY suite) — a separate agent that can auto-load keys at system startup.

## Clearing old HTTPS credentials

If you previously signed in over HTTPS, Windows may have stored credentials in Credential Manager, which can clash with the new SSH setup:

```bash
cmdkey /list | findstr github
cmdkey /delete:ENTRY_NAME
```

(read the entry name from the `/list` output — usually something like `git:https://github.com`)
