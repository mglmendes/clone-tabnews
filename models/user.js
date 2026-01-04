import database from "infra/database.js";
import { ValidationError } from "infra/errors.js";

async function create(userInputValues) {
  await validateUniqueAttribute("email", userInputValues.email);
  await validateUniqueAttribute("username", userInputValues.username);

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
};

export default user;
