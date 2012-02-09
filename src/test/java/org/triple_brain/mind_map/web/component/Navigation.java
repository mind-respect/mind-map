package org.triple_brain.mind_map.web.component;

import static org.testatoo.core.ComponentFactory.page;

/**
 * @author Vincent Blouin
 */
public class Navigation {
    public static void openGraphPage() {
        page().open("/desktop/mind-map.html");
    }
}
