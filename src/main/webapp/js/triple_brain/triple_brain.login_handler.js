/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */
define([
        "jquery",
        "triple_brain.registration_handler",
        "triple_brain.external_page_loader",
        "triple_brain.user",
        "triple_brain.mind_map_info",
        "jquery.json.min"
    ],
    function ($, RegistrationHandler, ExternalPageLoader, UserService, MindMapInfo) {
        "use strict";
        var api = {};
        api.startFlow = function () {
            $("#login-page").modal();
            handleLoginForm();
            handleRegisterLink();
            //ExternalPageLoader.showLinearFlowWithOptions({
            //    href: "login-form.html",
            //    onComplete: function () {
            //        handleLoginForm();
            //        handleRegisterLink();
            //    },
            //    title: $.t("login.title")
            //});
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

        function handleRegisterLink() {
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
        function getErrorMessages(){
            return $('.alert-danger');
        }
    }
);