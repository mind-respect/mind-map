/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "triple_brain.template"
],
    function (Template) {
        var api = {};
        var t = Template.withTemplateGroup(api);

        t.add('graph_canvas', '<canvas id="graphCanvas" width="{bounding_box_width}" height="{bounding_box_height}"></canvas>');
        t.add('canvas_for_relation', '<canvas id="canvasForRelation"></canvas>');
        t.add('canvas_to_move_vertex', '<canvas id="canvasToMoveVertex"></canvas>');

        //vertex html elements
        t.add('vertex', '<div class="vertex" id="{id}" style="top:{position.y}"></div>');
        t.add('vertex_label_container', '<div class=textfield-container><input type="text" class="label" value="{label}"></div>');
        t.add('vertex_menu', '<div class="menu"></div>');
        t.add('vertex_move_button', '<div class="move"></div>');
        t.add('vertex_remove_button', '<input type="button" value="x" class="remove" data-role="none">');
        t.add('vertex_center_button', '<input type="button" class="center" data-role="none">');
        t.add('vertex_what_is_this_button', '<input type="button" class="what-is-this" data-role="none" value="?">');
        t.add('vertex_suggestion_button', '<input type="button" data-role="none" value="S" class="suggestion">');

        t.add('identification_menu', '<div class="peripheral-menu identification"></div>');
        t.add('identification_menu_explanation_title', '<h2>Identifications</h2>');
        t.add('identification_menu_indications', '<h3>Find as many concepts that identify or are a generalization of this one.</h3>');
        t.add('identification_existing_identities', '<ul class="identification-list"></ul>');
        t.add('identification_existing_identity', '<li class="identification" identification-uri="{identification_uri}"><label class="type-label"><strong>{type_label}</strong></label> ' +
            '<input type="button" class="link-like-button remove-identification" value="remove"></li>');
        t.add('identification_textfield', '<input type="text" placeholder="Identify" class="semantic-textfield">');

        t.add('suggestions_menu', '<div class="peripheral-menu suggestion"></div>');
        t.add('suggestions_list', '<ul></ul>');
        t.add('suggestion', '<li type-id="{domain_id}">{label}</li>');
        t.add('suggestions_menu_title', '<h2>Suggestions of properties</h2>');
        t.add('suggestions_menu_sub_title', '<h3>( Drag a property outside the box<br/> to add it to your mind map )</h3>');

        t.add('hidden_property_container', '<div class="hidden-properties-container"></div>');
        t.add('hidden_property_menu', '<div class="peripheral-menu"></div>');
        t.add('hidden_properties_title', '<h2>Hidden properties of concept</h2>');
        t.add('hidden_property_list', '<ul></ul>');
        t.add('hidden_property', '<li>{name}</li>');

        //edge html elements
        t.add('edge', '<div class="edge" id="{id}" style="left:{label_position.x};top:{label_position.y}" source-vertex-id="{source_vertex_id}" destination-vertex-id="{destination_vertex_id}"></div>');
        t.add('edge_label', '<input type="text" value="{label}">');
        t.add('edge_remove_button', '<input type="button" class="remove" value="x" data-role="none">');

        t.add('auto_complete_suggestion_list', '<ul class="auto-complete-suggestion"></ul>');
        t.add('auto_complete_suggestion_list_element', '<li>{name}</li>');
        return api;
    }
);
