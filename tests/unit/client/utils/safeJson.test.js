import { parseJSONSafe } from '../../../../src/utils/safeJson';

describe('parseJSONSafe', () => {
  test('should parse valid JSON response', async () => {
    const mockResponse = {
      text: jest.fn().mockResolvedValue('{"test": "value"}')
    };

    const result = await parseJSONSafe(mockResponse);
    
    expect(result).toEqual({ test: 'value' });
    expect(mockResponse.text).toHaveBeenCalled();
  });

  test('should return null for empty response', async () => {
    const result = await parseJSONSafe(null);
    expect(result).toBeNull();
  });

  test('should return null for empty text response', async () => {
    const mockResponse = {
      text: jest.fn().mockResolvedValue('')
    };

    const result = await parseJSONSafe(mockResponse);
    
    expect(result).toBeNull();
    expect(mockResponse.text).toHaveBeenCalled();
  });

  test('should return null for whitespace-only response', async () => {
    const mockResponse = {
      text: jest.fn().mockResolvedValue('   ')
    };

    const result = await parseJSONSafe(mockResponse);
    
    expect(result).toBeNull();
  });

  test('should return null for invalid JSON', async () => {
    const mockResponse = {
      text: jest.fn().mockResolvedValue('invalid json content')
    };

    const result = await parseJSONSafe(mockResponse);
    
    expect(result).toBeNull();
    expect(mockResponse.text).toHaveBeenCalled();
  });

  test('should return null for malformed JSON', async () => {
    const mockResponse = {
      text: jest.fn().mockResolvedValue('{"incomplete": json')
    };

    const result = await parseJSONSafe(mockResponse);
    
    expect(result).toBeNull();
  });

  test('should parse JSON array', async () => {
    const mockResponse = {
      text: jest.fn().mockResolvedValue('[{"id": 1}, {"id": 2}]')
    };

    const result = await parseJSONSafe(mockResponse);
    
    expect(result).toEqual([{ id: 1 }, { id: 2 }]);
  });

  test('should parse JSON with nested objects', async () => {
    const complexJson = {
      user: {
        id: 1,
        name: 'Test User',
        preferences: {
          theme: 'dark',
          language: 'en'
        }
      },
      entries: [
        { id: 1, country: 'Finland' },
        { id: 2, country: 'Sweden' }
      ]
    };

    const mockResponse = {
      text: jest.fn().mockResolvedValue(JSON.stringify(complexJson))
    };

    const result = await parseJSONSafe(mockResponse);
    
    expect(result).toEqual(complexJson);
  });

  test('should handle response.text() error', async () => {
    const mockResponse = {
      text: jest.fn().mockRejectedValue(new Error('Network error'))
    };

    await expect(parseJSONSafe(mockResponse)).rejects.toThrow('Network error');
  });

  test('should parse boolean values', async () => {
    const mockResponse = {
      text: jest.fn().mockResolvedValue('{"success": true, "enabled": false}')
    };

    const result = await parseJSONSafe(mockResponse);
    
    expect(result).toEqual({ success: true, enabled: false });
  });

  test('should parse null and number values', async () => {
    const mockResponse = {
      text: jest.fn().mockResolvedValue('{"value": null, "count": 42}')
    };

    const result = await parseJSONSafe(mockResponse);
    
    expect(result).toEqual({ value: null, count: 42 });
  });
});