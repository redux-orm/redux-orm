BIN=node_modules/.bin

MOCHA_ARGS= --compilers js:babel-register
MOCHA_TARGET=src/**/test*.js

clean:
	rm -rf lib
	rm -rf dist
	rm -rf docs

build: clean
	$(BIN)/babel src --out-dir lib
	$(BIN)/webpack
	$(BIN)/webpack --mode=build
	$(BIN)/jsdoc src -d docs -c ./jsdoc.conf.json --verbose

test: lint
	NODE_ENV=test $(BIN)/mocha $(MOCHA_ARGS) $(MOCHA_TARGET)

test-watch: lint
	NODE_ENV=test $(BIN)/mocha $(MOCHA_ARGS) -w $(MOCHA_TARGET)

deploydocs: build
	$(BIN)/gulp deploy

lint:
	$(BIN)/eslint src

PHONY: build clean test test-watch lint