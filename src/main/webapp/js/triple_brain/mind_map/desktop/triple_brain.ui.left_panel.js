/**
 * @author Vincent Blouin
 */
if (triple_brain.ui.left_panel == undefined) {
    (function($) {
        triple_brain.ui.left_panel = {
            addHTML : function(html){
                $("#left-panel").append(html);
            }
        };
    })(jQuery);
}