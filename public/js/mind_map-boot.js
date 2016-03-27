/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

requirejs(
    [
        'require',
        'triple_brain/triple_brain.ui_starter'
    ], function (require, UiStarter) {
        require(["/js/vendor/bootstrap/bootstrap-modal-carousel.js"], function(){
            UiStarter.start();
        });
    }
);