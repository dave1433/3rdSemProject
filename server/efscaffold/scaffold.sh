set -a
source ../.env
set +a 

if ! dotnet tool list -g | grep -q '^dotnet-ef\s'; then
  dotnet tool install -g dotnet-ef
fi  

dotnet ef dbcontext scaffold "$CONN_STR" Npgsql.EntityFrameworkCore.PostgreSQL \
    --output-dir ./Entities \
    --context-dir . \
    --context MyDbContext \
    --no-onconfiguring \
    --namespace efscaffold.Entities \
    --context-namespace Infrastructure.Postgres.Scaffolding \
    --schema deadpigeons \
    --force