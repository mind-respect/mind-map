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
        api.setupModal = function(){
            new LoginForm(
                buildModal()
            ).setup();
        };
        api.showModal = function () {
            getModalSection().modal();
        };
        api.setupWelcomePageAuth = function () {
            new LoginForm(
                getOnPageAuthenticateSection()
            ).setup();
        };

        function buildModal(){
            var modalSection = getModalSection();
            getOnPageAuthenticateSection().find(".body").children().clone().appendTo(
                modalSection.find(".modal-body")
            );
            getOnPageAuthenticateSection().find(".footer").children().clone().appendTo(
                modalSection.find(".modal-footer")
            );
            return modalSection;
        }

        function LoginForm(container) {
            this.container = container;
        }

        LoginForm.prototype.setup = function () {
            this.handleLoginForm();
            this.handleRegisterButton();
            this.handleForgotPassword();
        };
        LoginForm.prototype.handleLoginForm = function () {
            var self = this;
            this.submitWhenPressingEnter();
            this.getLoginButton().click(function () {
                UserService.authenticate(
                    self.getFormData(),
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
                        self.hideAllMessages();
                        self.getLoginErrorMessage().removeClass("hidden");
                    }
                );
            });
            this.hideAllMessages();
            this.getLoginForm()[0].reset();
        };

        LoginForm.prototype.handleRegisterButton = function () {
            var self = this;
            this.getRegisterLink().on(
                "click",
                function (event) {
                    event.preventDefault();
                    UserService.register(
                        self.getFormData(),
                        handleRegistrationSuccess,
                        function(errors){
                            self.handleRegistrationError.call(self, errors);
                        }
                    );
                });
        };

        LoginForm.prototype.handleForgotPassword = function () {
            var self = this;
            this.getForgotPasswordButton().click(function (event) {
                event.preventDefault();
                self.hideAllMessages();
                var email = self.getEmailField().val().trim();
                if ("" === email) {
                    self.getMandatoryEmailErrorMessage().removeClass("hidden");
                    return;
                }
                UserService.resetPassword(
                    email,
                    success,
                    error
                );
            });
            function success() {
                self.container.find(
                    ".forgot-password-email-sent"
                ).removeClass("hidden");
            }

            function error() {
                self.getInexistentEmailErrorMessage().removeClass("hidden");
            }
        };

        LoginForm.prototype.submitWhenPressingEnter = function () {
            var self = this;
            this.getLoginForm().find("input").on(
                "keyup",
                function (event) {
                    var enterKeyCode = 13;
                    if (event.keyCode === enterKeyCode) {
                        self.getLoginButton().click();
                    }
                }
            );
        };

        function handleRegistrationSuccess(user) {
            UserService.getDefaultVertexUri(
                user.user_name,
                function (uri) {
                    window.location = "?bubble=" + uri;
                }
            );
        }

        LoginForm.prototype.handleRegistrationError = function (errors) {
            var self = this;
            this.getLoginErrorMessage().addClass("hidden");
            $.each(errors, function () {
                var error = this;
                self._getErrorWithName(
                    error.reason
                ).removeClass("hidden");
            });
        };

        LoginForm.prototype.getFormData = function () {
            return {
                email: this.getEmailField().val(),
                password: this.getPasswordField().val()
            };
        };

        LoginForm.prototype.getLoginErrorMessage = function () {
            return this.container.find('.login-error');
        };

        LoginForm.prototype.getLoginButton = function () {
            return this.container.find('.login-button');
        };

        LoginForm.prototype.getEmailField = function () {
            return this.container.find(".login-email");
        };

        LoginForm.prototype.getPasswordField = function () {
            return this.container.find(".login-password");
        };

        LoginForm.prototype.getLoginForm = function () {
            return this.container.find('.login-form');
        };

        LoginForm.prototype.getRegisterLink = function() {
            return this.container.find(".register-link");
        };

        LoginForm.prototype.getForgotPasswordButton = function() {
            return this.container.find(".forgot-password-link");
        };

        LoginForm.prototype.getMandatoryEmailErrorMessage = function(){
            return this._getErrorWithName("mandatory_email");
        };

        LoginForm.prototype.hideAllMessages = function () {
            this.getMessages().addClass("hidden");
        };

        LoginForm.prototype.getMessages = function () {
            return this.container.find('.alert');
        };

        LoginForm.prototype.getInexistentEmailErrorMessage = function () {
            return this._getErrorWithName("inexistent-email");
        };

        LoginForm.prototype._getErrorWithName = function (errorName) {
            return this.container.find("[data-error=" + errorName + "]");
        };

        function getModalSection() {
            return $("#login-page-modal");
        }

        function getOnPageAuthenticateSection(){
            return $("#authenticate");
        }

        return api;
    }
);