package org.triple_brain.mind_map.service;

import com.ovea.tadjin.module.security.client.AuthManager;
import org.triple_brain.module.repository.user.user.UserRepository;

import javax.inject.Inject;

/**
 * @author Vincent Blouin
 */
public class UserResource {
    @Inject
    AuthManager authManager;

    @Inject
    UserRepository userRepository;
}
