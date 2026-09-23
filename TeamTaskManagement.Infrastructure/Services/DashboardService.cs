using Microsoft.EntityFrameworkCore;
using TeamTaskManagement.Core.DTOs.Dashboard;
using TeamTaskManagement.Core.Interfaces;
using TeamTaskManagement.Infrastructure.Data;

namespace TeamTaskManagement.Infrastructure.Services
{
    public class DashboardService : IDashboardService
    {
        private readonly ApplicationDbContext _context;

        public DashboardService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<DashboardResponse> GetDashboardAsync(
            int currentUserId,
            string currentUserRole)
        {
            var taskQuery = _context.Tasks
                .AsNoTracking()
                .AsQueryable();

            if (currentUserRole == "User")
            {
                taskQuery = taskQuery.Where(t =>
                    t.AssignedTo == currentUserId);
            }
            else if (currentUserRole == "Manager")
            {
                taskQuery = taskQuery.Where(t =>
                    t.AssignedBy == currentUserId ||
                    _context.TeamMembers.Any(tm =>
                        tm.TeamId == t.TeamId &&
                        tm.UserId == currentUserId));
            }

            var totalTasks = await taskQuery.CountAsync();

            var toDo = await taskQuery.CountAsync(t =>
                t.Status == Core.Enums.TaskStatus.ToDo);

            var inProgress = await taskQuery.CountAsync(t =>
                t.Status == Core.Enums.TaskStatus.InProgress);

            var done = await taskQuery.CountAsync(t =>
                t.Status == Core.Enums.TaskStatus.Done);

            var totalUsers = currentUserRole == "User"
                ? 1
                : await _context.Users
                    .AsNoTracking()
                    .CountAsync(u => u.IsActive);

            var totalTeams = currentUserRole == "User"
                ? await _context.TeamMembers
                    .AsNoTracking()
                    .Where(tm => tm.UserId == currentUserId)
                    .Select(tm => tm.TeamId)
                    .Distinct()
                    .CountAsync()
                : await _context.Teams
                    .AsNoTracking()
                    .CountAsync();

            return new DashboardResponse
            {
                TotalTasks = totalTasks,
                TotalUsers = totalUsers,
                TotalTeams = totalTeams,
                PendingTasks = toDo + inProgress,
                CompletedTasks = done,

                StatusSummary = new TaskStatusSummary
                {
                    ToDo = toDo,
                    InProgress = inProgress,
                    Done = done,
                    Total = totalTasks
                }
            };
        }
    }
}