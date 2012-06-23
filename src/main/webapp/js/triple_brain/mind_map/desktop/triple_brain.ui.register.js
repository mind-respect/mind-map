/**
 * Copyright Mozilla Public License 1.1
 */
if (triple_brain.ui.register == undefined) {
    (function($) {
        var eventBus = triple_brain.event_bus;
        triple_brain.ui.register = {};
        $(document).ready(function(){
            $('#error-panel').hide();
            $('#register-form')[0].reset();
            $('#register-button').click(function() {
                triple_brain.user.register(
                    formAsJSon()
                );
            });
        });

        function formAsJSon(){
            var formAsJson = {};
            formAsJson.user_name = $("#register-user_name").val();
            formAsJson.email = $("#register-email").val();
            formAsJson.password = $("#register-password").val();
            formAsJson.password_verification = $("#register-retype_password").val();
            return formAsJson;
        }

        eventBus.subscribe(
            '/event/ui/user/registration/success',
            function() {
                $('#register-form, #error-panel').hide();
            }
        );

        eventBus.subscribe(
            '/event/ui/users/registration/errors',
            function(event, errors) {
                $('.notification.error').hide();
                for (var i in errors) {
                    $('#' + errors[i].reason).show();
                }
                $('#error-panel').show();
            }
        );
    })(jQuery);
}
