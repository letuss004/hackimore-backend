export function getModuleIndexFileContent(nameKebab: string): string {
  return `export * from './${nameKebab}.module';
export * from './${nameKebab}.controller';
export * from './${nameKebab}.service';
`;
}
