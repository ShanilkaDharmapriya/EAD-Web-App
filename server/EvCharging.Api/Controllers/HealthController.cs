using Microsoft.AspNetCore.Mvc;

namespace EvCharging.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    [HttpGet]
    public IActionResult Get()
    {
        return Ok(new
        {
            status = "ok",
            timeUtc = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
        });
    }
}


