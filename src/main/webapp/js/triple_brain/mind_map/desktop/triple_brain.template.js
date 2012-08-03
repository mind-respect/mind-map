if (triple_brain.template == undefined) {
    (function($) {
        triple_brain.template = {
            add: function(name, html) {
                triple_brain.template[name] = {
                    merge: function(obj) {
                        return $($.nano(html, obj || null));
                    }
                }
            }
        };

        function add(name, html){
            triple_brain.template.add(name, html);
        }

        add('graph_canvas', '<canvas id="graphCanvas" width="{bounding_box_width}" height="{bounding_box_height}"></canvas>');
        add('canvas_for_relation', '<canvas id="canvasForRelation"></canvas>');
        add('canvas_to_move_vertex', '<canvas id="canvasToMoveVertex"></canvas>');

        //vertex html elements
        add('vertex', '<div class="vertex" id="{id}" style="top:{position.y}"></div>');
        add('vertex_label_container', '<div class=textfield-container><input type="text" class="label" value="{label}"></div>');
        add('vertex_menu', '<div class="menu"></div>');
        add('vertex_menu_list_first_col', '<ul></ul>');
        add('vertex_menu_list_second_col', '<ul></ul>');
        add('vertex_menu_list_third_col', '<ul></ul>');
        add('vertex_move_button', '<li class="move"></li>');
        add('vertex_remove_button', '<li class="remove"><input type="button" value="x" data-role="none"></li>');
        add('vertex_center_button', '<li><input type="button" class="center" data-role="none"></li>');
        add('vertex_what_is_this_button', '<li><input type="button" class="what-is-this" data-role="none" value="?"></li>');
        add('vertex_suggestion_button', '<li class="suggestion"><input type="button" data-role="none" value="S"></li>');

        add('identification_menu', '<div class="peripheral-menu identification" vertex-id="{vertex_id}"></div>');
        add('identification_menu_title', '<h2>The type</h2>');
        add('identification_menu_explanation_title', '<h2>What is the type of this concept?</h2>');
        add('identification_menu_sub_title', '<h3>i.e "my best friend fido" would be of type "Dog"<br/> or "Friend" or "Pet" etc</h3>');
        add('identification_additional_type_menu', '<ul class="type-list"><li><label>{type_label}</label> <input type="button" class="link-like-button" value="remove"></li></ul>');
        add('identification_textfield', '<input type ="text" class="semantic-textfield" data-role="none">');

        add('suggestions_menu', '<div class="peripheral-menu suggestion"></div>');
        add('suggestions_list', '<ul></ul>');
        add('suggestion', '<li type-id="{domain_id}">{label}</li>');
        add('suggestions_menu_title', '<h2>Suggestions of properties</h2>');
        add('suggestions_menu_sub_title', '<h3>( Drag a property outside the box<br/> to add it to your mind map )</h3>');

        add('hidden_property_container', '<div class="hidden-properties-container"></div>');
        add('hidden_property_menu', '<div class="peripheral-menu"></div>');
        add('hidden_properties_title', '<h2>Hidden properties of concept</h2>');
        add('hidden_property_list', '<ul></ul>');
        add('hidden_property', '<li>{name}</li>');

        //edge html elements
        add('edge', '<div class="edge" id="{id}" style="left:{label_position.x};top:{label_position.y}" source-vertex-id="{source_vertex_id}" destination-vertex-id="{destination_vertex_id}"></div>');
        add('edge_label', '<input type="text" value="{label}">');
        add('edge_remove_button', '<input type="button" class="remove" value="x" data-role="none">');

        add('auto_complete_suggestion_list', '<ul class="auto-complete-suggestion"></ul>');
        add('auto_complete_suggestion_list_element', '<li>{name}</li>');

    })(jQuery);
}
