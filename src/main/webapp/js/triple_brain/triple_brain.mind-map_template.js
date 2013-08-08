/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "jquery",
    "triple_brain.template"
],
    function ($, Template) {
        var api = {};
        var t = Template.withTemplateGroup(api);

        //vertex html elements
        t.add(
            'vertex',
            '<div class="vertex graph-element absolute" style="top:{adjustedPosition.y};left:{adjustedPosition.x};"></div>'
        );
        t.add(
            'relative_vertex',
            '<div class="vertex graph-element relative"></div>'
        );
        t.add(
            'vertex_label_container',
            '<div class=textfield-container>' +
                '<input type="text" class="label" value="{label}">' +
                '</div>'
        );
        t.add('vertex_menu', '<div class="menu"></div>');
        t.add('vertex_move_button', '<div class="move"></div>');

        t.add('identification_menu', '<div class="peripheral-menu identification"></div>');
        t.add('identification_menu_explanation_title', '<h2 data-i18n="vertex.menu.identification.title"></h2>');
        t.add('identification_menu_indications', '<h3 data-i18n="vertex.menu.identification.instruction"></h3>');
        t.add('identification_existing_identities', '<div class="list"></div>');
        t.add(
            'identification_existing_identity',
            '<h3 class="type-label identification" identification-uri="{identification_uri}">{type_label}' +
            '<button class="remove-button-in-list">x</button>'+
            '</h3>'+
            '<div class="group description">{description}</div>'
        );
        t.add(
            'identification_textfield',
            '<input type="text" data-i18n="[placeholder]vertex.menu.identification.placeholder.to_another_source">'
        );
        t.add(
            'identification_type_textfield',
            '<input type="text" data-i18n="[placeholder]vertex.menu.identification.placeholder.to_a_category">'
        );

        t.add(
            'link_to_far_vertex_menu',
            '<div class="peripheral-menu link-to-far-vertex-menu"></div>'
        );

        t.add('suggestions_menu', '<div class="peripheral-menu suggestion"></div>');
        t.add('suggestions_list', '<ul></ul>');
        t.add(
            'suggestion',
            '<li><span class="text">{label}</span></li>'
        );
        t.add(
            'suggestions_menu_title',
            "<h2 data-i18n='vertex.menu.suggestion.title'></h2>"
        );
        t.add(
            'suggestions_instructions',
            "<h3>( <span data-i18n='vertex.menu.suggestion.instruction.1'></span><br/><span data-i18n='vertex.menu.suggestion.instruction.2'></span> )</h3>"
        );

        t.add('image_container', '<div class="image_container"></div>');
        t.add('image_container_image', "<img src='{src}'>");

        t.add('hidden_property_container', '<div class="hidden-properties-container"></div>');
        t.add('hidden_property_menu', '<div class="peripheral-menu"></div>');
        t.add(
            'hidden_properties_title',
            "<h2 data-i18n='vertex.menu.hidden_relation.title'></h2>"
        );
        t.add('hidden_property_list', '<ul></ul>');
        t.add('hidden_property', '<li>{name}</li>');

        //edge html elements
        t.add('edge', '<div class="edge relation graph-element" id="{id}" style="left:{label_position.x};top:{label_position.y}"></div>');
        t.add(
            'edge_label',
            '<input type="text" value="{label}">'
        );
        t.add('edge_remove_button', '<input type="button" class="remove" value="x" >');

        t.add('auto_complete_suggestion_list', '<ul class="auto-complete-suggestion"></ul>');
        t.add('auto_complete_suggestion_list_element', '<li>{name}</li>');
        return api;
    }
);
