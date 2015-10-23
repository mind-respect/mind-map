(function($){
    /*
     * http://stackoverflow.com/questions/13534601/re-attaching-jquery-detach
     */
    $.fn.detachTemp = function() {
        this.data('dt_placeholder',$('<span />').insertAfter( this ));
        return this.detach();
    };
    $.fn.reattach = function() {
        if(this.data('dt_placeholder')){
            this.insertBefore( this.data('dt_placeholder') );
            this.data('dt_placeholder').remove();
            this.removeData('dt_placeholder');
        }
        else if(window.console && console.error)
            console.error("Unable to reattach this element "
                + "because its placeholder is not available.");
        return this;
    };
    $.fn.disableAnchor = function(){
        return this.off("click").click(function(event){
            event.preventDefault();
        });
    }
})(jQuery);