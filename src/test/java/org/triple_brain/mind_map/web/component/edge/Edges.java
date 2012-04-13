package org.triple_brain.mind_map.web.component.edge;

import org.testatoo.cartridge.html4.By;
import org.testatoo.cartridge.html4.element.Div;
import org.testatoo.core.ComponentException;
import org.testatoo.core.nature.SizeSupport;
import org.triple_brain.mind_map.web.component.vertex.Vertex;

import java.util.ArrayList;
import java.util.List;

import static org.testatoo.core.ComponentFactory.components;
import static org.triple_brain.mind_map.web.component.edge.Edge.*;

/**
 * Copyright Mozilla Public License 1.1
 */
public class Edges implements SizeSupport {

    public static Edges edges(){
        return new Edges();
    }

    private Edges(){

    }

    public List<Edge> list(){
        List<Edge> edges = new ArrayList<Edge>();
        try{
            for(Div edge : components(Div.class, By.jQuery("$('.edge')"))){
                edges.add(edge(edge.id()));
            }
        }catch (ComponentException componentException){

        }
        return edges;

    }

    @Override
    public int size() {
        return list().size();
    }
}
