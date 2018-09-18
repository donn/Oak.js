ace.define("ace/theme/theme",["require","exports","module","ace/lib/dom"], function(acequire, exports, module) {

    exports.isDark = false;
    exports.cssClass = "ace-theme";
    exports.cssText = "";
    
    var dom = acequire("../lib/dom");
    dom.importCssString(exports.cssText, exports.cssClass);
});
    