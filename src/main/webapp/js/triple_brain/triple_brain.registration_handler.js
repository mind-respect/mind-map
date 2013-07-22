/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "require",
    "triple_brain.overlay_dialog",
    "triple_brain.user",
    "jquery"
],
    function (Require, OverlayDialog, UserService, $) {
        var api = {};
        var access = defineAccess();
        api.startFlow = function () {
            OverlayDialog.showLinearFlowWithOptions({
                href:"register-form.html",
                onComplete:function(){
                    OverlayDialog.adjustSize();
                    handleRegisterForm();
                    handleLoginLink();
                }
            });
        };
        return api;
        function handleRegisterForm(){
            access.errorMessages().hide();
            access.registerForm().reset();
            access.registerButton().on("click", function () {
                UserService.register(
                    formAsJSon(),
                    handleRegistrationSuccess,
                    handleRegistrationError
                );
            });
            access.registerPage().i18n();
            OverlayDialog.adjustSize();
        }
        function handleLoginLink(){
            access.loginLink().on("click", function(){
                var LoginHandler = require("triple_brain.login_handler");
                LoginHandler.startFlow();
            });
        }

        function formAsJSon() {
            var formAsJson = {};
            formAsJson.user_name = $(access.userNameField()).val();
            formAsJson.email = $(access.emailField()).val();
            formAsJson.password = $(access.passwordField()).val();
            formAsJson.password_verification = $(access.passwordConfirmationField()).val();
            return formAsJson;
        }
        function handleRegistrationSuccess(){
            window.location.reload();
        }
        function handleRegistrationError(errors){
           access.errorMessages().hide();
            for (var i in errors) {
                $('#' + errors[i].reason).show();
            }
            OverlayDialog.adjustSize();
        }
        function defineAccess() {
            return {
                registerPage : function(){
                    return $("#registration-page");
                },
                errorMessages : function () {
                    return $('.alert-error');
                },
                registerButton : function () {
                    return $('#register-button');
                },
                userNameField : function () {
                    return $("#register-user_name");
                },
                emailField : function () {
                    return $("#register-email");
                },
                passwordField : function () {
                    return $("#register-password");
                },
                passwordConfirmationField : function(){
                    return $("#register-retype_password");
                },
                registerForm : function () {
                    return $('#register-form')[0];
                },
                loginLink : function(){
                    return $("#login-link");
                }
            };
        }
    }
)