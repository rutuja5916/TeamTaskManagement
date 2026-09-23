using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TeamTaskManagement.Core.DTOs.Users;

namespace TeamTaskManagement.Core.Interfaces
{
    public interface IUserService
    {
        Task<IEnumerable<UserResponse>> GetAllAsync();

        Task<UserResponse?> GetByIdAsync(int userId);

        Task UpdateStatusAsync(int userId, bool isActive);

        Task UpdateRoleAsync(int userId, int roleId);
    }
}
