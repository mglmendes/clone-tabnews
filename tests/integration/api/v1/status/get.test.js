import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET /api/v1/status", () => {
  describe("Anonymous user", () => {
    test("Retrieving current system status", async () => {
      const response = await fetch("http://localhost:3000/api/v1/status");
      expect(response.status).toBe(200);

      const responseBody = await response.json();
      const parsedUpdatedAt = new Date(responseBody.updated_at).toISOString();
      expect(responseBody.updated_at).toEqual(parsedUpdatedAt);

      expect(
        responseBody.dependencies.database.max_connections,
      ).toBeGreaterThanOrEqual(100);
      expect(responseBody.dependencies.database.opened_connections).toEqual(1);
    });
  });

  describe("Privileged user", () => {
    test("With `read:status:all`", async () => {
      const createdUser = await orchestrator.createUser();
      const activateUser = await orchestrator.activateUser(createdUser);

      const privilegedUser = await orchestrator.addFeaturesToUser(createdUser, [
        "read:status:all",
      ]);

      const sessionObject = await orchestrator.createSession(privilegedUser.id);

      const response = await fetch("http://localhost:3000/api/v1/status", {
        headers: {
          cookie: `session_id=${sessionObject.token}`,
        },
      });

      expect(response.status).toBe(200);

      const responseBody = await response.json();
      expect(responseBody.dependencies.database.version).toBeDefined();
      expect(responseBody.dependencies.database.version).toContain("16");

      const parsedUpdatedAt = new Date(responseBody.updated_at).toISOString();
      expect(responseBody.updated_at).toEqual(parsedUpdatedAt);

      expect(
        responseBody.dependencies.database.max_connections,
      ).toBeGreaterThanOrEqual(100);
      expect(responseBody.dependencies.database.opened_connections).toEqual(1);
    });
  });
});
