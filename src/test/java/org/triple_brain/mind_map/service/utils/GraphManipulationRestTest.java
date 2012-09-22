package org.triple_brain.mind_map.service.utils;

import com.sun.jersey.api.client.ClientResponse;
import org.codehaus.jettison.json.JSONArray;
import org.codehaus.jettison.json.JSONException;
import org.codehaus.jettison.json.JSONObject;
import org.junit.Before;
import org.triple_brain.module.common_utils.Uris;
import org.triple_brain.module.model.User;
import org.triple_brain.module.model.json.UserJSONFields;

import javax.ws.rs.core.MediaType;
import java.net.URI;

import static org.hamcrest.core.Is.is;
import static org.junit.Assert.assertThat;

/*
* Copyright Mozilla Public License 1.1
*/
public class GraphManipulationRestTest extends RestTest {

    protected final Integer DEPTH_OF_SUB_VERTICES_COVERING_ALL_GRAPH_VERTICES = 10;


    private JSONObject vertexA;
    private JSONObject vertexB;
    private JSONObject vertexC;

    protected User authenticatedUser;
    protected  VertexRestTestUtils vertexUtils;
    protected  EdgeRestTestUtils edgeUtils;
    protected UserRestTestUtils userUtils;

    @Before
    public void before_graph_manipulator_rest_test() throws Exception{
        userUtils = UserRestTestUtils.withWebResource(
                resource
        );
        JSONObject userAsJson = userUtils.validForCreation();
        createAUser(userAsJson);
        authenticate(userAsJson);
        authenticatedUser = User.withUsernameAndEmail(
                userAsJson.getString(UserJSONFields.USER_NAME),
                userAsJson.getString(UserJSONFields.EMAIL)
        );
        authenticatedUser.password(DEFAULT_PASSWORD);

        vertexUtils = VertexRestTestUtils.withWebResourceAndAuthCookie(
                resource,
                authCookie
        );
        edgeUtils = EdgeRestTestUtils.withWebResourceAndAuthCookie(
                resource,
                authCookie
        );
        createUserCore();
        deleteAllUserVerticesFromSearch();
        makeGraphHave3SerialVerticesWithLongLabels();
    }

    protected void makeGraphHave3SerialVerticesWithLongLabels() {
        ClientResponse response = resource
                .path("test")
                .path("make_graph_have_3_serial_vertices_with_long_labels")
                .cookie(authCookie)
                .get(ClientResponse.class);
        JSONArray verticesABAndC = response.getEntity(JSONArray.class);
        try{
            vertexA = verticesABAndC.getJSONObject(0);
            vertexB = verticesABAndC.getJSONObject(1);
            vertexC = verticesABAndC.getJSONObject(2);
        }catch(JSONException e){
            throw new RuntimeException(e);
        }
    }

    public JSONObject vertexA(){
        return vertexUtils.vertexWithUri(vertexAUri());
    }
    public JSONObject vertexB(){
        return vertexUtils.vertexWithUri(vertexBUri());
    }
    public JSONObject vertexC(){
        return vertexUtils.vertexWithUri(vertexCUri());
    }

    private void createUserCore() {
        ClientResponse response = resource
                .path("test")
                .path("search")
                .path("create_core")
                .cookie(authCookie)
                .get(ClientResponse.class);
        assertThat(response.getStatus(), is(200));
    }

    private void deleteAllUserVerticesFromSearch() {
        ClientResponse response = resource
                .path("test")
                .path("search")
                .path("delete_all_documents")
                .cookie(authCookie)
                .get(ClientResponse.class);
        assertThat(response.getStatus(), is(200));
    }

    protected void indexAllVertices() {
        ClientResponse response = resource
                .path("test")
                .path("search")
                .path("index_all_vertices")
                .cookie(authCookie)
                .get(ClientResponse.class);
        assertThat(response.getStatus(), is(200));
    }


    public URI vertexAUri(){
        return vertexUtils.uriOfVertex(vertexA);
    }

    public URI vertexBUri(){
        return vertexUtils.uriOfVertex(vertexB);
    }

    public URI vertexCUri(){
        return vertexUtils.uriOfVertex(vertexC);
    }

    public boolean graphElementWithIdExistsInCurrentGraph(URI graphElementId){
        ClientResponse response = resource
                .path("test")
                .path("graph")
                .path("graph_element")
                .path(Uris.encodeURL(graphElementId.toString()))
                .path("exists")
                .cookie(authCookie)
                .get(ClientResponse.class);
        String boolStr = response.getEntity(String.class);
        return Boolean.valueOf(boolStr);
    }

    public JSONObject wholeGraph(){
        ClientResponse response = resource
                .path("drawn_graph")
                .path(authenticatedUser.mindMapUri())
                .path(DEPTH_OF_SUB_VERTICES_COVERING_ALL_GRAPH_VERTICES.toString())
                .cookie(authCookie)
                .type(MediaType.APPLICATION_JSON)
                .get(ClientResponse.class);
        return response.getEntity(JSONObject.class);
    }

}
