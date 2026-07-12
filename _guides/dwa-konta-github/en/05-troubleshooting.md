---
topic: dwa-konta-github
topic_title: "Two GitHub accounts, one computer"
topic_dek: "Configure git and SSH so every push lands on the right account automatically — no re-login required."
lang: en
order: 5
id: "005"
title: "Troubleshooting"
dek: "The most common problems with this setup, and how to diagnose them."
tags: ["diagnostics"]
kind: troubleshoot
---

## Push still goes to the wrong account

**Check in this order:**

```bash
git remote -v
```
If it starts with `https://`, SSH isn't being used at all — just HTTPS credentials cached by the browser/editor/Credential Manager. Switch it to `git@github.com:...`.

```bash
git config --show-origin --get user.email
git config --show-origin --get core.sshCommand
```
Check which file these values come from. If it's not your `.gitconfig-userX`, see the local `.git/config` note below.

## `git config --show-origin --get user.email` shows a completely different email

The most common cause: a **local config in this specific repository** (`.git/config`), set e.g. during the first `git init`/`clone`, before `includeIf` was configured. A local config always wins over `includeIf`, no matter how well the global one is set up.

```bash
cat .git/config
```

If you see a `[user]` section (or `[core] sshCommand`) with the wrong values:

```bash
git config --local --unset user.email
git config --local --unset user.name
git config --local --unset core.sshCommand
```

Once removed, Git falls back to the value from `includeIf`.

## `core.sshCommand` shows just `ssh.exe` with no `-i` and no key

This means the entry from `.gitconfig-userX` isn't being loaded at all — either `includeIf` isn't firing, or something else overrides the value earlier. Check:

```bash
git config --show-origin --list --show-scope
```

Most common reasons `includeIf` doesn't fire:

- The path in `gitdir:` doesn't end with `/`.
- Casing in the path (especially on Windows) doesn't exactly match how Git sees the working directory.
- A relative path in `path =` is resolved from the wrong place (see step 1 of the tutorial).

## VS Code / the GitHub extension only pushes to one account

Extensions like "GitHub Pull Requests and Issues" and VS Code's built-in GitHub sign-in keep their **own cached OAuth session** for `github.com`, independent of `.gitconfig`. Even a perfectly configured `includeIf` can't work around this as long as the repo uses HTTPS. Fix: switch to SSH (remote `git@github.com:...`) — then authentication goes through the key, not a token cached by the extension.

## `ssh-add` — "the term is not recognized" (Windows / PowerShell)

Two possible causes:

1. **The OpenSSH folder isn't in PATH.** Check the full path directly: `Get-Item "C:\Windows\System32\OpenSSH\ssh-add.exe"`. If the file exists, add the folder to the system PATH (PowerShell as Administrator) and open a **new** terminal window.
2. **32-bit PowerShell (x86) on 64-bit Windows.** WOW64 redirects `System32` to `SysWOW64`, where the OpenSSH folder doesn't exist — even though PATH looks correct and the file visually "exists" in File Explorer. Check `[Environment]::Is64BitProcess` — if `False`, open a regular (non-`x86`) PowerShell/Windows Terminal.

## Passphrase is asked for again after every reboot

That's expected behavior for the native OpenSSH agent on Windows — the agent's key memory isn't persistent across reboots. On macOS this goes away if you use `UseKeychain yes` in `~/.ssh/config` (see the macOS guide). On Linux it depends on your desktop environment's keyring integration.

A compromise that works on any platform: drop the passphrase from the key (`ssh-keygen -p`, blank passphrase) — but only if the drive is encrypted and no one else has access to the machine.

## Site published on GitHub Pages has no styling and every link 404s

Almost always the `baseurl` setting in `_config.yml`. If the site is published at `https://YOUR_USERNAME.github.io/repo-name/` (a project page) and `baseurl` is empty, CSS and links point at the domain root instead of the repo's subpath. Set:

```yaml
baseurl: "/repo-name"
url: "https://YOUR_USERNAME.github.io"
```

Commit, push, wait for the rebuild (check the **Actions** tab), then hard-refresh (Ctrl+Shift+R).

## Old HTTPS credentials keep clashing with the new SSH setup

Windows Credential Manager may have stored old HTTPS credentials for GitHub:

```bash
cmdkey /list | findstr github
cmdkey /delete:ENTRY_NAME
```

On macOS the equivalent is Keychain Access → search for "github.com".

## Quick diagnostic checklist

```bash
# 1. Are you in the right folder, and did includeIf fire?
git config --show-origin --get user.email

# 2. Is the remote in SSH form?
git remote -v

# 3. Will Git use the right key?
git config --show-origin --get core.sshCommand

# 4. Does the key itself work, independent of the repo's config?
ssh -T -i path/to/key -o IdentitiesOnly=yes git@github.com

# 5. Does the agent have both keys loaded?
ssh-add -l
```

If step 4 works fine but a plain `git push` still doesn't, the problem is in Git's configuration (steps 1–3), not the SSH key itself.
