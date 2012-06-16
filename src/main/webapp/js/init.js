
$.ajaxSetup({
    cache: false,
    xhrFields: {
        withCredentials: true
    }
});

$(document).ajaxError(function(e, xhr) {
    switch (xhr.status) {
        case 403:
            window.location = options.ws.security;
            break;
        case 500:
            window.location = options.ws.resource + '/html/500.html';
            break;
        case 404:
            window.location = options.ws.resource + '/html/404.html';
            break;
    }
});


$('div').live('pagecreate', function() {
    $('form:not([action])').submit(function() {
        return false;
    });
});

$(document).bind("mobileinit", function() {
    $.extend($.mobile, {
        defaultPageTransition: 'none'
    });
});
