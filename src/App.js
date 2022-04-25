import React, { useState, useEffect, useRef } from 'react';
import LoadingIndicator from './LoadingIndicator';
import './App.css';

const useJsonFetch = (url, options) => {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const currentRequestId = useRef(0);
  const reFetchId = useRef(0); // if reFetchId updated AND when rerendered, will cause re-fetch

  const onSuccess = jsonData => setState({ data: jsonData, loading: false, error: null });
  const onError = err => setState({ data: null, loading: false, error: err });
  const onLoadStart = () => setState({ data: null, loading: true, error: null });

  const reFetch = () => {
    reFetchId.current++;
    onLoadStart();
  };

  const dispatchFetch = (isThisRefetch) => {
    // if by the time response will arrive we've sent a new request, reject old response
    currentRequestId.current++;
    const thisRequestId = currentRequestId.current;

    console.log("[" + url + "] fetch #" + thisRequestId);
    fetch(url, options).then(async response => {
      if (!response.ok) { onError(response.statusText); return; }
      const jsonData = await response.json();
      const doReject = currentRequestId.current !== thisRequestId;

      console.log("[" + url + "] received #" + thisRequestId
        + ", expected #" + currentRequestId.current + (doReject ? " (rejecting)" : ""));

      if (doReject) return; // because a newer request's been sent
      onSuccess(jsonData);
    }).catch(onError);

    if (!isThisRefetch) onLoadStart();
  }

  useEffect(() => dispatchFetch(false), [url, options]);
  useEffect(() => { if (reFetchId.current !== 0) dispatchFetch(true) }, [reFetchId.current]);
  // separated to save 1 extra re-render

  console.log("[" + url + "] render");
  return [state.data, state.loading, state.error, reFetch];
};

const FetchTest = ({ requestName }) => {
  const [data, loading, error, reFetch] = useJsonFetch("http://localhost:7070/" + requestName);
  let content;

  if (loading) content = <LoadingIndicator />
  else if (error) content = <LoadingIndicator failed />
  else content = <div>{JSON.stringify(data)}</div>;

  const addClass = error ? " error" : (data ? " success" : "");
  return <div className={"FetchTest" + addClass} onClick={reFetch}>
    {"GET /" + requestName}
    {content}
  </div>;
};

export default function App() {
  return (
    <div className="App">
      <FetchTest requestName={"data"} />
      <FetchTest requestName={"error"} />
      <FetchTest requestName={"loading"} />
    </div>
  );
};
