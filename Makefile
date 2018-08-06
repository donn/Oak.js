SOURCES = $(wildcard Sources/*.ts)
FLAGS = --pretty
UGLIFYFLAGS = --verbose

all: ui
terminal: Scripts/oak.min.js
ui: Scripts/ui.min.js Scripts/oak.min.js

Scripts/oak.min.js: $(SOURCES)
	mkdir -p Build/
	tsc $(FLAGS) Sources/Zero.ts --outFile Build/Oak.js
	uglifyjs $(UGLIFYFLAGS) Build/Oak.js > Scripts/oak.min.js
	chmod +x Scripts/oak.min.js

Scripts/ui.min.js: UI/Oak.js 
	uglifyjs $(UGLIFYFLAGS) UI/Oak.js > Scripts/ui.min.js

clean:
	@rm -rf Build/
	@rm -f Scripts/oak.min.js
	@rm -f Scripts/ui.min.js