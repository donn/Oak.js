SOURCES = $(wildcard Sources/**/*.ts) $(wildcard Sources/*.ts)
FLAGS = --pretty --target ES2016
BABELFLAGS = --minified --no-comments

all: ui
terminal: Scripts/oak.min.js
ui: Scripts/ui.min.js Scripts/oak.min.js

Scripts/oak.min.js: $(SOURCES)
	mkdir -p Build/
	./node_modules/typescript/bin/tsc $(FLAGS) Sources/Zero.ts --outFile Build/Oak.js
	./node_modules/babel-cli/bin/babel.js $(BABELFLAGS) Build/Oak.js > Scripts/oak.min.js
	chmod +x Scripts/oak.min.js

Scripts/ui.min.js: UI/Oak.js 
	./node_modules/babel-cli/bin/babel.js $(BABELFLAGS) UI/Oak.js > Scripts/ui.min.js

clean:
	@rm -rf Build/
	@rm -f Scripts/oak.min.js
	@rm -f Scripts/ui.min.js