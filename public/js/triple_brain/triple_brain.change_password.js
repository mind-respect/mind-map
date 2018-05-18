/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "triple_brain.user_service",
    "triple_brain.login_handler",
    "jquery.url",
    "bootstrap"
], function ($, UserService, LoginHandler) {
    "use strict";
    var api = {};
    api.enterFlow = function () {
        getChangePasswordPage().modal('show');
        getSubmitButton().click(function () {
            hideAllMessages();
            if (!doPasswordsMatch()) {
                $("#change-password-dont-match").removeClass("hidden");
                return;
            }
            UserService.changePassword(
                getPasswordInput().val().trim(),
                getEmail(),
                getToken(),
                changePasswordSuccess,
                changePasswordError
            );
        });
        getCancelButton().click(closeModal);
        $("#change-password-go-to-login").click(function (event) {
            event.preventDefault();
            closeModal();
            LoginHandler.showModal();
        });
    };
    api.isChangePasswordFlow = function () {
        return $.url().param("reset-token") !== undefined;
    };
    return api;

    function changePasswordSuccess() {
        hideAllMessages();
        $("#change-password-success").removeClass("hidden");
        $("#change-password-go-to-login").removeClass("hidden");
        getSubmitButton().addClass("hidden");
        $("#change-password-form").addClass("hidden");
    }

    function changePasswordError(xhr) {
        hideAllMessages();
        var badRequestCode = 400;
        if (badRequestCode === xhr.status) {
            $("#change-password-too-short").removeClass("hidden");
            return;
        }
        $("#change-password-wrong").removeClass("hidden");
    }

    function hideAllMessages() {
        getMessages().addClass("hidden");
    }

    function getMessages() {
        return getChangePasswordPage().find(".alert");
    }

    function doPasswordsMatch() {
        return getPasswordInput().val().trim() === getPasswordRepeatInput().val().trim();
    }

    function getPasswordInput() {
        return $("#change-password-input");
    }

    function getPasswordRepeatInput() {
        return $("#change-password-repeat-input");
    }

    function getChangePasswordPage() {
        return $("#change-password-page");
    }

    function getSubmitButton() {
        return $("#forgot-password-submit");
    }

    function getToken() {
        return $.url().param("reset-token");
    }

    function getEmail() {
        return $.url().param("email");
    }

    function getCancelButton() {
        return getChangePasswordPage().find(".cancel");
    }

    function closeModal() {
        history.replaceState('landing', null, '/');
        getChangePasswordPage().modal("hide");
    }
});
