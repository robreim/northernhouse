# Enabling the CMS (`/admin`)

One-time setup, about fifteen minutes. After this, the site's editor can change
text and add or remove photos at **https://northernhouse.nl/admin**, without a
developer.

Without these steps `/admin` loads, but the *Sign in with GitHub* button will not
work: GitHub refuses to allow login from a static page. That needs a small
in-between service (a Cloudflare Worker).

You need: a free Cloudflare account and access to the GitHub repo.

## 1. Deploy the OAuth worker

1. Go to **https://github.com/sveltia/sveltia-cms-auth**
2. Click **Deploy to Cloudflare Workers**
3. Follow the steps; Cloudflare creates the worker

Alternative from the terminal: clone the repo and run `wrangler deploy`.

Then open the Cloudflare dashboard → **Workers & Pages** → `sveltia-cms-auth`.
The URL is at the top and looks like this:

```
https://sveltia-cms-auth.yourname.workers.dev
```

Keep that URL; you need it in steps 3 and 4.

## 2. Register a GitHub OAuth app

Go to **https://github.com/settings/applications/new** and fill in:

| Field | Value |
| --- | --- |
| Application name | `Sveltia CMS Authenticator` |
| Homepage URL | `https://northernhouse.nl` |
| Authorization callback URL | `<worker-url>/callback` |

The callback is the worker URL **plus `/callback`**, for example
`https://sveltia-cms-auth.yourname.workers.dev/callback`. Note: without
`/callback`, GitHub later reports `redirect_uri_mismatch`.

Click **Register application**, then **Generate a new client secret**. You now
have a **Client ID** and a **Client Secret** for the next step.

## 3. Configure the worker

Cloudflare → the worker → **Settings** → **Variables and Secrets**:

| Name | Value | Note |
| --- | --- | --- |
| `GITHUB_CLIENT_ID` | from step 2 | |
| `GITHUB_CLIENT_SECRET` | from step 2 | click **Encrypt** |
| `ALLOWED_DOMAINS` | `northernhouse.nl, *.northernhouse.nl` | see below |

`ALLOWED_DOMAINS` is technically optional but **don't skip it**: it stops another
site from using your worker as a free GitHub login, and stops anyone obtaining a
token through it. Multiple values are allowed, comma-separated; `*.` also covers
`www`.

Then save/deploy the worker.

## 4. Point the form at the worker

In `public/admin/config.yml`, under `backend` (line 14), there is still a
placeholder. Replace it with the worker URL:

```yaml
backend:
  name: github
  repo: robreim/northernhouse
  base_url: https://sveltia-cms-auth.yourname.workers.dev
```

Commit and push:

```bash
git add public/admin/config.yml
git commit -m "chore: point the CMS at the OAuth worker"
git push
```

After the deploy (about a minute) `/admin` is usable.

## 5. Give the editor access

The editor needs a **GitHub account with write access** to
`robreim/northernhouse`:

Repo → **Settings** → **Collaborators** → **Add people** → username, role
**Write**.

Note: on a public repo, Write also grants access to the code, not just the
content. The form itself only shows text and photo fields, but through GitHub
this person can do more. If that is not acceptable, the options are: make the
repo private (GitHub Pages then requires a paid plan) or accept it.

## 6. Test it

1. Go to **https://northernhouse.nl/admin/**
2. **Sign in with GitHub** → approve
3. Open a project, change a word, click **Save**
4. Check the repo's **Actions** tab: a deploy starts immediately. The change is
   live after about a minute
5. Then test a photo: upload one, check it lands in the right
   `src/assets/projecten/<project>/` folder, and that it appears on the site

## Do a dry run yourself first (recommended)

Test the form once locally, so you don't touch the live site:

```bash
npm run dev
```

Open **http://localhost:4321/admin/index.html** in Chrome (or Edge/Brave) →
**Work with Local Repository** → select the project folder → make a change.
Then look at `git diff` and discard the change with `git checkout .`

This only works in Chromium browsers (Chrome, Edge, Brave); Firefox and Safari
do not support the required file access.

## What the editor can and cannot do

Can: all text, add and remove photos, the order of photos and of the projects on
the homepage.

Cannot: page structure, styling, navigation. Those live in the Astro code. There
is deliberately no button that can break the site.

Adding a whole new project stays manual work for the site builder; see the
README, section *Beheer (/admin) → Een nieuw project toevoegen*.

## When something goes wrong

| Symptom | Cause |
| --- | --- |
| Sign-in button does nothing, or an error after approving | `base_url` does not match the worker URL exactly, or `/callback` is missing from the GitHub app |
| GitHub reports `redirect_uri_mismatch` | The callback URL in the GitHub app is not `<worker-url>/callback` |
| `/admin` shows a blank page or 404 | `public/admin/` was not in the deploy; check the Actions log for `dist/admin/` |
| Saving works but the site does not change | The build failed. Check **Actions**; run `npm run check-content` for the reason |
| Editor can sign in but sees no projects | No Write access to the repo (step 5) |

A failed build leaves the previous version of the site in place: the change does
not go live, but nothing breaks either. Everything is in git, so a bad change can
be undone with `git revert <commit>`.

## Security, briefly

- `/admin` is publicly reachable. There is nothing secret in it: only the repo
  name and field names. Without a GitHub account that has write access you get no
  further than the login screen.
- The page is `noindex` and `/admin/` is in `robots.txt`.
- The CMS configuration is public by definition; never put keys in it. The
  Web3Forms key therefore lives in `src/config.ts`, not here.
- The Cloudflare Worker is the only component holding secrets
  (`GITHUB_CLIENT_SECRET`), and that one is encrypted in Cloudflare.

## Technical notes for the site builder

- The form is **Sveltia CMS** (MIT, a single JavaScript file from unpkg). It is
  not a dependency in `package.json`, and there is no server or database.
- Saving = a commit to `main` = a new deploy via GitHub Actions.
  `publish_mode: simple`, so no drafts or pull requests.
- On upload the form resizes photos in the browser, converts them to webp
  (quality 82, max 2048 px) and stores them in that project's folder. Without
  that the repo fills up with phone photos of several MB each.
- When `/admin` loads, Sveltia validates the configuration against its own JSON
  schema and reports problems in the browser console. Enable the YAML extension
  in VS Code and you see those problems while typing (via the `$schema` line at
  the top of `config.yml`).
- Before every build, `scripts/check-content.mjs` runs. It checks that the data
  files, the photos and the CMS configuration match, and stops the build with a
  readable message if something is missing.
