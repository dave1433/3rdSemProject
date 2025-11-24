FROM mcr.microsoft.com/dotnet/sdk:9.0-alpine AS build
WORKDIR /src

# Copy solution file if it exists (OPTIONAL)
# COPY *.sln ./

# Copy project files
COPY api/api.csproj api/
COPY efscaffold/efscaffold.csproj efscaffold/

# Restore dependencies
RUN dotnet restore api/api.csproj

# Copy full source
COPY api/ api/
COPY efscaffold/ efscaffold/

# Publish
RUN dotnet publish api/api.csproj \
    -c Release \
    -o /app/publish \
    --runtime linux-musl-x64 \
    --self-contained true \
    /p:PublishSingleFile=true

# Runtime image
FROM mcr.microsoft.com/dotnet/runtime-deps:9.0-alpine
WORKDIR /app

COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://0.0.0.0:8080
EXPOSE 8080

ENTRYPOINT ["./api"]
