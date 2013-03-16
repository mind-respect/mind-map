package org.triple_brain.mind_map.service.resources;

import org.triple_brain.module.model.graph.UserGraph;

/*
* Copyright Mozilla Public License 1.1
*/
public interface VertexResourceFactory {
    public VertexResource withUserGraph(UserGraph userGraph);
}
