$(function() {
  $('.inactive').click(function() {
    $('#nav li').removeClass();
    $($(this).attr('href')).addClass('active');
  });
});

$(function() {
  $('.active').click(function() {
    $('#nav li').removeClass();
    $($(this).attr('href')).addClass('inactive');
  });
});
