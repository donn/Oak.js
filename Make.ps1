# Build Script For Powershell and Inferior Operating Systems
tsc Sources/Zero.ts --outFile Build/Sources/Zero.js
uglifyjs Build/Sources/Zero.js -o Scripts/oak.min.js
uglifyjs UI/OakUI.js -o Scripts/oakui.min.js

# In Case Of Uglify Debugging, Break Glass
# cp Build/Sources/Zero.js Scripts/oak.min.js
# cp UI/OakUI.js Scripts/oakui.min.js