require("Logger", "triple_brain.ui", "options.ws.app");

if (triple_brain.ui.login == undefined) {
    (function($) {

        triple_brain.ui.login = {};

        triple_brain.bus.local.topic('/event/ui/view/create/login').subscribe(function() {

            $('#login-button').click(function(e) {
                e.preventDefault();
                $.ajax({
                    type: 'GET',
                    data: $('#login-form').serialize(),
                    url: options.ws.app + '/service/users/authenticate'
                }).success(
                    function(result) {
                        window.location = "/";
                    }).error(function(xhr) {
                        $('#error-panel').show();
                    });
            });
        });

        triple_brain.bus.local.topic('/event/ui/view/beforeshow/login').subscribe(function(page) {
            $('#error-panel', page).hide();
            $('#login-form', page)[0].reset();
        });

    })(jQuery);
}
