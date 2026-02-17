# Release Checklist

Before creating a new release, ensure:

## Pre-Release Checks

- [ ] All CI checks pass
- [ ] Tests pass locally
- [ ] No critical security vulnerabilities
- [ ] Documentation is up to date
- [ ] Changelog is updated
- [ ] Version numbers are consistent across packages

## Release Process

1. **Create release branch**
   ```bash
   git checkout -b release/v1.x.x
   ```

2. **Update version numbers** (if needed)
   ```bash
   # Update package.json versions
   # Update CHANGELOG.md
   ```

3. **Run final tests**
   ```bash
   pnpm test
   pnpm build:all
   ```

4. **Publish packages**
   ```bash
   NODE_AUTH_TOKEN=ghp_... scripts/publish-gh-packages.sh
   ```

5. **Create GitHub release**
   - Tag: `v1.x.x`
   - Title: `Release v1.x.x`
   - Description: Copy from CHANGELOG.md

6. **Merge release branch**
   ```bash
   git checkout main
   git merge release/v1.x.x
   git push origin main
   git tag v1.x.x
   git push origin v1.x.x
   ```

## Post-Release

- [ ] Announce on social media/blog
- [ ] Update documentation links if needed
- [ ] Monitor for issues
- [ ] Plan next release cycle