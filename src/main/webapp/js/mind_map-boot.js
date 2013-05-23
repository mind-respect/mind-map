/*
 * Copyright Mozilla Public License 1.1
 */

requirejs(
    [
        'module/mind_map/vertices_list/triple_brain.module.vertices_list',
        'module/mind_map/date_picker/triple_brain.module.date_picker',
        'triple_brain/triple_brain.ui.mind_map_starter'
    ], function(VerticesList, DatePicker, mindMapApp){
        mindMapApp.start();
    }
);