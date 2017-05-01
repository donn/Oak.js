tsc Sources/*.ts --outDir Build/
cat Build/*.js > Sources/Oak.js
uglifyjs Sources/Oak.js -c > Scripts/oak.min.js
uglifyjs Sources/OakUI.js -c > Scripts/oakui.min.js