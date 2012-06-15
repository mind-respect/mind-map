package org.triple_brain.mind_map.service.resources;

import org.codehaus.jettison.json.JSONArray;
import org.codehaus.jettison.json.JSONException;
import org.codehaus.jettison.json.JSONObject;
import org.triple_brain.module.common_utils.CommonUtils;
import org.triple_brain.module.model.graph.Vertex;
import org.triple_brain.module.search.GraphSearch;

import javax.inject.Inject;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import java.io.UnsupportedEncodingException;
import java.util.List;

import static org.triple_brain.mind_map.service.resources.GraphManipulatorResourceUtils.userFromSession;
import static org.triple_brain.module.model.json.graph.VertexJSONFields.LABEL;
/*
* Copyright Mozilla Public License 1.1
*/
@Path("/search")
@Produces(MediaType.APPLICATION_JSON)
public class SearchResource {

    @Inject
    GraphSearch graphSearch;

    public static final String SEARCH_JSON_FIELD = "search_input";

    @GET
    @Path("vertices/auto_complete/{search_input}")
    public JSONArray searchVerticesForAutoComplete(@PathParam("search_input") String searchInput, @Context HttpServletRequest request)throws JSONException, UnsupportedEncodingException{
        return verticesFromSearchToJSONArray(
                graphSearch.searchVerticesForAutoCompletionByLabelAndUser(
                        CommonUtils.decodeURL(searchInput),
                        userFromSession(request.getSession())
                )
        );
    }

    private JSONArray verticesFromSearchToJSONArray(List<Vertex> vertices) throws JSONException{
        JSONArray verticesFromSearch = new JSONArray();
        for(Vertex vertex : vertices){
            verticesFromSearch.put(
                    new JSONObject()
                    .put(LABEL, vertex.label())
            );
        }
        return verticesFromSearch;
    }

}
