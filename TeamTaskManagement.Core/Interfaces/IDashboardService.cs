using TeamTaskManagement.Core.DTOs.Dashboard;

namespace TeamTaskManagement.Core.Interfaces
{
    public interface IDashboardService
    {
        Task<DashboardResponse> GetDashboardAsync(
            int currentUserId,
            string currentUserRole);
    }
}