NPM = ./node_modules

JSPM = ./jspm_packages

all: 
	rm src/plugins/masked-input -rf
	mkdir -p src/plugins/masked-input 
	cp ../dist/* src/plugins/masked-input

serve: $(NPM) $(JSPM)
	./node_modules/.bin/http-server -c-1

$(NPM):
	npm install

$(JSPM): $(NPM)
	./node_modules/.bin/jspm install
