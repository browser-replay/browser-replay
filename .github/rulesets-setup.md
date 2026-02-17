# GitHub Rulesets Configuration Guide

This guide shows how to configure branch protection using GitHub's new Rulesets feature (replaces Branch Protection Rules).

## Access Rulesets

1. Go to your repository on GitHub
2. Click **Settings** tab
3. Click **Rules** → **Rulesets** in the left sidebar
4. Click **New ruleset** button

## Recommended Ruleset Configuration

### Basic Information
```
Name: Main Branch Protection
Enforcement Status: Active
Target branches:
  - Include: main
```

### Branch Restrictions
```
Restrict pushes that create matching branches: ✅ Disabled
Restrict deletions: ✅ Enabled
  Allow deletions: ☐ (unchecked)
Block force pushes: ✅ Enabled
  Allow force pushes: ☐ (unchecked)
```

### Require Pull Requests
```
Require pull requests before merging: ✅ Enabled
  Required approvals: 1
  Dismiss stale reviews: ✅ Enabled
  Require review from Code Owners: ✅ Enabled
  Restrict who can dismiss reviews: ✅ Enabled
    Allowed to dismiss: Maintainers
  Allow bypassing: ☐ Disabled (or restrict to admins only)
```

### Required Status Checks
```
Require status checks before merging: ✅ Enabled
  Require branches to be up to date: ✅ Enabled
  Status checks:
    - ci (from your CI workflow)
  Strict mode: ✅ Enabled
```

### Code Scanning
```
Require code scanning checks: ✅ Enabled
  Required tools:
    - CodeQL (if enabled)
  Alert severity: Errors and warnings
```

### Secret Scanning
```
Prevent commits with secrets: ✅ Enabled
  Scan for secrets: ✅ Enabled
```

### Required Commit Signatures
```
Require commits to be signed: ✅ Enabled
  Allow bypassing: ☐ Disabled
```

### Additional Rules (Optional)
```
Restrict file paths: ☐ (consider for sensitive files)
  Blocked paths: package-lock.json, yarn.lock (since you use pnpm)
Require linear history: ☐ Disabled (too restrictive)
Lock branch: ☐ Disabled
```

## Advanced Rulesets (Optional)

### Development Branch Ruleset
```
Name: Development Branch Protection
Target branches:
  - Include: develop, dev
Settings: Similar to main but with fewer restrictions
- Required approvals: 1
- Status checks: ci
- Allow force pushes: ✅ (for active development)
```

### Release Branch Ruleset
```
Name: Release Branch Protection
Target branches:
  - Include: release/*
Settings:
- Required approvals: 2 (stricter for releases)
- Status checks: ci
- Code scanning: Required
- No force pushes allowed
```

### Feature Branch Ruleset
```
Name: Feature Branch Protection
Target branches:
  - Include: feature/*
Settings:
- Required approvals: 1
- Status checks: ci
- Allow force pushes: ✅ (for feature development)
```

## Migration from Branch Protection Rules

If you have existing Branch Protection Rules:

1. **Export your current settings** (document them)
2. **Create equivalent Rulesets** using the settings above
3. **Test the new Rulesets** with sample PRs
4. **Disable old Branch Protection Rules**
5. **Delete old rules** once new ones are working

## Ruleset Advantages

- **More flexible targeting**: Can target multiple branches with patterns
- **Better organization**: Group related rules together
- **Advanced features**: Code scanning, secret scanning, file path restrictions
- **Easier management**: Single interface for all branch protections

## Testing Your Rulesets

1. Create a test branch
2. Try to push directly to protected branches (should fail)
3. Create a pull request
4. Verify all required checks run
5. Try to merge without approvals (should fail)
6. Test bypass permissions (if configured)

## Emergency Procedures

For urgent fixes that need to bypass rules:

1. **Repository admins** can temporarily modify rulesets
2. **Create emergency branch** if needed (not protected)
3. **Revert ruleset changes** after emergency is resolved
4. **Document the emergency** and reasoning

## Best Practices

- **Start restrictive, relax as needed**
- **Test all rules** before enforcing
- **Document bypass procedures**
- **Regularly review** and update rules
- **Use CODEOWNERS** for automatic reviewer assignment
- **Enable security features** (code scanning, secret scanning)

## Your Repository Ruleset

For `dom-replay`, use the "Main Branch Protection" configuration above with these specifics:

- **Target**: `main` branch
- **CI Check**: `ci` workflow
- **Code Owners**: Enabled (uses your CODEOWNERS file)
- **Security**: Code scanning and secret scanning enabled
- **Signed Commits**: Required for security

This provides enterprise-grade protection while maintaining development efficiency! 🛡️