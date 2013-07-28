/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "jquery",
    "triple_brain.registration_handler",
    "triple_brain.external_page_loader",
    "triple_brain.user",
    "jquery.json.min"
],
    function ($, RegistrationHandler, ExternalPageLoader, UserService) {
        var api = {};
        var access = defineAccess();
        api.startFlow = function () {
            ExternalPageLoader.showLinearFlowWithOptions({
                href:"login-form.html",
                onComplete:function(){
                    handleLoginForm();
                    handleRegisterLink();
                },
                title:$.t("login.title")
            });
        };
        return api;
        function handleLoginForm() {
            access.loginButton().click(function () {
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
                    }
                );
            });
            access.errorMessage().hide();
            access.loginForm().reset();
            access.loginPage().i18n();
        }
        function defineAccess() {
            return {
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
        }
        function handleRegisterLink(){
            access.registerLink().on("click", function(event){
                event.preventDefault();
                RegistrationHandler.startFlow();
            });
        }
    }
)