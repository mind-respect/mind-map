package org.triple_brain.mind_map.web.component;

import static org.testatoo.core.ComponentFactory.page;

/**
 * Copyright Mozilla Public License 1.1
 */
public class Navigation {
    public static void openGraphPage() {
        page().open("/desktop/mind-map.html");
    }
}
