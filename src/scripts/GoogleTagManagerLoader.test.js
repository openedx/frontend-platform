import GoogleTagManagerLoader from './GoogleTagManagerLoader';

describe('GoogleTagManagerLoader', () => {
  const mockGTMId = 'GOOGLE_TAG_MANAGER_ID_test_id';
  let insertBeforeMock;

  beforeEach(() => {
    global.google_tag_manager = undefined;
    insertBeforeMock = jest.fn();

    document.getElementsByTagName = jest.fn(() => [
      {
        parentNode: {
          insertBefore: insertBeforeMock,
        },
      },
    ]);
  });

  it('should load GTM script', () => {
    const loader = new GoogleTagManagerLoader({ config: { GOOGLE_TAG_MANAGER_ID: mockGTMId } });

    loader.loadScript();

    expect(global.google_tag_manager).toBeDefined();
    expect(global.google_tag_manager.invoked).toBe(true);

    const firstScript = document.getElementsByTagName()[0];
    expect(firstScript.parentNode.insertBefore).toHaveBeenCalled();
  });

  it('should not load script if account is not defined', () => {
    const loader = new GoogleTagManagerLoader({ config: { GOOGLE_TAG_MANAGER_ID: '' } });

    loader.loadScript();

    expect(global.google_tag_manager).toBeUndefined();
  });

  it('should not load script if google_tag_manager is already invoked', () => {
    global.google_tag_manager = { invoked: true };
    const loader = new GoogleTagManagerLoader({ config: { GOOGLE_TAG_MANAGER_ID: mockGTMId } });

    loader.loadScript();

    expect(global.google_tag_manager.invoked).toBe(true);
    expect(document.getElementsByTagName).not.toHaveBeenCalled();
  });
});
