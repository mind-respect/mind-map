/**
 * Copyright Mozilla Public License 1.1
 */
define([
    "jquery",
    "triple_brain.event_bus",
    "triple_brain.user"
],
    function ($, eventBus, userService) {
        $(document).ready(function () {
            $('#error-panel').hide();
            $('#register-form')[0].reset();
            $('#register-button').click(function () {
                userService.register(
                    formAsJSon()
                );
            });
        });

        function formAsJSon() {
            var formAsJson = {};
            formAsJson.user_name = $("#register-user_name").val();
            formAsJson.email = $("#register-email").val();
            formAsJson.password = $("#register-password").val();
            formAsJson.password_verification = $("#register-retype_password").val();
            return formAsJson;
        }

        eventBus.subscribe(
            '/event/ui/user/registration/success',
            function () {
                $('#register-form, #error-panel').hide();
            }
        );

        eventBus.subscribe(
            '/event/ui/users/registration/errors',
            function (event, errors) {
                $('.notification.error').hide();
                for (var i in errors) {
                    $('#' + errors[i].reason).show();
                }
                $('#error-panel').show();
            }
        );
        return {};
    }
)

