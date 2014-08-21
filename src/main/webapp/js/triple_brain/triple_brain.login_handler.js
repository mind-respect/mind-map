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
        "use strict";
        var api = {};
        api.startFlow = function () {
            ExternalPageLoader.showLinearFlowWithOptions({
                href: "login-form.html",
                onComplete: function () {
                    handleLoginForm();
                    handleRegisterLink();
                },
                title: $.t("login.title")
            });
        };
        return api;
        function handleLoginForm() {
            submitWhenPressingEnter();
            getLoginButton().click(function () {
                var loginInfo = {
                    email: getEmailField().val(),
                    password: getPasswordField().val()
                };
                UserService.authenticate(
                    loginInfo,
                    function(){
                        window.location.reload();
                    },
                    function () {
                        getErrorMessage().removeClass("hidden");
                    }
                );
            });
            getErrorMessage().addClass("hidden");
            getLoginForm()[0].reset();
        }

        function handleRegisterLink() {
            getRegisterLink().on(
                "click",
                function (event) {
                    event.preventDefault();
                    RegistrationHandler.startFlow();
                });
        }

        function submitWhenPressingEnter() {
            getLoginForm().find("input").on(
                "keyup",
                function (event) {
                    var enterKeyCode = 13;
                    if (event.keyCode === enterKeyCode) {
                        getLoginButton().click();
                    }
                }
            );
        }
        function getLoginPage(){
            return $('#login-page');
        }
        function getErrorMessage(){
            return $('#login-error');
        }
        function getLoginButton(){
            return $('#login-button');
        }
        function getEmailField(){
            return $("#login-email");
        }
        function getPasswordField(){
            return $("#login-password");
        }
        function getLoginForm(){
            return $('#login-form');
        }
        function getRegisterLink(){
            return $("#register-link");
        }
    }
);