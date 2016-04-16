#!/bin/bash
make
cd sample
make
make serve &
cd ..
./node_modules/.bin/webdriver-manager update
./node_modules/.bin/webdriver-manager start &
make protractor-run
