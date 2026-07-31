import { HealthController } from './health.controller';

describe('HealthController', () => {
  it('returns an operational status', () => {
    const controller = new HealthController();

    expect(controller.check()).toEqual({
      status: 'ok',
      timestamp: expect.any(String) as string,
    });
  });
});
