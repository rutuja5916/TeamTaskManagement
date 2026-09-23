using Microsoft.EntityFrameworkCore;
using TeamTaskManagement.Core.DTOs.Teams;
using TeamTaskManagement.Core.Entities;
using TeamTaskManagement.Core.Interfaces;
using TeamTaskManagement.Infrastructure.Data;

namespace TeamTaskManagement.Infrastructure.Services
{
    public class TeamService : ITeamService
    {
        private readonly ApplicationDbContext _context;

        public TeamService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<TeamResponse> CreateAsync(
            CreateTeamRequest request,
            int createdByUserId)
        {
            var name = request.Name.Trim();

            var exists = await _context.Teams
                .AnyAsync(t => t.Name.ToLower() == name.ToLower());

            if (exists)
            {
                throw new InvalidOperationException(
                    "A team with this name already exists.");
            }

            var creatorExists = await _context.Users
                .AnyAsync(u => u.Id == createdByUserId && u.IsActive);

            if (!creatorExists)
            {
                throw new InvalidOperationException(
                    "Creator user was not found.");
            }

            var team = new Team
            {
                Name = name,
                Description = string.IsNullOrWhiteSpace(request.Description)
                    ? null
                    : request.Description.Trim(),
                CreatedBy = createdByUserId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Teams.Add(team);

            await _context.SaveChangesAsync();

            return await GetByIdAsync(team.Id)
                ?? throw new InvalidOperationException(
                    "Unable to retrieve the created team.");
        }

        public async Task<IEnumerable<TeamResponse>> GetAllAsync()
        {
            return await _context.Teams
                .AsNoTracking()
                .Include(t => t.Creator)
                .Include(t => t.Members)
                .Select(t => new TeamResponse
                {
                    Id = t.Id,
                    Name = t.Name,
                    Description = t.Description,
                    CreatedBy = t.CreatedBy,
                    CreatedByName =
                        t.Creator.FirstName + " " + t.Creator.LastName,
                    CreatedAt = t.CreatedAt,
                    UpdatedAt = t.UpdatedAt,
                    MemberCount = t.Members.Count
                })
                .OrderBy(t => t.Name)
                .ToListAsync();
        }

        public async Task<TeamResponse?> GetByIdAsync(int teamId)
        {
            return await _context.Teams
                .AsNoTracking()
                .Include(t => t.Creator)
                .Include(t => t.Members)
                .Where(t => t.Id == teamId)
                .Select(t => new TeamResponse
                {
                    Id = t.Id,
                    Name = t.Name,
                    Description = t.Description,
                    CreatedBy = t.CreatedBy,
                    CreatedByName =
                        t.Creator.FirstName + " " + t.Creator.LastName,
                    CreatedAt = t.CreatedAt,
                    UpdatedAt = t.UpdatedAt,
                    MemberCount = t.Members.Count
                })
                .FirstOrDefaultAsync();
        }

        public async Task<TeamResponse> UpdateAsync(
            int teamId,
            UpdateTeamRequest request)
        {
            var team = await _context.Teams
                .FirstOrDefaultAsync(t => t.Id == teamId);

            if (team is null)
            {
                throw new KeyNotFoundException("Team not found.");
            }

            var name = request.Name.Trim();

            var duplicateName = await _context.Teams
                .AnyAsync(t =>
                    t.Id != teamId &&
                    t.Name.ToLower() == name.ToLower());

            if (duplicateName)
            {
                throw new InvalidOperationException(
                    "A team with this name already exists.");
            }

            team.Name = name;

            team.Description =
                string.IsNullOrWhiteSpace(request.Description)
                    ? null
                    : request.Description.Trim();

            team.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return await GetByIdAsync(teamId)
                ?? throw new InvalidOperationException(
                    "Unable to retrieve the updated team.");
        }

        public async Task DeleteAsync(int teamId)
        {
            var team = await _context.Teams
                .Include(t => t.Members)
                .Include(t => t.Tasks)
                .FirstOrDefaultAsync(t => t.Id == teamId);

            if (team is null)
            {
                throw new KeyNotFoundException("Team not found.");
            }

            if (team.Tasks.Any())
            {
                throw new InvalidOperationException(
                    "A team with existing tasks cannot be deleted.");
            }

            _context.Teams.Remove(team);

            await _context.SaveChangesAsync();
        }

        public async Task AddMemberAsync(
            int teamId,
            int userId)
        {
            var teamExists = await _context.Teams
                .AnyAsync(t => t.Id == teamId);

            if (!teamExists)
            {
                throw new KeyNotFoundException("Team not found.");
            }

            var userExists = await _context.Users
                .AnyAsync(u => u.Id == userId && u.IsActive);

            if (!userExists)
            {
                throw new KeyNotFoundException(
                    "Active user not found.");
            }

            var alreadyMember = await _context.TeamMembers
                .AnyAsync(tm =>
                    tm.TeamId == teamId &&
                    tm.UserId == userId);

            if (alreadyMember)
            {
                throw new InvalidOperationException(
                    "User is already a member of this team.");
            }

            var member = new TeamMember
            {
                TeamId = teamId,
                UserId = userId,
                JoinedAt = DateTime.UtcNow
            };

            _context.TeamMembers.Add(member);

            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<TeamMemberResponse>> GetMembersAsync(
            int teamId)
        {
            var teamExists = await _context.Teams
                .AnyAsync(t => t.Id == teamId);

            if (!teamExists)
            {
                throw new KeyNotFoundException("Team not found.");
            }

            return await _context.TeamMembers
                .AsNoTracking()
                .Where(tm => tm.TeamId == teamId)
                .Include(tm => tm.User)
                .ThenInclude(u => u.Role)
                .Select(tm => new TeamMemberResponse
                {
                    UserId = tm.UserId,
                    FullName =
                        tm.User.FirstName + " " + tm.User.LastName,
                    Email = tm.User.Email,
                    Role = tm.User.Role.Name.ToString(),
                    JoinedAt = tm.JoinedAt
                })
                .OrderBy(m => m.FullName)
                .ToListAsync();
        }
    }
}
