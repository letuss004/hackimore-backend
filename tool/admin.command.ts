import { Logger, Module } from '@nestjs/common';
import { UserRole, UserStatus } from '@prisma/client';
import { ServerConfig } from '@server/config';
import { bcrypt } from '@server/libs/bcrypt';
import { isEmail } from 'class-validator';
import {
  Command,
  CommandFactory,
  CommandRunner,
  InquirerService,
  Question,
  QuestionSet,
} from 'nest-commander';
import { ERROR_RESPONSE } from 'src/common/const';
import { ServerException } from 'src/exception';
import { DatabaseModule, DatabaseService } from 'src/module/base/database';

@Module({
  imports: [DatabaseModule],
  providers: [],
})
@Command({ name: 'admin', options: { isDefault: true } })
@QuestionSet({ name: 'createAdmin' })
export class GenAdminCommand extends CommandRunner {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly inquirer: InquirerService,
  ) {
    super();
  }

  async run(_param: string[], options?: Record<string, any>): Promise<void> {
    const { email, password } = await this.inquirer.ask('createAdmin', options);

    const isUserExist = await this.databaseService.user.findFirst({
      where: { email },
    });
    if (isUserExist) {
      throw new ServerException(ERROR_RESPONSE.USER_ALREADY_EXISTED);
    }

    const hashPassword = await bcrypt.hash(
      password,
      ServerConfig.get().BCRYPT_SALT_ROUNDS,
    );
    await this.databaseService.user.create({
      data: {
        email,
        firstName: 'System',
        lastName: 'Admin',
        fullName: 'System Admin',
        role: UserRole.Admin,
        password: hashPassword,
        status: UserStatus.Active,
      },
    });
    Logger.log(`User created successfully`);
  }

  @Question({
    type: 'input',
    message: 'Please enter your email:',
    name: 'email',
  })
  parseEmail(val: string): string {
    if (!isEmail(val)) {
      throw new Error('Invalid email format');
    }
    return val;
  }

  @Question({
    type: 'password',
    message: 'Please enter your password:',
    name: 'password',
    mask: '*',
  })
  parsePassword(val: string): string {
    if (!val || val.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }
    return val;
  }
}

(async function run() {
  await CommandFactory.run(GenAdminCommand)
    .then(() => {
      Logger.log(`Command executed successfully`);
    })
    .catch((error) => {
      Logger.error(`Error executing command: ${error.message}`, error);
    });
})();
