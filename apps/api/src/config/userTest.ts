import { hashPassword } from "@fretou/components/password";
import { User } from "@fretou/users/server/models/Users";

export async function createUserTest(): Promise<void> {
  const CPF_TESTE = "11111111111";

  const existUser = await User.findOne({ cpf: CPF_TESTE });
  if (existUser) return;

  await User.create({
    name: "Usuário Teste",
    cpf: CPF_TESTE,
    password: await hashPassword("Fretou2026"),
    driver: false,
    thirdParty: false,
    active: true,
  });

  console.log("Usuário de teste criado.");
}
