using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TeamTaskManagement.Core.DTOs.Teams;
using TeamTaskManagement.Core.Interfaces;

namespace TeamTaskManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class TeamController : ControllerBase
    {
        private readonly ITeamService _teamService;

        public TeamController(ITeamService teamService)
        {
            _teamService = teamService;
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create(
            [FromBody] CreateTeamRequest request)
        {
            try
            {
                var userId = GetCurrentUserId();

                var team = await _teamService.CreateAsync(
                    request,
                    userId);

                return CreatedAtAction(
                    nameof(GetById),
                    new { id = team.Id },
                    team);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }

        [HttpGet]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> GetAll()
        {
            var teams = await _teamService.GetAllAsync();

            return Ok(teams);
        }

        [HttpGet("{id:int}")]
        [Authorize(Roles = "Admin,Manager,User")]
        public async Task<IActionResult> GetById(int id)
        {
            var team = await _teamService.GetByIdAsync(id);

            if (team is null)
            {
                return NotFound(new
                {
                    message = "Team not found."
                });
            }

            return Ok(team);
        }

        [HttpPut("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(
            int id,
            [FromBody] UpdateTeamRequest request)
        {
            try
            {
                var team = await _teamService.UpdateAsync(
                    id,
                    request);

                return Ok(team);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new
                {
                    message = ex.Message
                });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }

        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                await _teamService.DeleteAsync(id);

                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new
                {
                    message = ex.Message
                });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }

        [HttpPost("{id:int}/members")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> AddMember(
            int id,
            [FromBody] AddTeamMemberRequest request)
        {
            try
            {
                await _teamService.AddMemberAsync(
                    id,
                    request.UserId);

                return Ok(new
                {
                    message = "User added to team successfully."
                });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new
                {
                    message = ex.Message
                });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }

        [HttpGet("{id:int}/members")]
        [Authorize(Roles = "Admin,Manager,User")]
        public async Task<IActionResult> GetMembers(int id)
        {
            try
            {
                var members = await _teamService
                    .GetMembersAsync(id);

                return Ok(members);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new
                {
                    message = ex.Message
                });
            }
        }

        private int GetCurrentUserId()
        {
            var userId = User.FindFirstValue(
                ClaimTypes.NameIdentifier);

            if (!int.TryParse(userId, out var id))
            {
                throw new UnauthorizedAccessException(
                    "Invalid user identity.");
            }

            return id;
        }
    }
}
