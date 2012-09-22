package org.triple_brain.mind_map.service.resources.test;

import org.triple_brain.module.model.graph.GraphFactory;
import org.triple_brain.module.model.graph.UserGraph;

import javax.annotation.security.PermitAll;
import javax.inject.Inject;
import javax.inject.Singleton;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import static org.triple_brain.mind_map.service.resources.GraphManipulatorResourceUtils.userFromSession;

/*
* Copyright Mozilla Public License 1.1
*/

@Path("/test/graph")
@Singleton
@PermitAll
public class GraphResourceTestUtils {
    @Inject
    GraphFactory graphFactory;

    @Path("graph_element/{graphElementId}/exists")
    @GET
    @Produces(MediaType.TEXT_PLAIN)
    public Response destinationVertices(@Context HttpServletRequest request, @PathParam("graphElementId") String graphElementId)throws Exception{
        UserGraph userGraph = graphFactory.loadForUser(userFromSession(request.getSession()));
        return Response.ok(
                userGraph.haveElementWithId(graphElementId).toString()
        ).build();
    }
}
