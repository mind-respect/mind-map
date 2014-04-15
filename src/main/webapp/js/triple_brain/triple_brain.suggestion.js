define([
        "jquery",
        "triple_brain.freebase_uri",
        "triple_brain.external_resource",
        "triple_brain.friendly_resource_server_facade",
        "jquery.json.min"
    ],
    function ($, FreebaseUri, ExternalResource, FriendlyResourceServerFacade) {
        var api = {};
        api.IDENTIFICATION_PREFIX = "identification_";
        api.fromFreebaseSuggestionAndTypeUri = function (freebaseSuggestion, typeUri) {
            return new Suggestion(
                ExternalResource.fromFreebaseSuggestion(
                    freebaseSuggestion
                ),
                ExternalResource.withUriAndLabel(
                    FreebaseUri.freebaseIdToURI(
                        freebaseSuggestion.expected_type.id
                    ),
                    freebaseSuggestion.expected_type.name
                ),
                    api.IDENTIFICATION_PREFIX + typeUri
            );
        };
        api.formatAllForServer = function (suggestions) {
            var suggestionsFormatedForServer = [];
            $.each(suggestions, function () {
                var suggestion = this;
                suggestionsFormatedForServer.push(
                    suggestion.serverFormat()
                );
            });
            return $.toJSON(suggestionsFormatedForServer);
        };

        api.fromJsonOfServer = function (suggestion) {
            var sameAs = FriendlyResourceServerFacade.fromServerFormat(
                suggestion.sameAs
            );
            var domain = FriendlyResourceServerFacade.fromServerFormat(
                suggestion.domain
            );
            return new Suggestion(
                ExternalResource.withUriAndLabel(
                    sameAs.getUri(),
                    sameAs.getLabel()
                ),
                ExternalResource.withUriAndLabel(
                    domain.getUri(),
                    domain.getLabel()
                ),
                suggestion.origins[0]
            );
        };
        api.fromJsonArrayOfServer = function (jsonSuggestions) {
            var suggestions = [];
            $.each(jsonSuggestions, function () {
                var jsonSuggestion = this;
                suggestions.push(
                    api.fromJsonOfServer(
                        jsonSuggestion
                    )
                )
            });
            return suggestions;
        };
        return api;
        function Suggestion(sameAs, domain, origin) {
            var thisSuggestion = this;
            this.typeUri = function () {
                return sameAs.uri();
            };
            this.domainUri = function () {
                return domain.uri();
            };
            this.label = function () {
                return sameAs.label();
            };
            this.origin = function () {
                return origin;
            };
            this.serverFormat = function () {
                return {
                    sameAs: sameAs.jsonFormat(),
                    domain: domain.jsonFormat(),
                    origins: [
                        {
                            origin: thisSuggestion.origin()
                        }
                    ]
                }
            }
        }
    }
);