import md5 from 'md5';

class Api {
  constructor(apiUrl, authToken) {
    this.apiUrl = apiUrl;
    this.authToken = authToken;
  }

  async getIds(offset = 0, limit = 100) {
    try {
      const authToken = this.generateAuthToken();
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth': authToken
        },
        body: JSON.stringify({
          action: 'get_ids',
          params: { offset, limit }
        })
      });
      const data = await response.json();
      return data.result;
    } catch (error) {
      console.error('Error fetching IDs:', error);
      throw error;
    }
  }

  async getItems(ids) {
    try {
      const authToken = this.generateAuthToken();
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth': authToken
        },
        body: JSON.stringify({
          action: 'get_items',
          params: { ids }
        })
      });
      const data = await response.json();
      return data.result;
    } catch (error) {
      console.error('Ошибка при получении товаров:', error);
      throw error;
    }
  }
  

  async filter(params) {
    try {
      const authToken = this.generateAuthToken();
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth': authToken
        },
        body: JSON.stringify({
          action: 'filter',
          params
        })
      });
      const data = await response.json();
      return data.result;
    } catch (error) {
      console.error('Error filtering items:', error);
      throw error;
    }
  }

  generateAuthToken() {
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    return md5(`${this.authToken}_${timestamp}`);
  }
}

export { Api };
