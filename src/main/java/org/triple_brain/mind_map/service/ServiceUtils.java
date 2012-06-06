package org.triple_brain.mind_map.service;

import java.net.URI;

/*
* Copyright Mozilla Public License 1.1
*/
public class ServiceUtils {
    public static String usernameInURI(URI uri){
        return uri.getPath().split("\\/")[1];
    }
}
