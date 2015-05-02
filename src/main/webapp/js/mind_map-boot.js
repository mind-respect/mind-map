/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

requirejs(
    [
        '../module/vertices_list/triple_brain.module.vertices_list',
        '../module/date_picker/triple_brain.module.date_picker',
        'triple_brain/triple_brain.ui.mind_map_starter'
    ], function(VerticesList, DatePicker, mindMapApp){
        mindMapApp.start();
    }
);