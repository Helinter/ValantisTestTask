Тестовое задание для Valantis

реализован поиск продуктов компании

так как API не позволяет использовать метод filter с двумя и более параметрами, фильтрация выполняется сначала на сервере, затем на клиенте.
по приоритету имя-цена-бренд, первый аргумент фильтруется методами сервера, остальные методами на клиенте.

так как в тз не указано сколько товаров должно быть на странице изначально, реализовал такое поведение:
при заходе в прилоение будут запрошены 300 товаров (пока идет загрузка крутится оранжевый прелоадер),
как только пользователь перейдет на последнюю страницу из доступных, будут запрошены еще 300 товаров.

написано на React
