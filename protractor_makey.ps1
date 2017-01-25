
./node_modules/.bin/tsc -p tests/e2e/ --outDir tests/e2e/dest

if (-not $?) {
    exit
}

./node_modules/.bin/protractor tests/e2e/dest/protractor.conf.js
