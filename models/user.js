import database from "infra/database.js";
import { ValidationError, NotFoundError } from "infra/errors.js";
import password from "./password.js";

async function findOneByUsername(username) {
  const userFound = await runSelectQuery(username);

  return userFound;

  async function runSelectQuery(username) {
    const result = await database.query({
      text: `
          SELECT 
            *
          FROM
            users
          WHERE
            LOWER(username) = LOWER($1)
          LIMIT
            1
          ;`,
      values: [username],
    });

    if (result.rowCount === 0) {
      throw new NotFoundError({
        message: `O username informado não foi encontrado no sistema.`,
        action: `Verifique se o username está digitado corretamente.`,
      });
    }

    return result.rows[0];
  }
}

async function create(userInputValues) {
  await validateUniqueAttribute("email", userInputValues.email);
  await validateUniqueAttribute("username", userInputValues.username);
  await hashPasswordInObject(userInputValues);

  const newUser = await runInsertQuery(userInputValues);
  return newUser;

  async function validateUniqueAttribute(field, value) {
    const result = await database.query({
      text: `
          SELECT 
            ${field}
          FROM
            users
          WHERE
            LOWER(${field}) = LOWER($1)
          ;`,
      values: [value],
    });

    if (result.rowCount > 0) {
      throw new ValidationError({
        message: `O ${field} informado já está sendo utilizado.`,
        action: `Utilize outro ${field} para realizar o cadastro.`,
      });
    }
  }

  async function hashPasswordInObject(userInputValues) {
    const hashedPassword = await password.hash(userInputValues.password);
    userInputValues.password = hashedPassword;
  }

  async function runInsertQuery(userInputValues) {
    const result = await database.query({
      text: `INSERT INTO 
            users (username, email, password) 
          VALUES 
            ($1, $2, $3) 
          RETURNING 
            *
          ;`,
      values: [
        userInputValues.username,
        userInputValues.email,
        userInputValues.password,
      ],
    });

    return result.rows[0];
  }
}

const user = {
  create,
  findOneByUsername,
};

export default user;
