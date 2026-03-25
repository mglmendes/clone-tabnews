import { createRouter } from "next-connect";
import database from "infra/database.js";
import controller from "infra/controller";
import authorization from "models/authorization";

export default createRouter()
  .use(controller.injectAnonymousOrUser)
  .get(getHandler)
  .handler(controller.errorHandlers);

async function getHandler(request, response) {
  const updatedAt = new Date().toISOString();

  const resultShowVersion = await database.query("SHOW server_version;");
  const postgresVersion = resultShowVersion.rows[0].server_version;

  const resultMaxConnections = await database.query("SHOW max_connections;");
  const postgresMaxConnections = resultMaxConnections.rows[0].max_connections;

  const databaseName = process.env.POSTGRES_DB;
  const resultOpenedConnections = await database.query({
    text: "SELECT count(*)::int FROM pg_stat_activity WHERE datname = $1;",
    values: [databaseName],
  });

  const postgresConnections = resultOpenedConnections.rows[0].count;

  const statusObject = {
    updated_at: updatedAt,
    dependencies: {
      database: {
        version: postgresVersion,
        max_connections: parseInt(postgresMaxConnections),
        opened_connections: postgresConnections,
      },
    },
  };

  const userTryingToGet = request.context?.user;

  const secureOutputValues = authorization.filterOutput(
    userTryingToGet,
    "read:status",
    statusObject,
  );

  return response.status(200).json(secureOutputValues);
}
