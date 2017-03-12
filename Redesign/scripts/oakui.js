function changeTheme() {
    alert(1);    
}

$(document).ready(function() {
    $('#themes').val(0);
    for (i = 1; i < 3; i++)
        $("#theme"+i).prop('disabled', true);

    $("#themes").change(function() {
        var themeID = $(this).val();
        for (i = 0; i < 3; i++)
            $("#theme"+i).prop('disabled', i!=themeID);
    });
    
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