#!/bin/bash
make
cd sample
make
make serve &
cd ..
./node_modules/.bin/webdriver-manager update
sleep 50s
make protractor-run
