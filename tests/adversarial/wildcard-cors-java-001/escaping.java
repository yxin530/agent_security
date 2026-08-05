import org.springframework.web.bind.annotation.*;

@RestController
public class ApiController {
    @CrossOrigin(origins="*", allowCredentials="true")
    @GetMapping("/api/data")
    public String getData() {
        return "escaping";
    }
}
