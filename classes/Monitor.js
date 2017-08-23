const ProductFactory = require('../factories/ProductFactory');
const fetch = require('node-fetch');
const jsdom = require("jsdom");
const {JSDOM} = jsdom;

module.exports = class Monitor {
    constructor(url) {
        this._url = url;
        this._products = [];

        this.refreshList();
    }

    get products() {
        return [...this._products];
    }

    refreshList() {
        this._fetch()
            .then((body) => this._parse(body))
            .then((products) => {
                this._products = products;
            })
    }

    _fetch() {
        // return fetch(this._url)
        //     .then((response) => response.text());
        return new Promise((resolve) => {
            require('fs').readFile('./list.html', (err, data) => {
                resolve(data.toString());
            });
        });
    }

    _parse(body) {
        const dom = new JSDOM(body);
        const document = dom.window.document;
        const list = document.getElementById('lazy-list--categorylist');
        const product_list = list.querySelectorAll('.productlist__product');

        return [...product_list].map((element) => ProductFactory.fromDOM(element));
    }
};
