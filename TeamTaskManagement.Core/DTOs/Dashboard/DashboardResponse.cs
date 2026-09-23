namespace TeamTaskManagement.Core.DTOs.Dashboard
{
    public class DashboardResponse
    {
        public int TotalTasks { get; set; }

        public int TotalUsers { get; set; }

        public int TotalTeams { get; set; }

        public int PendingTasks { get; set; }

        public int CompletedTasks { get; set; }

        public TaskStatusSummary StatusSummary { get; set; }
            = new();
    }
}