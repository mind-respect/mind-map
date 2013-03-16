package org.triple_brain.mind_map.service.resources;

import com.google.inject.assistedinject.Assisted;
import com.google.inject.assistedinject.AssistedInject;
import org.codehaus.jettison.json.JSONException;
import org.codehaus.jettison.json.JSONObject;
import org.triple_brain.module.graphviz_visualisation.GraphToDrawnGraphConverter;
import org.triple_brain.module.model.User;
import org.triple_brain.module.model.graph.GraphFactory;
import org.triple_brain.module.model.graph.SubGraph;
import org.triple_brain.module.model.graph.UserGraph;

import javax.inject.Inject;
import javax.inject.Singleton;
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
@Singleton
public class DrawnGraphResource {

    @Inject
    GraphFactory graphFactory;

    private User user;

    @AssistedInject
    public DrawnGraphResource(
        @Assisted User user
    ){
        this.user = user;
    }

    @GET
    @Path("/{depthOfSubVertices}")
    public Response drawnGraph(
            @PathParam("depthOfSubVertices") Integer depthOfSubVertices
    ){
        UserGraph userGraph = graphFactory.loadForUser(
                user
        );
        SubGraph graph = userGraph.graphWithDefaultVertexAndDepth(
                depthOfSubVertices
        );
        JSONObject drawnGraph = GraphToDrawnGraphConverter.withGraph(
                graph
        ).convert();
        return Response.ok(drawnGraph, MediaType.APPLICATION_JSON).build();
    }

    @GET
    @Path("/{depthOfSubVertices}/{centralVertexId}")
    public Response drawnGraph(
            @PathParam("depthOfSubVertices") Integer depthOfSubVertices,
            @PathParam("centralVertexId") String centralVertexId
    ) throws JSONException{
        try{
            centralVertexId = decodeURL(centralVertexId);
        }catch(UnsupportedEncodingException e){
            Response.status(Response.Status.BAD_REQUEST).build();
        }
        UserGraph userGraph = graphFactory.loadForUser(
                user
        );
        SubGraph graph = userGraph.graphWithDepthAndCenterVertexId(
                depthOfSubVertices,
                centralVertexId
        );
        JSONObject drawnGraph = GraphToDrawnGraphConverter.withGraph(
                graph
        ).convert();
        return Response.ok(drawnGraph, MediaType.APPLICATION_JSON).build();
    }
}
