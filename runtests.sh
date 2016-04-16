#!/bin/bash
make
cd sample
make
make serve &
cd ..
./node_modules/.bin/webdriver-manager update
sleep 30s
make protractor-run
