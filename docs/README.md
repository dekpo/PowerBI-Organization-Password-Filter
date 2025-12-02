# Documentation Tool - GitHub Pages Setup

This folder contains a standalone HTML tool that allows users to generate encrypted JSON mappings from CSV files for the PowerBI Organization Password Filter visual.

## Features

- 📋 Paste CSV content or upload CSV file
- 🔒 AES-256 encryption using CryptoJS
- 📱 Responsive design
- ✨ Copy-to-clipboard functionality
- 🎨 Modern, user-friendly interface

## Setting Up GitHub Pages

### Option 1: Using GitHub Pages (Recommended)

1. **Enable GitHub Pages in your repository:**
   - Go to your repository on GitHub
   - Click on **Settings** → **Pages**
   - Under **Source**, select **Deploy from a branch**
   - Choose **main** (or **master**) branch
   - Select **/ (root)** folder
   - Click **Save**

2. **Configure the pages source:**
   - If you want to serve from the `doc` folder specifically, you can:
     - Use a custom GitHub Actions workflow (see below)
     - Or move `index.html` to the root and reference it

3. **Access your documentation:**
   - Your page will be available at: `https://[your-username].github.io/[repository-name]/doc/`
   - Or if configured from root: `https://[your-username].github.io/[repository-name]/`

### Option 2: Using GitHub Actions (For doc folder)

Create `.github/workflows/pages.yml`:

```yaml
name: Deploy GitHub Pages

on:
  push:
    branches:
      - main

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      
      - name: Setup Pages
        uses: actions/configure-pages@v3
      
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v2
        with:
          path: './doc'
      
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v2
```

### Option 3: Simple Root Deployment

If you prefer to keep it simple, you can:

1. Copy `doc/index.html` to the root as `docs/index.html` (GitHub Pages can serve from `/docs` folder)
2. Or rename `doc` folder to `docs` and enable Pages from `/docs` folder

## Local Testing

To test the HTML file locally:

1. Simply open `doc/index.html` in your web browser
2. Or use a local server:
   ```bash
   # Using Python
   cd doc
   python -m http.server 8000
   
   # Using Node.js
   npx http-server doc -p 8000
   ```

## Usage

1. Users visit your GitHub Pages URL
2. They paste CSV content or upload a CSV file
3. Click "Generate Encrypted JSON"
4. Copy the generated JSON
5. Paste into PowerBI Security Settings

## CSV Format

The CSV must follow this format:

```csv
Organization,Password
FAO,A7F9D2C4E1
IAEA,B3E8A6F1D9
ICAO,C9D4B7E2A5
```

- First row must be header: `Organization,Password`
- Each subsequent row contains: `Organization Name,Password`
- No spaces around commas (or they'll be trimmed)

## Security Note

This tool runs entirely in the browser using CryptoJS (loaded from CDN). All encryption happens client-side - no data is sent to any server. This ensures complete privacy for users generating their encrypted mappings.

