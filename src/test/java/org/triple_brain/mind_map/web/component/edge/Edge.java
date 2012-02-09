package org.triple_brain.mind_map.web.component.edge;

import org.testatoo.cartridge.html4.By;
import org.testatoo.cartridge.html4.HtmlEvaluator;
import org.testatoo.core.EvaluatorHolder;
import org.testatoo.core.component.Component;
import org.testatoo.core.component.Panel;
import org.testatoo.core.component.TextField;

import static org.testatoo.core.ComponentFactory.component;

/**
 * @author Vincent Blouin
 */
public class Edge extends Panel {

    public static Edge edge(String id){
        return new Edge(id);
    }

    private Edge(String id){
        super(EvaluatorHolder.<HtmlEvaluator>get(), By.id(id).id(EvaluatorHolder.<HtmlEvaluator>get()));
    }

    public TextField textField(){
        return component(TextField.class, By.jQuery("$('#" + id() + " input:text:first')"));
    }
}
