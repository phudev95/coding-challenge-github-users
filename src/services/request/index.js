export function request(url) {
  const fetchData = {
    method: 'GET',
  };

  return fetch(url, fetchData)
    .then(resp => resp.json());
}

