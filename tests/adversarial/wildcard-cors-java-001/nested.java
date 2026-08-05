import org.springframework.web.bind.annotation.*;

public class Outer {
    @RestController
    public class ApiController {
        @CrossOrigin(origins = "*", allowCredentials = "true")
        @GetMapping("/api/data")
        public String getData() {
            return "nested";
        }
    }
}
