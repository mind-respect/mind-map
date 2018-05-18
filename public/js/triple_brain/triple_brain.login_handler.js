/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
        "jquery",
        "triple_brain.user_service",
        "triple_brain.language_manager",
        "triple_brain.id_uri",
        "mr.loading_flow",
        "mr.forgot-password-flow",
        "bootstrap"
    ],
    function ($, UserService, LanguageManager, IdUri, LoadingFlow, ForgotPasswordFlow) {
        "use strict";
        var api = {};
        api.setupModal = function () {
            new LoginForm(
                getModalSection()
            ).setup();
        };
        api.showModal = function () {
            if(history.state !== 'login'){
                history.pushState('login', null, '/login');
            }
            getModalSection().modal();
        };

        function LoginForm(container) {
            this.container = container;
        }

        LoginForm.prototype.setup = function () {
            this.setupLoginForm();
            this.handleSubmitButton();
            this.handleForgotPassword();
            getCancelButton().click(closeModal);
        };
        LoginForm.prototype.setupLoginForm = function () {
            this.submitWhenPressingEnter();
            getModalSection().on('shown.bs.modal', function () {
                this.getEmailField().focus();
            }.bind(this));
            this.getLoginButton().click(function () {
                UserService.authenticate(
                    this.getFormData(),
                    function (user) {
                        window.location = "/user/" + user.user_name;
                    },
                    function () {
                        this.hideAllMessages();
                        this.getLoginErrorMessage().removeClass("hidden");
                    }.bind(this)
                );
            }.bind(this));
            this.hideAllMessages();
            this.getForm()[0].reset();
        };

        LoginForm.prototype.handleSubmitButton = function () {
            this.getRegisterLink().click(
                function (event) {
                    event.preventDefault();
                    LoadingFlow.enter();
                    var userData = this.getFormData();
                    userData.preferred_locales = [
                        LanguageManager.getBrowserLocale()
                    ];
                    UserService.register(
                        userData,
                        handleRegistrationSuccess,
                        function (errors) {
                            this.handleRegistrationError.call(this, errors);
                        }
                    );
                }.bind(this)
            );
        };

        LoginForm.prototype.handleForgotPassword = function () {
            $("#forgotPasswordLink").click(function(event){
                event.preventDefault();
                closeModal(true);
                ForgotPasswordFlow.enter();
            });
        };

        LoginForm.prototype.submitWhenPressingEnter = function () {
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
                    window.location = "/user/" + IdUri.usernameFromUri(uri);
                    LoadingFlow.leave();
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
                password: this.getPasswordField().val(),
                staySignedIn: this.getStaySignedInField().is(":checked")
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

        LoginForm.prototype.getStaySignedInField = function () {
            return this.container.find("[name=stayConnected]");
        };

        LoginForm.prototype.getForm = function () {
            return this.container.find('.login-form');
        };

        LoginForm.prototype.getRegisterLink = function () {
            return this.container.find(".register-link");
        };


        LoginForm.prototype.getMandatoryEmailErrorMessage = function () {
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

        function getCancelButton() {
            return getModalSection().find(".cancel");
        }

        function closeModal(skipPushState) {
            if(skipPushState !== true){
                history.pushState('landing', null, '/');
            }
            getModalSection().modal("hide");
        }

        return api;
    }
);
