    $(function() {
       $('#nav li a').click(function() {
          $('#nav li').removeClass();
          $($(this).attr('href')).addClass('active');
       });
    });
