all:
	@tsc Sources/*.ts --outDir Build/
	@cat Build/*.js | uglifyjs -c > Scripts/oak.min.js
	@uglifyjs Sources/OakUI.js -c > Scripts/oakui.min.js
	@uglifyjs Libraries/grapheme-splitter/index.js -c > Scripts/grapheme-splitter.min.js
	@uglifyjs Libraries/text-encoding/index.js -c > Scripts/text-encoding.min.js
clean:
	@rm -rf Build/