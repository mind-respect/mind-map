if (triple_brain.suggestion == undefined) {
    (function ($) {
        var freebaseStatic = triple_brain.freebase;
        var suggestionStatic = triple_brain.suggestion = {};
        suggestionStatic.fromFreebaseSuggestion = function (freebaseSuggestion) {
            return new Suggestion(
                freebaseStatic.freebaseIdToURI(
                    freebaseSuggestion.id
                ),
                freebaseStatic.freebaseIdToURI(
                    freebaseSuggestion.expected_type
                ),
                freebaseSuggestion.name
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
                suggestion.typeUri,
                suggestion.domain_uri,
                suggestion.label
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

        function Suggestion(typeUri, domainUri, label) {
            var thisSuggestion = this;
            this.typeUri = function () {
                return typeUri;
            }
            this.domainUri = function () {
                return domainUri;
            }
            this.label = function () {
                return label;
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