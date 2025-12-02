FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY ./api/api.csproj api/
COPY ./efscaffold/efscaffold.csproj efscaffold/
RUN dotnet restore api/api.csproj

COPY ./api api/
COPY ./efscaffold efscaffold/

RUN dotnet publish api/api.csproj \
    -c Release \
    -o /app/publish \
    --no-self-contained

FROM mcr.microsoft.com/dotnet/aspnet:9.0

WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://0.0.0.0:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "api.dll"]
