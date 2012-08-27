define([
    "jquery",
    "triple_brain.freebase",
    "triple_brain.external_resource"
],
    function ($, Freebase, ExternalResource) {
        var api = {};
        api.fromFreebaseSuggestion = function (freebaseSuggestion) {
            return new Suggestion(
                ExternalResource.fromFreebaseSuggestion(
                    freebaseSuggestion
                ),
                Freebase.freebaseIdToURI(
                    freebaseSuggestion.expected_type
                )
            );
        }
        api.formatAllForServer = function (suggestions) {
            var suggestionsFormatedForServer = [];
            $.each(suggestions, function(){
                var suggestion = this;
                suggestionsFormatedForServer.push(suggestion.serverFormat())
            })
            return $.toJSON(suggestionsFormatedForServer);
        }

        api.fromJsonOfServer = function (suggestion) {
            return new Suggestion(
                ExternalResource.withUriAndLabel(
                    suggestion.typeUri,
                    suggestion.label
                ),
                suggestion.domain_uri
            );
        }
        api.fromJsonArrayOfServer = function (jsonSuggestions) {
            var suggestions = [];
            $.each(jsonSuggestions, function(){
                var jsonSuggestion = this;
                suggestions.push(
                    api.fromJsonOfServer(
                        jsonSuggestion
                    )
                )
            });
            return suggestions;
        }

        function Suggestion(externalResource, domainUri) {
            var thisSuggestion = this;
            this.typeUri = function () {
                return externalResource.uri();
            }
            this.domainUri = function () {
                return domainUri;
            }
            this.label = function () {
                return externalResource.label();
            }
            this.serverFormat = function(){
                return {
                    type_uri : thisSuggestion.typeUri(),
                    domain_uri : thisSuggestion.domainUri(),
                    label : thisSuggestion.label()
                }
            }
        }
        return api;
    }
);