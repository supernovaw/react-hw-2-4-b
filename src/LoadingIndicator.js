import React from 'react';
import './LoadingIndicator.css';

export default function LoadingIndicator({ failed }) {
  let content;
  if (failed)
    content = <span className="error">Failed to load</span>;
  else
    content = <React.Fragment>Loading<span className="loading-dots"><span>.</span></span></React.Fragment>;

  return <div className="LoadingIndicator">{content}</div>;
};
