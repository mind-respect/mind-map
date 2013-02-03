/*
 * Copyright Mozilla Public License 1.1
 */

requirejs.config(window.config);

requirejs(
    [
        'module/mind_map/vertices_list/triple_brain.module.vertices_list',
        'module/mind_map/date_picker/triple_brain.module.date_picker',
        'triple_brain/mind_map/triple_brain.ui.mind_map'
    ], function(VerticesList, DatePicker, mindMapApp){
        mindMapApp.start();
    }
);