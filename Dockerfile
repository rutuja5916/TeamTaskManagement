# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

WORKDIR /src

COPY ["TeamTaskManagement.API/TeamTaskManagement.API.csproj", "TeamTaskManagement.API/"]
COPY ["TeamTaskManagement.Core/TeamTaskManagement.Core.csproj", "TeamTaskManagement.Core/"]
COPY ["TeamTaskManagement.Infrastructure/TeamTaskManagement.Infrastructure.csproj", "TeamTaskManagement.Infrastructure/"]

RUN dotnet restore "TeamTaskManagement.API/TeamTaskManagement.API.csproj"

COPY . .

WORKDIR "/src/TeamTaskManagement.API"

RUN dotnet build "TeamTaskManagement.API.csproj" \
    -c Release \
    -o /app/build

RUN dotnet publish "TeamTaskManagement.API.csproj" \
    -c Release \
    -o /app/publish \
    /p:UseAppHost=false


# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final

WORKDIR /app

COPY --from=build /app/publish .

EXPOSE 8080

ENTRYPOINT ["dotnet", "TeamTaskManagement.API.dll"]