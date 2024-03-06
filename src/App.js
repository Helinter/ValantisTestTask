import React, { useState } from 'react';
import { Api } from './Api';
import './App.css'
import Preloader from './components/Preloader/Preloader';

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
  const [isLoading, setIsLoading] = useState(false);

  const nextPage = () => {
    setCurrentPage(prevPage => Math.min(prevPage + 1, totalPages));
  };

  const prevPage = () => {
    setCurrentPage(prevPage => Math.max(prevPage - 1, 1));
  };

  const api = new Api('https://api.valantis.store:41000/', 'Valantis');

  const handleSubmit = async event => {

    event.preventDefault();
    setIsLoading(true);

    try {
      let filterParams = {};
      let filteredItems = [];

      // так как API не позволяет делать фильтрацию на стороне сервера с двумя и более параметрами,
      // определяем, какае параметры переданы в форму, и производим фильтрацию на стороне сервера по первому в приоритете "название-цена-бренд"

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

      setTotalPages(Math.ceil(uniqueItems.length / ITEMS_PER_PAGE));
      setProducts(uniqueItems);
      setCurrentPage(1);


    } catch (error) {
      if (error.response) {
        console.error('Ошибка при получении данных:', error, error.response.status);
      }
      // в случае ошибки сервера повторяем запрос

      handleSubmit(event);
    } finally {
      setIsLoading(false);
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
    if (event.key === 'Enter' && !isFormEmpty && !isLoading) {
      handleSubmit(event);
    }
  };

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentProducts = products.slice(startIndex, endIndex);

  const isFormEmpty = !filter.name.trim() && !filter.price.trim() && !filter.brand.trim();

  return (
    <div className='app'>
      <h1 className='app__title'>продукты компании</h1>

      <form onSubmit={handleSubmit} onKeyDown={handleKeyPress}>
        <div className='app__input-container'>
          <input
            className='app__input'
            type="text"
            placeholder="Название"
            name="name"
            value={filter.name}
            onChange={handleInputChange}
          />
          <input
            className='app__input'
            type="text"
            placeholder="Цена"
            name="price"
            value={filter.price}
            onChange={handleInputChange}
          />
          <input
            className='app__input'
            type="text"
            placeholder="Бренд"
            name="brand"
            value={filter.brand}
            onChange={handleInputChange}
          />
          <button className='app__button' type="submit" disabled={isFormEmpty || isLoading}>Применить фильтр</button>
        </div>
      </form>

      {isLoading ? <Preloader /> : null}

      <ul className='app__list'>
        {currentProducts.map(product => (
          <li className='app__list-item' key={product.id}>
            <p className='item-text'>ID: {product.id}</p>
            <p className='item-text'>Название: {product.product}</p>
            <p className='item-text'>Цена: {product.price}</p>
            <p className='item-text'>Бренд: {product.brand}</p>
          </li>
        ))}
      </ul>
      <div className='app__selector-container'>
        <button className='app__selector-button' onClick={prevPage} disabled={currentPage === 1 || currentProducts.length === 0}>Предыдущая страница</button>
        {currentProducts.length > 0 && (
          <span> Страница {currentPage} из {totalPages} </span>
        )}
        <button className='app__selector-button' onClick={nextPage} disabled={currentPage === totalPages || currentProducts.length === 0}>Следующая страница</button>
      </div>
    </div>
  );
};

export default App;