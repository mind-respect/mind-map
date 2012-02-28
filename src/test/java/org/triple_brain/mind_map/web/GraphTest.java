package org.triple_brain.mind_map.web;

import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Ignore;
import org.junit.Test;

import static org.testatoo.core.Language.type;
import static org.testatoo.core.input.Key.*;

import org.testatoo.cartridge.html4.HtmlEvaluator;
import org.testatoo.core.EvaluatorHolder;
import org.testatoo.core.input.Key;
import org.testatoo.core.input.KeyModifier;
import org.triple_brain.mind_map.web.component.Navigation;
import org.triple_brain.mind_map.web.component.edge.Edge;
import org.triple_brain.mind_map.web.component.edge.Edges;
import org.triple_brain.mind_map.web.component.vertex.Vertex;
import org.triple_brain.graphmanipulator.jena.TripleBrainModel;

import static org.hamcrest.Matchers.describedAs;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.testatoo.core.Language.enter;
import static org.testatoo.core.Language.waitUntil;
import static org.testatoo.core.input.Mouse.clickOn;
import static org.testatoo.core.matcher.Has.has;
import static org.testatoo.core.matcher.Matchers.contains;
import static org.testatoo.core.matcher.Matchers.size;
import static org.testatoo.core.matcher.Matchers.visible;
import static org.testatoo.core.matcher.TextValue.text;
import static org.testatoo.core.matcher.Value.value;
import static org.triple_brain.mind_map.web.component.vertex.Vertices.*;
import static org.triple_brain.mind_map.web.component.edge.Edges.*;
/**
 * @author Vincent Blouin
 */
@Ignore
public class GraphTest extends WebTest{


    @BeforeClass
    public static void setUp(){
        Navigation.openGraphPage();
    }

    @Before
    public void before(){
    }

    @Test
    public void graph_contains_expected_elements() throws Exception{
        assertThat(vertices().size(), is(1));
        assertThat(edges().size(), is(0));
    }

    @Test
    public void vertex_contains_expected_elements() throws Exception{
        Vertex firstVertex = vertices().list().get(0);
        assertThat(firstVertex, contains(
                firstVertex.textField(),
                firstVertex.addVertexBtn(),
                firstVertex.removeVertexBtn()
        ));

        assertThat(firstVertex.textField(), has(value("Roger Lamothe")));
        assertThat(firstVertex.addVertexBtn(), has(text("+")));
        assertThat(firstVertex.removeVertexBtn(), has(text("-")));
    }

    @Test
    public void can_add_vertex() throws Exception{
        Vertex firstVertex = vertices().list().get(0);
        clickOn(firstVertex.addVertexBtn());
        waitUntil(vertices(), has(size(2)));
        assertThat(edges(), has(size(1)));
        assertThat(edges().list().get(0).textField(), has(value(TripleBrainModel.EMPTY_EDGE_LABEL)));
        assertThat(vertices().list().get(1).textField(), has(value(TripleBrainModel.EMPTY_VERTEX_LABEL)));
    }

    @Test
    public void can_modify_labels() throws Exception{
        Vertex firstVertex = vertices().list().get(0);
        clickOn(firstVertex.addVertexBtn());
        Edge likesEdge = edges().list().get(0);
        enter("likes",likesEdge.textField());
        pressEnter();

        Vertex JuJiTsuVertex = vertices().list().get(1);
        enter("Ju-Ji-Tsu", JuJiTsuVertex.textField());
        pressEnter();

        //add another vertex in order to redraw the graph and verify if vertices and edges were updated
        clickOn(firstVertex.addVertexBtn());
        waitUntil(JuJiTsuVertex, is(visible()));
        waitUntil(likesEdge, is(visible()));
        assertThat(JuJiTsuVertex.textField(), has(value("Ju-Ji-Tsu")));
        assertThat(likesEdge.textField(), has(value("likes")));
    }

    private void pressEnter(){
        EvaluatorHolder.<HtmlEvaluator>get().press(ENTER);
    }

}

