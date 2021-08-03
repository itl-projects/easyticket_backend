import { Test, TestingModule } from '@nestjs/testing';
import { YController } from './y.controller';

describe('YController', () => {
  let controller: YController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [YController],
    }).compile();

    controller = module.get<YController>(YController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
