set -e
echo "Current version:" $(grep version package.json | sed -E 's/^.*"([0-9][^"]+)".*$/\1/')
echo "Enter the new version you want to publish e.g., 0.0.2: "
read VERSION

read -p "Releasing v$VERSION - are you sure? (y/n)" -n 1 -r
echo    # (optional) move to a new line
if [[ $REPLY =~ ^[Yy]$ ]]
then
  echo "Releasing v$VERSION ..."

  # generate the version so that the changelog can be generated too
  yarn version --no-git-tag-version --no-commit-hooks --new-version $VERSION

  yarn run build

  # changelog
  yarn run changelog
  yarn prettier --write CHANGELOG.md
  echo "Please check the git history and the changelog and press enter"
  read OKAY

  # commit and tag
  git add CHANGELOG.md package.json
  git commit -m "release: v$VERSION"
  git tag "v$VERSION"

  # commit
  yarn publish --new-version "$VERSION" --no-commit-hooks --no-git-tag-version

  # publish
  git push origin refs/tags/v$VERSION
  git push
fi
