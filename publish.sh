# update on npm
npm publish

# read version
gitsha=$(git rev-parse HEAD)
version=$(cat package.json | jq .version | sed -e 's/^"//'  -e 's/"$//')

gulp build
# swap to head so we don't commit compiled file to master along with tags
git checkout head

# add the compiled files, commit and tag!
git add datalib* -f
git commit -m "Release $version $gitsha"
git tag -am "Release v$version." "v$version"

# now swap back to the clean master and push the new tag
git checkout master
git push --tags

# Woo hoo! Now the published tag contains compiled files which works great with bower.
