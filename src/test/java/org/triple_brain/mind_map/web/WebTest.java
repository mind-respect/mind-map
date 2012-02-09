package org.triple_brain.mind_map.web;

import org.junit.After;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.runner.RunWith;
import org.testatoo.cartridge.html4.HtmlEvaluator;
import org.testatoo.config.annotation.TestatooModules;
import org.testatoo.config.junit.TestatooJunitRunner;
import org.testatoo.core.EvaluatorHolder;
import org.triple_brain.mind_map.web.conf.Module;

import javax.inject.Inject;

/**
 * @author Vincent Blouin
 */

@RunWith(TestatooJunitRunner.class)
@TestatooModules(Module.class)
public abstract class WebTest {

    public static HtmlEvaluator evaluator;


    @BeforeClass
    public static void setUpEvaluator(){
        evaluator = EvaluatorHolder.get();
    }

    @Before
    public final void beginPerRequestConnection() throws Exception {
        evaluator = EvaluatorHolder.get();
    }

    @After
    public final void endPerRequestConnection() {

    }
}