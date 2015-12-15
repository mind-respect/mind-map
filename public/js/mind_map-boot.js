/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

requirejs(
    [
        'require',
        'triple_brain/triple_brain.ui.mind_map_starter'
    ], function (require, mindMapApp) {
        require(["vendor/bootstrap/bootstrap-modal-carousel"], function(){
            mindMapApp.start();
        });
    }
);