echo "please enter the version you want to download: "
read version
token=$(cat token)
dir_content=$(curl -L \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer $token"\
  -H "X-GitHub-Api-Version: 2022-11-28" \
	https://api.github.com/repos/nodejs/node/contents/doc/api?ref=v$version.x)
if [ -d "out" ]; then
	rm -r out
fi
mkdir out
node -e "const e=require('child_process').execSync;const b=require('path').basename;$dir_content.map(x => x.download_url).forEach(x => e(['wget', '-qO-', x, '>', 'out/'+b(x)].join(' ')))"
asar pack out/ "$version.x.asar"
