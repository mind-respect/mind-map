package org.triple_brain.mind_map.service.resources.test;

import org.triple_brain.module.model.graph.Edge;
import org.triple_brain.module.model.graph.GraphFactory;
import org.triple_brain.module.model.graph.UserGraph;
import org.triple_brain.module.model.json.graph.EdgeJsonFields;

import javax.annotation.security.PermitAll;
import javax.inject.Inject;
import javax.inject.Singleton;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.Response;
import java.net.URI;

import static org.triple_brain.mind_map.service.resources.GraphManipulatorResourceUtils.userFromSession;

/*
* Copyright Mozilla Public License 1.1
*/
@Path("/test/edge/")
@PermitAll
@Singleton
public class EdgeResourceTestUtils {

    @Inject
    GraphFactory graphFactory;

    @Path("{edgeId}")
    @GET
    public Response vertexWithId(@Context HttpServletRequest request, @PathParam("edgeId") String edgeId)throws Exception{
        UserGraph userGraph = graphFactory.loadForUser(userFromSession(request.getSession()));
        Edge edge = userGraph.edgeWithUri(new URI(edgeId));
        return Response.ok(EdgeJsonFields.toJson(edge)).build();
    }

}
