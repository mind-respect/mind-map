package org.triple_brain.mind_map.web.component.vertex;

import org.testatoo.cartridge.html4.By;
import org.testatoo.cartridge.html4.HtmlEvaluator;
import org.testatoo.cartridge.html4.element.Div;
import org.testatoo.core.Evaluator;
import org.testatoo.core.EvaluatorHolder;
import org.testatoo.core.component.Button;
import org.testatoo.core.component.Component;
import org.testatoo.core.component.Panel;
import org.testatoo.core.component.TextField;

import static org.testatoo.core.ComponentFactory.component;

/**
 * @author Vincent Blouin
 */
public class Vertex extends Panel {

    public static Vertex vertex(String id){
        return new Vertex(id);
    }

    private Vertex(String id){
        super(EvaluatorHolder.<HtmlEvaluator>get(), By.id(id).id(EvaluatorHolder.<HtmlEvaluator>get()));
    }

    public TextField textField(){
        return component(TextField.class, By.jQuery("$('#" + id() + " input:text:first')"));
    }

    public Button addVertexBtn(){
        return component(Button.class, By.jQuery("$('#" + id() + " .add:first')"));
    }

    public Button removeVertexBtn(){
        return component(Button.class, By.jQuery("$('#" + id() + " .remove:first')"));
    }
}
