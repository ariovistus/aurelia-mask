#!/bin/bash
make
cd sample
make
make serve &
cd ..
make protractor-run
