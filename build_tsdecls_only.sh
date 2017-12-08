#!/bin/sh
mkdir /root/tmploc  
tsc -d -p . --outDir /root/tmploc  
cp /root/tmploc/*.d.ts .
