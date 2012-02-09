require("triple_brain", "Logger", "Store", "jQuery.mobile", "triple_brain.bus.local");

if (triple_brain.navigation == undefined) {
    (function($) {
        triple_brain.navigation = new window.jqmcontrib.Navigation(triple_brain.bus.local);
    })(jQuery);
}
