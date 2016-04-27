
rm src/plugins/masked-input -recurse
if(test-path src/plugins/src) {
    rm src/plugins/src -recurse
}
mkdir src/plugins/masked-input
mkdir src/plugins/src
cp ../dist/* src/plugins/masked-input
cp ../src/* src/plugins/src/

# rm -f src/plugins/masked-input/*.html
# rm -f src/plugins/masked-input/*.js
