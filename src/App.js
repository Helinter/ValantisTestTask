import React, { useState } from 'react';
import { Api } from './Api';

const ITEMS_PER_PAGE = 50;

const App = () => {
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [filter, setFilter] = useState({
    name: '',
    price: '',
    brand: ''
  });

  const nextPage = () => {
    setCurrentPage(prevPage => Math.min(prevPage + 1, totalPages));
  };

  const prevPage = () => {
    setCurrentPage(prevPage => Math.max(prevPage - 1, 1));
  };

  const handleSubmit = async event => {
    event.preventDefault();

    try {
      const api = new Api('https://api.valantis.store:41000/', 'Valantis');
      let filterParams = {};
      let filteredItems = [];

      // Определение параметров для фильтрации на стороне сервера и запрос к API
      if (filter.name !== '' && filter.price === '' && filter.brand === '') {
        filterParams.product = filter.name;

      } else if (filter.name === '' && filter.price !== '' && filter.brand === '') {
        filterParams.price = parseFloat(filter.price);

      } else if (filter.name === '' && filter.price === '' && filter.brand !== '') {
        filterParams.brand = filter.brand;
      }
      else if (filter.name === '' && filter.price !== '' && filter.brand !== '') {
        filterParams.price = parseFloat(filter.price);
      }
      else if (filter.name !== '') {
        filterParams.product = filter.name;
      }

      const filteredIds = await api.filter(filterParams);

      // Выполняем запрос по полученным идентификаторам, если они есть
      if (Array.isArray(filteredIds) && filteredIds.length > 0) {
        filteredItems = await api.getItems(filteredIds);
      } else {
        // Если идентификаторы не найдены, берем продукты из текущего состояния
        filteredItems = products;
      }

      // Фильтрация на стороне клиента по оставшимся параметрам
      filteredItems = filteredItems.filter(item => {
        return (
          (filter.name === '' || item.product.includes(filter.name)) &&
          (filter.price === '' || item.price === parseFloat(filter.price)) &&
          (filter.brand === '' || item.brand === filter.brand)
        );
      });

      const uniqueItems = filteredItems.filter((item, index, self) => {
        const isFirstOccurrence = index === self.findIndex((t) => t.id === item.id);
        return isFirstOccurrence;
      });

      // Обновляем состояние продуктов и других необходимых данных
      setTotalPages(Math.ceil(uniqueItems.length / ITEMS_PER_PAGE));
      setProducts(uniqueItems);
      setCurrentPage(1);


    } catch (error) {
      console.error('Ошибка при получении данных:', error);
    }
  };

  const handleInputChange = event => {
    const { name, value } = event.target;
    setFilter(prevFilter => ({
      ...prevFilter,
      [name]: value
    }));
  };

  const handleKeyPress = event => {
    if (event.key === 'Enter') {
      handleSubmit(event);
    }
  };

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentProducts = products.slice(startIndex, endIndex);

  return (
    <div>
      <h1>Список продуктов</h1>
      <form onSubmit={handleSubmit} onKeyPress={handleKeyPress}>
        <input
          type="text"
          placeholder="Название"
          name="name"
          value={filter.name}
          onChange={handleInputChange}
        />
        <input
          type="text"
          placeholder="Цена"
          name="price"
          value={filter.price}
          onChange={handleInputChange}
        />
        <input
          type="text"
          placeholder="Бренд"
          name="brand"
          value={filter.brand}
          onChange={handleInputChange}
        />
        <button type="submit">Применить фильтр</button>
      </form>
      <ul>
        {currentProducts.map(product => (
          <li key={product.id}>
            <div>ID: {product.id}</div>
            <div>Название: {product.product}</div>
            <div>Цена: {product.price}</div>
            <div>Бренд: {product.brand}</div>
          </li>
        ))}
      </ul>
      <div>
        <button onClick={prevPage} disabled={currentPage === 1}>Предыдущая страница</button>
        <span> Страница {currentPage} из {totalPages} </span>
        <button onClick={nextPage} disabled={currentPage === totalPages}>Следующая страница</button>
      </div>
    </div>
  );
};

export default App;
