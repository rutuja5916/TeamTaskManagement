using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TeamTaskManagement.Core.DTOs.Comments;
using TeamTaskManagement.Core.Interfaces;

namespace TeamTaskManagement.API.Controllers
{
    [ApiController]
    [Route("api")]
    [Authorize]
    public class CommentController : ControllerBase
    {
        private readonly ICommentService _commentService;

        public CommentController(ICommentService commentService)
        {
            _commentService = commentService;
        }

        // POST: api/Task/{taskId}/comments
        [HttpPost("Task/{taskId:int}/comments")]
        [Authorize(Roles = "Admin,Manager,User")]
        public async Task<IActionResult> Create(
            int taskId,
            [FromBody] CreateCommentRequest request)
        {
            try
            {
                var userId = GetCurrentUserId();

                var comment = await _commentService.CreateAsync(
                    taskId,
                    request,
                    userId);

                return Ok(comment);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new
                {
                    message = ex.Message
                });
            }
        }

        // GET: api/Task/{taskId}/comments
        [HttpGet("Task/{taskId:int}/comments")]
        [Authorize(Roles = "Admin,Manager,User")]
        public async Task<IActionResult> GetByTaskId(int taskId)
        {
            try
            {
                var userId = GetCurrentUserId();
                var role = GetCurrentUserRole();

                var comments =
                    await _commentService.GetByTaskIdAsync(
                        taskId,
                        userId,
                        role);

                return Ok(comments);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new
                {
                    message = ex.Message
                });
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
        }

        // DELETE: api/Comment/{id}
        [HttpDelete("Comment/{id:int}")]
        [Authorize(Roles = "Admin,Manager,User")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var userId = GetCurrentUserId();
                var role = GetCurrentUserRole();

                await _commentService.DeleteAsync(
                    id,
                    userId,
                    role);

                return Ok(new
                {
                    message = "Comment deleted successfully."
                });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new
                {
                    message = ex.Message
                });
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
            {
                throw new UnauthorizedAccessException(
                    "Invalid user identity.");
            }

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