import { useReducer } from 'react';

const withProvider = ({
  stateContext: StateContext,
  dispatchContext: DispatchContext,
  reducer,
  initialState,
}) => (WrappedComponent) => {
  function ProviderWrapper(props) {
    const [state, dispatch] = useReducer(reducer, initialState);
    return (
      <DispatchContext.Provider value={dispatch}>
        <StateContext.Provider value={state}>
          <WrappedComponent {...props} />
        </StateContext.Provider>
      </DispatchContext.Provider>
    );
  }

  return ProviderWrapper;
};

export default withProvider;
