# Build Script For Powershell and Inferior Operating Systems
tsc Libraries/**/*.ts Sources/*.ts --outDir Build/
Get-Content ./Build/*.js | Set-Content ./Build/oak.js
uglifyjs Build/oak.js -o Scripts/oak.min.js
uglifyjs Sources/OakUI.js -o Scripts/oakui.min.js
uglifyjs Libraries/grapheme-splitter/index.js -c > Scripts/grapheme-splitter.min.js
uglifyjs Libraries/text-encoding/index.js -c > Scripts/text-encoding.min.js

# In Case Of Uglify Debugging, Break Glass
# cp Build\oak.js Scripts\oak.min.js
# cp Sources\OakUI.js Scripts\oakui.min.js