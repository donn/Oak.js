function Tab(_name, _content, _machinecode) {
    return {
        name: _name,
        content: _content,
        machinecode: _machinecode,
        console: "",
        instructionLog: "",
        instructionSet: 0,
        memorySize: 4096,
        core: new RISCVCore(4096, invokeEnvironmentCall, decodeCallback),
        registers: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
    };
}

var tabs = [];
var currentTab = -1;
var editor;
var mcEditor;

var CONSOLE_ERROR = 0;
var CONSOLE_SUCCESS = 1;
var CONSOLE_WARNING = 2;
var CONSOLE_NORMAL = 3;

function resizeMC() {

}

function resizeRAM() {

}

function resize() {
    resizeMC();
    resizeRAM();
}

function addConsoleMsg(msg, type) {
    var typeStr = "";
    if (type == CONSOLE_ERROR)
        typeStr = " class='error'";
    else if (type == CONSOLE_SUCCESS)
        typeStr = " class='success'";
    else if (type == CONSOLE_WARNING)
        typeStr = " class='warning'";
    $("#console").append("<span"+typeStr+">"+msg+"</span>");
}

/* Calls */
function uiAssemble() {
    var val = editor.getValue();
    if (val == "") {
        return;
    }

    var core = tabs[currentTab].core;
    resetCore(core);
    var val = editor.getValue();
    var output = assemble(core, val);

    $("#console").html("");
    if (output.errorMessage==null) {
        $("#machineCode").val(output.machineCode.Oak_hex());
        addConsoleMsg("<b>Assembly Succeeded!</b", CONSOLE_SUCCESS);
    }
    else {
        addConsoleMsg("<b>Assembler Error: </b>" + output.errorMessage, CONSOLE_ERROR);
    }
}

function uiStepbystep() {
}

function updateRegAndMemory() {
    var core = tabs[currentTab].core;
    var t0 = performance.now();		
    console.log("Updating memory/registers...");
    
    for (var i = 0; i < 32; i++) {
        tabs[currentTab].registers[i] = registerRead(core, i);
    }

    var memory = getMemory(core);
    $("#memory").html("");
    for (var i=0; i < memory.length; i++) {
        var memOut = memory[i];
        $("#memory").append("0x"+padNo(memOut.toString(16), 2) + " ");
    }
    showRegisters();
    var t1 = performance.now();
    
    console.log("Memory/register update done in " + (t1 - t0) + "ms.");
}

var startSim;

function uiSimulate() {
    var core = tabs[currentTab].core;
    var consoleContents = $("#console").html();
    if (consoleContents.length > 0) {
        $("#console").html("");
        $("#log").html("");
    }

    resetCore(core);
    var val = $("#machineCode").val();
    var bytes = [];
    var hex = val.split(" ");
    for (var i = 0; i < hex.length; i++) {
        var byte = parseInt(hex[i], 16);
        if (!isNaN(byte))
            bytes.push(byte);
    }

    if (tabs[currentTab].memorySize <= bytes.length) {
        addConsoleMsg("<b>ERROR: </b>The allocated memory size is not big enough to contain the program. Please make it at least " + bytes.length + " big.", CONSOLE_ERROR);
        return;
    }

    startSim = performance.now();
    var output = simulate(core, bytes);
    if (output !== "@Oak_Ecall" && output != null) {
        updateRegAndMemory();
        addConsoleMsg("<b>Simulator Error: </b>" + output, CONSOLE_ERROR);
    }
}

function updateMemorySize(newSize) {
    if (newSize != tabs[currentTab].memorySize) {
        if (newSize < 8) {
            addConsoleMsg("<b>ERROR: </b> Please make the memory at least 8 bits. It should be enough to contain all instructions.", CONSOLE_ERROR);
            return;
        }

        tabs[currentTab].memorySize = newSize;
        delete tabs[currentTab].core;
        tabs[currentTab].core = new RISCVCore(newSize, invokeEnvironmentCall, decodeCallback);
        updateRegAndMemory();
        $("#console").html("");
        addConsoleMsg("<b>SUCCESS: </b> Memory size has been successfully update. Please ensure, though, that it is enough to contain the program and any extra memory.", CONSOLE_SUCCESS);
    }
}

function setConsoleMode(mode) {
    if (mode == 0) {
        $("#memory, #log").css("display", "none");
        $("#console").css("display", "block");
    }
    else if (mode == 1) {
        $("#console, #log").css("display", "none");
        $("#memory").css("display", "block");
    }
    else {
        $("#console, #memory").css("display", "none");
        $("#log").css("display", "block");
    }

    $("#consoleSel").val(mode);
}

function showRegisters() {
    var mode = parseInt($("#regSel").val());
    var registers = tabs[currentTab].registers;
    var cells = $("table tr > td:nth-child(2)");

    for (var i = 0; i < registers.length; i++) {
        var output;
        switch(mode) {
            case 0: // Hex
                output = "0x"+padNo((registers[i] >>> 0).toString(16), 8);
                break;
            case 1: // uint
                output = (registers[i] >>> 0).toString(10);
                break;
            case 2: // int
                output = registers[i].toString(10);
                if (output > 2147483648) { output = output - 4294967296 }
                break;
            case 3: // bin
                output = "0b"+padNo((registers[i] >>> 0).toString(2), 32);
                break;
            case 4: // float
                output = oakParseToFloat(registers[i]);
                break;
        }
        cells.eq(i).html(output);
    }
}

/* Callbacks */
function invokeEnvironmentCall() {
    var core = tabs[currentTab].core;

    var type = registerRead(core, 17);
    var arg = registerRead(core, 10);

    setConsoleMode(0);
    var exit = false;

    switch (type) {
    case 1: // Integer
        $("#console").append("<span> >>> "+arg+"</span>");
        break;
    case 4: // String
        var pointer = arg;
        var output = "";
        var char = core.memory[pointer];
        while (char != 0)
        {
            output += String.fromCharCode(char);
            pointer += 1;
            char = core.memory[pointer];
        }
        console.log(output);
        $("#console").append("<span> >>> "+output+"</span>");
        break;
    case 5:
        updateRegAndMemory();
        var input = prompt("Please enter a number as input.");
        tabs[currentTab].registers[17] = parseInt(input);
        registerWrite(core, 17, parseInt(input));
        $("#console").append("<span class='input insertable'> <<< "+input+"</span>");
        break;
    case 10:
        exit = true;
        break;
    default:
        addConsoleMsg("<b>WARNING:</b> Environment call " + type + "unsupported.", CONSOLE_WARNING);
        break;
    }

    if (!exit) {
        var output = continueSim(core);
        if (output != "@Oak_Ecall" && output != null) {
            updateRegAndMemory();
            addConsoleMsg("<b>Simulator Error: </b>" + output, CONSOLE_ERROR);
        }
    } else {
        updateRegAndMemory();
        var time = performance.now() - startSim;
        var numInstructions = $("#log > span").length;
        var ips = numInstructions*1000.0/time;
        addConsoleMsg("<b>Complete:</b> Simulation completed in "+Math.round(time)+" ms, "+numInstructions+" instructions, "+Math.round(ips)+" instructions/second.", CONSOLE_SUCCESS);
    }
}

function decodeCallback(data) {
    $("#log").append("<span>"+data+"</span>");
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

function padNo(str, length) {
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

function downloadAsm() {
    var data = editor.getValue();
    if (data.length == 0) {
        return;
    }

    var el = document.createElement('a');
    var blob = new Blob([data], {type: "text/plain"});
    var blobLink = URL.createObjectURL(blob);
    
    var name = tabs[currentTab].name+".s";
    el.setAttribute('href', blobLink);
    el.setAttribute('download', name);

    el.style.display = 'none';
    document.body.appendChild(el);
    el.click();
    document.body.removeChild(el);
}

function downloadBin() {
    var data = $("#machineCode").val();
    if (data.length == 0) {
        return;
    }

    var hexdata = data.split(" ");
    var bytes = [];
    for (var i = 0; i < hexdata.length; i++) {
        var v = parseInt(hexdata[i], 16);
        if (!isNaN(v))
            bytes.push(v);
    }
    var byteArray = new Uint8Array(bytes);
    var blob = new Blob([byteArray], {type: "application/octet-stream"});
    var blobLink = URL.createObjectURL(blob);
    
    var element = document.createElement('a');
    var name = tabs[currentTab].name+".bin";
    element.setAttribute('href', blobLink);
    element.setAttribute('download', name);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

function downloadRam() {
    var data = $("#memory").html();
    if (data.length == 0) {
        return;
    }

    var hexdata = data.split(" ");
    var bytes = [];
    for (var i = 0; i < hexdata.length; i++) {
        var v = parseInt(hexdata[i], 16);
        if (!isNaN(v))
            bytes.push(v);
    }
    var byteArray = new Uint8Array(bytes);
    var blob = new Blob([byteArray], {type: "application/octet-stream"});
    var blobLink = URL.createObjectURL(blob);
    
    var element = document.createElement('a');
    var name = tabs[currentTab].name+".ram";
    element.setAttribute('href', blobLink);
    element.setAttribute('download', name);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);

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

    var defaultTab = "<div class='selected'><span></span><div></div></div>";
    var defaultCode = "    la a0, str\n    li a7, 4 #4 is the string print service number...\n    ecall\n    li a7, 10 #...and 10 is the program termination service number!\n    ecall\n.data\nstr:\    .string \"Hello, World!\"";
    var riscvRegNames = ["zero", "ra", "sp", "gp", "tp", "t0", "t1", "t2", "s0", "s1", "a0", "a1", "a2", "a3", "a4", "a5", "a6", "a7", "s2", "s3", "s4", "s5", "s6", "s7", "s8", "s9", "s0", "s11", "t3", "t4", "t5", "t6"];
    var mipsRegNames = ["$zero", "$v0", "$v1", "$a0", "$a1", "$a2", "$a3", "$t0", "$t1", "$t2", "$t3", "$t4", "$t5", "$t6", "$t7", "$s0", "$s1", "$s2", "$s3", "$s4", "$s5", "$s6", "$s7", "$t8", "$t9", "$gp", "$sp", "$fp", "$ra"];

    function setRegisterNames() {
        var regNames;
        if (tabs[currentTab].instructionSet == 0) 
            regNames = riscvRegNames;
        else
            regNames = mipsRegNames;

        // When we add non-32 reg ISAs, here we should resize the table.
        var cells = $("table tr > td:first-child");
        for (var i = 0; i < regNames.length; i++) {
            cells.eq(i).html(regNames[i]);
        }
        showRegisters();
    }

    function addTab(name, code, machinecode) {
        if (tabs.length != 0) {
            tabs[currentTab].content = editor.getValue();
            tabs[currentTab].machineCode = mcEditor.val();
            tabs[currentTab].instructionLog = $("#log").html();
            tabs[currentTab].console = $("#console").html();
        }

        $("body").removeClass("noTab");
        $("section nav > div").removeClass("selected");
        currentTab = $("section nav > div").length;
        $("section nav").append(defaultTab);
        $("section nav > div.selected span").html(name);
        $("section nav > div.selected").on("click", function() {
            var n = $(this).index();
            switchToTab(n);
        });
        $("section nav > div.selected > div").on("click", function(e) {
            var n = $(this).parent().index();
            removeTab(n);
            e.preventDefault();
        });
        $("#regSel").on("change", function() {
            showRegisters();
        });
        $("#filename").val(name);
        $("#isa").val(0);
        $("#memsize").val(4096);
        $("#console").html("");
        $("#memory").html("");
        $("#log").html("");
        tabs.push(Tab(name, code, machinecode));
        editor.setValue(code);
        mcEditor.val(machinecode);
        setRegisterNames();
    }

    function switchToTab(num) {
        tabs[currentTab].content = editor.getValue();
        tabs[currentTab].machinecode = mcEditor.val();
        tabs[currentTab].console = $("#console").html();
        tabs[currentTab].instructionLog = $("#log").html();
        editor.setValue(tabs[num].content);
        mcEditor.val(tabs[num].machinecode);
        var tabsEl = $("section nav > div");
        tabsEl.eq(currentTab).removeClass("selected");
        tabsEl.eq(num).addClass("selected");
        $("#filename").val(tabs[num].name);
        $("#isa").val(tabs[num].instructionSet);
        $("#memsize").val(tabs[num].memorySize);
        $("#console").html(tabs[num].console);
        $("#log").html(tabs[num].instructionLog);

        currentTab = num;
        updateRegAndMemory();
        setRegisterNames();
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
            $("section nav > div").eq(id).remove();
            if (currentTab > id)
                currentTab--;
            else if (currentTab == id) {
                if (id != 0)
                    currentTab--;
                
                var tabsEl = $("section nav > div");
                tabsEl.removeClass("selected");
                tabsEl.eq(currentTab).addClass("selected");
                $("#filename").val(tabs[currentTab].name);
                $("#isa").val(tabs[currentTab].instructionSet);
                $("#memsize").val(tabs[currentTab].memorySize);
                editor.setValue(tabs[currentTab].content);
                mcEditor.val(tabs[currentTab].machineCode);
                $("#console").html(tabs[currentTab].console);
                $("#log").html(tabs[currentTab].instructionLog);
                setRegisterNames();
            }
        }
    }
    function removeTabThis() {
        removeTab(currentTab);
    }

    function uploadBin(e) {
        var files = $("#fileInputElement")[0].files;
        if (!files.length) {
            //addToast("<b>No Files: </b> Please choose files to upload one.", TOAST_WARNING);
            return;
        }

        var file = files[0];
        
        var blob = file.slice(0, file.size);
        var fr = new FileReader();
        fr.addEventListener('load', function () {
            var bytes = new Uint8Array(this.result);
            var hexer = "";
            for (var i=0; i < bytes.length; i++) {
                if (bytes[i] < 16) {
                    hexer += ("0"+bytes[i].toString(16).toUpperCase()+" ");
                }
                else {
                    hexer += (bytes[i].toString(16).toUpperCase()+" ");
                }
            }

            addTab(file.name, "", hexer);
        });
        fr.readAsArrayBuffer(blob);
        $("#fileInputElement").val("");
    }

    function uploadAsm(e) {
        var files = $("#asmInputElement")[0].files;
        if (!files.length) {
            //addToast("<b>No file chosen.</b>", TOAST_WARNING);
            return;
        }

        var file = files[0];
            
        var blob = file.slice(0, file.size);
        var fr = new FileReader();
        fr.addEventListener('load', function () {
            addTab(file.name, this.result, "");
        });
        fr.readAsText(blob);
        $("#asmInputElement").val("");
    }

    $(document).ready(function() {
        $('select').val(0);
        for (var i = 1; i < 3; i++)
            $("#theme"+i).prop('disabled', true);

        editor = ace.edit("editor");
        editor.setOption("firstLineNumber", 0);
        editor.setTheme("ace/theme/oak");
        editor.getSession().setMode("ace/mode/riscv");
        editor.getSession().setUseWrapMode(true);
        editor.$blockScrolling = Infinity;

        mcEditor = $("#machineCode");

        addTab("Untitled", defaultCode, "");
        $(".addTab").on("click", function() {addTab("Untitled", defaultCode, "")});
        $(".removeTab").on("click", function() {removeTabThis();});
        $("#convertBtn").on("click", function() {converter()});
        $("#consoleSel").on("change", function() {setConsoleMode($(this).val());});
        $("#fileInputElement").on("change", function(e) {uploadBin(e)});
        $("#asmInputElement").on("change", function(e) {uploadAsm(e)});
        $(".loadAsm").on("click", function() {$("#asmInputElement").click();})
        $(".loadBin").on("click", function() {$("#fileInputElement").click();})
        
        $("#applyBtn").on("click", function() {
            var name = $("#filename").val();
            $("nav .selected span").html(name);
            tabs[currentTab].name = name;
            
            var isa = $("#isa").val();
            if (tabs[currentTab].instructionSet != isa) {
                tabs[currentTab].instructionSet = isa;
                setRegisterNames();
            }
            
            var memsize = $("#memsize").val();
            updateMemorySize(memsize);
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