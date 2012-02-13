package org.triple_brain.mind_map.service;

import org.junit.*;
import org.triple_brain.model.User;
import org.triple_brain.module.repository.user.user.UserRepository;

import javax.inject.Inject;

/**
 * @author Vincent Blouin
 */
public class UserResourceTest extends RestTest {

    @Inject
    UserRepository userRepository;

    private User user;

    @Before
    public void setUp() {
        user = User.withEmail("user@triplebrain.org").password("password");
        userRepository.save(user);
        log(user);
    }

}
