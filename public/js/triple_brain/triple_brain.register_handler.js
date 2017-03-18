/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
        "jquery",
        "triple_brain.user_service",
        "triple_brain.id_uri",
        "triple_brain.friendly_resource",
        "triple_brain.friendly_resource_service",
        "bootstrap",
        "jquery.i18next"
    ],
    function ($, UserService, IdUri, FriendlyResource, FriendlyResourceService) {
        "use strict";
        var api = {};
        api.setupModal = function () {
            new RegisterForm(
                getModalSection()
            ).setup();
        };
        api.showModal = function () {
            getModalSection().modal();
        };

        function RegisterForm(container) {
            this.container = container;
        }

        RegisterForm.prototype.setup = function () {
            this.handleSubmitButton();
            this.submitWhenPressingEnter();
            getCancelButton().click(closeModal);
            getModalSection().on('shown.bs.modal', function () {
                this.getUsernameField().focus();
            }.bind(this));
        };

        RegisterForm.prototype.handleSubmitButton = function () {
            this.getRegisterLink().on(
                "click",
                function (event) {
                    event.preventDefault();
                    UserService.register(
                        this.getFormData(),
                        handleRegistrationSuccess,
                        function (errors) {
                            this.handleRegistrationError.call(this, errors);
                        }.bind(this)
                    );
                }.bind(this));
        };

        RegisterForm.prototype.handleForgotPassword = function () {
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

        RegisterForm.prototype.submitWhenPressingEnter = function () {
            var self = this;
            this.getForm().find("input").on(
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
                    FriendlyResourceService.updateLabel(
                        FriendlyResource.withUri(uri),
                        user.user_name,
                        function () {
                            window.location = IdUri.htmlUrlForBubbleUri(uri);
                        }
                    );

                }
            );
        }

        RegisterForm.prototype.handleRegistrationError = function (errors) {
            this.getLoginErrorMessage().addClass("hidden");
            errors.forEach(function (error) {
                this._getErrorWithName(
                    error.reason
                ).removeClass("hidden");
            }.bind(this));
        };

        RegisterForm.prototype.getFormData = function () {
            return {
                user_name: this.getUsernameField().val(),
                email: this.getEmailField().val(),
                password: this.getPasswordField().val(),
                staySignedIn: "on" === this.getStaySignedInField().val()
            };
        };

        RegisterForm.prototype.getLoginErrorMessage = function () {
            return this.container.find('.alert-danger');
        };

        RegisterForm.prototype.getLoginButton = function () {
            return this.container.find('.login-button');
        };

        RegisterForm.prototype.getUsernameField = function () {
            return this.container.find(".login-username");
        };

        RegisterForm.prototype.getEmailField = function () {
            return this.container.find(".login-email");
        };

        RegisterForm.prototype.getPasswordField = function () {
            return this.container.find(".login-password");
        };

        RegisterForm.prototype.getStaySignedInField = function () {
            return this.container.find("[name=stayConnected]");
        };

        RegisterForm.prototype.getForm = function () {
            return this.container.find('.login-form');
        };

        RegisterForm.prototype.getRegisterLink = function () {
            return this.container.find(".register-link");
        };

        RegisterForm.prototype.getForgotPasswordButton = function () {
            return this.container.find(".forgot-password-link");
        };

        RegisterForm.prototype.getMandatoryEmailErrorMessage = function () {
            return this._getErrorWithName("mandatory_email");
        };

        RegisterForm.prototype.hideAllMessages = function () {
            this.getMessages().addClass("hidden");
        };

        RegisterForm.prototype.getMessages = function () {
            return this.container.find('.alert');
        };

        RegisterForm.prototype.getInexistentEmailErrorMessage = function () {
            return this._getErrorWithName("inexistent-email");
        };

        RegisterForm.prototype._getErrorWithName = function (errorName) {
            return this.container.find("[data-error=" + errorName + "]");
        };

        function getModalSection() {
            return $("#register-page-modal");
        }

        function getCancelButton() {
            return getModalSection().find(".cancel");
        }

        function closeModal() {
            getModalSection().modal("hide");
        }

        return api;
    }
);