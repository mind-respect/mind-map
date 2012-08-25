define([
    "jquery",
    "triple_brain/triple_brain.config"
],
    function($, config) {
        $(document).ready(function(){
            $('#login-button').click(function(e) {
                e.preventDefault();
                $.ajax({
                    type: 'GET',
                    data: $('#login-form').serialize(),
                    url: config.links.app + '/service/users/authenticate'
                }).success(
                    function() {
                        window.location = "/";
                    }).error(function() {
                        $('#error-panel').show();
                    });
            });
            $('#error-panel').hide();
            $('#login-form')[0].reset();
        });
        return {};
    });