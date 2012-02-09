package org.triple_brain.mind_map.service;

import org.triple_brain.graphmanipulator.jena.graph.JenaEdgeManipulator;
import org.triple_brain.graphmanipulator.jena.graph.JenaGraphManipulator;
import org.triple_brain.graphmanipulator.jena.graph.JenaVertexManipulator;

import static org.triple_brain.graphmanipulator.jena.graph.JenaGraphManipulator.*;
import static org.triple_brain.graphmanipulator.jena.graph.JenaVertexManipulator.*;
import static org.triple_brain.graphmanipulator.jena.graph.JenaEdgeManipulator.*;

/**
 * @author Vincent Blouin
 */
public class SingleUserTempClass {
    public static JenaGraphManipulator jenaGraphManipulator = jenaGraphManipulatorWithDefaultUser();
    public static JenaVertexManipulator jenaVertexManipulator = jenaVertexManipulatorWithJenaGraphManipulator(jenaGraphManipulator);
    public static JenaEdgeManipulator jenaEdgeManipulator = jenaEdgeManipulatorWithJenaGraphManipulator(jenaGraphManipulator);
}
