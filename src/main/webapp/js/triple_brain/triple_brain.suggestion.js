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
                FriendlyResourceFacade.withUriAndLabel(
                    suggestionUri,
                    freebaseSuggestion.name
                ),
                FreebaseUri.freebaseIdToURI(
                    freebaseSuggestion.id
                ),
                FreebaseUri.freebaseIdToURI(
                    freebaseSuggestion.expected_type.id
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
            var friendlyResource = FriendlyResourceFacade.fromServerFormat(
                suggestion.friendlyResource
            );
            return new Suggestion(
                friendlyResource,
                suggestion.sameAsUri,
                suggestion.domainUri,
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
        return api;
        function Suggestion(friendlyResource, sameAsUri, domainUri, origins) {
            this.domainUri = function () {
                return domainUri;
            };
            this.label = function () {
                return friendlyResource.getLabel();
            };
            this.origin = function () {
                return origins[0];
            };
            this.serverFormat = function () {
                return {
                    friendlyResource: friendlyResource.getServerFormat(),
                    sameAsUri: sameAsUri,
                    domainUri: domainUri,
                    origins : origins
                }
            }
        }
    }
);