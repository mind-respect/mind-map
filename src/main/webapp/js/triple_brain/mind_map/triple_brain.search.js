/*
 * Copyright Mozilla Public License 1.1
 */

if (triple_brain.search == undefined) {
    (function($) {
        triple_brain.search = {
            search_for_auto_complete: function(searchText, successCallback) {
                $.ajax({
                    type: 'GET',
                    url: options.ws.app + '/service/search/vertices/auto_complete/' + searchText
                }).success(successCallback)
            }
        }
    })(jQuery);
}