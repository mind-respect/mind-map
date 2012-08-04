package org.triple_brain.mind_map.service;

import com.sun.jersey.api.client.ClientResponse;
import org.codehaus.jettison.json.JSONArray;
import org.codehaus.jettison.json.JSONObject;
import org.junit.Test;
import org.triple_brain.module.common_utils.CommonUtils;

import static org.hamcrest.core.Is.is;
import static org.junit.Assert.assertThat;
import static org.junit.Assert.assertTrue;
import static org.triple_brain.module.model.json.graph.VertexJsonFields.LABEL;
/*
* Copyright Mozilla Public License 1.1
*/
public class SearchResourceTest extends GraphManipulationRestTest{

    @Test
    public void can_search_vertices_for_auto_complete()throws Exception{
        indexAllVertices();
        ClientResponse response = resource
                .path("search")
                .path("vertices")
                .path("auto_complete")
                .path(CommonUtils.encodeURL("vert"))
                .cookie(authCookie)
                .type("application/json")
                .get(ClientResponse.class);
        JSONArray searchResults = response.getEntity(JSONArray.class);
        assertThat(searchResults.length(), is(3));
        assertTrue(searchResults.getJSONObject(0).has(LABEL));
    }

    @Test
    public void search_for_auto_complete_can_have_spaces()throws Exception{
        indexAllVertices();
        ClientResponse response = searchForAutoCompleteUsingRest(
                "vertex Azu"
        );
        JSONArray searchResults = response.getEntity(JSONArray.class);
        JSONObject firstResult = searchResults.getJSONObject(0);
        assertThat(firstResult.getString(LABEL), is("vertex Azure"));

        response = searchForAutoCompleteUsingRest(
                "vertex Bar"
        );
        searchResults = response.getEntity(JSONArray.class);
        firstResult = searchResults.getJSONObject(0);
        assertThat(firstResult.getString(LABEL), is("vertex Bareau"));
    }

    private ClientResponse searchForAutoCompleteUsingRest(String textToSearchWith)throws Exception{
        return resource
                .path("search")
                .path("vertices")
                .path("auto_complete")
                .path(CommonUtils.encodeURL(textToSearchWith))
                .cookie(authCookie)
                .type("application/json")
                .get(ClientResponse.class);
    }

}
