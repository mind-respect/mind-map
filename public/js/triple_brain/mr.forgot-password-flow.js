/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
        "jquery",
        "triple_brain.user_service",
        "bootstrap",
        "jquery.i18next"
    ],
    function ($, UserService) {
        "use strict";
        var api = {};
        api.setupModal = function () {
            new ForgotPasswordFlow(
                getModalSection()
            ).setup();
        };
        api.enter = function () {
            if (history.state !== 'forgot-password') {
                history.pushState("forgot-password", null, '/forgot-password');
            }
            getModalSection().modal();
            new ForgotPasswordFlow(getModalSection()).setup();
        };

        function ForgotPasswordFlow(container) {
            this.container = container;
        }

        ForgotPasswordFlow.prototype.setup = function () {
            this.handleSubmitButton();
            this.submitWhenPressingEnter();
            getCancelButton().click(closeModal);
            getModalSection().on('shown.bs.modal', function () {
                this.getEmailField().focus();
            }.bind(this));
        };

        ForgotPasswordFlow.prototype.handleSubmitButton = function () {
            this.getForgotPasswordButton().on(
                "click",
                function (event) {
                    event.preventDefault();
                    this.getForgotPasswordButton().attr('disabled', 'disabled');
                    this.hideAllMessages();
                    var email = this.getEmailField().val().trim();
                    if ("" === email) {
                        this.getMandatoryEmailErrorMessage().removeClass("hidden");
                        return;
                    }
                    UserService.resetPassword(
                        email,
                        success.bind(this),
                        error.bind(this)
                    );
                    function success() {
                        this.container.find(
                            ".forgot-password-email-sent"
                        ).removeClass("hidden");
                    }

                    function error() {
                        this.getForgotPasswordButton().removeAttr('disabled', 'disabled');
                        this.getInexistentEmailErrorMessage().removeClass("hidden");
                    }
                }.bind(this));
        };

        ForgotPasswordFlow.prototype.submitWhenPressingEnter = function () {
            this.getForm().find("input").on("keyup", function (event) {
                var enterKeyCode = 13;
                if (event.keyCode === enterKeyCode) {
                    this.getForgotPasswordButton().click();
                }
            }.bind(this));
        };

        ForgotPasswordFlow.prototype.getEmailField = function () {
            return this.container.find(".login-email");
        };

        ForgotPasswordFlow.prototype.getForm = function () {
            return this.container.find('.login-form');
        };

        ForgotPasswordFlow.prototype.getForgotPasswordButton = function () {
            return this.container.find(".forgot-password-button");
        };

        ForgotPasswordFlow.prototype.getMandatoryEmailErrorMessage = function () {
            return this._getErrorWithName("mandatory_email");
        };

        ForgotPasswordFlow.prototype.hideAllMessages = function () {
            this.getMessages().addClass("hidden");
        };

        ForgotPasswordFlow.prototype.getMessages = function () {
            return this.container.find('.alert');
        };

        ForgotPasswordFlow.prototype.getInexistentEmailErrorMessage = function () {
            return this._getErrorWithName("inexistent-email");
        };

        ForgotPasswordFlow.prototype._getErrorWithName = function (errorName) {
            return this.container.find("[data-error=" + errorName + "]");
        };

        function getModalSection() {
            return $("#forgot-password-page-modal");
        }

        function getCancelButton() {
            return getModalSection().find(".cancel");
        }

        function closeModal() {
            history.pushState('landing', null, '/');
            getModalSection().modal("hide");
        }

        return api;
    }
);
