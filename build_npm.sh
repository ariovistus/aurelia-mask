rm -rf dist/*
docker run -v $(pwd):/app --entrypoint yarn sandrokeil/typescript install
docker run -v $(pwd):/app --entrypoint python sandrokeil/typescript versionchecker.py
docker run -v $(pwd):/app --entrypoint tsc sandrokeil/typescript -d -p . --outDir dist
docker run -v $(pwd):/app --entrypoint npm sandrokeil/typescript pack
