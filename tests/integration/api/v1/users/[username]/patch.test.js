import orchestrator from "tests/orchestrator.js";
import { version as uuidVersion } from "uuid";
import user from "models/user.js";
import password from "models/password.js";
import { headers } from "next/headers";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("PATCH /api/v1/users/[username]", () => {
  describe("Anonymous user", () => {
    test("With unique 'username'", async () => {
      const createdUser = await orchestrator.createUser();

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${createdUser.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "uniqueUser2",
          }),
        },
      );

      expect(response.status).toBe(403);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "ForbiddenError",
        message: "Você não possui permissão para executar esta ação.",
        action: "Verifique se o seu usuário possui a feature update:user",
        status_code: 403,
      });
    });
  });

  describe("Default user", () => {
    test("With nonexistent 'username'", async () => {
      const createdUser = await orchestrator.createUser();

      const activatedUser = await orchestrator.activateUser(createdUser);

      const sessionObject = await orchestrator.createSession(activatedUser.id);

      const response = await fetch(
        "http://localhost:3000/api/v1/users/UsuarioInexistente",
        {
          method: "PATCH",
          headers: {
            cookie: `session_id=${sessionObject.token}`,
          },
        },
      );

      expect(response.status).toBe(404);

      const resposeBody = await response.json();

      expect(resposeBody).toEqual({
        name: "NotFoundError",
        message: "O username informado não foi encontrado no sistema.",
        action: "Verifique se o username está digitado corretamente.",
        status_code: 404,
      });
    });

    test("With duplicated 'username'", async () => {
      await orchestrator.createUser({
        username: "user1",
      });

      const createdUser2 = await orchestrator.createUser({
        username: "user2",
      });

      const activatedUser2 = await orchestrator.activateUser(createdUser2);

      const sessionObject2 = await orchestrator.createSession(
        activatedUser2.id,
      );

      const response = await fetch("http://localhost:3000/api/v1/users/user2", {
        method: "PATCH",
        headers: {
          cookie: `session_id=${sessionObject2.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "user1",
        }),
      });

      expect(response.status).toBe(400);

      const resposeBody = await response.json();

      expect(resposeBody).toEqual({
        name: "ValidationError",
        message: "O username informado já está sendo utilizado.",
        action: "Utilize outro username para realizar esta operação.",
        status_code: 400,
      });
    });

    test("With `user2` targeting `userA`", async () => {
      await orchestrator.createUser({
        username: "userA",
      });

      const createdUserB = await orchestrator.createUser({
        username: "userB",
      });

      const activatedUserB = await orchestrator.activateUser(createdUserB);

      const sessionObject2 = await orchestrator.createSession(
        activatedUserB.id,
      );

      const response = await fetch("http://localhost:3000/api/v1/users/userA", {
        method: "PATCH",
        headers: {
          cookie: `session_id=${sessionObject2.token}`, // token do user 2
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "userC",
        }),
      });

      expect(response.status).toBe(403);

      const resposeBody = await response.json();

      expect(resposeBody).toEqual({
        name: "ForbiddenError",
        message: "Você não possui permissão para atualizar outro usuário.",
        action: `Verifique se você possui a feature necessária para atualizar outro usuário.`,
        status_code: 403,
      });
    });

    test("With duplicated 'email'", async () => {
      await orchestrator.createUser({
        email: "email1@gmail.com",
      });

      const createdUser2 = await orchestrator.createUser({
        email: "email2@gmail.com",
      });

      const activatedUser2 = await orchestrator.activateUser(createdUser2);

      const sessionObject2 = await orchestrator.createSession(
        activatedUser2.id,
      );

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${createdUser2.username}`,
        {
          method: "PATCH",
          headers: {
            cookie: `session_id=${sessionObject2.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "email1@gmail.com",
          }),
        },
      );

      expect(response.status).toBe(400);

      const resposeBody = await response.json();

      expect(resposeBody).toEqual({
        name: "ValidationError",
        message: "O email informado já está sendo utilizado.",
        action: "Utilize outro email para realizar esta operação.",
        status_code: 400,
      });
    });

    test("With unique 'username'", async () => {
      const createdUser = await orchestrator.createUser();

      const activatedUser = await orchestrator.activateUser(createdUser);

      const sessionObject = await orchestrator.createSession(activatedUser.id);

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${createdUser.username}`,
        {
          method: "PATCH",
          headers: {
            cookie: `session_id=${sessionObject.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "uniqueUser2",
          }),
        },
      );

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "uniqueUser2",
        features: ["create:session", "read:session", "update:user"],
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
      expect(responseBody.created_at < responseBody.updated_at).toBe(true);
    });

    test("With existent 'username' but mismatched case", async () => {
      const createdUser = await orchestrator.createUser({
        username: "mismatchedUser",
        email: "mismatchedUser@gmail.com",
        password: "senha123",
      });

      const activatedUser = await orchestrator.activateUser(createdUser);

      const sessionObject = await orchestrator.createSession(activatedUser.id);

      const response = await fetch(
        "http://localhost:3000/api/v1/users/mismatchedUser",
        {
          method: "PATCH",
          headers: {
            cookie: `session_id=${sessionObject.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "MismatchedUser",
          }),
        },
      );

      expect(response.status).toBe(200);
      const mismatchedResponseBody = await response.json();

      expect(mismatchedResponseBody.username).toBe("MismatchedUser");
    });

    test("With unique 'email'", async () => {
      const createdUser = await orchestrator.createUser();

      const activatedUser = await orchestrator.activateUser(createdUser);

      const sessionObject = await orchestrator.createSession(activatedUser.id);

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${createdUser.username}`,
        {
          method: "PATCH",
          headers: {
            cookie: `session_id=${sessionObject.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "uniqueEmail2@gmail.com",
          }),
        },
      );

      expect(response.status).toBe(200);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        id: responseBody.id,
        username: createdUser.username,
        features: ["create:session", "read:session", "update:user"],
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
      expect(responseBody.created_at < responseBody.updated_at).toBe(true);
    });

    test("With new 'password'", async () => {
      const createdUser = await orchestrator.createUser({
        password: "newPassword1",
      });

      const activatedUser = await orchestrator.activateUser(createdUser);

      const sessionObject = await orchestrator.createSession(activatedUser.id);

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${createdUser.username}`,
        {
          method: "PATCH",
          headers: {
            cookie: `session_id=${sessionObject.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            password: "newPassword2",
          }),
        },
      );

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: createdUser.username,
        features: ["create:session", "read:session", "update:user"],
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
      expect(responseBody.created_at > responseBody.updated_at).toBe(false);

      const userInDatabase = await user.findOneByUsername(createdUser.username);
      const correctPasswordMatch = await password.compare(
        "newPassword2",
        userInDatabase.password,
      );

      const incorrectPasswordMatch = await password.compare(
        "newPassword1",
        userInDatabase.password,
      );

      expect(correctPasswordMatch).toBe(true);
      expect(incorrectPasswordMatch).toBe(false);
    });
  });

  describe("Privileged user", () => {
    test("With `update:user:others` targeting `defaultUser`", async () => {
      const privilegedUser = await orchestrator.createUser();
      const activatedPrivilegedUser =
        await orchestrator.activateUser(privilegedUser);

      await orchestrator.addFeaturesToUser(privilegedUser, [
        "update:user:others",
      ]);

      const privilegedUserSession = await orchestrator.createSession(
        activatedPrivilegedUser.id,
      );

      const defaultUser = await orchestrator.createUser();

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${defaultUser.username}`,
        {
          method: "PATCH",
          headers: {
            cookie: `session_id=${privilegedUserSession.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "AlteradoPeloPrivilegiado",
          }),
        },
      );

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "AlteradoPeloPrivilegiado",
        features: defaultUser.features,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
      expect(responseBody.created_at < responseBody.updated_at).toBe(true);
    });
  });
});
