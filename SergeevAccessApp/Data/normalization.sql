-- Исходная таблица в базе: [Order]
-- Нормализованная структура:
-- Categories 1 -> many Products
-- Products 1 -> 1 Stock

CREATE TABLE Categories (
    CategoryId AUTOINCREMENT CONSTRAINT PK_Categories PRIMARY KEY,
    CategoryName TEXT(255) NOT NULL
);

CREATE UNIQUE INDEX UX_Categories_CategoryName
    ON Categories (CategoryName);

CREATE TABLE Products (
    ProductId AUTOINCREMENT CONSTRAINT PK_Products PRIMARY KEY,
    PriceCode DOUBLE,
    Article DOUBLE NOT NULL,
    ProductName TEXT(255) NOT NULL,
    CategoryId LONG NOT NULL,
    PriceWithVat CURRENCY NOT NULL
);

CREATE UNIQUE INDEX UX_Products_Article
    ON Products (Article);

CREATE TABLE Stock (
    StockId AUTOINCREMENT CONSTRAINT PK_Stock PRIMARY KEY,
    ProductId LONG NOT NULL,
    Quantity DOUBLE NOT NULL
);

CREATE UNIQUE INDEX UX_Stock_ProductId
    ON Stock (ProductId);

INSERT INTO Categories (CategoryName)
SELECT DISTINCT [Категория]
FROM [Order]
WHERE [Категория] IS NOT NULL;

INSERT INTO Products (PriceCode, Article, ProductName, CategoryId, PriceWithVat)
SELECT
    o.[КодПрайс],
    o.[Артикул],
    o.[Наименование],
    c.CategoryId,
    o.[Цена, с НДС]
FROM [Order] AS o
INNER JOIN Categories AS c ON o.[Категория] = c.CategoryName;

INSERT INTO Stock (ProductId, Quantity)
SELECT p.ProductId, o.[Количество]
FROM [Order] AS o
INNER JOIN Products AS p ON o.[Артикул] = p.Article;

ALTER TABLE Products
    ADD CONSTRAINT FK_Products_Categories
    FOREIGN KEY (CategoryId) REFERENCES Categories(CategoryId);

ALTER TABLE Stock
    ADD CONSTRAINT FK_Stock_Products
    FOREIGN KEY (ProductId) REFERENCES Products(ProductId);
