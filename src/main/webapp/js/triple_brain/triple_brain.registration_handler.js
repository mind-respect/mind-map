/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "require",
    "jquery",
    "triple_brain.overlay_dialog",
    "triple_brain.user",
    "triple_brain.language_manager"
],
    function (Require, $, OverlayDialog, UserService, LanguageManager) {
        var api = {};
        var access = defineAccess();
        api.startFlow = function () {
            OverlayDialog.showLinearFlowWithOptions({
                href:"register-form.html",
                onComplete:function () {
                    OverlayDialog.adjustSize();
                    handleRegisterForm();
                    handleLoginLink();
                },
                width:500,
                title:$.t("register.title")
            });
        };
        return api;
        function handleRegisterForm() {
            setupLanguageLists();
            access.errorMessages().hide();
            access.registerForm().reset();
            access.registerButton().on("click", function () {
                UserService.register(
                    formAsJSon(),
                    handleRegistrationSuccess,
                    handleRegistrationError
                );
            });
            access.registerPage().i18n();
            OverlayDialog.adjustSize();
        }

        function handleLoginLink() {
            access.loginLink().on("click", function () {
                var LoginHandler = require("triple_brain.login_handler");
                LoginHandler.startFlow();
            });
        }

        function setupLanguageLists() {
            var currentLocale = LanguageManager.getLocale();
            setupAvailableLanguagesList();
            setupSelectedLanguagesList();
            $(
                ".connectedSortable"
            ).sortable({
                connectWith: ".connectedSortable"
            }).disableSelection();

            function setupSelectedLanguagesList() {
                var currentLanguage = LanguageManager.isLocaleFrench() ?
                    LanguageManager.frenchLanguage() :
                    LanguageManager.englishLanguage();
                access.selectedLanguagesList().append(
                    makeListElementUsingLanguage(
                        currentLanguage
                    )
                );
            }

            function setupAvailableLanguagesList() {
                var availableLanguagesList = access.availableLanguagesList();
                availableLanguagesList.empty();
                var languagesWithoutCurrentLocale = getLanguagesWithoutLocale(
                    currentLocale,
                    LanguageManager.getPossibleLanguages()
                );
                $.each(languagesWithoutCurrentLocale, function () {
                    availableLanguagesList.append(
                        makeListElementUsingLanguage(this)
                    );
                });
            }

            function makeListElementUsingLanguage(language) {
                return $("<li>")
                    .append(
                    language.fullname
                )
                    .prop(
                    "data-locale",
                    language.locale
                )
                    .addClass(
                    "ui-state-default"
                );
            }

            function getLanguagesWithoutLocale(locale, languages) {
                var filteredLanguages = [];
                $.each(languages, function () {
                    var language = this;
                    if (language.locale !== locale) {
                        filteredLanguages.push(
                            language
                        );
                    }
                });
                return filteredLanguages;
            }
        }

        function formAsJSon() {
            var formAsJson = {};
            formAsJson.user_name = access.userNameField().val();
            formAsJson.email = access.emailField().val();
            formAsJson.password = access.passwordField().val();
            formAsJson.password_verification = access.passwordConfirmationField().val();
            return formAsJson;
        }

        function handleRegistrationSuccess() {
            window.location.reload();
        }

        function handleRegistrationError(errors) {
            access.errorMessages().hide();
            for (var i in errors) {
                $('#' + errors[i].reason).show();
            }
            OverlayDialog.adjustSize();
        }

        function defineAccess() {
            return {
                registerPage:function () {
                    return $("#registration-page");
                },
                errorMessages:function () {
                    return $('.alert-error');
                },
                registerButton:function () {
                    return $('#register-button');
                },
                userNameField:function () {
                    return $("#register-user_name");
                },
                emailField:function () {
                    return $("#register-email");
                },
                passwordField:function () {
                    return $("#register-password");
                },
                passwordConfirmationField:function () {
                    return $("#register-retype_password");
                },
                registerForm:function () {
                    return $('#register-form')[0];
                },
                loginLink:function () {
                    return $("#login-link");
                },
                selectedLanguagesList:function () {
                    return $("#selectedLanguages");
                },
                availableLanguagesList:function () {
                    return $("#availableLanguages");
                }
            };
        }
    }
)