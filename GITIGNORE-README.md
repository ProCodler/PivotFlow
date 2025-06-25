# Git Ignore Configuration for PivotFlow ICP Project

This document explains the `.gitignore` configuration across the PivotFlow project to ensure sensitive files, build artifacts, and temporary files are not committed to the repository.

## Overview

The project has multiple `.gitignore` files at different levels:

1. **Root `.gitignore`** - Covers project-wide exclusions
2. **`src/.gitignore`** - Covers source-level generated files
3. **`src/PivotFlow_backend/.gitignore`** - Motoko/backend specific files
4. **`src/PivotFlow_frontend/.gitignore`** - Frontend specific files

## Root Level (/.gitignore)

### ICP/DFX Specific Files
- `.dfx/` - DFX build and deployment files
- `.vessel/`, `.mops/` - Motoko package managers
- `replica-configuration/`, `.pocket-ic/` - Local replica configs
- `canister_ids.json` - Contains sensitive canister IDs
- `*.wasm`, `*.did`, `*.did.js`, `*.did.d.ts` - Generated canister files

### Security & Sensitive Files
- `.env*` files - Environment variables and API keys
- `networks.json` - Network configuration with canister IDs
- `*.pem`, `*.private`, `*.key` - Private keys and certificates
- `wallets.json`, `identity.pem` - ICP identity and wallet files
- `credentials.json`, `auth-config.json` - Authentication configs

### Build Artifacts
- `node_modules/` - Package dependencies
- `dist/`, `build/`, `.webpack/` - Build outputs
- `src/declarations/` - Generated type declarations

### Development Files
- IDE configs (`.vscode/`, `.idea/`)
- Logs (`*.log`)
- Temporary files (`*.tmp`, `.cache/`)
- OS files (`.DS_Store`, `Thumbs.db`)

## Backend Level (/src/PivotFlow_backend/.gitignore)

### Motoko Specific
- `*.wasm*` - Compiled WebAssembly files
- `*.did*` - Generated Candid interface files
- `.vessel/`, `.mops/` - Package manager directories
- `package-set.dhall` - Vessel package set configurations

## Frontend Level (/src/PivotFlow_frontend/.gitignore)

### Build & Development
- `dist/`, `build/` - Frontend build outputs
- `node_modules/` - npm dependencies
- `.vite/` - Vite cache and temp files
- Environment files specific to frontend

### ICP Integration
- `declarations/` - Generated Candid types
- `canister_ids.json` - Local canister IDs
- DFX-related files

## Source Level (/src/.gitignore)

### Generated Files
- `declarations/` - All generated declarations
- Build outputs across all sub-projects
- Package manager artifacts

## Best Practices

### What Gets Ignored
✅ **Always ignore:**
- Build artifacts and generated files
- Environment variables and API keys
- Private keys and certificates
- Package manager directories
- IDE configuration files
- Temporary and cache files
- OS-specific files

### What Gets Committed
✅ **Always commit:**
- Source code (`.mo`, `.tsx`, `.ts` files)
- Configuration templates
- Documentation
- Package.json and dfx.json
- README files

### Security Considerations

⚠️ **Critical Files to Never Commit:**
- `.env` files with API keys
- `identity.pem` or any `.pem` files
- `wallets.json` or wallet-related files
- Private keys or certificates
- `canister_ids.json` (contains production canister IDs)
- `networks.json` (may contain sensitive network configs)

### Deployment Notes

When deploying to production:
1. Ensure all sensitive files are properly ignored
2. Use environment-specific configuration
3. Never commit production canister IDs
4. Use secure methods to deploy credentials

### Verification

To check what's being ignored:
```bash
git status --ignored
git ls-files --others --ignored --exclude-standard
```

To verify no sensitive files are tracked:
```bash
git ls-files | grep -E "\.(env|pem|key|private)$|canister_ids\.json"
```

## Maintenance

- Review `.gitignore` files when adding new tools or dependencies
- Update patterns when project structure changes
- Regularly audit committed files for sensitive data
- Test `.gitignore` patterns in development before pushing

## Emergency Procedures

If sensitive files were accidentally committed:
1. Remove from tracking: `git rm --cached <file>`
2. Add to `.gitignore`
3. Commit the removal
4. Consider rotating any exposed credentials
5. For public repos, consider history rewriting if necessary

---

Last updated: June 2025
Project: PivotFlow ICP Chain Fusion Application
