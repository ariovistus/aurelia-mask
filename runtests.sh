#!/bin/bash
make
cd samples
make
make serve &
cd ..
make protractor-run
