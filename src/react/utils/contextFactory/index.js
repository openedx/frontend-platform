import { createContext, useContext } from 'react';
import withProvider from './withProvider';

export default (reducer, initialState) => {
  const StateContext = createContext({ ...initialState });
  const DispatchContext = createContext(() => {});

  const useSelector = (selector) => {
    const state = useContext(StateContext);
    return selector(state);
  };

  const useDispatch = () => {
    const dispatch = useContext(DispatchContext);
    return dispatch;
  };

  const withContextProvider = withProvider({
    stateContext: StateContext,
    dispatchContext: DispatchContext,
    reducer,
    initialState,
  });

  return {
    withContextProvider, useSelector, useDispatch, StateContext, DispatchContext,
  };
};
