import org.springframework.web.bind.annotation.*;

@RestController
public class ApiController {
    @CrossOrigin(origins = "*")
    @GetMapping("/api/data")
    public String getData() {
        return "safe";
    }
}
