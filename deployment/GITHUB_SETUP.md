# GitHub Setup Instructions

## Setting Up Your GitHub Repository

1. Create a new repository on GitHub (or use an existing one)
2. Initialize Git in your local project folder (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```
3. Connect your local repository to GitHub:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git
   git branch -M main
   git push -u origin main
   ```

## Setting Up GitHub Secrets for CI/CD

For the CI/CD workflow to work properly, you need to add the following secrets to your GitHub repository:

1. Go to your repository on GitHub.
2. Click on "Settings" > "Secrets and variables" > "Actions".
3. Add the following secrets:
   - `DOCKERHUB_USERNAME`: Your Docker Hub username
   - `DOCKERHUB_TOKEN`: Your Docker Hub access token (generate from Docker Hub)
   - `OPENAI_API_KEY`: Your OpenAI API key for testing and deployment

## GitHub Pages Deployment (Optional)

If you want to deploy the frontend to GitHub Pages:

1. Add the following to your `package.json` file:
   ```json
   "homepage": "https://YOUR_USERNAME.github.io/YOUR_REPOSITORY_NAME",
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d dist/client"
   }
   ```

2. Install the gh-pages package:
   ```bash
   npm install --save-dev gh-pages
   ```

3. Create a GitHub workflow for GitHub Pages in `.github/workflows/gh-pages.yml`:
   ```yaml
   name: Deploy to GitHub Pages

   on:
     push:
       branches: [ main ]

   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - name: Setup Node.js
           uses: actions/setup-node@v3
           with:
             node-version: '20'
             cache: 'npm'
         - name: Install dependencies
           run: npm ci
         - name: Build
           run: npm run build
         - name: Deploy to GitHub Pages
           uses: JamesIves/github-pages-deploy-action@v4
           with:
             folder: dist/client
   ```

## Protecting Your Main Branch

To ensure code quality, you can protect your main branch:

1. Go to your repository on GitHub.
2. Click on "Settings" > "Branches".
3. Under "Branch protection rules", click "Add rule".
4. Enter "main" as the branch name pattern.
5. Check options like "Require pull request reviews before merging" and "Require status checks to pass before merging".
6. Save changes.

This ensures that code must be reviewed and pass all CI checks before being merged into the main branch.