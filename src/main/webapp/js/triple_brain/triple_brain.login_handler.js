/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
        "jquery",
        "triple_brain.user_service",
        "triple_brain.mind_map_info",
        "bootstrap"
    ],
    function ($, UserService, MindMapInfo) {
        "use strict";
        var api = {};
        api.startFlow = function () {
            getSection().modal();
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
                                    window.location = MindMapInfo.htmlUrlForBubbleUri(
                                        uri
                                    );
                                }
                            }
                        );
                    },
                    function () {
                        hideAllMessages();
                        getLoginErrorMessage().removeClass("hidden");
                    }
                );
            });
            hideAllMessages();
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

        function handleForgotPassword() {
            getForgotPasswordButton().click(function (event) {
                event.preventDefault();
                hideAllMessages();
                var email = getEmailField().val().trim();
                if ("" === email) {
                    getMandatoryEmailErrorMessage().removeClass("hidden");
                    return;
                }
                UserService.resetPassword(
                    email,
                    success,
                    error
                );
            });
            function success() {
                $("#forgot-password-email-sent").removeClass("hidden");
            }

            function error() {
                getInexistentEmailErrorMessage().removeClass("hidden");
            }
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

        function getForgotPasswordButton() {
            return $("#forgot-password-link");
        }

        function getMandatoryEmailErrorMessage() {
            return $("#mandatory_email");
        }

        function hideAllMessages() {
            getMessages().addClass("hidden");
        }

        function getMessages() {
            return getSection().find('.alert');
        }

        function getInexistentEmailErrorMessage() {
            return $("#inexistent-email");
        }

        function getSection() {
            return $("#login-page");
        }
    }
);