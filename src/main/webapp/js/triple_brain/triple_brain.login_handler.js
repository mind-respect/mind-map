/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "jquery",
    "triple_brain.registration_handler",
    "triple_brain.overlay_dialog",
    "triple_brain.user",
    "jquery.json.min"
],
    function ($, RegistrationHandler, OverlayDialog, UserService) {
        var api = {};
        var access = defineAccess();
        api.startFlow = function () {
            OverlayDialog.showLinearFlowWithOptions({
                href:"login-form.html",
                onComplete:function(test){
                    handleLoginForm();
                    handleRegisterLink();
                }
            })
        }
        return api;
        function handleLoginForm() {
            $(access.loginButton()).click(function () {
                var loginInfo = {
                    email:access.emailField().val(),
                    password:access.passwordField().val()
                };
                UserService.authenticate(
                    loginInfo,
                    function () {
                        window.location.reload();
                    },
                    function () {
                        access.errorMessage().show();
                        OverlayDialog.adjustSize();
                    }
                );
            });
            access.errorMessage().hide();
            access.loginForm().reset();
            access.loginPage().i18n();
            OverlayDialog.adjustSize();
        }


        function defineAccess() {
            var access = {
                loginPage : function () {
                    return $('#login-page');
                },
                errorMessage : function () {
                    return $('#login-error');
                },
                loginButton : function () {
                    return $('#login-button');
                },
                emailField : function () {
                    return $("#login-email");
                },
                passwordField : function () {
                    return $("#login-password");
                },
                loginForm : function () {
                    return $('#login-form')[0];
                },
                registerLink : function(){
                    return $("#register-link");
                }
            };
            return access;
        }
        function handleRegisterLink(){
            $(access.registerLink()).on("click", function(){
                RegistrationHandler.startFlow();
            });
        }
    }
)