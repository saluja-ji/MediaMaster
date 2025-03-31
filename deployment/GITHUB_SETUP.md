# GitHub Setup Guide for MediaMaster

This guide walks you through setting up and deploying MediaMaster on GitHub.

## Initial Repository Setup

### 1. Create a GitHub Repository

1. Log in to your GitHub account
2. Click on the "+" icon in the top right corner and select "New repository"
3. Name your repository (e.g., "MediaMaster")
4. Add a description: "AI-powered social media management platform"
5. Choose visibility (public or private)
6. Initialize with a README if starting from scratch
7. Click "Create repository"

### 2. Clone the Repository Locally

```bash
git clone https://github.com/yourusername/MediaMaster.git
cd MediaMaster
```

## Setting Up the Project

### 1. Initialize the Project

If starting from scratch:

```bash
# Create main project structure
mkdir -p client/src/{components,hooks,lib,pages} server shared deployment

# Copy existing files if you already have the project
# ...

# Initialize git repository if not cloned
git init
```

### 2. Configure Environment Variables

1. Create a `.env.example` file with placeholder values
2. Add `.env` to `.gitignore`

### 3. Initial Commit and Push

```bash
git add .
git commit -m "Initial project setup"
git push -u origin main
```

## Setting Up GitHub Actions CI/CD

### 1. Create a GitHub Actions Workflow

Create a file at `.github/workflows/ci.yml`:

```yaml
name: MediaMaster CI/CD

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '20'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run TypeScript checks
      run: npm run typecheck
    
    - name: Run linter
      run: npm run lint
    
    - name: Run tests
      run: npm test
      
  deploy:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    # Add deployment steps here based on your hosting provider
    # Examples:
    # - Deploy to Vercel, Netlify, or custom server
    # - Build Docker image and push to registry
```

### 2. Set Up GitHub Secrets

For CI/CD to work with your application's secrets:

1. Go to your GitHub repository settings
2. Click on "Secrets and variables" → "Actions"
3. Add the following secrets:
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `DATABASE_URL`: PostgreSQL connection string
   - Any other API keys or credentials needed

## Collaborating with Others

### 1. Branch Strategy

Adopt a branch strategy for collaboration:

```bash
# Create a feature branch
git checkout -b feature/new-feature-name

# Make changes, commit them
git add .
git commit -m "Implemented new feature"

# Push to GitHub
git push -u origin feature/new-feature-name
```

### 2. Pull Requests

1. Go to your repository on GitHub
2. Click "Pull requests" → "New pull request"
3. Select your feature branch
4. Add a title and description
5. Request reviews from team members
6. Create the pull request

### 3. Code Reviews

1. Assign reviewers to pull requests
2. Use GitHub's review features for inline comments
3. Approve changes or request modifications
4. Merge when approved

## Integration with Issue Tracking

### 1. Create Issues

1. Go to the "Issues" tab in your repository
2. Click "New issue"
3. Add a descriptive title and detailed description
4. Assign labels, milestones, and assignees
5. Reference issues in commit messages using #issue-number

### 2. Project Boards

Consider setting up a GitHub Project Board:

1. Go to the "Projects" tab
2. Create a new project
3. Add columns like "To do", "In progress", "Review", "Done"
4. Add issues to your project board

## GitHub Pages (Optional)

If you want to host documentation:

1. Go to repository settings → Pages
2. Choose a source branch
3. Select folder (e.g., /docs)
4. Save and your docs will be published at yourusername.github.io/MediaMaster

## Automated Releases

For versioning and releases:

1. Create tags for releases:
   ```bash
   git tag -a v1.0.0 -m "Initial stable release"
   git push origin v1.0.0
   ```

2. Go to "Releases" in your repository
3. Create a new release from the tag
4. Add release notes
5. Publish the release

## Best Practices

1. Keep sensitive information in GitHub Secrets, never commit them
2. Use meaningful commit messages
3. Reference issues in commits and pull requests
4. Keep the main branch stable
5. Document your code and APIs
6. Regularly update dependencies using Dependabot
7. Set up branch protection rules for important branches

---

Remember to customize this guide based on your specific needs and team structure. This provides a starting point for GitHub integration with your MediaMaster project.