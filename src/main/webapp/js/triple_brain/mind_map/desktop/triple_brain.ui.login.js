if (triple_brain.ui.login == undefined) {
    (function($) {
        triple_brain.ui.login = {};
        $(document).ready(function(){
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
            $('#error-panel').hide();
            $('#login-form')[0].reset();
        });

    })(jQuery);
}