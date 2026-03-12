# Push Your Cursor Changes to Lovable Git

Use this to push your current web app code (including changes made in Cursor) to the Git repo connected to Lovable, so you can edit design in Lovable.

---

## 1. Get your Lovable Git repo URL

- In **Lovable**: open your project → **Settings** or **Integrations** → find **Git** / **GitHub**.
- Copy the repository URL. It will look like:
  - `https://github.com/YOUR_USERNAME/YOUR_REPO.git`
  - or `git@github.com:YOUR_USERNAME/YOUR_REPO.git`
- If you haven’t connected a repo yet, create one on GitHub (or use Lovable’s “Connect repository”) and copy that URL.

---

## 2. In your project folder (Terminal)

Run these from the **project root** (where `package.json` and `src/` are).

**Initialize Git and make the first commit (if not already done):**

```bash
cd "/Users/lenovo/Downloads/vibly-sync-sessions-main 2"

# Initialize git (only if you see "not a git repository")
git init

# Add Lovable’s repo as remote (replace with YOUR repo URL from step 1)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
# If you already have "origin" and want Lovable’s repo:
# git remote set-url origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Stage all files (respects .gitignore: node_modules, dist, etc.)
git add .

# Commit your Cursor changes
git commit -m "Sync web app from Cursor: design and feature updates"

# Push to Lovable’s branch (usually main or master)
git push -u origin main
```

If your Lovable repo uses branch `master` instead of `main`:

```bash
git push -u origin master
```

If the remote already has commits (e.g. from Lovable), you may need to pull first:

```bash
git pull origin main --allow-unrelated-histories
# resolve any conflicts, then:
git push -u origin main
```

---

## 3. What gets pushed (web app vs rest)

- **Pushed:** Everything except what’s in `.gitignore` (e.g. `node_modules`, `dist`, logs).
- **Lovable uses:** The **web app** part: `src/`, `index.html`, `public/`, `package.json`, `vite.config.ts`, `tailwind.config.ts`, etc. Lovable’s editor works on these.
- **Also in repo:** `ios/`, `android/`, `supabase/`, `docs/` — they’ll be in the repo but Lovable will focus on the web app for design.

So you’re pushing the whole project; Lovable will use the web app part for design changes.

---

## 4. After pushing

- In Lovable, trigger a sync/import from Git if it doesn’t auto-update.
- Your Cursor changes (design, components, pages) will appear in Lovable and you can continue editing there.

---

## 5. Push only web app code (optional)

If Lovable’s repo is **only** for the web app (no `ios/` or `android/`), you can push just those paths:

```bash
git init
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git add index.html package.json vite.config.ts tailwind.config.ts tsconfig*.json postcss.config.js components.json eslint.config.js
git add src public
git add .env .gitignore
git add supabase
# add docs if you want
git add docs
git commit -m "Sync web app from Cursor"
git branch -M main
git push -u origin main
```

Then in Lovable you’d only have the web app; native (`ios/`, `android/`) would stay only in your local/Cursor project.
