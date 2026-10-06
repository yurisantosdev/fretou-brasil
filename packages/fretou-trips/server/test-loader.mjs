export async function resolve(specifier, context, nextResolve) {
  const relativo = specifier.startsWith("./") || specifier.startsWith("../");
  const semExtensao = !/\.[a-z]+$/i.test(specifier);
  if (relativo && semExtensao) {
    return nextResolve(`${specifier}.ts`, context);
  }
  return nextResolve(specifier, context);
}
