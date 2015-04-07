/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */
define([
        "jquery",
        "triple_brain.user_service",
        "triple_brain.mind_map_info",
        "jquery.json.min"
    ],
    function ($, UserService, MindMapInfo) {
        "use strict";
        var api = {};
        api.startFlow = function () {
            $("#login-page").modal();
            handleLoginForm();
            handleRegisterButton();
            handleForgotPassword();
        };
        return api;
        function handleLoginForm() {
            submitWhenPressingEnter();
            getLoginButton().click(function () {
                UserService.authenticate(
                    getFormData(),
                    function (user) {
                        UserService.getDefaultVertexUri(
                            user.user_name,
                            function (uri) {
                                if (MindMapInfo.isCenterBubbleUriDefinedInUrl()) {
                                    window.location.reload();
                                } else {
                                    window.location = "?bubble=" + uri;
                                }
                            }
                        );
                    },
                    function () {
                        getErrorMessages().addClass("hidden");
                        getLoginErrorMessage().removeClass("hidden");
                    }
                );
            });
            getErrorMessages().addClass("hidden");
            getLoginForm()[0].reset();
        }

        function handleRegisterButton() {
            getRegisterLink().on(
                "click",
                function (event) {
                    event.preventDefault();
                    UserService.register(
                        getFormData(),
                        handleRegistrationSuccess,
                        handleRegistrationError
                    );
                });
        }

        function handleForgotPassword(){
            getForgotPasswordButton().click(function(event){
                event.preventDefault();
                getErrorMessages().addClass("hidden");
                if(getEmailField().val().trim() === ""){
                    getMandatoryEmailErrorMessage().removeClass("hidden");
                    return;
                }
                UserService.resetPassword();
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

        function handleRegistrationSuccess(user) {
            UserService.getDefaultVertexUri(
                user.user_name,
                function (uri) {
                    window.location = "?bubble=" + uri;
                }
            );
        }

        function handleRegistrationError(errors) {
            getLoginErrorMessage().addClass("hidden");
            $.each(errors, function () {
                var error = this;
                $('#' + error.reason).removeClass("hidden");
            });
        }

        function getFormData() {
            return {
                email: getEmailField().val(),
                password: getPasswordField().val()
            }
        }

        function getLoginErrorMessage() {
            return $('#login-error');
        }

        function getLoginButton() {
            return $('#login-button');
        }

        function getEmailField() {
            return $("#login-email");
        }

        function getPasswordField() {
            return $("#login-password");
        }

        function getLoginForm() {
            return $('#login-form');
        }

        function getRegisterLink() {
            return $("#register-link");
        }
        function getForgotPasswordButton(){
            return $("#forgot-password-link");
        }
        function getErrorMessages(){
            return $('.alert-danger');
        }
        function getMandatoryEmailErrorMessage(){
            return $("#mandatory_email");
        }
    }
);