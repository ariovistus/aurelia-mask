

rm dist/*
cp src/*.ts dist/
cp dist_tsconfig.json dist/tsconfig.json
./node_modules/.bin/tsc -d -p ./dist 
rm dist/tsconfig.json
cp dist/*.d.ts .
