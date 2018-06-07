SOURCES = Sources/Zero.ts#$(shell find Sources -name "*.ts")
OBJECTS = Build/Sources/Zero.js #$(addprefix Build/, $(patsubst %.ts,%.js,$(SOURCES)))

.PHONY: all ui terminal clean

all: ui
ui: Scripts/ui.min.js Scripts/oak.min.js

$(OBJECTS): Build/%.js : %.ts
	mkdir -p $(@D)
	tsc $(FLAGS) $< --outFile $@

Scripts/oak.min.js: $(OBJECTS)
	uglifyjs -c --verbose Build/Sources/Zero.js > Scripts/oak.min.js
	chmod +x Scripts/oak.min.js

Scripts/ui.min.js: UI/Oak.js 
	uglifyjs UI/Oak.js -c > Scripts/ui.min.js

clean:
	@rm -rf Build/
	@rm -f Scripts/oak.min.js
	@rm -f Scripts/ui.min.js