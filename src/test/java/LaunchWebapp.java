import org.triple_brain.mind_map.Launcher;
import org.triple_brain.service.Launch;

public class LaunchWebapp {

    public static void main(String[] args) throws Exception {
        Launch.before();
        Launcher launcher = new Launcher();
        launcher.launch();
        Launch.after();
    }
}
