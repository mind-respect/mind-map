package org.triple_brain.mind_map.service.resources;

import org.triple_brain.mind_map.service.SecurityInterceptor;
import org.triple_brain.module.model.User;

import javax.servlet.http.HttpSession;
/*
* Copyright Mozilla Public License 1.1
*/
public class GraphManipulatorResourceUtils {
    public static User userFromSession(HttpSession session){
        return (User) session.getAttribute(SecurityInterceptor.AUTHENTICATED_USER_KEY);
    }

    public static boolean isUserInSession(HttpSession session){
        return session.getAttribute(SecurityInterceptor.AUTHENTICATED_USER_KEY) != null;
    }
}
