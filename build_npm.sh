rm -rf dist/*
ls dist
docker run -v $(pwd):/app --entrypoint yarn sandrokeil/typescript install
docker run -v $(pwd):/app --entrypoint python sandrokeil/typescript versionchecker.py
echo "begin compile"
docker run -v $(pwd):/app --entrypoint tsc sandrokeil/typescript -d -p . --outDir dist
echo "end compile $?"
docker run -v $(pwd):/app --entrypoint sh sandrokeil/typescript build_tsdecls_only.sh
docker run -v $(pwd):/app --entrypoint npm sandrokeil/typescript pack
