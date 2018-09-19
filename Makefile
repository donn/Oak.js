SOURCES = $(wildcard src/backend/**/*.ts) src/backend/Assembler.ts src/backend/Core.ts src/backend/InstructionSet.ts src/backend/Memory.ts src/backend/VirtualOS.ts
TERMINAL = $(SOURCES) src/backend/main.ts
BACKEND = $(SOURCES) src/backend/Zero.ts

FLAGS = --module amd --pretty --target ES2016 --removeComments --noEmitOnError

all: terminal
backend: src/backend.js
terminal: bin/Oak.js

bin/Oak.js: $(SOURCES)
	@mkdir -p $(@D)
	@./node_modules/typescript/bin/tsc $(FLAGS) src/backend/main.ts --outFile $@
	@echo "Terminal Compiled"

src/backend.js: $(BACKEND)
	@mkdir -p $(@D)
	@./node_modules/typescript/bin/tsc $(FLAGS) src/backend/Zero.ts --outFile $@
	@cat src/backend/ZeroPlus.js >> src/backend.js
	@echo "Backend Compiled"
	
clean:
	@rm -rf bin/
	@rm -f src/backend.js