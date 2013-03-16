package org.triple_brain.mind_map.service.resources;

import com.google.inject.assistedinject.Assisted;
import com.google.inject.assistedinject.AssistedInject;
import org.triple_brain.module.model.User;
import org.triple_brain.module.model.graph.GraphFactory;
import org.triple_brain.module.model.graph.SubGraph;
import org.triple_brain.module.model.graph.UserGraph;
import org.triple_brain.module.model.json.graph.GraphJSONFields;

import javax.inject.Inject;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.io.UnsupportedEncodingException;

import static org.triple_brain.module.common_utils.Uris.decodeURL;

/**
 * Copyright Mozilla Public License 1.1
 */
@Produces(MediaType.APPLICATION_JSON)
public class GraphResource {

    @Inject
    GraphFactory graphFactory;

    @Inject
    VertexResourceFactory vertexResourceFactory;

    @Inject
    EdgeResourceFactory edgeResourceFactory;

    private User user;

    @AssistedInject
    public GraphResource(
            @Assisted User user
    ){
        this.user = user;
    }

    @Path("/vertex")
    public VertexResource vertexResource(){
        return vertexResourceFactory.withUserGraph(
                userGraph()
        );
    }

    @Path("/edge")
    public EdgeResource edgeResource(){
        return edgeResourceFactory.withUserGraph(
                userGraph()
        );
    }

    @GET
    @Path("/")
    @Produces(MediaType.APPLICATION_XML)
    public Response rdfXML() {
        UserGraph userGraph = userGraph();
        return Response.ok(userGraph.toRdfXml()).build();
    }

    @GET
    @Path("/{depthOfSubVertices}")
    public Response graph(
            @PathParam("depthOfSubVertices") Integer depthOfSubVertices
    ) {
        UserGraph userGraph = userGraph();
        SubGraph graph = userGraph.graphWithDefaultVertexAndDepth(depthOfSubVertices);
        return Response.ok(
                GraphJSONFields.toJson(graph),
                MediaType.APPLICATION_JSON
        ).build();
    }

    @GET
    @Path("/{depthOfSubVertices}/{centralVertexId}")
    public Response graph(
            @PathParam("depthOfSubVertices") Integer depthOfSubVertices,
            @PathParam("centralVertexId") String centralVertexId
    ) {
        try {
            centralVertexId = decodeURL(centralVertexId);
        } catch (UnsupportedEncodingException e) {
            Response.status(Response.Status.BAD_REQUEST).build();
        }
        UserGraph userGraph = userGraph();
        SubGraph graph = userGraph.graphWithDepthAndCenterVertexId(
                depthOfSubVertices,
                centralVertexId
        );
        return Response.ok(
                GraphJSONFields.toJson(graph),
                MediaType.APPLICATION_JSON
        ).build();
    }

    private UserGraph userGraph() {
        return graphFactory.loadForUser(
                user
        );
    }


}
