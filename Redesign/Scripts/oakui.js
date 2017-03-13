function Tab(_name, _content) {
    return {
        name: _name,
        content: _content,
        instructionSet: 0,
        memorySize: 4096
    };
}

function setOptionsTab(index) {
    for (var i = 0; i < 3; i++) {
        if (i == index) {
            $("aside > div").eq(i+2).addClass("selected");
            $(".optionsTabs > div").eq(i).addClass("selected");
        }
        else {
            $("aside > div").eq(i+2).removeClass("selected");
            $(".optionsTabs > div").eq(i).removeClass("selected");
        }
    }
}

function padNo(str, length)
{
    var padded = str;
    for (var i = 0; i < length - str.length; i++)
    {
        padded = "0" + padded;
    }
    return padded;
}

// Not working properly.
function oakParseFromFloat(num) {
    var sign = (num < 0);
    var signString = (sign)?"1":"0";
    
    var flParts = num.toString().split(".");
    var wholePart = parseInt(flParts[0]);
    var fracPart = 0;
    if (isNaN(wholePart))   wholePart = 0;
    if (flParts.length > 1) fracPart = parseInt(flParts[1]);

    // Whole mantissa
    var wholeMantissa = (wholePart >>> 0).toString(2);

    // Frac mantissa
    var fracMantissaStr = "";
    var fracPartParsing = parseFloat("0."+fracPart.toString());
    var i = 0;
    while(fracPartParsing > 0) {
        //fracMantissa += ((true)?"1":"0");
        var potentialAdd = Math.pow(2, -i-1);
        
        if (fracPartParsing - potentialAdd < 0) {
            // Wrong Number
            fracMantissaStr += "0";
        }
        else {
            // Right Number
            fracPartParsing -= potentialAdd;
            fracMantissaStr += "1";
        }

        i++;
    }
    var finalMantissa = parseInt(wholeMantissa.substr(1)+fracMantissaStr, 2).toString(2);

    alert(wholeMantissa);
    
    var exponent;
    if (wholeMantissa > 0) {
        exponent = wholeMantissa.length;
    }
    else {
        exponent = -fracMantissaStr.length;
    }
    finalMantissa = parseInt(wholeMantissa.substr(1)+fracMantissaStr, 2).toString(2).substring(0,23);

    exponent += 127;
    exponent = Math.log2(exponent);
    var exponentStr = (exponent >>> 0).toString(2);
    var finalStr = signString+"|"+padNo(exponentStr, 8)+"|"+padNo(finalMantissa, 23);
    alert(finalStr);
    return parseInt(finalStr, 2);
}

// From Jonas Raoni Soares Silva, JSFromHell states
//          that code can be redistributed and modified
//          as long as original credits are kept.
// http://jsfromhell.com/classes/binary-parser
function encodeFloat(number) {
    var n = +number,
        status = (n !== n) || n == -Infinity || n == +Infinity ? n : 0,
        exp = 0,
        len = 281, // 2 * 127 + 1 + 23 + 3,
        bin = new Array(len),
        signal = (n = status !== 0 ? 0 : n) < 0,
        n = Math.abs(n),
        intPart = Math.floor(n),
        floatPart = n - intPart,
        i, lastBit, rounded, j, exponent;

    if (status !== 0) {
        if (n !== n) {
            return 0x7fc00000;
        }
        if (n === Infinity) {
            return 0x7f800000;
        }
        if (n === -Infinity) {
            return 0xff800000
        }
    }

    i = len;
    while (i) {
        bin[--i] = 0;
    }

    i = 129;
    while (intPart && i) {
        bin[--i] = intPart % 2;
        intPart = Math.floor(intPart / 2);
    }

    i = 128;
    while (floatPart > 0 && i) {
        (bin[++i] = ((floatPart *= 2) >= 1) - 0) && --floatPart;
    }

    i = -1;
    while (++i < len && !bin[i]);

    if (bin[(lastBit = 22 + (i = (exp = 128 - i) >= -126 && exp <= 127 ? i + 1 : 128 - (exp = -127))) + 1]) {
        if (!(rounded = bin[lastBit])) {
            j = lastBit + 2;
            while (!rounded && j < len) {
                rounded = bin[j++];
            }
        }

        j = lastBit + 1;
        while (rounded && --j >= 0) {
            (bin[j] = !bin[j] - 0) && (rounded = 0);
        }
    }
    i = i - 2 < 0 ? -1 : i - 3;
    while(++i < len && !bin[i]);
    (exp = 128 - i) >= -126 && exp <= 127 ? ++i : exp < -126 && (i = 255, exp = -127);
    (intPart || status !== 0) && (exp = 128, i = 129, status == -Infinity ? signal = 1 : (status !== status) && (bin[i] = 1));

    n = Math.abs(exp + 127);
    exponent = 0;
    j = 0;
    while (j < 8) {
        exponent += (n % 2) << j;
        n >>= 1;
        j++;
    }

    var mantissa = 0;
    n = i + 23;
    for (; i < n; i++) {
        mantissa = (mantissa << 1) + bin[i];
    }
    return ((signal ? 0x80000000 : 0) + (exponent << 23) + mantissa) | 0;
}

function oakParseToFloat(num) {
    var mantissaMask = 0x7fffff;
    var expMask = 0x7f800000;
    var signMask = 0x80000000;

    var sign = 1;
    if (signMask & num) sign = -1;
    var exp = (expMask & num) >> 23;
    exp = Math.pow(2, (exp - 127));
    var mantissa = (mantissaMask & num);
    for (var i = 0; i < 23; i++) {
        mantissa /= 2;
    }
    mantissa += 1;

    return sign * exp * mantissa;
}

function converter() {
    var input = $("#inputVal").val();
    var inputType = parseInt($("#inputSel").val());
    switch(inputType) {
        case 0: // Hex
            input = parseInt(input, 16);
            break;
        case 1: // uint
        case 2: // int
            input = parseInt(input, 10);
            break;
        case 3: // bin
            input = parseInt(input, 2);
            break;
        case 4: // float
            input = encodeFloat(input);
            break;
    }

    if (input.toString() == "NaN")
        alert("Invalid value for input!");

    var output;
    var outputType = parseInt($("#outputSel").val());
    switch(outputType) {
        case 0: // Hex
            output = "0x"+padNo((input >>> 0).toString(16), 8);
            break;
        case 1: // uint
            output = (input >>> 0).toString(10);
            break;
        case 2: // int
            output = input.toString(10);
            if (output > 2147483648) { output = output - 4294967296 }
            break;
        case 3: // bin
            output = "0b"+padNo((input >>> 0).toString(2), 32);
            break;
        case 4: // float
            output = oakParseToFloat(input);
            break;
    }
    $("#outputVal").val(output);
}
    
(function() {
    "use strict";

    function contextMenuListener(el) {
        el.addEventListener( "contextmenu", function(e) {
            $("#contextMenu").css({left: e.pageX, top: e.pageY}).stop().slideDown(64);
            
            var i = 0;
            while (el.parentElement.children[i]!==el) {
                i++;
            }
            
            $('body').click(function(evt){    
                /*if(evt.target.id == "contextMenu")
                    return;
                
                if($(evt.target).closest('#contextMenu').length)
                    return;*/
                $("#contextMenu").slideUp(64);
            });

            e.preventDefault();
        });
    }

    var tabs = [];
    var currentTab = -1;

    var defaultTab = "<div class='selected'><span></span><div></div></div>";
    var defaultCode = "    la a0, str\n    li a7, 4 #4 is the string print service number...\n    ecall\n    li a7, 10 #...and 10 is the program termination service number!\n    ecall\n.data\nstr:\    .string \"Hello, World!\"";
    
    function addTab(name, code) {
        var editor = ace.edit($("section > #editor").get(0));
        
        if (tabs.length != 0)
            tabs[currentTab].content = editor.getValue();

        $("body").removeClass("noTab");
        $("section nav > div").removeClass("selected");
        currentTab = $("section nav > div").length;
        $("section nav").append(defaultTab);
        $("section nav > div.selected span").html(name + " " + (1+currentTab));
        $("section nav > div.selected").on("click", function() {
            var n = $(this).index();
            switchToTab(n);
        });
        $("section nav > div > div").on("click", function() {
            var n = $(this).index();
            //removeTab(n);
        });
        $("#filename").val(name + " " + (1+currentTab));
        $("#isa").val(0);
        $("#memsize").val(4096);
        tabs.push(Tab(name + " " + (1+currentTab), code));
        editor.setValue(tabs[currentTab].content);
    }

    function switchToTab(num) {
        var editor = ace.edit($("section > #editor").get(0));
        tabs[currentTab].content = editor.getValue();
        editor.setValue(tabs[num].content);
        var tabsEl = $("section nav > div");
        tabsEl.eq(currentTab).removeClass("selected");
        tabsEl.eq(num).addClass("selected");
        $("#filename").val(tabs[num].name);
        $("#isa").val(tabs[num].instructionSet);
        $("#memsize").val(tabs[num].memorySize);

        currentTab = num;
    }

    function removeTab(id) {
        if (tabs.length == 1) {
            tabs.pop();
            $("section nav").html("");
            $("body").addClass("noTab");
            currentTab = -1;
        }
        else {
            tabs.splice(id, 1);
            alert(tabs.length);
            $("section nav > div").eq(id).remove();
        }
    }
    
    $(document).ready(function() {
        $('select').val(0);
        for (var i = 1; i < 3; i++)
            $("#theme"+i).prop('disabled', true);

        $("section > #editor").html(defaultCode);
        var editor = ace.edit($("section > #editor").get(0));
        editor.setOption("firstLineNumber", 0);
        editor.setTheme("ace/theme/oak");
        editor.getSession().setMode("ace/mode/riscv");
        editor.getSession().setUseWrapMode(true);

        $(".addTab").on("click", function() {addTab("Untitled", defaultCode)});
        $("#convertBtn").on("click", function() {converter()});
        
        $("#applyBtn").on("click", function() {
            var name = $("#filename").val();
            $("nav .selected span").html(name);
            tabs[currentTab].name = name;
            
            var isa = $("#isa").val();
            tabs[currentTab].instructionSet = isa;
            
            var memsize = $("#memsize").val();
            tabs[currentTab].memorySize = memsize;
        });
        
        $('#sideGrabber').on('mousedown', function(e){
            var $element = $(this).parent();
            var $element2 = $(this).parent().parent().find("section");
            var $element3 = $(this).parent().parent().find("footer");
            var width = $(this).parent().parent().width();
            
            $(document).on('mouseup', function(e){
                $(document).off('mouseup').off('mousemove');

                e.preventDefault();
            });

            $(document).on('mousemove', function(me){
                var mx = (me.pageX)*100.0/width;
                mx = Math.min(90, Math.max(20, mx));

                $element.css({width: ((100-mx)+"%")});
                $element2.css({width: ((mx)+"%")});
                $element3.css({width: ((mx)+"%")});

                me.preventDefault();
            });

            e.preventDefault();
        });
        
        $('#editorGrabber').on('mousedown', function(e){
            var $element = $(this).parent();
            var $element2 = $(this).parent().parent().find("#editor");
            var width = $(this).parent().parent().width();
            
            $(document).on('mouseup', function(e){
                $(document).off('mouseup').off('mousemove');

                e.preventDefault();
            });

            $(document).on('mousemove', function(me){
                var mx = (me.pageX)*100.0/width;
                mx = Math.min(90, Math.max(20, mx));

                $element.css({width: ((100-mx)+"%")});
                $element2.css({width: ((mx)+"%")});
                $element3.css({width: ((mx)+"%")});

                me.preventDefault();
            });

            e.preventDefault();
        });
        
        $('#yGrabber').on('mousedown', function(e){
            var $element = $(this).parent();
            var $element2 = $(this).parent().parent().find("footer");
            var height = $(this).parent().parent().height();

            var	pY = e.pageY-$(this).position().top+$element.position().top;
            
            $(document).on('mouseup', function(e){
                $(document).off('mouseup').off('mousemove');

                e.preventDefault();
            });
            $(document).on('mousemove', function(me){
                var my = (me.pageY - pY)*100.0/height;
                my = Math.min(90, Math.max(15, my));

                $element.css({height: ((my)+"%")});
                $element2.css({height: ((100-my)+"%")});

                me.preventDefault();
            });

            e.preventDefault();
        });
    });

    $("#themes").change(function() {
        var themeID = $(this).val();
        for (var i = 0; i < 3; i++)
            $("#theme"+i).prop('disabled', i!=themeID);
    });

    $("#editorSel").change(function() {
        var v = $(this).val();
        
        if (v == 1) {
            $("section > #editor").css({width: "50%"});
            $("section > aside").css({width: "50%"});
        }
        else {
            $("section > #editor").css({width: "100%"});
            $("section > aside").css({width: "0%"});
        }
    });

})();