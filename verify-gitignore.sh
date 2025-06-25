#!/bin/bash

# PivotFlow .gitignore Verification Script
# This script checks that sensitive files are properly ignored

echo "🔍 PivotFlow .gitignore Verification"
echo "==================================="

# Check for sensitive files that should be ignored
echo ""
echo "🔒 Checking sensitive files..."

# List of sensitive patterns to check
SENSITIVE_PATTERNS=(
    ".env"
    ".env.local"
    ".env.production"
    "canister_ids.json"
    "identity.pem"
    "wallets.json"
    "*.key"
    "*.private"
    "networks.json"
)

for pattern in "${SENSITIVE_PATTERNS[@]}"; do
    if find . -name "$pattern" -type f 2>/dev/null | grep -q .; then
        if git check-ignore $(find . -name "$pattern" -type f 2>/dev/null | head -1) >/dev/null 2>&1; then
            echo "✅ $pattern - properly ignored"
        else
            echo "❌ $pattern - NOT ignored (security risk!)"
        fi
    else
        echo "ℹ️  $pattern - not found"
    fi
done

# Check for build artifacts
echo ""
echo "🏗️  Checking build artifacts..."

BUILD_DIRS=(
    ".dfx"
    "node_modules"
    "dist"
    "build"
    "src/declarations"
    ".vessel"
    ".mops"
)

for dir in "${BUILD_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        if git check-ignore "$dir" >/dev/null 2>&1; then
            echo "✅ $dir/ - properly ignored"
        else
            echo "❌ $dir/ - NOT ignored"
        fi
    else
        echo "ℹ️  $dir/ - not found"
    fi
done

# Check for tracked files that shouldn't be
echo ""
echo "🚫 Checking for tracked files that shouldn't be..."

SHOULD_NOT_TRACK=(
    "*.wasm"
    "*.did"
    "*.did.js"
    "*.did.d.ts"
    ".env*"
    "canister_ids.json"
)

found_issues=false
for pattern in "${SHOULD_NOT_TRACK[@]}"; do
    if git ls-files | grep -E "$pattern" >/dev/null 2>&1; then
        echo "❌ Found tracked files matching: $pattern"
        git ls-files | grep -E "$pattern" | sed 's/^/   /'
        found_issues=true
    fi
done

if [ "$found_issues" = false ]; then
    echo "✅ No problematic files found in tracking"
fi

# Summary
echo ""
echo "📊 Summary"
echo "========="
ignored_count=$(git ls-files --others --ignored --exclude-standard | wc -l)
echo "📁 Total ignored files: $ignored_count"
echo "📋 .gitignore files in project:"
find . -name ".gitignore" -type f | sort

echo ""
echo "💡 Tips:"
echo "   - Run 'git status --ignored' to see all ignored files"
echo "   - Run 'git ls-files' to see all tracked files"
echo "   - Always verify before committing sensitive files"
echo ""
echo "✨ Verification complete!"
