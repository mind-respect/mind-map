/*
 * Copyright Mozilla Public License 1.1
 */

if (triple_brain.event_bus == undefined) {
    (function($) {
        triple_brain.event_bus = {
            subscribe: function(event, fn) {
                $(this).bind(event, fn);
            },
            publish: function(event, args) {
                $(this).trigger(event, args);
            }
        };
    })(jQuery);
}
 