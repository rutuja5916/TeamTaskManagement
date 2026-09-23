using System.Net;
using System.Net.Http.Json;
using TeamTaskManagement.Core.DTOs.Auth;

namespace TeamTaskManagement.Tests.Integration
{
    public class AuthApiTests
        : IClassFixture<CustomWebApplicationFactory>
    {
        private readonly HttpClient _client;

        public AuthApiTests(CustomWebApplicationFactory factory)
        {
            _client = factory.CreateClient();
        }

        [Fact]
        public async Task Register_ShouldReturnSuccess()
        {
            // Arrange
            var request = new RegisterRequest
            {
                FirstName = "Integration",
                LastName = "Test",
                Email = $"test-{Guid.NewGuid()}@example.com",
                Password = "Test@12345"
            };

            // Act
            var response = await _client.PostAsJsonAsync(
                "/api/Auth/register",
                request);

            // Assert
            Assert.True(
                response.StatusCode == HttpStatusCode.OK ||
                response.StatusCode == HttpStatusCode.Created);
        }

        [Fact]
        public async Task Register_ShouldRejectInvalidEmail()
        {
            // Arrange
            var request = new RegisterRequest
            {
                FirstName = "Integration",
                LastName = "Test",
                Email = "invalid-email",
                Password = "Test@12345"
            };

            // Act
            var response = await _client.PostAsJsonAsync(
                "/api/Auth/register",
                request);

            // Assert
            Assert.Equal(
                HttpStatusCode.BadRequest,
                response.StatusCode);
        }
    }
}