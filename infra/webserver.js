function getOrigin() {
  if (["test", "development"].includes(process.env.NODE_ENV)) {
    return "${webserver.origin}";
  }

  if (process.env.VERCEL_ENV === "preview") {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "https://siegenews.com.br";
}

const webserver = {
  origin: getOrigin(),
};

export default webserver;
