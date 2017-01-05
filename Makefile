BIN=node_modules/.bin

MOCHA_ARGS= --compilers js:babel-register
MOCHA_TARGET=src/**/test*.js

clean:
	rm -rf lib
	rm -rf docs

build: clean
	$(BIN)/webpack
	$(BIN)/webpack --mode=build
	$(BIN)/jsdoc src -d docs -c ./jsdoc.conf.json --verbose
	cp ./src/index.d.ts ./dist/redux-orm.d.ts

test: lint
	NODE_ENV=test $(BIN)/mocha $(MOCHA_ARGS) $(MOCHA_TARGET)

test-watch: lint
	NODE_ENV=test $(BIN)/mocha $(MOCHA_ARGS) -w $(MOCHA_TARGET)

deploydocs: build
	$(BIN)/gulp deploy

lint:
	$(BIN)/eslint src

PHONY: build clean test test-watch lint
