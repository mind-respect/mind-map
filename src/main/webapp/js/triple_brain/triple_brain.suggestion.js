define([
        "jquery",
        "triple_brain.freebase_uri",
        "triple_brain.friendly_resource_server_facade",
        "triple_brain.id_uri",
        "triple_brain.user",
        "jquery.json.min"
    ],
    function ($, FreebaseUri, FriendlyResourceFacade, IdUri, UserService) {
        var api = {};
        api.IDENTIFICATION_PREFIX = "identification_";
        api.fromFreebaseSuggestionAndTypeUri = function (freebaseSuggestion, typeUri) {
            var suggestionUri = api.generateUri();
            return new Suggestion(
                FriendlyResourceFacade.withUri(
                    suggestionUri
                ),
                FriendlyResourceFacade.fromFreebaseSuggestion(
                    freebaseSuggestion
                ),
                FriendlyResourceFacade.withUriAndLabel(
                    FreebaseUri.freebaseIdToURI(
                        freebaseSuggestion.expected_type.id
                    ),
                    freebaseSuggestion.expected_type.name
                ),[{
                    friendlyResource: FriendlyResourceFacade.withUri(
                    api.generateOriginUriFromSuggestionUri(suggestionUri)
                    ).getServerFormat(),
                    origin: api.IDENTIFICATION_PREFIX + typeUri
                }]
            );
        };
        api.generateOriginUriFromSuggestionUri = function(suggestionUri){
            return suggestionUri + "/origin/" + IdUri.generateUuid();
        };
        api.generateUri = function () {
            return UserService.currentUserUri() + "/suggestion/" + IdUri.generateUuid();
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
            var sameAs = FriendlyResourceFacade.fromServerFormat(
                suggestion.sameAs
            );
            var domain = FriendlyResourceFacade.fromServerFormat(
                suggestion.domain
            );
            var friendlyResource = FriendlyResourceFacade.fromServerFormat(
                suggestion.friendlyResource
            );
            return new Suggestion(
                friendlyResource,
                sameAs,
                domain,
                suggestion.origins
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
        api.fromSearchResult = function (searchResult) {
            return api.withUriLabelAndDescription(
                searchResult.uri,
                searchResult.label,
                searchResult.comment
            );
        };
        return api;
        function Suggestion(friendlyResource, sameAs, domain, origins) {
            this.domainUri = function () {
                return domain.getUri();
            };
            this.label = function () {
                return sameAs.getLabel();
            };
            this.origin = function () {
                return origins[0];
            };
            this.serverFormat = function () {
                return {
                    friendlyResource: friendlyResource.getServerFormat(),
                    sameAs: sameAs.getServerFormat(),
                    domain: domain.getServerFormat(),
                    origins : origins
                }
            }
        }
    }
);