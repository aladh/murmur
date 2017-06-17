import secrets from '../secrets';

const keyHeader = () => {
  return {'x-api-key': secrets.apiKey}
};

const createShare = async (data) => {
  let response = await fetch('https://api.biimer.com/shares/', {
    headers: keyHeader(),
    method: 'POST',
    body: JSON.stringify(data)
  });

  if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`)
};

const getShare = async (id) => {
  let response = await fetch(`https://api.biimer.com/shares/${id}`, {
    headers: keyHeader()
  });

  if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);
  return response.json();
};

const deleteShare = async (id) => {
  let response = await fetch(`https://api.biimer.com/shares/${id}`, {
    method: 'DELETE',
    headers: keyHeader()
  });

  if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);
};

export default {createShare, getShare, deleteShare}
