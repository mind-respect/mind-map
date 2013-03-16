package org.triple_brain.mind_map.service.resources;

import org.triple_brain.module.model.graph.UserGraph;

/*
* Copyright Mozilla Public License 1.1
*/
public interface EdgeResourceFactory{
    public EdgeResource withUserGraph(UserGraph userGraph);
}
