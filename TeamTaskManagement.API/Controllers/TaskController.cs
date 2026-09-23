using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TeamTaskManagement.Core.DTOs.Tasks;
using TeamTaskManagement.Core.Interfaces;

namespace TeamTaskManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class TaskController : ControllerBase
    {
        private readonly ITaskService _taskService;

        public TaskController(ITaskService taskService)
        {
            _taskService = taskService;
        }

        // POST: api/Task
        [HttpPost]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Create(
            [FromBody] CreateTaskRequest request)
        {
            try
            {
                var currentUserId = GetCurrentUserId();

                var task = await _taskService.CreateAsync(
                    request,
                    currentUserId);

                return CreatedAtAction(
                    nameof(GetById),
                    new { id = task.Id },
                    task);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // GET: api/Task
        [HttpGet]
        [Authorize(Roles = "Admin,Manager,User")]
        public async Task<IActionResult> GetAll(
            [FromQuery] TaskFilterRequest filter)
        {
            var currentUserId = GetCurrentUserId();
            var currentUserRole = GetCurrentUserRole();

            var tasks = await _taskService.GetAllAsync(
                filter,
                currentUserId,
                currentUserRole);

            return Ok(tasks);
        }

        // GET: api/Task/5
        [HttpGet("{id:int}")]
        [Authorize(Roles = "Admin,Manager,User")]
        public async Task<IActionResult> GetById(int id)
        {
            var currentUserId = GetCurrentUserId();
            var currentUserRole = GetCurrentUserRole();

            var task = await _taskService.GetByIdAsync(
                id,
                currentUserId,
                currentUserRole);

            if (task == null)
                return NotFound(new { message = "Task not found." });

            return Ok(task);
        }

        // PUT: api/Task/5
        [HttpPut("{id:int}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Update(
            int id,
            [FromBody] UpdateTaskRequest request)
        {
            try
            {
                var currentUserId = GetCurrentUserId();
                var currentUserRole = GetCurrentUserRole();

                var task = await _taskService.UpdateAsync(
                    id,
                    request,
                    currentUserId,
                    currentUserRole);

                return Ok(task);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // PUT: api/Task/5/status
        [HttpPut("{id:int}/status")]
        [Authorize(Roles = "Admin,Manager,User")]
        public async Task<IActionResult> UpdateStatus(
            int id,
            [FromBody] UpdateTaskStatusRequest request)
        {
            try
            {
                var currentUserId = GetCurrentUserId();
                var currentUserRole = GetCurrentUserRole();

                await _taskService.UpdateStatusAsync(
                    id,
                    request,
                    currentUserId,
                    currentUserRole);

                return Ok(new
                {
                    message = "Task status updated successfully."
                });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
        }

        // DELETE: api/Task/5
        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var currentUserId = GetCurrentUserId();
                var currentUserRole = GetCurrentUserRole();

                await _taskService.DeleteAsync(
                    id,
                    currentUserId,
                    currentUserRole);

                return Ok(new
                {
                    message = "Task deleted successfully."
                });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirstValue(
                ClaimTypes.NameIdentifier);

            if (!int.TryParse(userIdClaim, out var userId))
                throw new UnauthorizedAccessException(
                    "Invalid user identity.");

            return userId;
        }

        private string GetCurrentUserRole()
        {
            return User.FindFirstValue(ClaimTypes.Role)
                   ?? throw new UnauthorizedAccessException(
                       "User role not found.");
        }
    }
}