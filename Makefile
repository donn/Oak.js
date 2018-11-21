# I'm sick of you hipster web devs and your build scripts let me write "make" in the terminal in peace
TS_SRC = $(shell find oak -name "*.ts" | grep -v Zero.ts)

bin/Oak.js: $(TS_SRC)
	node ./node_modules/typescript/bin/tsc --module amd --pretty --target ES2016 --removeComments --noEmitOnError oak/main.ts --outFile $@
	echo '#!/usr/bin/env node' | cat - $@ > $(@D)/temp && mv $(@D)/temp $@
	chmod +x $@

.PHONY: clean
clean:
	rm -rf bin
	rm -rf build