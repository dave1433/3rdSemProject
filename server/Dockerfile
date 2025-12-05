FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# copy csproj files and restore
COPY api/api.csproj api/
COPY efscaffold/efscaffold.csproj efscaffold/
RUN dotnet restore api/api.csproj

# copy rest and publish
COPY . .
WORKDIR /src/api
RUN dotnet publish -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:9.0-alpine AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "api.dll"]
