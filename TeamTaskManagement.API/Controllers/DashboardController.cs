using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TeamTaskManagement.Core.Interfaces;

namespace TeamTaskManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DashboardController : ControllerBase
    {
        private readonly IDashboardService _dashboardService;

        public DashboardController(
            IDashboardService dashboardService)
        {
            _dashboardService = dashboardService;
        }

        // GET: api/Dashboard
        [HttpGet]
        [Authorize(Roles = "Admin,Manager,User")]
        public async Task<IActionResult> GetDashboard()
        {
            var userIdClaim = User.FindFirstValue(
                ClaimTypes.NameIdentifier);

            var role = User.FindFirstValue(
                ClaimTypes.Role);

            if (!int.TryParse(userIdClaim, out var userId) ||
                string.IsNullOrWhiteSpace(role))
            {
                return Unauthorized(new
                {
                    message = "Invalid user identity."
                });
            }

            var dashboard =
                await _dashboardService.GetDashboardAsync(
                    userId,
                    role);

            return Ok(dashboard);
        }
    }
}