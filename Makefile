all:
	@tsc Sources/*.ts --outDir Build/
	@cat Build/*.js | uglifyjs -c > Scripts/oak.min.js
	@uglifyjs Sources/OakUI.js -c > Scripts/oakui.min.js
clean:
	@rm -rf Build/