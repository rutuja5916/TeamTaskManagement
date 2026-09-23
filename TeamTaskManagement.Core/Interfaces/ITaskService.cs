using TeamTaskManagement.Core.DTOs.Tasks;

namespace TeamTaskManagement.Core.Interfaces
{
    public interface ITaskService
    {
        Task<TaskResponse> CreateAsync(
            CreateTaskRequest request,
            int assignedByUserId);

        Task<IEnumerable<TaskResponse>> GetAllAsync(
            TaskFilterRequest filter,
            int currentUserId,
            string currentUserRole);

        Task<TaskResponse?> GetByIdAsync(
            int taskId,
            int currentUserId,
            string currentUserRole);

        Task<TaskResponse> UpdateAsync(
            int taskId,
            UpdateTaskRequest request,
            int currentUserId,
            string currentUserRole);

        Task UpdateStatusAsync(
            int taskId,
            UpdateTaskStatusRequest request,
            int currentUserId,
            string currentUserRole);

        Task DeleteAsync(
            int taskId,
            int currentUserId,
            string currentUserRole);
    }
}