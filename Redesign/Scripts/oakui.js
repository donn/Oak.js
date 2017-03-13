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

    var defaultCode = "    la a0, str\n    li a7, 4 #4 is the string print service number...\n    ecall\n    li a7, 10 #...and 10 is the program termination service number!\n    ecall\n.data\nstr:\    .string \"Hello, World!\"";
    
    $(document).ready(function() {
        $('#themes').val(0);
        for (var i = 1; i < 3; i++)
            $("#theme"+i).prop('disabled', true);

        $("section > #editor").html(defaultCode);
        var editor = ace.edit($("section > #editor").get(0));
        editor.setOption("firstLineNumber", 0);
        editor.setTheme("ace/theme/oak");
        editor.getSession().setMode("ace/mode/riscv");
        editor.getSession().setUseWrapMode(true);

        var taskItems = document.querySelectorAll("main nav > div");
        for ( var i = 0, len = taskItems.length; i < len; i++ ) {
            contextMenuListener(taskItems[i]);
        }
        
        $('.grabberX').on('mousedown', function(e){
            var $element = $(this).parent();
            var $element2 = $(this).parent().parent().find("section");
            var $element3 = $(this).parent().parent().find("footer");
            var width = $(this).parent().parent().width();
            
            $(document).on('mouseup', function(e){
                $(document).off('mouseup').off('mousemove');
            });

            $(document).on('mousemove', function(me){
                var mx = (me.pageX)*100.0/width;
                mx = Math.min(90, Math.max(20, mx));

                $element.css({width: ((100-mx)+"%")});
                $element2.css({width: ((mx)+"%")});
                $element3.css({width: ((mx)+"%")});
            });
        });
        
        $('.grabberY').on('mousedown', function(e){
            var $element = $(this).parent();
            var $element2 = $(this).parent().parent().find("footer");
            var height = $(this).parent().parent().height();

            var	pY = e.pageY-$(this).position().top+$element.position().top;
            
            $(document).on('mouseup', function(e){
                $(document).off('mouseup').off('mousemove');
            });
            $(document).on('mousemove', function(me){
                var my = (me.pageY - pY)*100.0/height;
                my = Math.min(90, Math.max(15, my));

                $element.css({height: ((my)+"%")});
                $element2.css({height: ((100-my)+"%")});
            });
        });
    });

    
    $("#themes").change(function() {
        var themeID = $(this).val();
        for (var i = 0; i < 3; i++)
            $("#theme"+i).prop('disabled', i!=themeID);
    });

})();