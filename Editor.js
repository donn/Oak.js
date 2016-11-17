var coreArray = [];

var TOAST_NORMAL = 0;
var TOAST_WARNING = 1;
var TOAST_ERROR = 2;

var INPUT_NOINPUT = 0;
var INPUT_NUMERICAL = 1;
var INPUT_ALPHANUMERIC = 2;

var cursor = 0;
var inputMode = INPUT_NOINPUT;

function addToast(str, type) {
	if (type==TOAST_ERROR)
		$("#toasts").append("<div class='error'>"+str+"<span class='close'></span></div>");
	else if (type==TOAST_WARNING)
		$("#toasts").append("<div class='warning'>"+str+"<span class='close'></span></div>");
	else
		$("#toasts").append("<div>"+str+"<span class='close'></span></div>");
	
	$("#toasts div:last-child").delay(3600).fadeOut(400, function() {$(this).remove();});
	
	$("#toasts div:last-child .close").on( "click", function() {$(this).parent().stop().fadeOut(200, function() {$(this).remove();})});
}

$("#ShowMC").on("change", function() {
	if($(this).prop('checked') == true) {
		$("main section.sel #machinecode").stop().slideDown(200);
	} else {
		$("main section.sel #machinecode").stop().slideUp(200);
	}
});

function assembleField() {
	if (inputMode == INPUT_NOINPUT) {
		resetCore(coreArray[getSelected()]);
		var val = $("main section.sel #asm").val();
		var output = assemble(coreArray[getSelected()], val);
		if (output.errorMessage==null) {
			$("main section.sel #machinecode").val(output.machineCode.Oak_hex());
			addToast("<b>Complete:</b> Assembly complete, check machine code.", TOAST_NORMAL);
		}
		else {
			addToast("<b>Assembler Error: </b>" + output.errorMessage, TOAST_ERROR);
		}

		$("#ShowMC").prop('checked', true);
		$("main section.sel #machinecode").stop().slideDown(200);
	}
}

$(".assemble").on("click", function() {
	assembleField();
});

function hexToBytes(hex) {
	var hexArr = hex.split(' '); // Remove spaces, then seperate characters
	var byteArr = [];
	for (var i=0; i < hexArr.length; i++) {
		var value = parseInt(hexArr[i], 16);
		if (!isNaN(value))
		{
			byteArr.push(value);
		}
	}

	return byteArr;
}

function getSelected() {
	return $("main section.sel").index();
}

var REG_HEX = 0;
var REG_DEC = 1;
var REG_UDC = 2;
var REG_BIN = 3;

var regDisplay = REG_HEX;

function padNo(str, length)
{
	var padded = str;
	for (var i = 0; i < length - str.length; i++)
	{
		padded = "0" + padded;
	}
	return padded;
}

function updateRegAndMemory() {
	
	if (inputMode == INPUT_NOINPUT) {
		var core = coreArray[getSelected()];
		var t0 = performance.now();		
		console.log("Updating memory/registers...");
		switch(regDisplay)
		{
		case REG_BIN:
			for (var i=0; i < 32; i++) {
				var formatted = "0b" + padNo((registerRead(core, i) >>> 0).toString(2), 32);
				$("main section.sel table tbody").children().eq(i).children("td:last-child").html(formatted);
			}
			break;
		case REG_DEC:
			for (var i=0; i < 32; i++) {
				var formatted = registerRead(core, i).toString(10);
				$("main section.sel table tbody").children().eq(i).children("td:last-child").html(formatted);
			}
			break;
		case REG_UDC:
			for (var i=0; i < 32; i++) {
				var formatted = (registerRead(core, i) >>> 0).toString(10);
				$("main section.sel table tbody").children().eq(i).children("td:last-child").html(formatted);
			}
			break;
		case REG_HEX:
			for (var i=0; i < 32; i++) {
				var formatted = "0x" + padNo((registerRead(core, i) >>> 0).toString(16), 8);
				$("main section.sel table tbody").children().eq(i).children("td:last-child").html(formatted);
			}
		default:
			for (var i=0; i < 32; i++) {
				var formatted = "0x" + padNo((registerRead(core, i) >>> 0).toString(16), 8);
				$("main section.sel table tbody").children().eq(i).children("td:last-child").html(formatted);
			}		
		}


		var memory = getMemory(coreArray[getSelected()]);
		$("main section.sel #memory").html("");
		for (var i=0; i < memory.length; i++) {
			var memOut = memory[i];
			$("main section.sel #memory").append(padNo(memOut.toString(16), 2) + " ");
		}
		var t1 = performance.now();
		
		console.log("Memory/register update done in " + (t1 - t0) + "ms.");
	}
	
}

function selectCommand(id, data) {
	if (data == 0) {
		$("main section.sel p").css("display", "none");
		$("main section.sel #console").css("display", "block");
	}
	else if (data == 1) {
		$("main section.sel p").css("display", "none");
		$("main section.sel #instructions").css("display", "block");
	}
	else if (data == 2) {
		$("main section.sel p").css("display", "none");
		$("main section.sel #memory").css("display", "block");
	}
	else {
		regDisplay = data-3;
		updateRegAndMemory();
	}
	$("main section.sel select").val("-- Choose an Action --");
}

function simulateMC() {
	if (inputMode == INPUT_NOINPUT) {
		var consoleContents = $("main section.sel #console").html();
		if (consoleContents.length > 0) {
			$("main section.sel #console").append("<hr />");
			$("main section.sel #instructions").append("<hr />");
		}

		resetCore(coreArray[getSelected()]);
		var val = $("main section.sel #machinecode").val();
		var bytes = hexToBytes(val);
		var output = simulate(coreArray[getSelected()], bytes);
		if (output !== "SCALL" && output !== null && output != undefined) {
			addToast("<b>Simulator Error: </b>" + output, TOAST_ERROR);
		}
		// else if (output != "SCALL") {
		// 	updateRegAndMemory();
		// 	addToast("<b>Complete:</b> Simulation complete.", TOAST_NORMAL);
		// }
	}
}

$(".stepbystep").on("click", function() {
	if (inputMode == INPUT_NOINPUT) {
		loadMemStep(core, data);
	}
});

$(".simulate").on("click", function() {
	simulateMC();
});

function decodeCallback(data) {
	$("main section.sel #instructions").append("<span>"+data+"</span>");
}

var template = "<section class='sel'><textarea rows='8' id='asm' placeholder='Assembly Code'></textarea><textarea rows='8' id='machinecode' placeholder='Machine Code'></textarea><div class='output'><p id='console'></p><p id='instructions'></p><p id='memory'></p><div class='side'><select><option id='-1'>-- Choose an Action --</option><optgroup label='Console Display'><option id='0'>Output</option><option id='1'>Instructions</option><option id='2'>Memory</option></optgroup><optgroup label='Register Format'><option id='3'>Hexadecimal</option><option id='4'>Decimal</option><option id='5'>Unsigned Decimal</option><option id='6'>Binary</option></optgroup></select><table><thead><tr><th>Register</th><th>Data</th></tr></thead><tbody></tbody></table></div></div></section>";

function addTab(tabTitle) {
	if (inputMode == INPUT_NOINPUT) {
		$(".tabs span").removeClass("sel");
		$(".tabs").append("<span class='sel'><span>"+tabTitle+"</span><div class='close'></div></span>");
		$("main section").removeClass("sel");
		$("main").append(template);
		$("main section.sel #machinecode").stop().slideUp(0);
		$("#ShowMC").prop('checked', false);

		coreArray.push(new RISCVCore(2048, invokeSyscall, decodeCallback));

		// Implement Tab Switch
		$(".tabs span:last-child").on("click", function() {
			if (inputMode == INPUT_NOINPUT) {
				$(".tabs span").removeClass("sel");
				$(this).addClass("sel");
				$("main section").removeClass("sel");
				$("main").children().eq($(this).index()).addClass("sel");
				var machineCodeEnabled = $("main section.sel #machinecode").css("display") != "none";
				$("#ShowMC").prop('checked', machineCodeEnabled);

				if ($("section.sel .insertable").length == 1) {
					var words = $("section.sel .insertable").html();
					counter = words.length;
				}
			}
		});

		// Implement Close Button
		$(".tabs span:last-child .close").on("click", function() {
			closeTab($(this).parent().index());
		});

		// Implement Double Click
		$(".tabs span:last-child").dblclick(function(e) {
			var val = $(this).children(":first-child").html();
			$(this).children(":first-child").remove();
			$(this).prepend("<input value='"+val+"'>").focus();
			$(this).children(":first-child").on("blur", function() {
				var val = $(this).val();
				$(this).parent().prepend("<span>"+val+"</span>");
				$(this).remove();
			});
			e.preventDefault();
		});

		// Implement select
		$("main section.sel select").on('change', function () {
			var data = $("option:selected", this).attr("id");
			selectCommand($(this).parent().index(), data);
		});

		var names = getRegisterABINames(coreArray[getSelected()]);
		for(var i=0; i < names.length; i++)
			$("main section.sel tbody").append("<tr><td>"+names[i]+"</td><td>0x00000000</td></tr>");
	}
}

function closeTab(id) {
	if (inputMode == INPUT_NOINPUT) {
		coreArray.splice(id, 1);
		$("main").children().eq(id).remove();
		$(".tabs").children().eq(id).remove();
	}
}

$(".addTab").on("click", function() {
	addTab("Untitled");
});

// Implement this on Oak.js
function processKey(event) {
	event.preventDefault();

	if (inputMode != INPUT_NOINPUT) {
		// Enter
		if (event.keyCode == 13) {
			registerWrite(coreArray[getSelected()], 17, parseInt($("section.sel .insertable").html()));

			$("section.sel .insertable").removeClass("insertable");
			$("section.sel #console").append("<br />");
			cursor = 0;
			inputMode = INPUT_NOINPUT;
			$("section.sel #asm").prop('disabled', false);
			$("section.sel #machinecode").prop('disabled', false);
			$("#fileInputElement").prop('disabled', false);
			$("#asmInputElement").prop('disabled', false);

			updateRegAndMemory();
			var output = continueSim(coreArray[getSelected()]);
			if (output !== "SCALL" && output !== null && output != undefined) {
				addToast("<b>Simulator Error: </b>" + output, TOAST_ERROR);
			}
			// else if (output != "SCALL") {
			// 	updateRegAndMemory();
			// 	addToast("<b>Complete:</b> Simulation complete.", TOAST_NORMAL);
			// }
		}
		// Minus
		else if (event.keyCode == 189) {
			$("section.sel .insertable").append("-");
			cursor++;
		}
		// Left Arrow
		else if (event.keyCode == 37) {
			cursor--;
			if (cursor < 0) {
				cursor = 0;
			}
		}
		// Right Arrow
		else if (event.keyCode == 39) {
			cursor++;
			var maxLen = $("section.sel .insertable").html().length;
			if (cursor >= maxLen) {
				cursor = maxLen - 1;
			}
		}
		// Backspace
		else if (event.keyCode == 8) {
			if (cursor > 0) {
				var content = $("section.sel .insertable").html();
				content = content.slice(0, cursor-1) + content.slice(cursor);
				$("section.sel .insertable").html(content);
				cursor--;
			}
		}
		// Delete
		else if (event.keyCode == 46) {
			var maxLen = $("section.sel .insertable").html().length;
			if (cursor <= maxLen) {
				var content = $("section.sel .insertable").html();
				content = content.slice(0, cursor) + content.slice(cursor+1);
				$("section.sel .insertable").html(content);
				cursor--;
			}
		}
		// Numbers
		else if (event.keyCode >= 48 && event.keyCode <= 57) {
			var content = $("section.sel .insertable").html();
			content = content.slice(0, cursor) + (event.keyCode-48) + content.slice(cursor);
			$("section.sel .insertable").html(content);
			cursor++;
		}
		else if (event.keyCode >= 65 && event.keyCode <= 90) {
			if (inputMode == INPUT_ALPHANUMERIC) {
				var content = $("section.sel .insertable").html();
				content = content.slice(0, cursor-1) + (keyCode-48) + content.slice(cursor);
				$("section.sel .insertable").html(content);
				cursor++;
			}
		}
	}
}

function invokeSyscall() {
	var core = coreArray[getSelected()];
	var type = registerRead(core, 17);
	var arg = registerRead(core, 10);

	selectCommand(0);
	var exit = false;
	
	switch (type) {
	case 1: // Integer
		$("section.sel #console").append("<span>"+arg+"</span>");
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
		$("section.sel #console").append("<span>"+output+"</span>");
		break;
	case 5:
		updateRegAndMemory();
		inputMode = INPUT_NUMERICAL;
		$("section.sel #console").append("<span class='input insertable'></span>");
		$("section.sel #asm").prop('disabled', true);
		$("section.sel #machinecode").prop('disabled', true);
		$("#fileInputElement").prop('disabled', true);
		$("#asmInputElement").prop('disabled', true);
		return;
	case 10:
		exit = true;
		break;
	default:
		addToast("<b>WARNING:</b> Syscall " + type + "unsupported.", TOAST_WARNING);
		break;
	}

	if (!exit) {
		var output = continueSim(coreArray[getSelected()]);
		if (output != "SCALL" && output !== null && output != undefined) {
			addToast("<b>Simulator Error: </b>" + output, TOAST_ERROR);
		}
		// else if (output != "SCALL") {
		// 	updateRegAndMemory();
		// 	addToast("<b>Complete:</b> Simulation complete.", TOAST_NORMAL);
		// }
	} else {
		updateRegAndMemory();
		addToast("<b>Complete:</b> Simulation complete.", TOAST_NORMAL);
	}
}

$(document).ready(function() {
	addTab("Untitled");
	$("#machinecode").stop().slideUp(0);
	$(document).on("keyup", function( event ) {processKey(event)});
	if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
		$(".download, .downloadBin, .asmUpload, .fileUpload").remove();
	}
	else {		
		$("#fileInputElement").on("change", function(evt){
			var files = $(this)[0].files;
			if (!files.length) {
				addToast("<b>No Files: </b> Please choose files to upload one.", TOAST_WARNING);
				return;
			}

			var file = files[0];

			addTab(file.name);
			
			var blob = file.slice(0, file.size);
			var fr = new FileReader();
			fr.addEventListener('load', function () {
				var bytes = new Uint8Array(this.result);
				var hexer = "";
				for (var i=0; i < bytes.length; i++) {
					if (bytes[i] < 16) {
						hexer += ("0"+bytes[i].toString(16)+" ");
					}
					else {
						hexer += (bytes[i].toString(16)+" ");
					}
				}

				$("#ShowMC").prop('checked', true);
				$("main section.sel #machinecode").val(hexer).stop().slideDown(200);
			});
			fr.readAsArrayBuffer(blob);
		});

		$("#asmInputElement").on("change", function(evt){
			var files = $(this)[0].files;
			if (!files.length) {
				addToast("<b>No file chosen.</b>", TOAST_WARNING);
				return;
			}

			var file = files[0];

			addTab(file.name);
			
			var blob = file.slice(0, file.size);
			var fr = new FileReader();
			fr.addEventListener('load', function () {
				$("main section.sel #asm").val(this.result);
			});
			fr.readAsText(blob);
		});

		$(".download").on("click", function() {
			var link = $("main section.sel #asm").val();
			var el = document.createElement('a');
			var blob = new Blob([link], {type: "text/plain"});
			var blobLink = URL.createObjectURL(blob);
			
			var name = $(".tabs span.sel span").html()+".s";
			el.setAttribute('href', blobLink);
			el.setAttribute('download', name);

			el.style.display = 'none';
			document.body.appendChild(el);
			el.click();
			document.body.removeChild(el);
		});

		$(".downloadBin").on("click", function() {
			var hexdata = $("main section.sel #machinecode").val();
			var byteArray = new Uint8Array(hexToBytes(hexdata));
			var blob = new Blob([byteArray], {type: "application/octet-stream"});
			var blobLink = URL.createObjectURL(blob);
			
			var element = document.createElement('a');
			var filename = $(".tabs span.sel span").html()+".bin";
			element.setAttribute('href', blobLink);
			element.setAttribute('download', filename);

			element.style.display = 'none';
			document.body.appendChild(element);

			element.click();

			document.body.removeChild(element);

		});
	}
	/* Please. This gets annoying. People know how to use a web browser. :P */
	//addToast("<b>Tip: </b>You can press the <i>F11</i> key to make our editor full screen!", TOAST_NORMAL);
});
