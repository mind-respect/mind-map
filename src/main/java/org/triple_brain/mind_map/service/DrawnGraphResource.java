package org.triple_brain.mind_map.service;

import com.hp.hpl.jena.rdf.model.Model;

import org.codehaus.jettison.json.JSONObject;
import static org.triple_brain.module.graphviz_visualisation.JenaGraphToDrawnGraphConverter.*;

import javax.inject.Singleton;
import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import org.codehaus.jettison.json.JSONException;

import static org.triple_brain.mind_map.service.SingleUserTempClass.*;

/**
 * @author Vincent Blouin
 */

@Path("/drawn_graph")
@Produces(MediaType.APPLICATION_JSON)
@Singleton
public class DrawnGraphResource {

    @GET
    @Path("/{depthOfSubVertices}")
    public Response drawnGraph(@PathParam("depthOfSubVertices") Integer depthOfSubVertices) throws JSONException{
        Model jenaGraph = jenaGraphManipulator.graphWithDefaultVertexAndDepth(depthOfSubVertices);
        JSONObject drawnGraph = graphVizDrawing(jenaGraph);
        return Response.ok(drawnGraph, MediaType.APPLICATION_JSON).build();
    }

    @GET
    @Path("/{depthOfSubVertices}/{centralVertexId}")
    public Response drawnGraph(@PathParam("depthOfSubVertices") Integer depthOfSubVertices, @PathParam("centralVertexId") String centralVertexId) throws JSONException{
        Model jenaGraph = jenaGraphManipulator.graphWithDepthAndCenterVertexId(depthOfSubVertices, centralVertexId);
        JSONObject drawnGraph = graphVizDrawing(jenaGraph);
        return Response.ok(drawnGraph, MediaType.APPLICATION_JSON).build();
    }

}
