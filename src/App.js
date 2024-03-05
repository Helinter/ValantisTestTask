import React, { useState, useEffect } from 'react';
import { Api } from './Api';

const ITEMS_PER_PAGE = 50;

const App = () => {
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const api = new Api('https://api.valantis.store:41000/', 'Valantis');
        const ids = await api.getIds();
        let items = await api.getItems(ids);

        // Удаление дубликатов
        const uniqueItems = items.filter((item, index, self) => {
          const isFirstOccurrence = index === self.findIndex((t) => t.id === item.id);
          if (!isFirstOccurrence) {
            console.log("Элемент с неуникальным id:", item);
          }

          return isFirstOccurrence;
        });

        setTotalPages(Math.ceil(uniqueItems.length / ITEMS_PER_PAGE));
        setProducts(uniqueItems);
      } catch (error) {
        console.error('Ошибка при получении данных:', error);
      }
    };

    fetchData();
  }, []);

  const nextPage = () => {
    setCurrentPage(prevPage => Math.min(prevPage + 1, totalPages));
  };

  const prevPage = () => {
    setCurrentPage(prevPage => Math.max(prevPage - 1, 1));
  };

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentProducts = products.slice(startIndex, endIndex);
  return (
    <div>
      <h1>Список продуктов</h1>
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
