/**
 * @author Vincent Blouin
 */

require("Logger", "triple_brain.ui");

if (triple_brain.ui.register == undefined) {
    (function($) {
        triple_brain.ui.register = {};

        triple_brain.bus.local.topic('/event/ui/view/beforeshow/register').subscribe(function() {
            $('#error-panel').hide();
            $('#register-form')[0].reset();
            $('#register-button').click(function(e) {
                e.preventDefault();
                triple_brain.user.register($('#register-form').dynaForm().toJSON());
            });
        });

        triple_brain.bus.local.topic('/event/ui/user/registration/success').subscribe(function() {
            $('#register-form, #error-panel').hide();
        });

        triple_brain.bus.local.topic('/event/ui/users/registration/errors').subscribe(function(errors) {
            $('.notification.error').hide();
            for (var i in errors) {
                $('#' + errors[i].reason).show();
            }
            $('#error-panel').show();
        });
    })(jQuery);
}
