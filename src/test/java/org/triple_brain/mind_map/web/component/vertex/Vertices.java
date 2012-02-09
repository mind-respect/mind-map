package org.triple_brain.mind_map.web.component.vertex;

import org.testatoo.cartridge.html4.By;
import org.testatoo.cartridge.html4.element.Div;
import org.testatoo.core.component.Component;
import org.testatoo.core.nature.SizeSupport;

import static org.triple_brain.mind_map.web.component.vertex.Vertex.*;
import java.util.ArrayList;
import java.util.List;

import static org.testatoo.core.ComponentFactory.components;

/**
 * @author Vincent Blouin
 */
public class Vertices implements SizeSupport{

    public static Vertices vertices(){
        return new Vertices();
    }

    public Vertices(){

    }

    public List<Vertex> list(){
        List<Vertex> vertices = new ArrayList<Vertex>();
        for(Div vertex : components(Div.class, By.jQuery("$('.vertex')"))){
            vertices.add(vertex(vertex.id()));
        }
        return vertices;
    }

    @Override
    public int size() {
        return list().size();
    }
}
