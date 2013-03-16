/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "triple_brain.template"
],
    function (Template) {
        var api = {};
        var t = Template.withTemplateGroup(api);

        //vertex html elements
        t.add('vertex', '<div class="vertex graph-element" style="top:{adjustedPosition.y};left:{adjustedPosition.x};position:absolute"></div>');
        t.add(
            'relative_vertex',
            '<div class="vertex graph-element" style="position:relative;margin:50% 0 0 0"></div>'
        );
        t.add('vertex_label_container', '<div class=textfield-container><input type="text" class="label" value="{label}"></div>');
        t.add('vertex_menu', '<div class="menu"></div>');
        t.add('vertex_move_button', '<div class="move"></div>');
        t.add('vertex_plus_button', '<input type="button" value="+" class="plus">');
        t.add('vertex_remove_button', '<input type="button" value="x" class="remove">');
        t.add('vertex_center_button', '<input type="button" class="center">');
        t.add('vertex_what_is_this_button', '<input type="button" class="what-is-this"  value="?">');
        t.add('vertex_suggestion_button', '<input type="button"  value="S" class="suggestion">');

        t.add('identification_menu', '<div class="peripheral-menu identification"></div>');
        t.add('identification_menu_explanation_title', '<h2>Identifications</h2>');
        t.add('identification_menu_indications', '<h3>Find as many concepts that identify or are a generalization of this one.</h3>');
        t.add('identification_existing_identities', '<div class="list"></div>');
        t.add('identification_existing_identity','<h3 class="type-label identification" identification-uri="{identification_uri}">{type_label}' +
            '<input type="button" class="remove-identification" value="x">'+
            '</h3>'+
            '<div class="group description">{description}</div>');
        t.add('identification_textfield', '<input type="text" placeholder="Identify" class="semantic-textfield">');

        t.add('suggestions_menu', '<div class="peripheral-menu suggestion"></div>');
        t.add('suggestions_list', '<ul></ul>');
        t.add('suggestion', '<li type-id="{domain_id}">{label}</li>');
        t.add('suggestions_menu_title', '<h2>Suggestions of properties</h2>');
        t.add('suggestions_menu_sub_title', '<h3>( Drag a property outside the box<br/> to add it to your mind map )</h3>');

        t.add('image_container', '<div class="image_container"></div>');
        t.add('image_container_image', "<img src='{src}'>");

        t.add('hidden_property_container', '<div class="hidden-properties-container"></div>');
        t.add('hidden_property_menu', '<div class="peripheral-menu"></div>');
        t.add('hidden_properties_title', '<h2>Hidden properties of concept</h2>');
        t.add('hidden_property_list', '<ul></ul>');
        t.add('hidden_property', '<li>{name}</li>');

        //edge html elements
        t.add('edge', '<div class="edge graph-element" id="{id}" style="left:{label_position.x};top:{label_position.y}"></div>');
        t.add('edge_label', '<input type="text" value="{label}">');
        t.add('edge_remove_button', '<input type="button" class="remove" value="x" >');

        t.add('auto_complete_suggestion_list', '<ul class="auto-complete-suggestion"></ul>');
        t.add('auto_complete_suggestion_list_element', '<li>{name}</li>');
        return api;
    }
);
