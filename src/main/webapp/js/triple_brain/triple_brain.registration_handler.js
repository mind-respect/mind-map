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
        var api = {}
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
        }
        return api;
        function handleRegisterForm(){
            $(access.errorMessages()).hide();
            access.registerForm().reset();
            $(access.registerButton()).on("click", function () {
                UserService.register(
                    formAsJSon(),
                    handleRegistrationSuccess,
                    handleRegistrationError
                );
            });
        }
        function handleLoginLink(){
            $(access.loginLink()).on("click", function(){
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
            window.location = "/";
        }
        function handleRegistrationError(errors){
            $(access.errorMessages()).hide();
            for (var i in errors) {
                $('#' + errors[i].reason).show();
            }
            OverlayDialog.adjustSize();
        }
        function defineAccess() {
            var access = {};
            access.errorMessages = function () {
                return $('#error-panel');
            }
            access.registerButton = function () {
                return $('#register-button');
            }
            access.userNameField = function () {
                return $("#register-user_name");
            }
            access.emailField = function () {
                return $("#register-email");
            }
            access.passwordField = function () {
                return $("#register-password");
            }
            access.passwordConfirmationField = function(){
                return $("#register-retype_password");
            }
            access.registerForm = function () {
                return $('#register-form')[0];
            }
            access.loginLink = function(){
                return $("#login-link");
            }
            return access;
        }
    }
)