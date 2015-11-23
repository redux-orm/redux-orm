BIN=node_modules/.bin

MOCHA_ARGS= --compilers js:babel/register
MOCHA_TARGET=src/**/test*.js

build:
	$(BIN)/babel src --out-dir lib
	$(BIN)/jsdoc ./src/index.js -d docs -c ./jsdoc.conf.json

clean:
	rm -rf lib
	rm -rf docs

test: lint
	NODE_ENV=test $(BIN)/mocha $(MOCHA_ARGS) $(MOCHA_TARGET)

test-watch: lint
	NODE_ENV=test $(BIN)/mocha $(MOCHA_ARGS) -w $(MOCHA_TARGET)

lint:
	$(BIN)/eslint src