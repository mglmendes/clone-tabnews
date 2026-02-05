import { InternalServerError } from "infra/errors.js";
import authorization from "models/authorization.js";

describe("models/authorization.js", () => {
  describe(".can()", () => {
    test("without `user`", () => {
      expect(() => {
        authorization.can();
      }).toThrow(InternalServerError);
    });

    test("without `user.features`", () => {
      const createdUser = {
        username: "UserWithoutFeatures",
      };
      expect(() => {
        authorization.can(createdUser);
      }).toThrow(InternalServerError);
    });

    test("With unknown `feature`", () => {
      const createdUser = {
        features: [],
      };
      expect(() => {
        authorization.can(createdUser, "unknow:feature");
      }).toThrow(InternalServerError);
    });

    test("With valid `user` and known `feature`", () => {
      const createdUser = {
        features: ["create:user"],
      };
      expect(authorization.can(createdUser, "create:user")).toBe(true);
    });
  });

  describe(".filterOutput()", () => {
    test("without `user`", () => {
      expect(() => {
        authorization.filterOutput();
      }).toThrow(InternalServerError);
    });

    test("without `user.features`", () => {
      const createdUser = {
        username: "UserWithoutFeatures",
      };
      expect(() => {
        authorization.filterOutput(createdUser);
      }).toThrow(InternalServerError);
    });

    test("With unknown `feature`", () => {
      const createdUser = {
        features: [],
      };
      expect(() => {
        authorization.filterOutput(createdUser, "unknow:feature");
      }).toThrow(InternalServerError);
    });

    test("With valid `user`, known `feature` but no `resource`", () => {
      const createdUser = {
        username: "UserWithoutFeatures",
        features: ["read:user"],
      };
      expect(() => {
        authorization.filterOutput(createdUser, "read:user");
      }).toThrow(InternalServerError);
    });

    test("With valid `user`, known `feature` and `resource`", () => {
      const createdUser = {
        features: ["read:user"],
      };

      const resource = {
        id: 1,
        username: "Resource",
        features: ["read:user"],
        created_at: "2026-02-01T00:00:000Z",
        updated_at: "2026-02-01T00:00:000Z",
        email: "resource@email.com",
        password: "ResourcePassword",
      };

      const result = authorization.filterOutput(
        createdUser,
        "read:user",
        resource,
      );
      expect(result).toEqual({
        id: 1,
        username: "Resource",
        features: ["read:user"],
        created_at: "2026-02-01T00:00:000Z",
        updated_at: "2026-02-01T00:00:000Z",
      });
    });
  });
});
