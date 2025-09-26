const { authMiddleware, optionalAuthMiddleware } = require('../../../../server/middleware/auth');

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('authMiddleware', () => {
    test('should authenticate with demo token', () => {
      req.headers.authorization = 'Bearer demo-token';

      authMiddleware(req, res, next);

      expect(req.user).toEqual({ id: 1 });
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('should authenticate with valid token format', () => {
      req.headers.authorization = 'Bearer token-123';

      authMiddleware(req, res, next);

      expect(req.user).toEqual({ id: 123 });
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('should reject request without authorization header', () => {
      authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'No token provided' });
      expect(next).not.toHaveBeenCalled();
    });

    test('should reject request with invalid authorization format', () => {
      req.headers.authorization = 'InvalidFormat token';

      authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'No token provided' });
      expect(next).not.toHaveBeenCalled();
    });

    test('should reject request with invalid token', () => {
      req.headers.authorization = 'Bearer invalid-token';

      authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' });
      expect(next).not.toHaveBeenCalled();
    });

    test('should reject request with malformed token-* format', () => {
      req.headers.authorization = 'Bearer token-abc';

      authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token format' });
      expect(next).not.toHaveBeenCalled();
    });

    test('should reject request with token-0', () => {
      req.headers.authorization = 'Bearer token-0';

      authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token format' });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('optionalAuthMiddleware', () => {
    test('should add user to request with valid token', () => {
      req.headers.authorization = 'Bearer demo-token';

      optionalAuthMiddleware(req, res, next);

      expect(req.user).toEqual({ id: 1 });
      expect(next).toHaveBeenCalled();
    });

    test('should add user to request with token-* format', () => {
      req.headers.authorization = 'Bearer token-456';

      optionalAuthMiddleware(req, res, next);

      expect(req.user).toEqual({ id: 456 });
      expect(next).toHaveBeenCalled();
    });

    test('should continue without user if no token provided', () => {
      optionalAuthMiddleware(req, res, next);

      expect(req.user).toBeUndefined();
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('should continue without user if invalid token format', () => {
      req.headers.authorization = 'InvalidFormat token';

      optionalAuthMiddleware(req, res, next);

      expect(req.user).toBeUndefined();
      expect(next).toHaveBeenCalled();
    });

    test('should continue without user if invalid token', () => {
      req.headers.authorization = 'Bearer invalid-token';

      optionalAuthMiddleware(req, res, next);

      expect(req.user).toBeUndefined();
      expect(next).toHaveBeenCalled();
    });

    test('should continue without user if malformed token-* format', () => {
      req.headers.authorization = 'Bearer token-abc';

      optionalAuthMiddleware(req, res, next);

      expect(req.user).toBeUndefined();
      expect(next).toHaveBeenCalled();
    });
  });
});