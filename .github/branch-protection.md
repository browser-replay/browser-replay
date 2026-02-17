# Branch Protection Rules

This document outlines the recommended branch protection rules for this repository.

## Main Branch (`main` or `master`)

### Required Status Checks
- [ ] Require status checks to pass before merging
- [ ] Require branches to be up to date before merging
- [ ] Status checks that must pass:
  - `ci` (CI workflow)

### Branch Protection
- [ ] Require a pull request before merging
- [ ] Require approvals (1 minimum)
- [ ] Dismiss stale pull request approvals when new commits are pushed
- [ ] Require review from Code Owners (if CODEOWNERS file exists)
- [ ] Restrict who can dismiss pull request reviews
- [ ] Allow specified actors to bypass required pull requests (maintainers only)

### Restrictions
- [ ] Restrict who can push to matching branches (maintainers only)
- [ ] Allow force pushes (disabled)
- [ ] Allow deletions (disabled)

## Setup Instructions

1. Go to repository Settings → Branches
2. Click "Add rule"
3. Configure the above settings for the `main` branch
4. Save the rule

## Additional Recommendations

- Enable "Include administrators" for all rules
- Consider requiring signed commits for security
- Set up CODEOWNERS file for automatic review assignments