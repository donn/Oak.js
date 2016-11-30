ace.define("ace/mode/riscv_highlight_rules", ["require", "exports", "module", "ace/lib/oop", "ace/mode/text_highlight_rules"], function(e, t, n) {
    "use strict";
    var r = e("../lib/oop")
      , i = e("./text_highlight_rules").TextHighlightRules
      , s = function() {
        this.$rules = {
            start: [{
                token: "keyword.control.assembly",
                regex: "\\b(?:add|sub|sll|slt|sltu|xor|srl|sra|or|and|jalr|addi|slti|sltiu|xori|ori|andi|lb|lh|lw|lbu|lhu|slli|srli|srai|sb|sh|sw|lui|auipc|beq|bne|blt|bge|bltu|bgeu|jal|ecall|mv|li|la|jr|scall|syscall|string|half|word|byte)\\b",
                caseInsensitive: !0
            }, {
                token: "variable.parameter.register.assembly",
                regex: "\\b(?:zero|ra|sp|gp|tp|t0|t1|t2|s0|s1|a0|a1|a2|a3|a4|a5|a6|a7|s2|s3|s4|s5|s6|s7|s8|s9|s10|s11|t3|t4|t5|t6|x0|x1|x2|x3|x4|x5|x6|x7|x8|x9|x10|x11|x12|x13|x14|x15|x16|x17|x18|x19|x20|x21|x22|x23|x24|x25|x26|x27|x28|x29|x30|x31)\\b",
                caseInsensitive: !0
            }, {
                token: "constant.character.decimal.assembly",
                regex: "\\b[0-9]+\\b"
            }, {
                token: "constant.character.hexadecimal.assembly",
                regex: "\\b0x[A-F0-9]+\\b",
                caseInsensitive: !0
            }, {
                token: "constant.character.hexadecimal.assembly",
                regex: "\\b[A-F0-9]+h\\b",
                caseInsensitive: !0
            }, {
                token: "string.assembly",
                regex: /'([^\\']|\\.)*'/
            }, {
                token: "string.assembly",
                regex: /"([^\\"]|\\.)*"/
            }, {
                token: "support.function.directive.assembly",
                regex: "^\\[",
                push: [{
                    token: "support.function.directive.assembly",
                    regex: "\\]$",
                    next: "pop"
                }, {
                    defaultToken: "support.function.directive.assembly"
                }]
            }, {
                token: ["support.function.directive.assembly", "support.function.directive.assembly", "entity.name.function.assembly"],
                regex: "(^struc)( )([_a-zA-Z][_a-zA-Z0-9]*)"
            }, {
                token: "support.function.directive.assembly",
                regex: "^endstruc\\b"
            }, {
                token: ["support.function.directive.assembly", "entity.name.function.assembly", "support.function.directive.assembly", "constant.character.assembly"],
                regex: "^(%macro )([_a-zA-Z][_a-zA-Z0-9]*)( )([0-9]+)"
            }, {
                token: "support.function.directive.assembly",
                regex: "^%endmacro"
            }, {
                token: ["text", "support.function.directive.assembly", "text", "entity.name.function.assembly"],
                regex: "(\\s*)(%define|%xdefine|%idefine|%undef|%assign|%defstr|%strcat|%strlen|%substr|%00|%0|%rotate|%rep|%endrep|%include|\\$\\$|\\$|%unmacro|%if|%elif|%else|%endif|%(?:el)?ifdef|%(?:el)?ifmacro|%(?:el)?ifctx|%(?:el)?ifidn|%(?:el)?ifidni|%(?:el)?ifid|%(?:el)?ifnum|%(?:el)?ifstr|%(?:el)?iftoken|%(?:el)?ifempty|%(?:el)?ifenv|%pathsearch|%depend|%use|%push|%pop|%repl|%arg|%stacksize|%local|%error|%warning|%fatal|%line|%!|%comment|%endcomment|__NASM_VERSION_ID__|__NASM_VER__|__FILE__|__LINE__|__BITS__|__OUTPUT_FORMAT__|__DATE__|__TIME__|__DATE_NUM__|_TIME__NUM__|__UTC_DATE__|__UTC_TIME__|__UTC_DATE_NUM__|__UTC_TIME_NUM__|__POSIX_TIME__|__PASS__|ISTRUC|AT|IEND|BITS 16|BITS 32|BITS 64|USE16|USE32|__SECT__|ABSOLUTE|EXTERN|GLOBAL|COMMON|CPU|FLOAT)\\b( ?)((?:[_a-zA-Z][_a-zA-Z0-9]*)?)",
                caseInsensitive: !0
            }, {
                token: "support.function.directive.assembly",
                regex: "\\b(?:d[bwdqtoy]|res[bwdqto]|equ|times|align|alignb|sectalign|section|ptr|byte|word|dword|qword|incbin)\\b",
                caseInsensitive: !0
            }, {
                token: "entity.name.function.assembly",
                regex: "^\\s*%%[\\w.]+?:$"
            }, {
                token: "entity.name.function.assembly",
                regex: "^\\s*%\\$[\\w.]+?:$"
            }, {
                token: "entity.name.function.assembly",
                regex: "^[\\w.]+?:"
            }, {
                token: "entity.name.function.assembly",
                regex: "^[\\w.]+?\\b"
            }, {
                token: "comment.assembly",
                regex: "#.*$"
            }]
        },
        this.normalizeRules()
    };
    s.metaData = {
        fileTypes: ["asm", "s"],
        name: "RISCV",
        scopeName: "source.assembly"
    },
    r.inherits(s, i),
    t.RiscvHighlightRules = s
}),
ace.define("ace/mode/folding/coffee", ["require", "exports", "module", "ace/lib/oop", "ace/mode/folding/fold_mode", "ace/range"], function(e, t, n) {
    "use strict";
    var r = e("../../lib/oop")
      , i = e("./fold_mode").FoldMode
      , s = e("../../range").Range
      , o = t.FoldMode = function() {}
    ;
    r.inherits(o, i),
    function() {
        this.getFoldWidgetRange = function(e, t, n) {
            var r = this.indentationBlock(e, n);
            if (r)
                return r;
            var i = /\S/
              , o = e.getLine(n)
              , u = o.search(i);
            if (u == -1 || o[u] != "#")
                return;
            var a = o.length
              , f = e.getLength()
              , l = n
              , c = n;
            while (++n < f) {
                o = e.getLine(n);
                var h = o.search(i);
                if (h == -1)
                    continue;
                if (o[h] != "#")
                    break;
                c = n
            }
            if (c > l) {
                var p = e.getLine(c).length;
                return new s(l,a,c,p)
            }
        }
        ,
        this.getFoldWidget = function(e, t, n) {
            var r = e.getLine(n)
              , i = r.search(/\S/)
              , s = e.getLine(n + 1)
              , o = e.getLine(n - 1)
              , u = o.search(/\S/)
              , a = s.search(/\S/);
            if (i == -1)
                return e.foldWidgets[n - 1] = u != -1 && u < a ? "start" : "",
                "";
            if (u == -1) {
                if (i == a && r[i] == "#" && s[i] == "#")
                    return e.foldWidgets[n - 1] = "",
                    e.foldWidgets[n + 1] = "",
                    "start"
            } else if (u == i && r[i] == "#" && o[i] == "#" && e.getLine(n - 2).search(/\S/) == -1)
                return e.foldWidgets[n - 1] = "start",
                e.foldWidgets[n + 1] = "",
                "";
            return u != -1 && u < i ? e.foldWidgets[n - 1] = "start" : e.foldWidgets[n - 1] = "",
            i < a ? "start" : ""
        }
    }
    .call(o.prototype)
}),
ace.define("ace/mode/riscv", ["require", "exports", "module", "ace/lib/oop", "ace/mode/text", "ace/mode/riscv_highlight_rules", "ace/mode/folding/coffee"], function(e, t, n) {
    "use strict";
    var r = e("../lib/oop")
      , i = e("./text").Mode
      , s = e("./riscv_highlight_rules").RiscvHighlightRules
      , o = e("./folding/coffee").FoldMode
      , u = function() {
        this.HighlightRules = s,
        this.foldingRules = new o
    };
    r.inherits(u, i),
    function() {
        this.lineCommentStart = ";",
        this.$id = "ace/mode/riscv"
    }
    .call(u.prototype),
    t.Mode = u
})
