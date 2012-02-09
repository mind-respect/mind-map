import org.testatoo.container.ContainerRunner;

/**
 * This launcher starts the webapp in test mode. To launch the webapp in real runtime mode, create a launcher
 * in your IDE with :
 * - the main class: org.testatoo.container.ContainerRunner
 * - the parameters: -container jetty -context triple_brain
 */
public class LaunchWebapp {

    public static void main(String[] args) throws Exception {
        ContainerRunner.main("-container", "jetty");
    }
}
