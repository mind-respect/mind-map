package org.triple_brain.mind_map.service.resources;

import org.codehaus.jettison.json.JSONException;
import org.codehaus.jettison.json.JSONObject;
import org.triple_brain.mind_map.service.ServiceUtils;
import org.triple_brain.module.graphviz_visualisation.GraphToDrawnGraphConverter;
import org.triple_brain.module.model.graph.Graph;

import javax.inject.Singleton;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import java.io.UnsupportedEncodingException;

import static org.triple_brain.mind_map.service.SingleUserTempClass.jenaGraphManipulator;

/**
 * Copyright Mozilla Public License 1.1
 */

@Path("/drawn_graph")
@Produces(MediaType.APPLICATION_JSON)
@Singleton
public class DrawnGraphResource {

    @GET
    @Path("/{depthOfSubVertices}")
    public Response drawnGraph(@PathParam("depthOfSubVertices") Integer depthOfSubVertices) throws JSONException{
        Graph graph = jenaGraphManipulator.graphWithDefaultVertexAndDepth(depthOfSubVertices);
        JSONObject drawnGraph = GraphToDrawnGraphConverter.withGraph(graph).convert();
        return Response.ok(drawnGraph, MediaType.APPLICATION_JSON).build();
    }

    @GET
    @Path("/{depthOfSubVertices}/{centralVertexId}")
    public Response drawnGraph(@PathParam("depthOfSubVertices") Integer depthOfSubVertices, @PathParam("centralVertexId") String centralVertexId) throws JSONException{
        try{
            centralVertexId = ServiceUtils.decodeURL(centralVertexId);
        }catch(UnsupportedEncodingException e){
            Response.status(Response.Status.BAD_REQUEST).build();
        }
        Graph graph = jenaGraphManipulator.graphWithDepthAndCenterVertexId(depthOfSubVertices, centralVertexId);
        JSONObject drawnGraph = GraphToDrawnGraphConverter.withGraph(graph).convert();
        return Response.ok(drawnGraph, MediaType.APPLICATION_JSON).build();
    }

}
