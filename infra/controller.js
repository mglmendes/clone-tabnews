import * as cookie from "cookie";
import session from "models/session.js";
import {
  InternalServerError,
  MethodNotAllowedError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
} from "infra/errors.js";

function onErrorHandler(error, request, response) {
  console.log(error);
  if (error instanceof ValidationError || error instanceof NotFoundError) {
    return response.status(error.status_code).json(error);
  }

  if (error instanceof UnauthorizedError) {
    console.log("BATE AQ");
    clearSessionCookie(response);
    return response.status(error.status_code).json(error);
  }

  const publicErrorObject = new InternalServerError({
    cause: error,
  });
  console.error(publicErrorObject);
  response.status(publicErrorObject.status_code).json(publicErrorObject);
}

function onNoMatchHandler(resquest, response) {
  const publicErrorObject = new MethodNotAllowedError();
  response.status(publicErrorObject.status_code).json(publicErrorObject);
}

async function setSessionCookie(sessionToken, response) {
  const setCookie = cookie.serialize("session_id", sessionToken, {
    path: "/",
    maxAge: session.EXPIRATION_IN_MILLISECONDS / 1000,
    secure: process.env.NODE_ENV === "production" ? true : false,
    httpOnly: true,
  });

  response.setHeader("Set-Cookie", setCookie);
}

async function clearSessionCookie(response) {
  console.log("cleaning set cookies");
  const setCookie = cookie.serialize("session_id", "invalid", {
    path: "/",
    maxAge: -1,
    secure: process.env.NODE_ENV === "production" ? true : false,
    httpOnly: true,
  });

  console.log(setCookie);

  response.setHeader("Set-Cookie", setCookie);
}

const controller = {
  errorHandlers: {
    onNoMatch: onNoMatchHandler,
    onError: onErrorHandler,
  },
  setSessionCookie,
  clearSessionCookie,
};

export default controller;
