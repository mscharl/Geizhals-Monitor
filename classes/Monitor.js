const ProductFactory = require('../factories/ProductFactory');
const ProductListFactory = require('../factories/ProductListFactory');
const ProductList = require('../models/ProductList');
const fetch = require('node-fetch');
const jsdom = require("jsdom");
const {JSDOM} = jsdom;

const _getCompareableProductsArray = (newProducts, oldProducts) => {
    newProducts = ProductListFactory.withProducts(newProducts);
    oldProducts = ProductListFactory.withProducts(oldProducts);

    const compareable = [...newProducts].map((newProduct) => {
        const oldProductIndex = oldProducts.findProductIndex(newProduct.name);
        const oldProduct = oldProductIndex > -1 ? oldProducts.splice(oldProductIndex, 1).first : null;

        return {
            new: newProduct,
            old: oldProduct
        }
    });

    return compareable.concat([...oldProducts].map((oldProduct) => {
        return {
            new: null,
            old: oldProduct
        }
    }));
};

module.exports = class Monitor {
    constructor(url) {
        this._url = url;
        this._products = new ProductList();

        this._list_name = null;

        this.refreshList();
    }

    get products() {
        return new ProductList(...this._products);
    }

    get listName() {
        return this._list_name;
    }

    refreshList() {
        return this._reloadProducts()
            .then((products) => {
                this._products = products;
            })
    }

    checkProducts() {
        return this._reloadProducts()
            .then((products) => {
                const compareable = _getCompareableProductsArray(products, this.products);
                const changed = compareable.filter((compare_product) => {
                    return compare_product.old && compare_product.new && compare_product.old.price !== compare_product.new.price;
                });
                const added = compareable.filter((compareable_product) => {
                    return compareable_product.old === null;
                });
                const removed = compareable.filter((compareable_product) => {
                    return compareable_product.new === null;
                });
                const list = {
                    old: this.products,
                    new: products
                };

                // Update products
                this._products = products;

                return {changed, added, removed, list};
            })
    }

    _reloadProducts() {
        return this._fetch()
            .then((body) => this._parse(body));
    }

    _fetch() {
        return fetch(this._url)
            .then((response) => response.text());
    }

    _parse(body) {
        const dom = new JSDOM(body);
        const document = dom.window.document;
        const list = document.getElementById('lazy-list--categorylist');
        const product_list = list.querySelectorAll('.productlist__product');

        this._list_name = document.querySelector('.gh_listtitle').innerHTML.trim();

        const products = [...product_list].map((element) => ProductFactory.fromDOM(element));

        return ProductListFactory.withProducts(products);
    }
};
