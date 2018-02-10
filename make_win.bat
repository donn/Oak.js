call tsc
cd Build
copy /b *.js oak.js
cd ..
call uglifyjs Build/oak.js -o Scripts/oak.min.js
call uglifyjs Sources/OakUI.js -o Scripts/oakui.min.js
:: copy Build\oak.js Scripts\oak.min.js
:: copy Sources\OakUI.js Scripts\oakui.min.js