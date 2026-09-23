using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TeamTaskManagement.Core.DTOs.Teams;

namespace TeamTaskManagement.Core.Interfaces
{
    public interface ITeamService
    {
        Task<TeamResponse> CreateAsync(
            CreateTeamRequest request,
            int createdByUserId);

        Task<IEnumerable<TeamResponse>> GetAllAsync();

        Task<TeamResponse?> GetByIdAsync(int teamId);

        Task<TeamResponse> UpdateAsync(
            int teamId,
            UpdateTeamRequest request);

        Task DeleteAsync(int teamId);

        Task AddMemberAsync(
            int teamId,
            int userId);

        Task<IEnumerable<TeamMemberResponse>> GetMembersAsync(
            int teamId);
    }
}
