define([
    "jquery",
    "triple_brain.config",
    "jquery.json.min"
],
    function($, config) {
        $(document).ready(function(){
            $('#login-button').click(function(e) {
                e.preventDefault();
                var loginInfo = {
                    email : $("#login-email").val(),
                    password : $("#login-password").val()
                };
                $.ajax({
                    type:'POST',
                    data: $.toJSON(loginInfo),
                    url: config.links.app + '/service/users/authenticate',
                    dataType:'json',
                    contentType:'application/json;charset=utf-8'
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