const mockCookiesImplementation = {
  get: jest.fn(),
  remove: jest.fn(),
};

module.exports = () => mockCookiesImplementation;
