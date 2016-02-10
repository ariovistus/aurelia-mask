all: js html


js:
	../node_modules/.bin/tsc -p src/plugins/masked-input 
	cp ../src/*.js src/plugins/masked-input 

html:
	cp ../src/*.html src/plugins/masked-input 
clean:
	rm -f src/plugins/masked-input/*.html
	rm -f src/plugins/masked-input/*.js
