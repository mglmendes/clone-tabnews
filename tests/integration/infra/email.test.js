import email from "infra/email.js";
import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

describe("infra/email.js", () => {
  test("send", async () => {
    await orchestrator.deleteAllEmails();
    await email.send({
      from: "SiegeNews <contato@siegenews.com.br>",
      to: "contato@curso.dev",
      subject: "Teste de Assunto",
      text: "Teste de corpo",
    });

    await email.send({
      from: "SiegeNews <contato@siegenews.com.br>",
      to: "contato@curso.dev",
      subject: "Ultimo email enviado",
      text: "Corpo do último email",
    });

    const lastEmail = await orchestrator.getLastEmail();
    expect(lastEmail.sender).toBe("<contato@siegenews.com.br>");
    expect(lastEmail.recipients[0]).toBe("<contato@curso.dev>");
    expect(lastEmail.subject).toBe("Ultimo email enviado");
    expect(lastEmail.text).toBe("Corpo do último email\r\n");
  });
});
