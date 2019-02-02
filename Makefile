# I'm sick of you hipster web devs and your build scripts let me write "make" in the terminal in peace
TS_SRC = $(shell find oak -name "*.ts" | grep -v Zero.ts)

bin/oak: $(TS_SRC)
	node ./node_modules/typescript/bin/tsc --module amd --pretty --target ES2016 --removeComments --noEmitOnError oak/main.ts --outFile $@
	echo '#!/usr/bin/env node' | cat - $@ > $(@D)/temp && mv $(@D)/temp $@
	chmod +x $@
	@echo "\033[1;32m>> Build complete.\033[0m"

.PHONY: clean test
test:
	./bin/oak examples/riscv/bubblesort.S > /dev/null
	./bin/oak -a mips examples/mips/bubblesort.S > /dev/null
	@echo "\033[1;32m>> Tests completed successfully.\033[0m"

clean:
	rm -rf bin
	rm -rf build