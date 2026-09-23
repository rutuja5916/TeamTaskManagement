using Microsoft.EntityFrameworkCore;
using TeamTaskManagement.Core.DTOs.Tasks;
using TeamTaskManagement.Core.Entities;
using TeamTaskManagement.Core.Enums;
using TeamTaskManagement.Core.Interfaces;
using TeamTaskManagement.Infrastructure.Data;
using TaskStatusEnum = TeamTaskManagement.Core.Enums.TaskStatus;

namespace TeamTaskManagement.Infrastructure.Services
{
    public class TaskService : ITaskService
    {
        private readonly ApplicationDbContext _context;
        private readonly INotificationService _notificationService;

        public TaskService(ApplicationDbContext context,INotificationService notificationService)
        {
            _context = context;
            _notificationService = notificationService;
        }

        public async Task<TaskResponse> CreateAsync(
            CreateTaskRequest request,
            int assignedByUserId)
        {
            var team = await _context.Teams
                .FirstOrDefaultAsync(t => t.Id == request.TeamId);

            if (team == null)
                throw new KeyNotFoundException("Team not found.");

            var assignee = await _context.Users
                .FirstOrDefaultAsync(u =>
                    u.Id == request.AssignedTo &&
                    u.IsActive);

            if (assignee == null)
                throw new KeyNotFoundException("Assigned user not found.");

            var isTeamMember = await _context.TeamMembers
                .AnyAsync(tm =>
                    tm.TeamId == request.TeamId &&
                    tm.UserId == request.AssignedTo);

            if (!isTeamMember)
                throw new InvalidOperationException(
                    "Assigned user is not a member of the selected team.");

            var assignedBy = await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u =>
                    u.Id == assignedByUserId &&
                    u.IsActive);

            if (assignedBy == null)
                throw new KeyNotFoundException("Assigning user not found.");

            var task = new TaskItem
            {
                Title = request.Title.Trim(),
                Description = request.Description?.Trim(),
                TeamId = request.TeamId,
                AssignedTo = request.AssignedTo,
                AssignedBy = assignedByUserId,
                Status = request.Status,
                Priority = request.Priority,
                Deadline = request.Deadline,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Tasks.Add(task);

            await _context.SaveChangesAsync();

            await _notificationService.CreateAsync(
                task.AssignedTo,
                task.Id,
                $"You have been assigned a new task: {task.Title}",
                NotificationType.TaskAssigned);

            return await GetByIdAsync(
                task.Id,
                assignedByUserId,
                assignedBy.Role.Name.ToString())
                ?? throw new InvalidOperationException(
                    "Task could not be loaded after creation.");
        }

        public async Task<IEnumerable<TaskResponse>> GetAllAsync(
            TaskFilterRequest filter,
            int currentUserId,
            string currentUserRole)
        {
            var query = _context.Tasks
                .AsNoTracking()
                .Include(t => t.Team)
                .Include(t => t.Assignee)
                .Include(t => t.Creator)
                .AsQueryable();

            // User can see only tasks assigned to them.
            if (currentUserRole == "User")
            {
                query = query.Where(t => t.AssignedTo == currentUserId);
            }
            // Manager can see tasks assigned by them or
            // tasks belonging to teams they are members of.
            else if (currentUserRole == "Manager")
            {
                query = query.Where(t =>
                    t.AssignedBy == currentUserId ||
                    _context.TeamMembers.Any(tm =>
                        tm.TeamId == t.TeamId &&
                        tm.UserId == currentUserId));
            }

            if (filter.Status.HasValue)
                query = query.Where(t => t.Status == filter.Status.Value);

            if (filter.Priority.HasValue)
                query = query.Where(t => t.Priority == filter.Priority.Value);

            if (filter.DeadlineFrom.HasValue)
                query = query.Where(t =>
                    t.Deadline >= filter.DeadlineFrom.Value);

            if (filter.DeadlineTo.HasValue)
                query = query.Where(t =>
                    t.Deadline <= filter.DeadlineTo.Value);

            if (filter.AssignedTo.HasValue)
                query = query.Where(t =>
                    t.AssignedTo == filter.AssignedTo.Value);

            if (filter.TeamId.HasValue)
                query = query.Where(t =>
                    t.TeamId == filter.TeamId.Value);

            return await query
                .OrderBy(t => t.Deadline)
                .Select(t => new TaskResponse
                {
                    Id = t.Id,
                    Title = t.Title,
                    Description = t.Description,
                    TeamId = t.TeamId,
                    TeamName = t.Team.Name,
                    AssignedTo = t.AssignedTo,
                    AssignedToName =
                        t.Assignee.FirstName + " " + t.Assignee.LastName,
                    AssignedBy = t.AssignedBy,
                    AssignedByName =
                        t.Creator.FirstName + " " + t.Creator.LastName,
                    Status = t.Status,
                    Priority = t.Priority,
                    Deadline = t.Deadline,
                    CreatedAt = t.CreatedAt,
                    UpdatedAt = t.UpdatedAt
                })
                .ToListAsync();
        }

        public async Task<TaskResponse?> GetByIdAsync(
            int taskId,
            int currentUserId,
            string currentUserRole)
        {
            var query = _context.Tasks
                .AsNoTracking()
                .Include(t => t.Team)
                .Include(t => t.Assignee)
                .Include(t => t.Creator)
                .Where(t => t.Id == taskId);

            if (currentUserRole == "User")
            {
                query = query.Where(t => t.AssignedTo == currentUserId);
            }
            else if (currentUserRole == "Manager")
            {
                query = query.Where(t =>
                    t.AssignedBy == currentUserId ||
                    _context.TeamMembers.Any(tm =>
                        tm.TeamId == t.TeamId &&
                        tm.UserId == currentUserId));
            }

            return await query
                .Select(t => new TaskResponse
                {
                    Id = t.Id,
                    Title = t.Title,
                    Description = t.Description,
                    TeamId = t.TeamId,
                    TeamName = t.Team.Name,
                    AssignedTo = t.AssignedTo,
                    AssignedToName =
                        t.Assignee.FirstName + " " + t.Assignee.LastName,
                    AssignedBy = t.AssignedBy,
                    AssignedByName =
                        t.Creator.FirstName + " " + t.Creator.LastName,
                    Status = t.Status,
                    Priority = t.Priority,
                    Deadline = t.Deadline,
                    CreatedAt = t.CreatedAt,
                    UpdatedAt = t.UpdatedAt
                })
                .FirstOrDefaultAsync();
        }

        public async Task<TaskResponse> UpdateAsync(
            int taskId,
            UpdateTaskRequest request,
            int currentUserId,
            string currentUserRole)
        {
            var task = await _context.Tasks
                .FirstOrDefaultAsync(t => t.Id == taskId);

            if (task == null)
                throw new KeyNotFoundException("Task not found.");

            if (currentUserRole == "User")
                throw new UnauthorizedAccessException(
                    "Users cannot edit task details.");

            if (currentUserRole == "Manager" &&
                task.AssignedBy != currentUserId)
            {
                throw new UnauthorizedAccessException(
                    "You can only edit tasks assigned by you.");
            }

            var assignee = await _context.Users
                .FirstOrDefaultAsync(u =>
                    u.Id == request.AssignedTo &&
                    u.IsActive);

            if (assignee == null)
                throw new KeyNotFoundException("Assigned user not found.");

            var isTeamMember = await _context.TeamMembers
                .AnyAsync(tm =>
                    tm.TeamId == task.TeamId &&
                    tm.UserId == request.AssignedTo);

            if (!isTeamMember)
                throw new InvalidOperationException(
                    "Assigned user is not a member of the task team.");

            task.Title = request.Title.Trim();
            task.Description = request.Description?.Trim();
            task.AssignedTo = request.AssignedTo;
            task.Priority = request.Priority;
            task.Deadline = request.Deadline;
            task.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return await GetByIdAsync(
                task.Id,
                currentUserId,
                currentUserRole)
                ?? throw new InvalidOperationException(
                    "Task could not be loaded after update.");
        }

        public async Task UpdateStatusAsync(int taskId,UpdateTaskStatusRequest request,int currentUserId,string currentUserRole)
        {
            var task = await _context.Tasks
                .FirstOrDefaultAsync(t => t.Id == taskId);

            if (task == null)
                throw new KeyNotFoundException("Task not found.");

            if (currentUserRole == "User" &&
                task.AssignedTo != currentUserId)
            {
                throw new UnauthorizedAccessException(
                    "You can only update your assigned tasks.");
            }

            if (currentUserRole == "Manager" &&
                task.AssignedTo != currentUserId &&
                task.AssignedBy != currentUserId)
            {
                throw new UnauthorizedAccessException(
                    "You do not have access to update this task.");
            }

            task.Status = request.Status;
            task.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            await _notificationService.CreateAsync(
                task.AssignedBy,
                task.Id,
                $"Task '{task.Title}' status was updated to {task.Status}.",
                NotificationType.TaskStatusUpdated);
        }

        public async Task DeleteAsync(
            int taskId,
            int currentUserId,
            string currentUserRole)
        {
            var task = await _context.Tasks
                .FirstOrDefaultAsync(t => t.Id == taskId);

            if (task == null)
                throw new KeyNotFoundException("Task not found.");

            if (currentUserRole == "User")
            {
                throw new UnauthorizedAccessException(
                    "Users cannot delete tasks.");
            }

            if (currentUserRole == "Manager" &&
                task.AssignedBy != currentUserId)
            {
                throw new UnauthorizedAccessException(
                    "You can only delete tasks assigned by you.");
            }

            _context.Tasks.Remove(task);

            await _context.SaveChangesAsync();
        }
    }
}