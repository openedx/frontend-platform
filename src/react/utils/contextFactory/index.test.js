import { renderHook } from '@testing-library/react-hooks';

import contextFactory from '.';

const INITIAL_STATE = { foo: { bar: 2 } };
const reducer = jest.fn(() => INITIAL_STATE);

test('useSelector returns the state', () => {
  const { useSelector } = contextFactory(reducer, INITIAL_STATE);

  const { result } = renderHook(() => useSelector((state) => state));
  expect(result.current).toEqual(INITIAL_STATE);
});
