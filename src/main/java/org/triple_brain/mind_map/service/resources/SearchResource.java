package org.triple_brain.mind_map.service.resources;

import org.codehaus.jettison.json.JSONArray;
import org.codehaus.jettison.json.JSONException;
import org.triple_brain.module.common_utils.CommonUtils;
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

import static org.triple_brain.mind_map.service.resources.GraphManipulatorResourceUtils.userFromSession;

/*
* Copyright Mozilla Public License 1.1
*/
@Path("/search")
@Produces(MediaType.APPLICATION_JSON)
public class SearchResource {

    @Inject
    GraphSearch graphSearch;

    @GET
    @Path("vertices/auto_complete/{search_text}")
    public JSONArray searchVerticesForAutoComplete(@PathParam("search_text") String searchText, @Context HttpServletRequest request) throws JSONException, UnsupportedEncodingException {
        return graphSearch.searchVerticesForAutoCompletionByLabelAndUser(
                CommonUtils.decodeURL(searchText),
                userFromSession(request.getSession())

        );
    }
}
