/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "require",
    "jquery",
    "triple_brain.external_page_loader",
    "triple_brain.user",
    "triple_brain.language_manager"
],
    function (Require, $, ExternalPageLoader, UserService, LanguageManager) {
        var api = {};
        var access = defineAccess();
        api.startFlow = function () {
            ExternalPageLoader.showLinearFlowWithOptions({
                href:"register-form.html",
                onComplete:function () {
                    handleRegisterForm();
                    handleLoginLink();
                },
                width:450,
                title:$.t("register.title")
            });
        };
        return api;
        function handleRegisterForm() {
            setupLanguageMenu();
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
        }

        function handleLoginLink() {
            access.loginLink().on("click", function (event) {
                event.preventDefault();
                var LoginHandler = require("triple_brain.login_handler");
                LoginHandler.startFlow();
            });
        }

        function setupLanguageMenu() {
            var currentLocale = LanguageManager.getLocale();
            handleAddLanguageButton();
            setupSelectedLanguagesList();
            function setupSelectedLanguagesList() {
                var currentLanguage = LanguageManager.isLocaleFrench() ?
                    LanguageManager.frenchLanguage() :
                    LanguageManager.englishLanguage();
                var selectedLanguagesList = access.getSelectedLanguagesList();
                selectedLanguagesList.append(
                    makeListElementUsingLanguage(
                        currentLanguage
                    )
                );
                selectedLanguagesList.sortable().disableSelection();
            }

            function handleAddLanguageButton(){
                access.getAddLanguagesButton().on("click", function(event){
                    event.preventDefault();
                    setupAvailableLanguagesList();
                });
                function setupAvailableLanguagesList() {
                    var availableLanguagesList = $(
                        "<ul class='registration-available-languages'>"
                    );
                    var languagesWithoutCurrentLocale = getLanguagesWithoutLocale(
                        currentLocale,
                        LanguageManager.getPossibleLanguages()
                    );
                    $.each(languagesWithoutCurrentLocale, function () {
                        availableLanguagesList.append(
                            makeListElementForAvailableLanguages(this)
                        );
                    });
                    availableLanguagesList.dialog({
                        title:$.t("register.language.available_languages")
                    });
                    function makeListElementForAvailableLanguages(language){
                        var listElement = makeListElementUsingLanguage(language);
                        var addButton = $(
                            "<button class='add-button-in-list'>"
                        );
                        addButton.append(
                            "+"
                        );
                        addButton.on(
                            "click",
                            function(){
                                var selectedListElement = $(this).closest(
                                    "li"
                                );
                                var language = selectedListElement.data(
                                    "language"
                                );
                                selectedListElement.remove();
                                access.getSelectedLanguagesList().append(
                                    makeListElementUsingLanguage(
                                        language
                                    )
                                );
                            }
                        );
                        listElement.prepend(
                            addButton
                        );
                        return listElement;
                    }
                }
            }
            function makeListElementUsingLanguage(language) {
                var label = $("<label>");
                label.append(
                    language.fullname
                );
                return $("<li>")
                    .append(
                    label
                )
                    .data(
                    "language",
                    language
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
                getSelectedLanguagesList:function () {
                    return $("#selectedLanguages");
                },
                getAddLanguagesButton:function(){
                    return $("#more-languages-link");
                }
            };
        }
    }
)