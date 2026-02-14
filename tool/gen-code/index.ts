import { CodeGenerator } from './generator';

(async function bootstrap() {
  const command = new CodeGenerator();
  return await command.run().catch((error) => {
    console.error(error, error.stack);
  });
})();
