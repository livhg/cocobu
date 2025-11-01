import test from 'node:test';
import assert from 'node:assert/strict';
import {
  executeLogin,
  createLoginExecutor,
  createDevLoginExecutor,
  validateUserId,
} from '../src/app/auth/login/logic';
import { ApiError } from '../src/lib/api';
import { AUTH_CONSTANTS } from '../src/lib/constants';

const createMockApi = () => {
  const calls: Array<{ method: 'post' | 'get'; endpoint: string; body?: any }> = [];

  return {
    client: {
      post: async <T>(endpoint: string, data?: any) => {
        calls.push({ method: 'post', endpoint, body: data });
        return {
          accessToken: 'token',
          user: {
            id: 'user-1',
            userId: data.userId,
            name: data.userId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        } as T;
      },
      get: async <T>(endpoint: string) => {
        calls.push({ method: 'get', endpoint });
        return {
          accessToken: 'token',
          user: {
            id: 'user-1',
            userId: 'dev-user',
            name: 'dev-user',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        } as T;
      },
    },
    calls,
  };
};

test('validateUserId enforces slug rules', () => {
  assert.equal(
    validateUserId('ab'),
    `使用者 ID 至少需要 ${AUTH_CONSTANTS.USER_ID_MIN_LENGTH} 個字元`
  );
  assert.equal(
    validateUserId('a'.repeat(65)),
    `使用者 ID 最多僅能 ${AUTH_CONSTANTS.USER_ID_MAX_LENGTH} 個字元`
  );
  assert.equal(validateUserId('Invalid'), '僅能使用小寫英文、數字或 - 號');
  assert.equal(validateUserId('valid-id'), null);
});

test('executeLogin stores user and redirects on success', async () => {
  const { client, calls } = createMockApi();
  const executor = createLoginExecutor(client);
  let storedUserId: string | null = null;
  let redirectedTo: string | null = null;

  await executeLogin({
    executor,
    userId: 'valid-id',
    setUser: (user) => {
      storedUserId = user.userId;
    },
    redirect: (path) => {
      redirectedTo = path;
    },
  });

  assert.deepEqual(calls, [
    { method: 'post', endpoint: '/auth/login', body: { userId: 'valid-id' } },
  ]);
  assert.equal(storedUserId, 'valid-id');
  assert.equal(redirectedTo, '/dashboard');
});

test('executeLogin surfaces API errors with friendly messages', async () => {
  const error = new ApiError(400, 'Bad Request', { message: 'User ID invalid' });
  const executor = async () => {
    throw error;
  };

  await assert.rejects(
    () =>
      executeLogin({
        executor,
        userId: 'valid-id',
        setUser: () => {
          throw new Error('should not set user');
        },
        redirect: () => {
          throw new Error('should not redirect');
        },
      }),
    (err: unknown) => {
      assert.ok(err instanceof Error);
      assert.equal(err.message, 'User ID invalid');
      return true;
    }
  );
});

test('createDevLoginExecutor hits the dev endpoint', async () => {
  const { client, calls } = createMockApi();
  const executor = createDevLoginExecutor(client);
  await executor('dev-user');
  assert.equal(calls.length, 1);
  assert.equal(
    calls[0]?.endpoint,
    '/auth/dev-login?userId=dev-user'
  );
});
