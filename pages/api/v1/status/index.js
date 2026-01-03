import database from "infra/database.js";
import { InternalServerError } from "infra/errors";

async function status(request, response) {
  try {
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

    response.status(200).json({
      updated_at: updatedAt,
      dependencies: {
        version: postgresVersion,
        max_connections: parseInt(postgresMaxConnections),
        opened_connections: postgresConnections,
      },
    });
  } catch (error) {
    const publicErrorObject = new InternalServerError({
      cause: error,
    });

    console.log("\n Erro dentro do catch do controller");
    console.error(publicErrorObject);

    response.status(500).json(publicErrorObject);
  }
}

export default status;
