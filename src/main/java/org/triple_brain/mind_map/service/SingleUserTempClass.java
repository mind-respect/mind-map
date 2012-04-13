package org.triple_brain.mind_map.service;

import org.triple_brain.graphmanipulator.jena.graph.JenaEdgeManipulator;
import org.triple_brain.graphmanipulator.jena.graph.JenaGraphManipulator;
import org.triple_brain.graphmanipulator.jena.graph.JenaVertexManipulator;

import static org.triple_brain.graphmanipulator.jena.graph.JenaGraphManipulator.*;

/**
 * Copyright Mozilla Public License 1.1
 */
public class SingleUserTempClass {
    public static JenaGraphManipulator jenaGraphManipulator = withDefaultUser();
    public static JenaVertexManipulator jenaVertexManipulator = JenaVertexManipulator.withJenaGraphManipulator(jenaGraphManipulator);
    public static JenaEdgeManipulator jenaEdgeManipulator = JenaEdgeManipulator.withJenaGraphManipulator(jenaGraphManipulator);
}
