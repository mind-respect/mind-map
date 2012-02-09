$(function() {

    $('nav#main-nav > ul > li > a').click(function() {

        $('nav.main-nav > ul > li').removeClass('current');
        $(this).parent().addClass('current');

    });

});