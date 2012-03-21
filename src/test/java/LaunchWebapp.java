import org.testatoo.container.ContainerRunner;

import static org.triple_brain.module.repository_sql.SQLConnection.clearDatabases;
import static org.triple_brain.module.repository_sql.SQLConnection.createTables;

/**
 * This launcher starts the webapp in test mode. To launch the webapp in real runtime mode, create a launcher
 * in your IDE with :
 * - the main class: org.testatoo.container.ContainerRunner
 * - the parameters: -container jetty -context triple_brain
 */
public class LaunchWebapp {

    public static void main(String[] args) throws Exception {
        clearDatabases();
        createTables();
        ContainerRunner.main("-container", "jetty");
    }
}
