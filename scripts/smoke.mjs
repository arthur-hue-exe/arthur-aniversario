/**
 * Smoke test da API real (RSVP + administração) contra um servidor em execução.
 *
 * Uso local: npm run test:smoke
 * Requer ADMIN_PASSWORD no ambiente (carregado de .env pelo script npm).
 */

const base = (process.env.SMOKE_BASE_URL ?? "http://localhost:3000").replace(
  /\/$/,
  "",
);
const origin = new URL(base).origin;
const password = process.env.ADMIN_PASSWORD;

const isLocal = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(base);

if (!isLocal && process.env.SMOKE_ALLOW_REMOTE !== "1") {
  console.error(
    "O smoke test cria e remove um registro real. Use apenas em ambiente local ou defina SMOKE_ALLOW_REMOTE=1.",
  );
  process.exit(1);
}

if (!password) {
  console.error("ADMIN_PASSWORD ausente. Rode via `npm run test:smoke`.");
  process.exit(1);
}

let failures = 0;
let passes = 0;

function check(label, condition, detail) {
  if (condition) {
    passes += 1;
    console.log(`PASS  ${label}`);
  } else {
    failures += 1;
    console.error(`FAIL  ${label}${detail ? ` — ${detail}` : ""}`);
  }
}

async function readJson(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

async function request(path, options = {}) {
  return fetch(`${base}${path}`, options);
}

function uniqueName() {
  const suffix = Date.now()
    .toString(36)
    .replace(/[0-9]/g, (digit) => "qwertyuiop"[Number(digit)]);

  return `Smoke ${suffix}`;
}

const guestName = uniqueName();
const companionName = "Acompanhante Smoke";
let guestId = null;
let cookie = null;

async function adminLogin(attemptPassword = password) {
  return request("/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: origin },
    body: JSON.stringify({ password: attemptPassword }),
  });
}

try {
  console.log(`\nSmoke test em ${base}\n`);

  let response = await request("/api/rsvp");
  const baseline = await readJson(response);
  check("GET /api/rsvp responde 200", response.status === 200);
  check("lista pública retorna convidados", Array.isArray(baseline?.guests));
  check(
    "lista pública não expõe campos internos",
    !JSON.stringify(baseline ?? {}).includes("internalNotes"),
  );

  const baselineTotal = baseline?.stats?.totalConfirmed ?? 0;
  const baselineCompanions = baseline?.stats?.confirmedCompanions ?? 0;
  const baselinePending = baseline?.stats?.pendingGuests ?? 0;

  response = await request("/api/rsvp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: guestName, companionName }),
  });
  const created = await readJson(response);
  guestId = created?.id ?? null;
  check(
    "POST /api/rsvp cria confirmação real",
    response.status === 201 && Boolean(guestId),
    `status ${response.status}`,
  );

  response = await request("/api/rsvp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "<script>alert(1)</script>" }),
  });
  check("nome inválido é recusado com 422", response.status === 422);

  response = await request("/api/rsvp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: guestName.toUpperCase(), companionName: null }),
  });
  const duplicate = await readJson(response);
  check(
    "duplicata é recusada com 409",
    response.status === 409 && duplicate?.error?.code === "DUPLICATE",
    `status ${response.status}`,
  );

  response = await request("/api/rsvp");
  const afterCreate = await readJson(response);
  const entry = afterCreate?.guests?.find((guest) => guest.id === guestId);
  check("nova confirmação aparece na lista pública", Boolean(entry));
  check(
    "acompanhante começa como não confirmado",
    entry?.companionConfirmed === false,
  );
  check(
    "contagem pública aumenta em 1",
    afterCreate?.stats?.totalConfirmed === baselineTotal + 1,
  );

  response = await request("/api/admin/guests");
  check(
    "GET /api/admin/guests sem sessão retorna 401",
    response.status === 401,
    `status ${response.status}`,
  );

  response = await request(`/api/admin/guests/${guestId}`, {
    method: "DELETE",
    headers: { Origin: origin },
  });
  check(
    "DELETE administrativo sem sessão retorna 401",
    response.status === 401,
    `status ${response.status}`,
  );

  response = await request("/admin", { redirect: "manual" });
  const location = response.headers.get("location") ?? "";
  check(
    "página administrativa redireciona sem sessão",
    [303, 307, 308].includes(response.status) &&
      location.includes("/admin/login"),
    `status ${response.status} · ${location}`,
  );

  response = await request("/");
  const homeHtml = await response.text();
  check(
    "home não expõe link para a administração",
    !homeHtml.includes('href="/admin'),
  );

  response = await adminLogin("senha-incorreta");
  check(
    "login com senha errada retorna 401",
    response.status === 401,
    `status ${response.status}`,
  );

  response = await request("/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: "https://evil.example" },
    body: JSON.stringify({ password }),
  });
  check(
    "login de origem externa retorna 403",
    response.status === 403,
    `status ${response.status}`,
  );

  response = await adminLogin();
  const setCookie = response.headers.getSetCookie?.()[0] ?? "";
  cookie = setCookie.split(";")[0] ?? null;
  check("login administrativo correto retorna 200", response.status === 200);
  check(
    "sessão é gravada em cookie HttpOnly",
    Boolean(cookie?.startsWith("aa_admin_session=")) &&
      setCookie.toLowerCase().includes("httponly"),
    setCookie,
  );

  response = await request("/api/admin/guests", {
    headers: { Cookie: cookie },
  });
  const adminList = await readJson(response);
  check(
    "admin autenticado lê a lista completa",
    response.status === 200 &&
      adminList?.guests?.some((guest) => guest.id === guestId),
  );

  const adminBody = {
    name: guestName,
    companionName,
    companionConfirmed: true,
    status: "CONFIRMED",
    publicNote: null,
    internalNotes: "Registro criado pelo smoke test",
  };

  response = await request(`/api/admin/guests/${guestId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Origin: origin,
      Cookie: cookie,
    },
    body: JSON.stringify(adminBody),
  });
  const updated = await readJson(response);
  check(
    "admin confirma o acompanhante",
    response.status === 200 && updated?.companionConfirmed === true,
    `status ${response.status}`,
  );

  response = await request("/api/rsvp");
  const afterCompanion = await readJson(response);
  check(
    "acompanhante confirmado entra na contagem",
    afterCompanion?.stats?.confirmedCompanions === baselineCompanions + 1 &&
      afterCompanion?.stats?.totalConfirmed === baselineTotal + 2,
  );

  response = await request(`/api/admin/guests/${guestId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Origin: origin,
      Cookie: cookie,
    },
    body: JSON.stringify({ ...adminBody, status: "PENDING" }),
  });
  const pending = await readJson(response);
  check(
    "admin altera o status para pendente",
    response.status === 200 && pending?.status === "PENDING",
    `status ${response.status}`,
  );

  response = await request("/api/rsvp");
  const afterPending = await readJson(response);
  check(
    "pendente sai da contagem de confirmados",
    afterPending?.stats?.totalConfirmed === baselineTotal &&
      afterPending?.stats?.pendingGuests === baselinePending + 1,
  );

  response = await request(`/api/admin/guests/${guestId}`, {
    method: "DELETE",
    headers: { Origin: origin, Cookie: cookie },
  });
  check(
    "admin remove o registro",
    response.status === 200,
    `status ${response.status}`,
  );
  guestId = null;

  response = await request("/api/rsvp");
  const afterDelete = await readJson(response);
  check(
    "registro removido não aparece mais na lista",
    afterDelete?.stats?.totalConfirmed === baselineTotal &&
      afterDelete?.stats?.pendingGuests === baselinePending &&
      !afterDelete?.guests?.some((guest) => guest.id === created?.id),
  );

  response = await request("/api/admin/logout", {
    method: "POST",
    headers: { Origin: origin, Cookie: cookie },
  });
  const logoutCookie = response.headers.getSetCookie?.()[0] ?? "";
  check(
    "logout limpa o cookie de sessão",
    response.status === 200 && /Max-Age=0/i.test(logoutCookie),
  );
} catch (error) {
  failures += 1;
  console.error("FAIL  erro inesperado:", error);
} finally {
  if (guestId) {
    try {
      let activeCookie = cookie;

      if (!activeCookie) {
        const login = await adminLogin();
        activeCookie =
          (login.headers.getSetCookie?.()[0] ?? "").split(";")[0] ?? null;
      }

      if (activeCookie) {
        await request(`/api/admin/guests/${guestId}`, {
          method: "DELETE",
          headers: { Origin: origin, Cookie: activeCookie },
        });
        console.log("INFO  registro de teste removido na limpeza.");
      } else {
        console.error(
          `AVISO  não foi possível limpar o registro "${guestName}" automaticamente.`,
        );
      }
    } catch {
      console.error(
        `AVISO  falha ao limpar o registro "${guestName}" automaticamente.`,
      );
    }
  }
}

console.log(
  `\n${passes} verificações aprovadas, ${failures} falhas.\n`,
);

process.exit(failures > 0 ? 1 : 0);
