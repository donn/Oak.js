# Build Script For Powershell and Inferior Operating Systems
tsc Sources/*.ts --outDir Build/
Get-Content ./Build/*.js | Set-Content ./Build/oak.js
uglifyjs Build/oak.js -o Scripts/oak.min.js
uglifyjs Sources/OakUI.js -o Scripts/oakui.min.js

# In Case Of Uglify Debugging, Break Glass
# cp Build\oak.js Scripts\oak.min.js
# cp Sources\OakUI.js Scripts\oakui.min.js