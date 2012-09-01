/*
 * Copyright Mozilla Public License 1.1
 */

requirejs.config(window.config);

requirejs(
    [
        'module/mind_map/vertices_list/desktop/triple_brain.module.vertices_list',
        'triple_brain/mind_map/desktop/triple_brain.ui.mind_map'
    ], function(VerticesList, mindMapApp){
        mindMapApp.start();
    }
);