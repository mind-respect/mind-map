if (triple_brain.suggestion == undefined) {
    (function ($) {
       var freebaseStatic = triple_brain.freebase;
        var externalResourceStatic = triple_brain.external_resource;
        var suggestionStatic = triple_brain.suggestion = {};
        suggestionStatic.fromFreebaseSuggestion = function (freebaseSuggestion) {
            return new Suggestion(
                externalResourceStatic.fromFreebaseSuggestion(
                    freebaseSuggestion
                ),
                freebaseStatic.freebaseIdToURI(
                    freebaseSuggestion.expected_type
                )
            );
        }
        suggestionStatic.formatAllForServer = function (suggestions) {
            var suggestionsFormatedForServer = [];
            $.each(suggestions, function(){
                var suggestion = this;
                suggestionsFormatedForServer.push(suggestion.serverFormat())
            })
            return $.toJSON(suggestionsFormatedForServer);
        }

        suggestionStatic.fromJsonOfServer = function (suggestion) {
            return new Suggestion(
                externalResourceStatic.withUriAndLabel(
                    suggestion.typeUri,
                    suggestion.label
                ),
                suggestion.domain_uri
            );
        }
        suggestionStatic.fromJsonArrayOfServer = function (jsonSuggestions) {
            var suggestions = [];
            $.each(jsonSuggestions, function(){
                var jsonSuggestion = this;
                suggestions.push(
                    suggestionStatic.fromJsonOfServer(
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

    })(jQuery);
}