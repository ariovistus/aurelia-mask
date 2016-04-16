#!/bin/bash
make
cd sample
make
make serve &
cd ..
./node_modules/.bin/webdriver-manager update
make protractor-run
