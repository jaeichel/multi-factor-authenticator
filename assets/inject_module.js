locationParser = () => {
  const urlParams = new URLSearchParams(window.location.search);
  let base = `${window.location.protocol}//${window.location.host}`;

  if (window.location.port !== '') {
    base += `:${window.location.port}`;
  }
  base += window.location.pathname;
  
  const queryVars = {
    client_id: 'clientId',
    code_challenge_method: 'codeChallengeMethod',
    response_type: 'responseType',
  };

  Object.keys(queryVars).forEach((key, i) => {
    if (urlParams.has(key)) {
      base += i === 0 ? '?' : '&';
      base += `${queryVars[key]}=${encodeURIComponent(urlParams.get(key))}`;
    }
  });

 return base;
}

findMFAElement = () => {
  const elementIds = [
    'mfacode'
  ];
  
  return elementIds.map(id => document.getElementById(id)).find(e => e !== null);
}

injectMFA = () => {
  const url = locationParser();
  const e = findMFAElement();
  return fetch('https://server.com/mfa', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      url
    })
  })
  .then(res => res.json())
  .then(json => {
    const { token } = json;
    if (token) {
      e.value = token;
    }
  });
}